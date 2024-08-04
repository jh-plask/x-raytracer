const rayTracerVertexShader = `
    attribute vec3 position;
    attribute vec2 uv;
    uniform mat4 worldViewProjection;
    varying vec2 vUV;
    varying vec3 vWorldPosition;
    void main(void) {
        gl_Position = worldViewProjection * vec4(position, 1.0);
        vUV = uv;
        vWorldPosition = position;
    }
`;

const rayTracerFragmentShader = `
    precision highp float;
    varying vec2 vUV;
    varying vec3 vWorldPosition;
    uniform vec3 cameraPosition;
    uniform sampler2D bvhTexture;
    uniform float bvhTextureSize;

    struct Ray {
        vec3 origin;
        vec3 direction;
    };

    struct AABB {
        vec3 min;
        vec3 max;
    };

    bool intersectAABB(Ray ray, AABB aabb, out float tMin, out float tMax) {
        vec3 invDir = 1.0 / ray.direction;
        vec3 t0 = (aabb.min - ray.origin) * invDir;
        vec3 t1 = (aabb.max - ray.origin) * invDir;
        vec3 tNear = min(t0, t1);
        vec3 tFar = max(t0, t1);
        tMin = max(max(tNear.x, tNear.y), tNear.z);
        tMax = min(min(tFar.x, tFar.y), tFar.z);
        return tMax > tMin && tMax > 0.0;
    }

    vec4 traverseBVH(Ray ray) {
        int stack[64];
        int stackPtr = 0;
        stack[stackPtr++] = 0; // Start with root node

        while (stackPtr > 0) {
            int nodeIndex = stack[--stackPtr];
            vec4 nodeData1 = texture2D(bvhTexture, vec2((float(nodeIndex * 2) + 0.5) / bvhTextureSize, 0.5));
            vec4 nodeData2 = texture2D(bvhTexture, vec2((float(nodeIndex * 2 + 1) + 0.5) / bvhTextureSize, 0.5));

            AABB aabb;
            aabb.min = nodeData1.xyz;
            aabb.max = nodeData2.xyz;

            float tMin, tMax;
            if (intersectAABB(ray, aabb, tMin, tMax)) {
                int meshIndex = int(nodeData1.w);
                if (meshIndex >= 0) {
                    // Leaf node, return color based on mesh index
                    return vec4(float(meshIndex) / 10.0, 0.0, 0.0, 1.0);
                } else {
                    // Internal node, continue traversal
                    int leftChild = int(nodeData2.w);
                    stack[stackPtr++] = leftChild + 1;
                    stack[stackPtr++] = leftChild;
                }
            }
        }

        return vec4(0.0, 0.0, 0.0, 1.0); // Background color
    }

    void main(void) {
        Ray ray;
        ray.origin = cameraPosition;
        ray.direction = normalize(vWorldPosition - cameraPosition);

        gl_FragColor = traverseBVH(ray);
    }
`;

export {
  rayTracerVertexShader,
  rayTracerFragmentShader,
};
