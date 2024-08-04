import { Vector3, Mesh } from "@babylonjs/core";

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
 * Node in a binary BVH tree.
 */
class BVHNode {
  aabb: AABB;
  left: BVHNode | null = null;
  right: BVHNode | null = null;
  mesh: Mesh | null = null;

  constructor(
    aabb: AABB,
    mesh: Mesh | null = null
  ) {
    this.aabb = aabb;
    this.mesh = mesh;
  }
}

/**
 * Binary BVH tree.
 */
class BVH {
  root: BVHNode | null = null;

  constructor(meshes: Mesh[]) {
    this.build(meshes);
  }

  private build(meshes: Mesh[]) {
    if (meshes.length === 0) return;

    const nodes = meshes.map(
      (mesh) =>
        new BVHNode(AABB.fromMesh(mesh), mesh)
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

    const combinedAABB = this.combineAABB(
      left.aabb,
      right.aabb
    );
    const parent = new BVHNode(combinedAABB);
    parent.left = left;
    parent.right = right;

    return parent;
  }

  private chooseAxis(nodes: BVHNode[]): number {
    // Simple axis choice: alternate between x, y, and z
    return nodes.length % 3;
  }

  private combineAABB(a: AABB, b: AABB): AABB {
    const min = Vector3.Minimize(a.min, b.min);
    const max = Vector3.Maximize(a.max, b.max);
    return new AABB(min, max);
  }
}

export { BVH, BVHNode, AABB };
