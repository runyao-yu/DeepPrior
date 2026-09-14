import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const sourcePath = path.join(projectRoot, "public", "common", "scene.glb");
const outputPath = sourcePath;

const lowerAngleDegrees = 65;
const apexAngleDegrees = 180 - lowerAngleDegrees * 2;
const sourceTargetHeight = 0.37643;
const sourceTargetDepth = 0.106007;
const geometryScale = 0.8;
const targetHeight = sourceTargetHeight * geometryScale;
const targetDepth = sourceTargetDepth * geometryScale;
const targetWidth =
  (2 * targetHeight) /
  Math.tan(THREE.MathUtils.degToRad(lowerAngleDegrees));
const geometryOffsetY = 0.021;
const apertureScale = 0.52;
const apertureOffsetWidthRatio = 0.067;
const apertureOffsetHeightRatio = -0.036;

// Three's browser-oriented GLB helpers only need these small platform shims in
// Node. Blob is native in supported Node releases.
globalThis.ProgressEvent ??= class ProgressEvent {
  constructor(type, init = {}) {
    this.type = type;
    Object.assign(this, init);
  }
};

globalThis.FileReader ??= class FileReader {
  result = null;
  error = null;
  onloadend = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(
      (result) => {
        this.result = result;
        this.onloadend?.();
      },
      (error) => {
        this.error = error;
        this.onloadend?.();
      },
    );
  }
};

function fail(message) {
  throw new Error(`[build-triangle-scene] ${message}`);
}

function arrayBufferFrom(buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );
}

async function loadGlb(buffer) {
  return new GLTFLoader().parseAsync(arrayBufferFrom(buffer), "");
}

function angleAt(point, firstNeighbor, secondNeighbor) {
  const first = firstNeighbor.clone().sub(point);
  const second = secondNeighbor.clone().sub(point);
  return THREE.MathUtils.radToDeg(first.angleTo(second));
}

function pointIsInsideTriangle(point, triangle, tolerance = 1e-12) {
  const crossProducts = triangle.map((start, index) => {
    const end = triangle[(index + 1) % triangle.length];
    return (
      (end.x - start.x) * (point.y - start.y) -
      (end.y - start.y) * (point.x - start.x)
    );
  });
  const hasNegative = crossProducts.some((value) => value < -tolerance);
  const hasPositive = crossProducts.some((value) => value > tolerance);
  return !(hasNegative && hasPositive);
}

function validateInnerEdgesContained(inner, outer) {
  for (let edgeIndex = 0; edgeIndex < inner.length; edgeIndex += 1) {
    const start = inner[edgeIndex];
    const end = inner[(edgeIndex + 1) % inner.length];
    for (let sampleIndex = 0; sampleIndex <= 64; sampleIndex += 1) {
      const point = new THREE.Vector2().lerpVectors(
        start,
        end,
        sampleIndex / 64,
      );
      if (!pointIsInsideTriangle(point, outer)) {
        fail(`Inner aperture edge ${edgeIndex} exits the outer triangle`);
      }
    }
  }
}

function buildAuthoredTriangles() {
  const authoredHeight = 1;
  const halfWidth =
    authoredHeight /
    Math.tan(THREE.MathUtils.degToRad(lowerAngleDegrees));
  const baseY = -authoredHeight / 3;
  const apexY = (2 * authoredHeight) / 3;
  const outer = [
    new THREE.Vector2(-halfWidth, baseY),
    new THREE.Vector2(halfWidth, baseY),
    new THREE.Vector2(0, apexY),
  ];
  const centroid = outer
    .reduce((sum, point) => sum.add(point), new THREE.Vector2())
    .multiplyScalar(1 / outer.length);
  const authoredWidth = halfWidth * 2;
  const apertureOffset = new THREE.Vector2(
    authoredWidth * apertureOffsetWidthRatio,
    authoredHeight * apertureOffsetHeightRatio,
  );
  const inner = outer.map((point) =>
    point
      .clone()
      .sub(centroid)
      .multiplyScalar(apertureScale)
      .add(centroid)
      .add(apertureOffset),
  );
  return { apertureOffset, authoredHeight, authoredWidth, inner, outer };
}

