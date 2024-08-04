export const vertexShader = `
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vUV;
    void main() {
        gl_Position = vec4(position, 1.0);
        vUV = uv;
    }
`;

export const fragmentShader = `
    precision highp float;
    varying vec2 vUV;
    uniform vec3 cameraPosition;
    uniform vec2 resolution;
    uniform float time;

    #define MAX_SPHERES 4
    #define MAX_BOUNCES 5
    #define EPSILON 0.001
    #define PI 3.14159265359

    struct Ray {
        vec3 origin;
        vec3 direction;
    };

    struct Sphere {
        vec3 center;
        float radius;
        vec3 color;
        float specular;
        float reflectivity;
    };

    struct Hit {
        bool didHit;
        float distance;
        vec3 point;
        vec3 normal;
        vec3 color;
        float specular;
        float reflectivity;
    };

    uniform Sphere spheres[MAX_SPHERES];
    uniform int sphereCount;

    float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    bool intersectSphere(Ray ray, Sphere sphere, out float t) {
        vec3 oc = ray.origin - sphere.center;
        float a = dot(ray.direction, ray.direction);
        float b = 2.0 * dot(oc, ray.direction);
        float c = dot(oc, oc) - sphere.radius * sphere.radius;
        float discriminant = b * b - 4.0 * a * c;
        
        if (discriminant < 0.0) {
            return false;
        } else {
            float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
            float t2 = (-b + sqrt(discriminant)) / (2.0 * a);
            t = (t1 < t2 && t1 > 0.0) ? t1 : t2;
            return t > 0.0;
        }
    }

    Hit raySphereIntersect(Ray ray) {
        Hit bestHit;
        bestHit.didHit = false;
        bestHit.distance = 1e20;

        for (int i = 0; i < MAX_SPHERES; i++) {
            if (i >= sphereCount) break;
            
            Sphere sphere = spheres[i];
            float t;
            if (intersectSphere(ray, sphere, t) && t < bestHit.distance) {
                bestHit.didHit = true;
                bestHit.distance = t;
                bestHit.point = ray.origin + t * ray.direction;
                bestHit.normal = normalize(bestHit.point - sphere.center);
                bestHit.color = sphere.color;
                bestHit.specular = sphere.specular;
                bestHit.reflectivity = sphere.reflectivity;
            }
        }

        return bestHit;
    }

    vec3 shade(Hit hit, Ray ray, vec3 lightDir) {
        float diffuse = max(dot(hit.normal, lightDir), 0.0);
        
        vec3 viewDir = normalize(-ray.direction);
        vec3 halfwayDir = normalize(lightDir + viewDir);
        float specular = pow(max(dot(hit.normal, halfwayDir), 0.0), 32.0) * hit.specular;
        
        vec3 ambient = 0.1 * hit.color;
        return ambient + (diffuse + specular) * hit.color;
    }

    float softShadow(Ray ray, float maxDist) {
        float res = 1.0;
        float t = 0.1;
        for(int i = 0; i < 16; i++) {
            if(t < maxDist) {
                Hit hit = raySphereIntersect(Ray(ray.origin + ray.direction * t, ray.direction));
                if(hit.didHit) {
                    return 0.0;
                }
                res = min(res, 8.0 * (maxDist - t) / maxDist);
                t += 0.1;
            }
        }
        return res;
    }

    vec3 skyColor(Ray ray) {
        vec3 unitDirection = normalize(ray.direction);
        float t = 0.5 * (unitDirection.y + 1.0);
        return (1.0 - t) * vec3(1.0) + t * vec3(0.5, 0.7, 1.0);
    }

    vec3 traceRay(Ray initialRay) {
        Ray ray = initialRay;
        vec3 color = vec3(1.0);
        vec3 finalColor = vec3(0.0);

        for (int bounce = 0; bounce < MAX_BOUNCES; bounce++) {
            Hit hit = raySphereIntersect(ray);
            
            if (hit.didHit) {
                vec3 lightDir = normalize(vec3(sin(time), 1.0, cos(time)));
                float shadow = softShadow(Ray(hit.point + hit.normal * EPSILON, lightDir), 20.0);
                vec3 shadeColor = shade(hit, ray, lightDir) * shadow;
                finalColor += color * shadeColor;
                
                ray.origin = hit.point + hit.normal * EPSILON;
                ray.direction = reflect(ray.direction, hit.normal);
                
                color *= hit.reflectivity;
            } else {
                finalColor += color * skyColor(ray);
                break;
            }
        }

        return finalColor;
    }

    void main() {
        vec3 color = vec3(0.0);
        
        for (int y = 0; y < 2; y++) {
            for (int x = 0; x < 2; x++) {
                vec2 offset = vec2(float(x), float(y)) / 2.0 - 0.5;
                vec2 uv = ((gl_FragCoord.xy + offset) - 0.5 * resolution) / resolution.y;
                Ray ray;
                ray.origin = cameraPosition;
                ray.direction = normalize(vec3(uv, 1.0));
                
                color += traceRay(ray);
            }
        }
        
        color /= 4.0; // Average the samples
        
        // Tone mapping and gamma correction
        color = color / (color + vec3(1.0));
        color = pow(color, vec3(1.0 / 2.2));
        
        gl_FragColor = vec4(color, 1.0);
    }
`;
