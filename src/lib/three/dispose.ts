import * as THREE from 'three';

/** Frees the GPU memory held by every mesh's geometry, material and textures in `root`. */
export function disposeObject(root: THREE.Object3D): void {
  const materials = new Set<THREE.Material>();
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    node.geometry.dispose();
    const nodeMaterials: THREE.Material[] = Array.isArray(node.material) ? node.material : [node.material];
    nodeMaterials.forEach((material) => materials.add(material));
  });
  materials.forEach((material) => {
    Object.values(material).forEach((value) => {
      if (value instanceof THREE.Texture) value.dispose();
    });
    material.dispose();
  });
}
