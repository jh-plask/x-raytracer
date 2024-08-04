import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
} from "@babylonjs/core";
import { BVH } from "./core/picking/bvh";

class App {
  constructor() {
    // Create the canvas and engine
    const canvas =
      document.createElement("canvas");
    canvas.id = "renderCanvas";
    document.body.appendChild(canvas);
    const engine = new Engine(canvas, true);

    // Create the scene
    const scene = new Scene(engine);

    // Create and position a free camera
    const camera = new FreeCamera(
      "camera1",
      new Vector3(0, 5, -10),
      scene
    );
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    // Create a light
    const light = new HemisphericLight(
      "light",
      new Vector3(0, 1, 0),
      scene
    );

    const sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2 },
      scene
    );
    sphere.position.y = 1;

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 6, height: 6 },
      scene
    );

    const box = MeshBuilder.CreateBox(
      "box",
      { size: 1 },
      scene
    );
    box.position.set(2, 0.5, 2);

    // Create BVH
    const meshes = [sphere, ground, box];
    const bvh = new BVH(meshes);

    console.log("BVH created:", bvh);

    // Run the render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle browser resize
    window.addEventListener("resize", () => {
      engine.resize();
    });
  }
}

new App();
