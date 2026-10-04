import * as THREE from "three";
import canTextureUrl from "../assets/home-redbull-ps2-texture.webp";
import { advanceSpin } from "./home-object-motion.js";

const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;

function pixelTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function discTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  const pixels = context.createImageData(128, 128);
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const dx = x - 63.5, dy = y - 63.5;
    const angle = Math.atan2(dy, dx);
    const radius = Math.hypot(dx, dy);
    const grain = (Math.sin(x * 127.1 + y * 311.7) * 43758.5453 % 1) * .035;
    const beam = Math.pow(Math.abs(Math.cos(angle - .35)), 10);
    const rings = Math.sin(radius * 4.5) * .014;
    const light = .70 + Math.sin(angle * 2 + .6) * .1 + grain + rings;
    const color = new THREE.Color().setHSL(.64 + beam * (radius / 64 * .95 - .42), .07 + beam * .55, light + beam * .025).convertLinearToSRGB();
    const i = (y * 128 + x) * 4;
    pixels.data[i] = color.r * 255;
    pixels.data[i + 1] = color.g * 255;
    pixels.data[i + 2] = color.b * 255;
    pixels.data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  return pixelTexture(canvas);
}

function lidTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d");
  context.fillStyle = "#aeb3bf";
  context.fillRect(0, 0, 64, 64);
  for (let r = 28; r > 18; r -= 3) {
    context.strokeStyle = r % 2 ? "#838a96" : "#d6d8dc";
    context.beginPath(); context.arc(32, 32, r, 0, TAU); context.stroke();
  }
  context.fillStyle = "#690909";
  context.fillRect(42, 2, 7, 16);
  context.fillRect(5, 35, 13, 4);
  context.fillStyle = "#a31816";
  context.fillRect(43, 2, 3, 13);
  context.fillRect(13, 38, 3, 7);
  return pixelTexture(canvas);
}

function createCan(texture) {
  const group = new THREE.Group();
  const geometry = new THREE.CylinderGeometry(.43, .43, 2.22, 20, 14, true, Math.PI);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const angle = Math.atan2(x, z);
    const envelope = Math.sin((y / 2.22 + .5) * Math.PI);
    const fold = .12 * Math.sin(y * 12 + angle * 3) + .055 * Math.cos(y * 21 - angle * 2);
    const dent = .26 * Math.exp(-Math.pow((y - .17) / .32, 2)) * (.6 + .4 * Math.cos(angle + 1));
    const radius = .43 * (1 + envelope * fold - dent);
    const twist = angle + envelope * .1 * Math.sin(y * 8);
    positions.setXYZ(i,
      Math.sin(twist) * radius + envelope * .065 * Math.sin(y * 4),
      y + envelope * .035 * Math.cos(angle * 3 + y * 11),
      Math.cos(twist) * radius);
  }
  geometry.computeVertexNormals();
  const metal = new THREE.MeshPhongMaterial({ color:0xc6cad1, specular:0xcbd6ed, shininess:36, flatShading:true });
  const body = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ map:texture, specular:0x8a97b1, shininess:22, flatShading:true }));
  group.add(body);
  for (const sign of [-1, 1]) {
    const bevel = new THREE.Mesh(new THREE.CylinderGeometry(.40, .43, .055, 20), metal);
    bevel.position.y = sign * 1.135;
    if (sign < 0) bevel.rotation.z = Math.PI;
    group.add(bevel);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.4, .018, 4, 20), metal);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = sign * 1.165;
    group.add(rim);
  }
  const lid = new THREE.Mesh(new THREE.CircleGeometry(.395, 20), new THREE.MeshPhongMaterial({ map:lidTexture(), specular:0xbcc6d6, shininess:32 }));
  lid.rotation.x = -Math.PI / 2;
  lid.position.y = 1.166;
  group.add(lid);
  const opening = new THREE.Mesh(new THREE.CircleGeometry(.10, 10), new THREE.MeshBasicMaterial({ color:0x303642 }));
  opening.rotation.x = -Math.PI / 2;
  opening.scale.y = 1.5;
  opening.position.set(0, 1.17, -.16);
  group.add(opening);
  const tab = new THREE.Mesh(new THREE.TorusGeometry(.09, .027, 4, 10), metal);
  tab.rotation.x = -Math.PI / 2;
  tab.scale.set(.8, 1.4, 1);
  tab.position.set(0, 1.185, .025);
  group.add(tab);
  group.rotation.set(.13, -.08, -.22);
  return group;
}

