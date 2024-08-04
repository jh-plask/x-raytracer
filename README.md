# BabylonJS Ray Tracer

This project implements a basic ray tracer using BabylonJS and WebGL shaders. It renders a scene with spheres, demonstrating basic ray tracing techniques including reflections and simple lighting.

## Features

- Custom WebGL shader implementation of ray tracing
- Rendering of multiple spheres with different colors and sizes
- Basic lighting and reflection effects
- Real-time rendering using BabylonJS

## Prerequisites

- Node.js and npm (Node Package Manager)
- A modern web browser with WebGL support

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/babylonjs-ray-tracer.git
   cd babylonjs-ray-tracer
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Build the project:

   ```
   npm run build
   ```

2. Start the development server:

   ```
   npm start
   ```

3. Open your web browser and navigate to `http://localhost:8080` (or the port specified by your development server).

## Project Structure

- `src/index.ts`: Main application file
- `src/shader/rayTracerShader.ts`: GLSL shaders for ray tracing
- `dist/index.html`: HTML file for rendering the canvas

## Customization

- Modify the `createSpheres` method in `src/index.ts` to change the number, size, position, and color of spheres.
- Adjust the camera position in the `createScene` method to change the view of the scene.
- Edit the shader code in `src/shader/rayTracerShader.ts` to modify the ray tracing algorithm, lighting, or add new effects.

## Troubleshooting

If you encounter a white screen or other rendering issues:

1. Check the browser console for error messages.
2. Ensure WebGL is enabled and supported in your browser.
3. Verify that all shader uniforms are being set correctly in the `runRenderLoop` method.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
