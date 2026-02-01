/**
 * 3D Renderer using Three.js
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IRenderer } from '../types';
import { VisualizerConfig, PresetConfig, ColorPoint } from '../types';

export class Renderer3D implements IRenderer {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private container: HTMLElement | null = null;
  private config: VisualizerConfig | null = null;
  private animationId: number | null = null;
  private mesh: THREE.Mesh | null = null;
  private axesHelper: THREE.AxesHelper | null = null;
  private gridHelper: THREE.GridHelper | null = null;
  private controls: OrbitControls | null = null;

  init(container: HTMLElement, config: VisualizerConfig): void {
    this.container = container;
    this.config = config;

    const width = config.width || container.clientWidth || 800;
    const height = config.height || container.clientHeight || 600;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(
      config.backgroundColor || '#f0f0f0'
    );

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(3, 3, 3);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Controls (if interactive)
    if (config.interactive !== false) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.update();
    }

    this.startRenderLoop();
  }

  render(preset: PresetConfig): void {
    if (!this.scene || !this.camera || !this.renderer) {
      throw new Error('Renderer not initialized. Call init() first.');
    }

    // Clear existing mesh
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose();
      }
    }

    // Remove helpers
    if (this.axesHelper) {
      this.scene.remove(this.axesHelper);
    }
    if (this.gridHelper) {
      this.scene.remove(this.gridHelper);
    }

    const config = this.config || preset.config || {};
    const size = preset.size || { width: 1, height: 1, depth: 1 };

    // Normalize size for 3D rendering (Three.js works better with smaller units)
    const scale = 1 / 255; // Scale down from 0-255 range to 0-1 range
    const normalizedWidth = (size.width || 255) * scale;
    const normalizedHeight = (size.height || 255) * scale;
    const normalizedDepth = (size.depth || size.width || 255) * scale;

    // Create geometry based on shape
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (preset.shape) {
      case 'cube':
        geometry = new THREE.BoxGeometry(
          normalizedWidth,
          normalizedHeight,
          normalizedDepth
        );
        material = this.createCubeMaterial(preset);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          normalizedWidth / 2,
          32,
          32
        );
        material = this.createSphereMaterial();
        break;
      default:
        geometry = new THREE.BoxGeometry(
          normalizedWidth,
          normalizedHeight,
          normalizedDepth
        );
        material = this.createCubeMaterial(preset);
    }

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    // Add axes helper
    if (config.showAxes !== false) {
      const scale = 1 / 255;
      const axisLength = Math.max(
        (size.width || 255) * scale,
        (size.height || 255) * scale,
        (size.depth || size.width || 255) * scale
      ) * 1.5;
      this.axesHelper = new THREE.AxesHelper(axisLength);
      this.scene.add(this.axesHelper);
    }

    // Add grid helper
    if (config.showGrid !== false) {
      const scale = 1 / 255;
      const gridSize = Math.max(
        (size.width || 255) * scale,
        (size.height || 255) * scale,
        (size.depth || size.width || 255) * scale
      ) * 2;
      this.gridHelper = new THREE.GridHelper(gridSize, 10);
      this.scene.add(this.gridHelper);
    }

    // Center the camera on the cube
    if (this.camera && this.controls) {
      const scale = 1 / 255;
      const center = new THREE.Vector3(
        (size.width || 255) * scale * 0.5,
        (size.height || 255) * scale * 0.5,
        (size.depth || size.width || 255) * scale * 0.5
      );
      this.controls.target.copy(center);
      this.controls.update();
    }
  }

  update(points: ColorPoint[]): void {
    // Update visualization with new color points
    // This can be used for dynamic updates
    if (this.mesh && points.length > 0) {
      // Update material or geometry based on points
      // Implementation depends on specific use case
    }
  }

  resize(width: number, height: number): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  destroy(): void {
    this.stopRenderLoop();

    if (this.mesh) {
      this.scene?.remove(this.mesh);
      this.mesh.geometry.dispose();
      if (this.mesh.material instanceof THREE.Material) {
        this.mesh.material.dispose();
      }
      this.mesh = null;
    }

    if (this.axesHelper) {
      this.scene?.remove(this.axesHelper);
      this.axesHelper = null;
    }

    if (this.gridHelper) {
      this.scene?.remove(this.gridHelper);
      this.gridHelper = null;
    }

    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    if (this.renderer && this.container) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.container = null;
  }

  private createCubeMaterial(preset: PresetConfig): THREE.Material {
    // For RGB cube, create a shader material that visualizes RGB colors
    if (preset.colorSpace.name === 'RGB') {
      const size = preset.size || { width: 255, height: 255, depth: 255 };
      
      // Create a shader material that visualizes RGB cube
      // Position is normalized to 0-1 range, then converted to RGB
      const vertexShader = `
        varying vec3 vPosition;
        uniform vec3 uSize;
        uniform vec3 uOffset;
        
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform vec3 uSize;
        uniform vec3 uOffset;
        varying vec3 vPosition;
        
        void main() {
          // Normalize position from -size/2 to +size/2 to 0-1 range
          // Since geometry is already scaled, we need to account for that
          vec3 normalized = (vPosition / uSize) + 0.5;
          // Clamp to valid RGB range
          normalized = clamp(normalized, 0.0, 1.0);
          // The normalized values represent R, G, B directly
          gl_FragColor = vec4(normalized, 1.0);
        }
      `;

      return new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uSize: {
            value: new THREE.Vector3(
              size.width,
              size.height,
              size.depth || size.width
            ),
          },
          uOffset: {
            value: new THREE.Vector3(0, 0, 0),
          },
        },
        side: THREE.DoubleSide,
      });
    }

    // Default material
    return new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.3,
      roughness: 0.7,
    });
  }

  private createSphereMaterial(): THREE.Material {
    // Similar to cube but for sphere
    return new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.3,
      roughness: 0.7,
    });
  }

  private startRenderLoop(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      if (this.mesh && this.config?.animation?.enabled) {
        // Rotate the mesh if animation is enabled
        const speed = this.config.animation?.speed || 0.01;
        this.mesh.rotation.x += speed;
        this.mesh.rotation.y += speed;
      }

      // Update controls
      if (this.controls) {
        this.controls.update();
      }

      if (this.scene && this.camera && this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
  }

  private stopRenderLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