function validateAuthoredTriangles({
  apertureOffset,
  authoredHeight,
  authoredWidth,
  inner,
  outer,
}) {
  const [left, right, apex] = outer;
  const angles = [
    angleAt(left, right, apex),
    angleAt(right, apex, left),
    angleAt(apex, left, right),
  ];
  const expectedAngles = [
    lowerAngleDegrees,
    lowerAngleDegrees,
    apexAngleDegrees,
  ];
  angles.forEach((angle, index) => {
    if (Math.abs(angle - expectedAngles[index]) > 1e-10) {
      fail(`Authored triangle angle ${index} is ${angle}, expected ${expectedAngles[index]}`);
    }
  });

  if (Math.abs(left.y - right.y) > 1e-12) {
    fail("The authored lower edge is not horizontal");
  }
  const measuredHeight = apex.y - left.y;
  const measuredWidth = right.x - left.x;
  const derivedWidth =
    (2 * measuredHeight) /
    Math.tan(THREE.MathUtils.degToRad(lowerAngleDegrees));
  if (
    Math.abs(measuredWidth - derivedWidth) > 1e-12 ||
    Math.abs(measuredWidth - authoredWidth) > 1e-12 ||
    Math.abs(measuredHeight - authoredHeight) > 1e-12
  ) {
    fail(`Authored width ${measuredWidth} does not match derived width ${derivedWidth}`);
  }
  if ([...outer, ...inner].some((point) => point.y < left.y - 1e-12)) {
    fail("An authored polygon point extends below the horizontal base edge");
  }

  const [innerLeft, innerRight, innerApex] = inner;
  const innerAngles = [
    angleAt(innerLeft, innerRight, innerApex),
    angleAt(innerRight, innerApex, innerLeft),
    angleAt(innerApex, innerLeft, innerRight),
  ];
  if (!innerAngles.every((angle, index) => Math.abs(angle - angles[index]) <= 1e-10)) {
    fail("The inner aperture is not a similar 65/65/50 triangle");
  }
  if (!inner.every((point) => pointIsInsideTriangle(point, outer))) {
    fail("An inner aperture point lies outside the outer triangle");
  }
  validateInnerEdgesContained(inner, outer);

  const innerCentroid = inner
    .reduce((sum, point) => sum.add(point), new THREE.Vector2())
    .multiplyScalar(1 / inner.length);
  const normalizedOffset = new THREE.Vector2(
    innerCentroid.x / authoredWidth,
    innerCentroid.y / authoredHeight,
  );
  if (
    Math.abs(normalizedOffset.x - apertureOffsetWidthRatio) > 1e-12 ||
    Math.abs(normalizedOffset.y - apertureOffsetHeightRatio) > 1e-12 ||
    !valuesMatch(apertureOffset.toArray(), innerCentroid.toArray(), 1e-12)
  ) {
    fail("The aperture centroid offset does not match the normalized specification");
  }
  return { angles, normalizedOffset };
}

