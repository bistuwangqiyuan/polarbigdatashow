'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/* ── constants ── */
const PANEL_W = 1.0
const PANEL_H = 0.8
const PANEL_THICK = 0.03
const TILT = (30 * Math.PI) / 180
const STAND_COLOR = 0xb0b8c8
const GAP_X = 1.35
const GAP_Z = 1.8
const POSITIONS = [
  [-(GAP_X / 2), 0, 0],
  [GAP_X / 2, 0, 0],
  [-(GAP_X / 2), 0, -GAP_Z],
  [GAP_X / 2, 0, -GAP_Z],
]

/* ── procedural solar cell texture ── */
function createSolarTexture() {
  const size = 512
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#1a2744'
  ctx.fillRect(0, 0, size, size)

  const cols = 6, rows = 10, g = 2
  const cw = size / cols, ch = size / rows
  for (let r = 0; r < rows; r++) {
    for (let cl = 0; cl < cols; cl++) {
      const grd = ctx.createLinearGradient(cl * cw, r * ch, (cl + 1) * cw, (r + 1) * ch)
      grd.addColorStop(0, '#1e3a5f')
      grd.addColorStop(0.5, '#2a5080')
      grd.addColorStop(1, '#1e3a5f')
      ctx.fillStyle = grd
      ctx.fillRect(cl * cw + g, r * ch + g, cw - g * 2, ch - g * 2)
      ctx.strokeStyle = 'rgba(120,180,255,0.12)'
      ctx.lineWidth = 0.5
      const mx = cl * cw + cw / 2
      ctx.beginPath()
      ctx.moveTo(mx, r * ch + g)
      ctx.lineTo(mx, (r + 1) * ch - g)
      ctx.stroke()
    }
  }
  ctx.strokeStyle = 'rgba(200,200,200,0.5)'
  ctx.lineWidth = 3
  ctx.strokeRect(1, 1, size - 2, size - 2)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/* ── tube between two points ── */
function createTube(scene, a, b, radius, mat) {
  const s = new THREE.Vector3(...a)
  const e = new THREE.Vector3(...b)
  const mid = s.clone().add(e).multiplyScalar(0.5)
  const len = s.distanceTo(e)
  const dir = e.clone().sub(s).normalize()
  const geo = new THREE.CylinderGeometry(radius, radius, len, 8)
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.copy(mid)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
  scene.add(mesh)
  return mesh
}

/* ── build triangular stand ── */
function buildStand(parent) {
  const mat = new THREE.MeshStandardMaterial({ color: STAND_COLOR, metalness: 0.85, roughness: 0.18 })
  const r = 0.012
  const frontH = PANEL_H * Math.sin(TILT) + 0.05
  const rearH = 0.05
  const baseD = PANEL_H * Math.cos(TILT)
  const halfW = PANEL_W / 2 - 0.06

  const legs = []
  for (const side of [-1, 1]) {
    const x = side * halfW
    legs.push([[x, 0, 0], [x, frontH, 0]])
    legs.push([[x, 0, -baseD], [x, rearH, -baseD]])
    legs.push([[x, frontH, 0], [x, rearH, -baseD]])
  }
  legs.push([[-halfW, frontH * 0.5, -baseD * 0.3], [halfW, frontH * 0.5, -baseD * 0.3]])
  legs.push([[-halfW, 0, 0], [halfW, 0, 0]])
  legs.push([[-halfW, 0, -baseD], [halfW, 0, -baseD]])

  for (const [a, b] of legs) createTube(parent, a, b, r, mat)
}

/* ── build one panel assembly ── */
function buildPanelAssembly(parent, index) {
  const group = new THREE.Group()
  parent.add(group)

  buildStand(group)

  const frontH = PANEL_H * Math.sin(TILT) + 0.05
  const rearH = 0.05
  const pivotY = (frontH + rearH) / 2 + 0.02

  const tiltGroup = new THREE.Group()
  tiltGroup.position.set(0, pivotY, -PANEL_H * Math.cos(TILT) * 0.5)
  tiltGroup.rotation.x = -TILT
  group.add(tiltGroup)

  const solarTex = createSolarTexture()
  const panelMat = new THREE.MeshPhysicalMaterial({
    map: solarTex,
    metalness: 0.1,
    roughness: 0.15,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    reflectivity: 0.6,
    envMapIntensity: 0.8,
  })
  const panelMesh = new THREE.Mesh(
    new THREE.BoxGeometry(PANEL_W, PANEL_H, PANEL_THICK),
    panelMat
  )
  panelMesh.castShadow = true
  panelMesh.userData = { panelIndex: index }
  tiltGroup.add(panelMesh)

  const frameMat = new THREE.MeshStandardMaterial({ color: 0xc0c8d4, metalness: 0.9, roughness: 0.15 })
  const frames = [
    [0, PANEL_H / 2, 0, PANEL_W + 0.02, 0.018, PANEL_THICK + 0.006],
    [0, -PANEL_H / 2, 0, PANEL_W + 0.02, 0.018, PANEL_THICK + 0.006],
    [-PANEL_W / 2, 0, 0, 0.018, PANEL_H + 0.02, PANEL_THICK + 0.006],
    [PANEL_W / 2, 0, 0, 0.018, PANEL_H + 0.02, PANEL_THICK + 0.006],
  ]
  for (const [x, y, z, w, h, d] of frames) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat)
    m.position.set(x, y, z)
    tiltGroup.add(m)
  }

  const ledGeo = new THREE.SphereGeometry(0.008, 16, 16)
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x4ade80, emissiveIntensity: 2 })
  const led = new THREE.Mesh(ledGeo, ledMat)
  led.position.set(PANEL_W / 2 - 0.04, PANEL_H / 2 - 0.04, PANEL_THICK / 2 + 0.005)
  tiltGroup.add(led)

  return { group, led, panelMesh }
}

