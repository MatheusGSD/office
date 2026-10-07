import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#cfe8ff');

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);

scene.add(new THREE.HemisphereLight('#ffffff', '#b0a090', 1.2));
const sun = new THREE.DirectionalLight('#ffffff', 1.6);
sun.position.set(6, 12, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15 });
scene.add(sun);

const mat = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.8 });

// Chão do escritório
const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 16), mat('#e9d8b8'));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Algumas mesas para dar contexto
for (const [x, z] of [[-6, -3], [-2, -3], [2, -3], [6, -3], [-4, 3], [4, 3]]) {
  const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.75, 1.2), mat('#b08968'));
  desk.position.set(x, 0.375, z);
  desk.castShadow = desk.receiveShadow = true;
  scene.add(desk);
}

// Avatar chibi: cabeça grande, corpo pequeno
const chibi = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.3, 4, 12), mat('#ff8fab'));
body.position.y = 0.45;
const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 16), mat('#f7c9a3'));
head.position.y = 1.15;
const hair = new THREE.Mesh(new THREE.SphereGeometry(0.43, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45), mat('#5a3a22'));
hair.position.y = 1.17;
const eyeGeo = new THREE.SphereGeometry(0.05, 12, 8);
for (const x of [-0.14, 0.14]) {
  const eye = new THREE.Mesh(eyeGeo, mat('#222222'));
  eye.position.set(x, 1.12, 0.37);
  eye.scale.set(1, 1.4, 0.5);
  chibi.add(eye);
}
chibi.add(body, head, hair);
chibi.traverse((o) => { o.castShadow = true; });
scene.add(chibi);

// Controles: WASD / setas
const keys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.code));
window.addEventListener('keyup', (e) => keys.delete(e.code));

const clock = new THREE.Clock();
let walk = 0;

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const dir = new THREE.Vector3(
    (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0),
    0,
    (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0),
  );

  if (dir.lengthSq() > 0) {
    dir.normalize();
    chibi.position.addScaledVector(dir, 4 * dt);
    chibi.position.x = THREE.MathUtils.clamp(chibi.position.x, -11.5, 11.5);
    chibi.position.z = THREE.MathUtils.clamp(chibi.position.z, -7.5, 7.5);
    chibi.rotation.y = Math.atan2(dir.x, dir.z);
    walk += dt * 12;
  } else {
    walk = 0;
  }
  chibi.position.y = Math.abs(Math.sin(walk)) * 0.08;

  camera.position.set(chibi.position.x, 9, chibi.position.z + 9);
  camera.lookAt(chibi.position.x, 0.8, chibi.position.z);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