function buildTriangleGeometry() {
  const triangles = buildAuthoredTriangles();
  const { angles, normalizedOffset } = validateAuthoredTriangles(triangles);
  const [left, right, apex] = triangles.outer;
  const [innerLeft, innerRight, innerApex] = triangles.inner;

  const shape = new THREE.Shape();
  shape.moveTo(left.x, left.y);
  shape.lineTo(right.x, right.y);
  shape.lineTo(apex.x, apex.y);
  shape.closePath();

  // Opposite winding marks the centroid-scaled inner triangle as an aperture.
  const hole = new THREE.Path();
  hole.moveTo(innerLeft.x, innerLeft.y);
  hole.lineTo(innerApex.x, innerApex.y);
  hole.lineTo(innerRight.x, innerRight.y);
  hole.closePath();
  shape.holes.push(hole);

  const bevelSize = 0.018;
  const rawGeometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelOffset: -bevelSize,
    bevelSegments: 2,
    bevelSize,
    bevelThickness: 0.025,
    curveSegments: 1,
    depth: 0.22,
    steps: 1,
  });
  const geometry = mergeVertices(rawGeometry, 1e-6);
  rawGeometry.dispose();
  if (!geometry?.index) fail("Could not create indexed triangle geometry");

  geometry.computeBoundingBox();
  const rawBounds = geometry.boundingBox.getSize(new THREE.Vector3());
  const planarScale = targetHeight / rawBounds.y;
  geometry.applyMatrix4(
    new THREE.Matrix4().makeScale(
      planarScale,
      planarScale,
      targetDepth / rawBounds.z,
    ),
  );
  geometry.center();
  geometry.translate(0, geometryOffsetY, 0);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.name = "DeepPrior_Triangle65";
  return { angles, geometry, normalizedOffset };
}

function buildDegenerateGeometry() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0], 3),
  );
  geometry.setAttribute(
    "normal",
    new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3),
  );
  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 2),
  );
  geometry.setIndex([0, 1, 2]);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.name = "DeepPrior_DegenerateSideScreen";
  return geometry;
}

function collectSceneStats(scene) {
  const names = [];
  let nodeCount = 0;
  let meshCount = 0;
  scene.traverse((object) => {
    nodeCount += 1;
    if (object.isMesh) meshCount += 1;
    if (object.name) names.push(object.name);
  });
  return { meshCount, names: names.sort(), nodeCount };
}

function collectNodeLayouts(scene) {
  const layouts = new Map();
  scene.traverse((object) => {
    if (!object.name) return;
    layouts.set(object.name, {
      parentName: object.parent?.name ?? null,
      position: object.position.toArray(),
      quaternion: object.quaternion.toArray(),
      scale: object.scale.toArray(),
    });
  });
  return layouts;
}

function materialNames(mesh) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  return materials.map((material) => material?.name ?? null);
}

function collectMaterialSlots(scene) {
  const slots = new Map();
  scene.traverse((object) => {
    if (object.isMesh) slots.set(object.name, materialNames(object));
  });
  return slots;
}

function normalizeBrandNodeNames(scene) {
  for (const suffix of ["_A", "_Outline", "_SideScreen"]) {
    const canonicalName = `DeepPrior${suffix}`;
    if (scene.getObjectByName(canonicalName)) continue;

    let candidate = null;
    scene.traverse((object) => {
      if (!candidate && object.name.endsWith(suffix)) candidate = object;
    });
    if (!candidate) fail(`Source GLB is missing its ${suffix} brand mesh`);

    candidate.name = canonicalName;
    if (candidate.userData && typeof candidate.userData.name === "string") {
      candidate.userData.name = canonicalName;
    }
  }
}

function collectPreservedMeshStats(scene) {
  const stats = new Map();
  scene.traverse((object) => {
    if (
      !object.isMesh ||
      object.name === "DeepPrior_A" ||
      object.name === "DeepPrior_SideScreen"
    ) {
      return;
    }
    object.geometry.computeBoundingBox();
    stats.set(object.name, {
      attributes: Object.keys(object.geometry.attributes).sort(),
      boundsMax: object.geometry.boundingBox.max.toArray(),
      boundsMin: object.geometry.boundingBox.min.toArray(),
      indexCount: object.geometry.index?.count ?? 0,
      positionCount: object.geometry.getAttribute("position")?.count ?? 0,
    });
  });
  return stats;
}

function valuesMatch(left, right, tolerance = 1e-7) {
  return (
    left.length === right.length &&
    left.every((value, index) => Math.abs(value - right[index]) <= tolerance)
  );
}

function geometryStats(geometry) {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox.getSize(new THREE.Vector3());
  const positionCount = geometry.getAttribute("position")?.count ?? 0;
  const triangleCount = (geometry.index?.count ?? positionCount) / 3;
  return { bounds, positionCount, triangleCount };
}

