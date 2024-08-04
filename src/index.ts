import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  ShaderMaterial,
  Effect,
} from "@babylonjs/core";
import {
  rayTracerFragmentShader,
  rayTracerVertexShader,
} from "./shader/rayTracer.fragment";
import { BVH } from "./core/picking/bvh";
class App {
  private engine: Engine;
  private scene: Scene;
  private camera: FreeCamera;

  constructor() {
    console.log("App constructor started");

    const canvas =
      document.createElement("canvas");
    canvas.id = "renderCanvas";
    document.body.appendChild(canvas);
    console.log("Canvas created");

    this.engine = new Engine(canvas, true);
    console.log("Engine created");

    this.scene = new Scene(this.engine);
    console.log("Scene created");

    this.camera = new FreeCamera(
      "camera",
      new Vector3(0, 5, -10),
      this.scene
    );
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(canvas, true);
    console.log("Camera set up");

    new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      this.scene
    );
    console.log("Light created");

    const meshes = [
      MeshBuilder.CreateBox(
        "box1",
        { size: 1 },
        this.scene
      ),
      MeshBuilder.CreateSphere(
        "sphere",
        { diameter: 1 },
        this.scene
      ),
      MeshBuilder.CreateGround(
        "ground",
        { width: 6, height: 6 },
        this.scene
      ),
    ];
    meshes[0].position.set(-1, 0, 0);
    meshes[1].position.set(1, 0, 0);

    const bvh = new BVH(meshes);
    const bvhTexture = bvh.createBVHTexture(
      bvh,
      this.scene
    );

    Effect.ShadersStore["rayTracerVertexShader"] =
      rayTracerVertexShader;
    Effect.ShadersStore[
      "rayTracerFragmentShader"
    ] = rayTracerFragmentShader;

    const rayTracerMaterial = new ShaderMaterial(
      "rayTracer",
      this.scene,
      {
        vertex: "rayTracer",
        fragment: "rayTracer",
      },
      {
        attributes: ["position", "uv"],
        uniforms: [
          "world",
          "worldView",
          "worldViewProjection",
          "view",
          "projection",
          "cameraPosition",
        ],
        samplers: ["bvhTexture"],
      }
    );

    rayTracerMaterial.setTexture(
      "bvhTexture",
      bvhTexture
    );
    rayTracerMaterial.setFloat(
      "bvhTextureSize",
      bvh.flatNodes.length / 4
    );

    const fullscreenQuad =
      MeshBuilder.CreatePlane(
        "fullscreenQuad",
        { width: 2, height: 2 },
        this.scene
      );
    fullscreenQuad.material = rayTracerMaterial;

    this.engine.runRenderLoop(() => {
      rayTracerMaterial.setVector3(
        "cameraPosition",
        this.camera.position
      );
      this.scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    console.log("App constructor finished");
  }
}

new App();
