import {
  Vector3,
  Mesh,
  Scene,
  RawTexture,
  Texture,
  Engine,
} from "@babylonjs/core";

/**
 * Axis-aligned bounding box.
 */
class AABB {
  constructor(
    public min: Vector3,
    public max: Vector3
  ) {}

  static fromMesh(mesh: Mesh): AABB {
    const boundingBox =
      mesh.getBoundingInfo().boundingBox;
    return new AABB(
      boundingBox.minimumWorld,
      boundingBox.maximumWorld
    );
  }
}

/**
 * Bounding volume hierarchy node.
 */
class BVHNode {
  aabb: AABB;
  left: BVHNode | null = null;
  right: BVHNode | null = null;
  meshIndex: number = -1;

  constructor(
    aabb: AABB,
    meshIndex: number = -1
  ) {
    this.aabb = aabb;
    this.meshIndex = meshIndex;
  }
}

export class BVH {
  root: BVHNode | null = null;
  flatNodes: Float32Array = new Float32Array(0);

  constructor(meshes: Mesh[]) {
    this.build(meshes);
    this.flatten();
  }

  private build(meshes: Mesh[]) {
    const nodes = meshes.map(
      (mesh, index) =>
        new BVHNode(AABB.fromMesh(mesh), index)
    );
    this.root = this.buildRecursive(nodes);
  }

  private buildRecursive(
    nodes: BVHNode[]
  ): BVHNode {
    if (nodes.length === 1) return nodes[0];

    const axis = this.chooseAxis(nodes);
    nodes.sort(
      (a, b) =>
        a.aabb.min.asArray()[axis] -
        b.aabb.min.asArray()[axis]
    );

    const mid = Math.floor(nodes.length / 2);
    const left = this.buildRecursive(
      nodes.slice(0, mid)
    );
    const right = this.buildRecursive(
      nodes.slice(mid)
    );

    const parent = new BVHNode(
      this.combineAABB(left.aabb, right.aabb)
    );
    parent.left = left;
    parent.right = right;

    return parent;
  }

  /**
   * Choose the axis to split the nodes along.
   * @param nodes
   * @returns
   */
  private chooseAxis(nodes: BVHNode[]): number {
    return nodes.length % 3;
  }

  private combineAABB(a: AABB, b: AABB): AABB {
    const min = Vector3.Minimize(a.min, b.min);
    const max = Vector3.Maximize(a.max, b.max);
    return new AABB(min, max);
  }

  private flatten() {
    const nodes: number[] = [];
    this.flattenRecursive(this.root, nodes);
    this.flatNodes = new Float32Array(nodes);
  }

  private flattenRecursive(
    node: BVHNode | null,
    nodes: number[]
  ) {
    if (!node) return -1;

    const nodeIndex = nodes.length / 8;
    nodes.push(
      node.aabb.min.x,
      node.aabb.min.y,
      node.aabb.min.z,
      node.meshIndex,
      node.aabb.max.x,
      node.aabb.max.y,
      node.aabb.max.z,
      0
    );

    if (node.left && node.right) {
      const leftIndex = this.flattenRecursive(
        node.left,
        nodes
      );
      const rightIndex = this.flattenRecursive(
        node.right,
        nodes
      );
      nodes[nodeIndex * 8 + 7] = leftIndex;
      nodes[nodeIndex * 8 + 3] = rightIndex;
    }

    return nodeIndex;
  }

createBVHTexture(
    bvh: BVH,
    scene: Scene
  ) {
    return RawTexture.CreateRGBATexture(
      bvh.flatNodes,
      bvh.flatNodes.length / 4,
      1,
      scene,
      false,
      false,
      Texture.NEAREST_SAMPLINGMODE,
      Engine.TEXTURETYPE_FLOAT
    );
  }
}