function validatePreservation(
  sourceStats,
  sourceLayouts,
  sourceMaterialSlots,
  preservedMeshes,
  scene,
) {
  const outputStats = collectSceneStats(scene);
  if (
    outputStats.nodeCount !== sourceStats.nodeCount ||
    outputStats.meshCount !== sourceStats.meshCount
  ) {
    fail(
      `Scene counts changed from ${sourceStats.nodeCount}/${sourceStats.meshCount} ` +
        `to ${outputStats.nodeCount}/${outputStats.meshCount}`,
    );
  }
  if (JSON.stringify(outputStats.names) !== JSON.stringify(sourceStats.names)) {
    fail("The generated GLB does not preserve the complete named-node set");
  }

  for (const [name, expected] of sourceLayouts) {
    const object = scene.getObjectByName(name);
    if (
      !object ||
      (object.parent?.name ?? null) !== expected.parentName ||
      !valuesMatch(object.position.toArray(), expected.position) ||
      !valuesMatch(object.quaternion.toArray(), expected.quaternion) ||
      !valuesMatch(object.scale.toArray(), expected.scale)
    ) {
      fail(`Node hierarchy or transform changed for ${name}`);
    }
  }

  for (const [name, expected] of sourceMaterialSlots) {
    const mesh = scene.getObjectByName(name);
    if (!mesh?.isMesh || JSON.stringify(materialNames(mesh)) !== JSON.stringify(expected)) {
      fail(`Material slots changed for ${name}`);
    }
  }

  for (const [name, expected] of preservedMeshes) {
    const mesh = scene.getObjectByName(name);
    if (!mesh?.isMesh) fail(`Preserved mesh ${name} is missing`);
    mesh.geometry.computeBoundingBox();
    const attributes = Object.keys(mesh.geometry.attributes).sort();
    if (
      JSON.stringify(attributes) !== JSON.stringify(expected.attributes) ||
      mesh.geometry.getAttribute("position")?.count !== expected.positionCount ||
      (mesh.geometry.index?.count ?? 0) !== expected.indexCount ||
      !valuesMatch(mesh.geometry.boundingBox.min.toArray(), expected.boundsMin) ||
      !valuesMatch(mesh.geometry.boundingBox.max.toArray(), expected.boundsMax)
    ) {
      fail(`Geometry changed for preserved mesh ${name}`);
    }
  }
  return outputStats;
}

function validateTriangle(scene) {
  const triangle = scene.getObjectByName("DeepPrior_A");
  const sideScreen = scene.getObjectByName("DeepPrior_SideScreen");
  const outline = scene.getObjectByName("DeepPrior_Outline");
  if (!triangle?.isMesh || !sideScreen?.isMesh || !outline?.isMesh) {
    fail("Required DeepPrior_A, DeepPrior_Outline, or DeepPrior_SideScreen mesh is missing");
  }
  for (const attributeName of ["position", "normal", "uv"]) {
    if (!triangle.geometry.getAttribute(attributeName)?.count) {
      fail(`DeepPrior_A is missing its ${attributeName} attribute`);
    }
  }
  if (!triangle.geometry.index?.count) fail("DeepPrior_A is not indexed");

  const stats = geometryStats(triangle.geometry);
  const expectedBounds = [targetWidth, targetHeight, targetDepth];
  stats.bounds.toArray().forEach((value, index) => {
    if (Math.abs(value - expectedBounds[index]) > 1e-5) {
      fail(`DeepPrior_A bound ${index} is ${value}, expected ${expectedBounds[index]}`);
    }
  });
  const boundsCenter = triangle.geometry.boundingBox.getCenter(new THREE.Vector3());
  const expectedMinimumY = geometryOffsetY - targetHeight / 2;
  const expectedMaximumY = geometryOffsetY + targetHeight / 2;
  if (
    Math.abs(boundsCenter.x) > 1e-5 ||
    Math.abs(boundsCenter.y - geometryOffsetY) > 1e-5 ||
    Math.abs(triangle.geometry.boundingBox.min.y - expectedMinimumY) > 1e-5 ||
    Math.abs(triangle.geometry.boundingBox.max.y - expectedMaximumY) > 1e-5
  ) {
    fail("DeepPrior_A geometry does not have the specified centered-X and offset-Y bounds");
  }

  const sideStats = geometryStats(sideScreen.geometry);
  if (sideStats.positionCount === 0 || sideStats.bounds.lengthSq() > 1e-16) {
    fail("DeepPrior_SideScreen is not a preserved degenerate mesh");
  }
  return { boundsCenter, ...stats };
}