/* ── inverter box ── */
function buildInverter(parent, pos) {
  const g = new THREE.Group()
  g.position.set(...pos)
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.35, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x2a2a3a, metalness: 0.7, roughness: 0.3 })
  )
  box.castShadow = true
  g.add(box)
  const indicator = new THREE.Mesh(
    new THREE.CircleGeometry(0.02, 16),
    new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 0.5 })
  )
  indicator.position.set(0, 0.08, 0.065)
  g.add(indicator)
  parent.add(g)
  return indicator
}

/* ── energy particles ── */
function createParticles(parent, count = 80) {
  const positions = new Float32Array(count * 3)
  const velocities = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4
    positions[i * 3 + 1] = Math.random() * 0.3 + 0.05
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3
    velocities[i * 3] = (Math.random() - 0.5) * 0.3
    velocities[i * 3 + 1] = Math.random() * 0.5 + 0.2
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    size: 0.025,
    color: 0x00ff88,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  })
  const pts = new THREE.Points(geo, mat)
  parent.add(pts)
  return { geo, velocities, count }
}

/* ── procedural cement texture ── */
function createCementTexture() {
  const size = 512
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')

  ctx.fillStyle = '#d4d0c8'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const v = 190 + Math.floor(Math.random() * 30)
    ctx.fillStyle = `rgb(${v},${v - 2},${v - 6})`
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2)
  }

  ctx.strokeStyle = 'rgba(180,175,165,0.4)'
  ctx.lineWidth = 2
  for (let x = 0; x < size; x += size / 4) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke()
  }
  for (let y = 0; y < size; y += size / 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  return tex
}

/* ── ground (white cement, Beijing rooftop) ── */
function buildGround(parent) {
  const cementTex = createCementTexture()
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
      map: cementTex,
      color: 0xd8d4ce,
      metalness: 0.05,
      roughness: 0.85,
    })
  )
  plane.rotation.x = -Math.PI / 2
  plane.receiveShadow = true
  parent.add(plane)

  const grid = new THREE.GridHelper(20, 40, 0x99bbcc, 0xbbc4cc)
  grid.position.y = 0.001
  grid.material.opacity = 0.15
  grid.material.transparent = true
  parent.add(grid)
}

/* ── cable paths ── */
function buildCables(parent) {
  const mat = new THREE.LineBasicMaterial({ color: 0x333333 })
  for (const [px, , pz] of POSITIONS) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(px, 0.02, pz - 0.3),
      new THREE.Vector3(px, 0.01, pz - 0.6),
      new THREE.Vector3(1.2, 0.01, -2.5),
      new THREE.Vector3(1.2, 0.175, -2.5),
    ])
    const pts = curve.getPoints(30)
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    parent.add(new THREE.Line(geo, mat))
  }
}

