import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  Vector2,
  MeshBuilder,
  ShaderMaterial,
  Effect,
} from "@babylonjs/core";
import {
  vertexShader,
  fragmentShader,
} from "./shader/rayTracerShader";

class App {
  private engine: Engine;
  private scene: Scene;
  private camera: FreeCamera;

  constructor() {
    const canvas =
      document.createElement("canvas");
    document.body.appendChild(canvas);
    canvas.id = "renderCanvas";
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);

    this.camera = new FreeCamera(
      "camera",
      new Vector3(0, 0, -5),
      this.scene
    );
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(canvas, true);

    Effect.ShadersStore["rayTracerVertexShader"] =
      vertexShader;
    Effect.ShadersStore[
      "rayTracerFragmentShader"
    ] = fragmentShader;

    const material = new ShaderMaterial(
      "rayTracerMaterial",
      this.scene,
      {
        vertex: "rayTracer",
        fragment: "rayTracer",
      },
      {
        attributes: ["position", "uv"],
        uniforms: [
          "cameraPosition",
          "resolution",
          "spheres",
          "sphereCount",
        ],
      }
    );

    const plane = MeshBuilder.CreatePlane(
      "plane",
      { size: 2 },
      this.scene
    );
    plane.material = material;

    // Set up spheres
    const spheres = [
      {
        center: new Vector3(0, 0, 0),
        radius: 1.0,
        color: new Vector3(1, 0, 0),
      },
      {
        center: new Vector3(-1.5, 0, -1),
        radius: 0.5,
        color: new Vector3(0, 1, 0),
      },
      {
        center: new Vector3(1.5, 0, -1),
        radius: 0.5,
        color: new Vector3(0, 0, 1),
      },
    ];

    this.engine.runRenderLoop(() => {
      material.setVector3(
        "cameraPosition",
        this.camera.position
      );
      material.setVector2(
        "resolution",
        new Vector2(
          this.engine.getRenderWidth(),
          this.engine.getRenderHeight()
        )
      );

      // Update sphere uniforms
      for (let i = 0; i < spheres.length; i++) {
        material.setVector3(
          `spheres[${i}].center`,
          spheres[i].center
        );
        material.setFloat(
          `spheres[${i}].radius`,
          spheres[i].radius
        );
        material.setVector3(
          `spheres[${i}].color`,
          spheres[i].color
        );
      }
      material.setInt(
        "sphereCount",
        spheres.length
      );

      this.scene.render();
    });
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
}

new App();