function createDisc() {
  const group = new THREE.Group();
  const surface = new THREE.ShaderMaterial({
    uniforms: { discMap: { value:discTexture() } },
    vertexShader: `
      varying vec2 discUv;
      varying vec3 discNormal;
      void main() {
        discUv = uv;
        discNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D discMap;
      varying vec2 discUv;
      varying vec3 discNormal;
      void main() {
        vec3 normal = normalize(discNormal);
        vec3 light = normalize(vec3(-0.3, 0.5, 1.0));
        float shade = floor((0.5 + 0.5 * dot(normal, light)) * 6.0) / 6.0;
        float glint = pow(max(dot(reflect(-light, normal), vec3(0.0, 0.0, 1.0)), 0.0), 18.0);
        vec3 color = texture2D(discMap, discUv).rgb * (0.68 + 0.22 * shade);
        color += vec3(0.07, 0.065, 0.09) * glint;
        gl_FragColor = vec4(min(color, vec3(0.86)), 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
  const metal = new THREE.MeshPhongMaterial({ color:0xb9bdcc, specular:0xeeeeff, shininess:52, flatShading:true, side:THREE.DoubleSide });
  for (const sign of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.RingGeometry(.23, 1.27, 32, 1), surface);
    face.position.z = sign * .018;
    if (sign < 0) face.rotation.y = Math.PI;
    group.add(face);
    const hub = new THREE.Mesh(new THREE.RingGeometry(.23, .32, 32), metal);
    hub.position.z = sign * .019;
    if (sign < 0) hub.rotation.y = Math.PI;
    group.add(hub);
  }
  for (const radius of [.23, 1.27]) {
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, .036, 32, 1, true), metal);
    edge.rotation.x = Math.PI / 2;
    group.add(edge);
  }
  group.rotation.set(.65, -.42, -.45);
  return group;
}

export async function mountHomeObject(host, kind) {
  const texture = kind === "can" ? await new THREE.TextureLoader().loadAsync(canTextureUrl) : null;
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
  }
  const canvas = host.querySelector("canvas");
  let card = host.closest(".home-destination");
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:false, powerPreference:"low-power" }); }
  catch (error) { texture?.dispose(); throw error; }
  renderer.setPixelRatio(1);
  renderer.setClearColor(0xffffff, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.7, 1.7, 1.7, -1.7, .1, 20);
  camera.position.set(0, 0, 7);
  scene.add(new THREE.HemisphereLight(0xe9edff, 0x555066, 2.15));
  const light = new THREE.DirectionalLight(0xffffff, 2.1);
  light.position.set(-3, 4, 5); scene.add(light);
  const rim = new THREE.DirectionalLight(0x899fff, .9);
  rim.position.set(3, -1, -2); scene.add(rim);
  const pivot = new THREE.Group();
  const model = kind === "can" ? createCan(texture) : createDisc();
  const initialRotation = model.rotation.clone();
  pivot.add(model); scene.add(pivot);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const cruiseSpeed = kind === "can" ? .14 : .22;
  const drag = { pointer:null, moved:false, x:0, y:0, startX:0, startY:0, time:0, move:false };
  const velocity = new THREE.Vector2(kind === "can" ? cruiseSpeed : 0, 0);
  const spinDirection = new THREE.Vector2(1, 0);
  const sampledVelocity = new THREE.Vector2();
  let hasRotated = false, rollSpeed = cruiseSpeed;
  const deltaRotation = new THREE.Quaternion();
  const angles = new THREE.Euler(0, 0, 0, "YXZ");
  let frame, lastTime = 0, visible = true, hovered = false, disposed = false;
  let suppressNextClick = false;

  function rotate(dx, dy) {
    angles.set(dy, dx, 0);
    deltaRotation.setFromEuler(angles);
    pivot.quaternion.premultiply(deltaRotation).normalize();
  }
  function reset() {
    pivot.quaternion.identity(); pivot.position.set(0, 0, 0);
    velocity.set(kind === "can" ? cruiseSpeed : 0, 0);
    spinDirection.set(1, 0); hasRotated = false; rollSpeed = cruiseSpeed;
    model.rotation.copy(initialRotation);
  }
  function pointerDown(event) {
    if (event.button !== 0 || drag.pointer !== null) return;
    suppressNextClick = false;
    drag.pointer = event.pointerId;
    drag.moved = false;
    drag.x = drag.startX = event.clientX;
    drag.y = drag.startY = event.clientY;
    drag.time = event.timeStamp;
    drag.move = event.shiftKey;
    velocity.set(0, 0);
    card.setPointerCapture(event.pointerId);
  }
  function pointerMove(event) {
    if (event.pointerId !== drag.pointer) return;
    if ((event.buttons & 1) === 0) { interruptDrag(); return; }
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;
    drag.moved = true;
    card.dataset.objectDragging = "true";
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    const seconds = Math.max((event.timeStamp - drag.time) / 1000, 1 / 240);
    drag.x = event.clientX; drag.y = event.clientY;
    drag.time = event.timeStamp;
    if (drag.move) {
      const scale = 3.4 / host.clientWidth;
      pivot.position.x = clamp(pivot.position.x + dx * scale, -.35, .35);
      pivot.position.y = clamp(pivot.position.y - dy * scale, -.32, .32);
    } else {
      rotate(dx * .014, dy * .014);
      // Measure the hand's angular speed, smoothing uneven pointer event intervals.
      sampledVelocity.set(dx * .014 / seconds, dy * .014 / seconds).clampLength(0, 4);
      velocity.lerp(sampledVelocity, 1 - Math.exp(-seconds * 24));
      if (velocity.lengthSq() > .01) spinDirection.copy(velocity).normalize();
      hasRotated = true;
    }
    event.preventDefault();
  }
  function releaseDrag() {
    const pointer = drag.pointer;
    if (pointer === null) return;
    // Clear first: releasing capture can synchronously send lostpointercapture.
    drag.pointer = null;
    if (drag.moved) suppressNextClick = true;
    delete card.dataset.objectDragging;
    if (card.hasPointerCapture(pointer)) card.releasePointerCapture(pointer);
  }
  function interruptDrag() {
    if (drag.pointer !== null) {
      velocity.set(0, 0);
      releaseDrag();
    }
    hovered = false;
  }
  function visibilityChanged() {
    if (document.hidden) interruptDrag();
  }
  function pointerUp(event) {
    if (event.pointerId !== drag.pointer) return;
    // Holding still before release should not replay the last fast movement.
    const heldSeconds = Math.max(0, (event.timeStamp - drag.time) / 1000 - .06);
    velocity.multiplyScalar(Math.exp(-heldSeconds * 10));
    if (event.type === "pointercancel" || event.type === "lostpointercapture") velocity.set(0, 0);
    releaseDrag();
    const rect = card.getBoundingClientRect();
    hovered = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }
  function click(event) {
    if (event.detail && suppressNextClick) {
      suppressNextClick = false;
      event.preventDefault(); event.stopPropagation();
    }
  }
  function keyDown(event) {
    const directions = { ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1] };
    if (event.key === "Escape") { reset(); event.preventDefault(); return; }
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    velocity.set(0, 0);
    if (event.shiftKey) {
      pivot.position.x = clamp(pivot.position.x + direction[0] * .08, -.35, .35);
      pivot.position.y = clamp(pivot.position.y - direction[1] * .08, -.32, .32);
    } else {
      rotate(direction[0] * .16, direction[1] * .16);
      spinDirection.set(direction[0], direction[1]);
      velocity.copy(spinDirection).multiplyScalar(.8);
      hasRotated = true;
    }
  }
  const enter = () => { hovered = true; };
  const leave = () => { hovered = false; };
  const lost = event => { event.preventDefault(); interruptDrag(); delete host.dataset.ready; };
  const restored = () => { host.dataset.ready = "true"; };
  const events = { pointerdown:pointerDown, pointermove:pointerMove, pointerup:pointerUp, pointercancel:pointerUp, lostpointercapture:pointerUp, pointerenter:enter, pointerleave:leave, keydown:keyDown };
  function setInteractionTarget(nextCard) {
    releaseDrag();
    if (card) {
      for (const [name, handler] of Object.entries(events)) card.removeEventListener(name, handler);
      card.removeEventListener("click", click, true);
      delete card.dataset.objectDragging;
    }
    drag.pointer = null;
    hovered = false;
    card = nextCard;
    if (card) {
      for (const [name, handler] of Object.entries(events)) card.addEventListener(name, handler);
      card.addEventListener("click", click, true);
    }
  }
  setInteractionTarget(card);
  window.addEventListener("pointerup", pointerUp, true);
  window.addEventListener("pointercancel", pointerUp, true);
  window.addEventListener("blur", interruptDrag);
  document.addEventListener("visibilitychange", visibilityChanged);
  canvas.addEventListener("webglcontextlost", lost);
  canvas.addEventListener("webglcontextrestored", restored);
  const resize = new ResizeObserver(() => {
    const size = Math.max(96, Math.min(160, Math.round(host.clientWidth * .78)));
    renderer.setSize(size, size, false);
    // Resizing clears the drawing buffer, including while the tab is in the background.
    renderer.render(scene, camera);
  });
  resize.observe(host);
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  intersection.observe(host);
  function animate(time) {
    if (disposed) return;
    frame = requestAnimationFrame(animate);
    const elapsed = time - lastTime;
    if (elapsed < 1000 / 30) return;
    const dt = Math.min(elapsed / 1000, .05);
    lastTime = time;
    if (!card || !visible || document.hidden || renderer.getContext().isContextLost()) return;
    if (drag.pointer === null && !reducedMotion.matches) {
      const targetSpeed = cruiseSpeed * (hovered || card?.matches(":focus-visible") ? .3 : 1);
      if (kind === "disc" && !hasRotated) {
        const roll = advanceSpin(rollSpeed, targetSpeed, dt);
        rollSpeed = roll.velocity;
        model.rotateZ(roll.angle);
      } else {
        // Momentum settles into a quiet spin in the last drag direction, never a hard stop.
        const yaw = advanceSpin(velocity.x, spinDirection.x * targetSpeed, dt);
        const pitch = advanceSpin(velocity.y, spinDirection.y * targetSpeed, dt);
        velocity.set(yaw.velocity, pitch.velocity);
        rotate(yaw.angle, pitch.angle);
      }
    }
    renderer.render(scene, camera);
  }
  renderer.setSize(152, 152, false);
  renderer.render(scene, camera);
  host.dataset.ready = "true";
  frame = requestAnimationFrame(animate);

  const dispose = () => {
    disposed = true; cancelAnimationFrame(frame);
    resize.disconnect(); intersection.disconnect();
    window.removeEventListener("pointerup", pointerUp, true);
    window.removeEventListener("pointercancel", pointerUp, true);
    window.removeEventListener("blur", interruptDrag);
    document.removeEventListener("visibilitychange", visibilityChanged);
    setInteractionTarget(null);
    canvas.removeEventListener("webglcontextlost", lost);
    canvas.removeEventListener("webglcontextrestored", restored);
    const textures = new Set(), materials = new Set(), geometries = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.material) materials.add(object.material);
    });
    for (const material of materials) {
      if (material.map) textures.add(material.map);
      if (material.uniforms?.discMap) textures.add(material.uniforms.discMap.value);
      material.dispose();
    }
    for (const texture of textures) texture.dispose();
    for (const geometry of geometries) geometry.dispose();
    renderer.dispose();
    delete host.dataset.ready;
  };
  dispose.setInteractionTarget = setInteractionTarget;
  return dispose;
}