/* ══════════════════════════════════════════════ */
/*  Main React component wrapping Three.js       */
/* ══════════════════════════════════════════════ */
export default function SolarStation3D({ panelData, selectedPanel, onSelectPanel }) {
  const mountRef = useRef(null)
  const internals = useRef(null)

  const init = useCallback((container) => {
    if (!container || internals.current) return

    const w = container.clientWidth
    const h = container.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x1a1a22, 0.035)

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100)
    camera.position.set(3.5, 2.5, 3.5)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.3, -0.9)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 1.5
    controls.maxDistance = 10
    controls.minPolarAngle = 0.2
    controls.maxPolarAngle = Math.PI / 2 - 0.05
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.3
    controls.update()

    /* lights */
    scene.add(new THREE.AmbientLight(0xffffff, 0.3))
    const sun = new THREE.DirectionalLight(0xffffff, 1.5)
    sun.position.set(5, 8, 3)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.bias = -0.001
    sun.shadow.camera.left = -5
    sun.shadow.camera.right = 5
    sun.shadow.camera.top = 5
    sun.shadow.camera.bottom = -5
    scene.add(sun)
    scene.add(new THREE.PointLight(0x00d4ff, 0.4, 15).translateTo?.(0, 0, 0) || (() => {
      const p = new THREE.PointLight(0x00d4ff, 0.4, 15)
      p.position.set(-3, 4, -2)
      scene.add(p)
      return p
    })())
    const greenLight = new THREE.PointLight(0x00ff88, 0.3, 15)
    greenLight.position.set(3, 3, 2)
    scene.add(greenLight)

    /* environment (simple gradient sky) */
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envScene = new THREE.Scene()
    envScene.add(new THREE.Mesh(
      new THREE.SphereGeometry(50, 32, 32),
      new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        color: 0x111122,
      })
    ))
    const envMap = pmrem.fromScene(envScene, 0, 0.1, 100).texture
    scene.environment = envMap
    pmrem.dispose()

    /* build scene objects */
    const panelAssemblies = POSITIONS.map((pos, i) => {
      const asm = buildPanelAssembly(scene, i)
      asm.group.position.set(...pos)
      return asm
    })

    const invIndicator = buildInverter(scene, [1.2, 0.175, -2.5])
    buildCables(scene)
    buildGround(scene)
    const particles = createParticles(scene)

    /* raycaster for click detection */
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let pendingClick = null

    renderer.domElement.addEventListener('pointerdown', (e) => {
      pendingClick = { x: e.clientX, y: e.clientY }
    })
    renderer.domElement.addEventListener('pointerup', (e) => {
      if (!pendingClick) return
      const dx = e.clientX - pendingClick.x
      const dy = e.clientY - pendingClick.y
      pendingClick = null
      if (Math.sqrt(dx * dx + dy * dy) > 5) return
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const meshes = panelAssemblies.map((a) => a.panelMesh)
      const hits = raycaster.intersectObjects(meshes)
      if (hits.length > 0) {
        const idx = hits[0].object.userData.panelIndex
        if (typeof internals.current?.onSelect === 'function') {
          internals.current.onSelect(idx)
        }
      }
    })

    /* hover cursor */
    renderer.domElement.addEventListener('pointermove', (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const meshes = panelAssemblies.map((a) => a.panelMesh)
      const hits = raycaster.intersectObjects(meshes)
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab'
    })

    /* animation loop */
    let prevTime = performance.now() / 1000
    let elapsed = 0
    let raf
    function animate() {
      raf = requestAnimationFrame(animate)
      const now = performance.now() / 1000
      const dt = Math.min(now - prevTime, 0.1)
      prevTime = now
      elapsed += dt
      const t = elapsed
      controls.update()

      invIndicator.material.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.3

      const arr = particles.geo.attributes.position.array
      for (let i = 0; i < particles.count; i++) {
        arr[i * 3] += particles.velocities[i * 3] * dt
        arr[i * 3 + 1] += particles.velocities[i * 3 + 1] * dt
        arr[i * 3 + 2] += particles.velocities[i * 3 + 2] * dt
        if (arr[i * 3 + 1] > 2) {
          arr[i * 3] = (Math.random() - 0.5) * 4
          arr[i * 3 + 1] = 0.05
          arr[i * 3 + 2] = (Math.random() - 0.5) * 3
        }
      }
      particles.geo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const nw = container.clientWidth
      const nh = container.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    internals.current = {
      renderer,
      scene,
      camera,
      controls,
      panelAssemblies,
      raf,
      onResize,
      onSelect: null,
    }
  }, [])

  useEffect(() => {
    if (mountRef.current) init(mountRef.current)

    return () => {
      if (internals.current) {
        cancelAnimationFrame(internals.current.raf)
        window.removeEventListener('resize', internals.current.onResize)
        internals.current.renderer.dispose()
        if (mountRef.current) {
          const canvas = internals.current.renderer.domElement
          if (canvas.parentNode === mountRef.current) {
            mountRef.current.removeChild(canvas)
          }
        }
        internals.current = null
      }
    }
  }, [init])

  useEffect(() => {
    if (internals.current) {
      internals.current.onSelect = (idx) => onSelectPanel?.(idx)
    }
  }, [onSelectPanel])

  useEffect(() => {
    if (!internals.current || !panelData) return
    const statusColors = {
      normal: 0x4ade80,
      warning: 0xfb923c,
      fault: 0xf87171,
      offline: 0x6b7280,
    }
    internals.current.panelAssemblies.forEach((asm, i) => {
      const d = panelData[i]
      if (!d) return
      const color = statusColors[d.status] || statusColors.normal
      asm.led.material.color.setHex(color)
      asm.led.material.emissive.setHex(color)
    })
  }, [panelData])

  return <div ref={mountRef} className="absolute inset-0" style={{ touchAction: 'none' }} />
}