async function build() {
  const sourceBuffer = await readFile(sourcePath);
  const sourceGltf = await loadGlb(sourceBuffer);
  normalizeBrandNodeNames(sourceGltf.scene);
  const sourceStats = collectSceneStats(sourceGltf.scene);
  const sourceLayouts = collectNodeLayouts(sourceGltf.scene);
  const sourceMaterialSlots = collectMaterialSlots(sourceGltf.scene);
  const preservedMeshes = collectPreservedMeshStats(sourceGltf.scene);
  const triangle = sourceGltf.scene.getObjectByName("DeepPrior_A");
  const sideScreen = sourceGltf.scene.getObjectByName("DeepPrior_SideScreen");
  if (!triangle?.isMesh || !sideScreen?.isMesh) {
    fail("Source GLB is missing DeepPrior_A or DeepPrior_SideScreen");
  }

  const { angles, geometry, normalizedOffset } = buildTriangleGeometry();
  triangle.geometry = geometry;
  sideScreen.geometry = buildDegenerateGeometry();

  // Promote GLTFLoader's named root Group to the exported glTF scene, avoiding
  // an additional auxiliary wrapper while preserving the original hierarchy.
  const exportScene = new THREE.Scene();
  exportScene.name = sourceGltf.scene.name;
  exportScene.position.copy(sourceGltf.scene.position);
  exportScene.quaternion.copy(sourceGltf.scene.quaternion);
  exportScene.scale.copy(sourceGltf.scene.scale);
  exportScene.userData = structuredClone(sourceGltf.scene.userData);
  for (const child of [...sourceGltf.scene.children]) exportScene.add(child);

  const binary = await new GLTFExporter().parseAsync(exportScene, {
    animations: sourceGltf.animations,
    binary: true,
    includeCustomExtensions: true,
    onlyVisible: false,
  });
  if (!(binary instanceof ArrayBuffer)) fail("GLTFExporter did not produce a GLB");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, new Uint8Array(binary));

  const generatedBuffer = await readFile(outputPath);
  const generatedGltf = await loadGlb(generatedBuffer);
  const outputStats = validatePreservation(
    sourceStats,
    sourceLayouts,
    sourceMaterialSlots,
    preservedMeshes,
    generatedGltf.scene,
  );
  const stats = validateTriangle(generatedGltf.scene);
  const sizeKiB = (generatedBuffer.length / 1024).toFixed(1);
  const dimensions = stats.bounds.toArray().map((value) => value.toFixed(6));
  const center = stats.boundsCenter.toArray().map((value) => value.toFixed(6));
  const formattedAngles = angles.map((angle) => `${angle.toFixed(6)}°`);
  const formattedApertureOffset = normalizedOffset
    .toArray()
    .map((value) => value.toFixed(6));
  console.log(
    `[build-triangle-scene] wrote public/common/scene.glb (${sizeKiB} KiB); ` +
      `${outputStats.nodeCount} nodes, ${outputStats.meshCount} meshes; ` +
      `DeepPrior_A ${stats.positionCount} vertices, ${stats.triangleCount} triangles, ` +
      `bounds ${dimensions.join(" × ")}, center ${center.join("/")}; ` +
      `angles ${formattedAngles.join("/")}; aperture ${apertureScale.toFixed(2)} ` +
      `at ${formattedApertureOffset.join("/")}; ` +
      `DeepPrior_SideScreen degenerate`,
  );
}

build().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
