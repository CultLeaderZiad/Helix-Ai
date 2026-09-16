'use client'

import React, { useEffect, useRef } from 'react'

export interface LightfallProps {
  className?: string
  dpr?: number
  paused?: boolean
  colors?: string[]
  backgroundColor?: string
  speed?: number
  streakCount?: number
  streakWidth?: number
  streakLength?: number
  glow?: number
  density?: number
  twinkle?: number
  zoom?: number
  backgroundGlow?: number
  opacity?: number
  mouseInteraction?: boolean
  mouseStrength?: number
  mouseRadius?: number
  mouseDampening?: number
  lightMode?: boolean
  mixBlendMode?: string
}

type RGB = [number, number, number]

const MAX_COLORS = 8
const DEFAULT_COLORS = ['#A6C8FF', '#5227FF', '#FF9FFC']

const hexToRGB = (hex: string): RGB => {
  const c = hex.replace('#', '').padEnd(6, '0')
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  return [r, g, b]
}

const prepColors = (input?: string[]) => {
  const base = (input && input.length ? input : DEFAULT_COLORS).slice(0, MAX_COLORS)
  const count = base.length
  const arr: RGB[] = []
  for (let i = 0; i < MAX_COLORS; i++) arr.push(hexToRGB(base[Math.min(i, base.length - 1)]))
  const avg: RGB = [0, 0, 0]
  for (let i = 0; i < count; i++) {
    avg[0] += arr[i][0]
    avg[1] += arr[i][1]
    avg[2] += arr[i][2]
  }
  avg[0] /= count
  avg[1] /= count
  avg[2] /= count
  return { arr, count, avg }
}

const vertexSource = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentSource = `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uBgColor;
uniform vec3  uMouseColor;
uniform float uSpeed;
uniform int   uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;
uniform float uLightMode;

varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = uLightMode > 0.5
    ? vec4(0.0)
    : vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    O.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  if (uLightMode > 0.5) {
    float peak = max(colr.r, max(colr.g, colr.b));
    float coverage = smoothstep(0.035, 0.58, peak) * uOpacity;
    vec3 chroma = clamp(colr / max(peak, 1e-4), 0.0, 1.0);
    chroma = pow(chroma, vec3(1.35));
    float chromaPeak = max(chroma.r, max(chroma.g, chroma.b));
    chroma /= max(chromaPeak, 1e-4);
    o = vec4(mix(vec3(1.0), chroma, coverage * 0.94), 1.0);
  } else {
    o = vec4(colr, uOpacity);
  }
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('Lightfall shader compile error:', gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  return s
}

const Lightfall: React.FC<LightfallProps> = ({
  className,
  dpr,
  paused = false,
  colors = DEFAULT_COLORS,
  backgroundColor = '#0B0F19',
  speed = 0.6,
  streakCount = 6,
  streakWidth = 1,
  streakLength = 1,
  glow = 0.8,
  density = 0.7,
  twinkle = 1,
  zoom = 3,
  backgroundGlow = 0.5,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.5,
  mouseRadius = 1,
  mouseDampening = 0.15,
  lightMode = false,
  mixBlendMode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const mouseTargetRef = useRef<[number, number]>([0, 0])
  const lastTimeRef = useRef(0)
  const colorKey = colors.join('|')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clean up any stale canvas from prior mounts to prevent context leaks
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    const renderCssFallback = () => {
      while (container.firstChild) container.removeChild(container.firstChild)
      const fallback = document.createElement('div')
      fallback.style.position = 'absolute'
      fallback.style.inset = '0'
      fallback.style.pointerEvents = 'none'
      fallback.style.background = `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56, 189, 248, 0.22), transparent 70%), radial-gradient(ellipse 60% 50% at 85% 25%, rgba(14, 165, 233, 0.15), transparent 60%), ${backgroundColor}`
      container.appendChild(fallback)
    }

    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    let gl: WebGLRenderingContext | null = null
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
      })
    } catch {
      gl = null
    }

    if (!gl) {
      renderCssFallback()
      return () => {
        while (container.firstChild) container.removeChild(container.firstChild)
      }
    }

    // Cap DPR at 1.0 on mobile screens (<768px) and 1.25 on desktop to eliminate GPU throttling
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const pixelRatio = dpr ?? (typeof window !== 'undefined' ? (isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25)) : 1)

    let vs: WebGLShader | null = null
    let fs: WebGLShader | null = null
    let program: WebGLProgram | null = null
    let quadBuffer: WebGLBuffer | null = null

    try {
      vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
      fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
      if (!vs || !fs) {
        renderCssFallback()
        return
      }

      program = gl.createProgram()
      if (!program) {
        renderCssFallback()
        return
      }

      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        renderCssFallback()
        return
      }

      gl.useProgram(program)

      quadBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1, -1, 0, 0,
           3, -1, 2, 0,
          -1,  3, 0, 2,
        ]),
        gl.STATIC_DRAW
      )

      const aPos = gl.getAttribLocation(program, 'position')
      const aUv = gl.getAttribLocation(program, 'uv')
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0)
      gl.enableVertexAttribArray(aUv)
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8)
    } catch {
      renderCssFallback()
      return
    }

    const { arr, count, avg } = prepColors(colorKey.split('|'))

    const uRes = gl.getUniformLocation(program, 'iResolution')
    const uMouse = gl.getUniformLocation(program, 'iMouse')
    const uTime = gl.getUniformLocation(program, 'iTime')
    const uBgCol = gl.getUniformLocation(program, 'uBgColor')
    const uMouseCol = gl.getUniformLocation(program, 'uMouseColor')
    const uSpd = gl.getUniformLocation(program, 'uSpeed')
    const uStrkCnt = gl.getUniformLocation(program, 'uStreakCount')
    const uStrkWid = gl.getUniformLocation(program, 'uStreakWidth')
    const uStrkLen = gl.getUniformLocation(program, 'uStreakLength')
    const uGlw = gl.getUniformLocation(program, 'uGlow')
    const uDens = gl.getUniformLocation(program, 'uDensity')
    const uTwnk = gl.getUniformLocation(program, 'uTwinkle')
    const uZm = gl.getUniformLocation(program, 'uZoom')
    const uBgGlw = gl.getUniformLocation(program, 'uBgGlow')
    const uOpac = gl.getUniformLocation(program, 'uOpacity')
    const uMseEn = gl.getUniformLocation(program, 'uMouseEnabled')
    const uMseStr = gl.getUniformLocation(program, 'uMouseStrength')
    const uMseRad = gl.getUniformLocation(program, 'uMouseRadius')
    const uLtMd = gl.getUniformLocation(program, 'uLightMode')
    const uColCnt = gl.getUniformLocation(program, 'uColorCount')

    for (let i = 0; i < 8; i++) {
      const loc = gl.getUniformLocation(program, `uColor${i}`)
      if (loc) gl.uniform3fv(loc, arr[i])
    }
    if (uColCnt) gl.uniform1i(uColCnt, count)
    if (uBgCol) gl.uniform3fv(uBgCol, hexToRGB(backgroundColor))
    if (uMouseCol) gl.uniform3fv(uMouseCol, avg)
    if (uSpd) gl.uniform1f(uSpd, speed)
    // Reduce streak count on mobile for buttery smooth 60fps
    const targetStreak = isMobile ? Math.min(streakCount, 4) : streakCount
    if (uStrkCnt) gl.uniform1i(uStrkCnt, Math.max(1, Math.min(16, Math.round(targetStreak))))
    if (uStrkWid) gl.uniform1f(uStrkWid, streakWidth)
    if (uStrkLen) gl.uniform1f(uStrkLen, streakLength)
    if (uGlw) gl.uniform1f(uGlw, glow)
    if (uDens) gl.uniform1f(uDens, isMobile ? Math.min(density, 0.4) : density)
    if (uTwnk) gl.uniform1f(uTwnk, twinkle)
    if (uZm) gl.uniform1f(uZm, zoom)
    if (uBgGlw) gl.uniform1f(uBgGlw, backgroundGlow)
    if (uOpac) gl.uniform1f(uOpac, opacity)
    if (uMseEn) gl.uniform1f(uMseEn, mouseInteraction && !isMobile ? 1.0 : 0.0)
    if (uMseStr) gl.uniform1f(uMseStr, mouseStrength)
    if (uMseRad) gl.uniform1f(uMseRad, mouseRadius)
    if (uLtMd) gl.uniform1f(uLtMd, lightMode ? 1.0 : 0.0)

    let mouseCur = [0, 0]

    const resize = () => {
      if (!container || !gl || gl.isContextLost()) return
      const rect = container.getBoundingClientRect()
      const w = Math.floor(rect.width * pixelRatio)
      const h = Math.floor(rect.height * pixelRatio)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
        if (uRes) gl.uniform3f(uRes, w, h, 1)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    let isVisible = true
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry ? entry.isIntersecting : true
      },
      { threshold: 0.01 }
    )
    io.observe(container)

    const onPointerMove = (e: PointerEvent) => {
      if (!gl || gl.isContextLost()) return
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) * pixelRatio
      const y = (rect.height - (e.clientY - rect.top)) * pixelRatio
      mouseTargetRef.current = [x, y]
      if (mouseDampening <= 0 && uMouse) {
        gl.uniform2f(uMouse, x, y)
      }
    }
    if (mouseInteraction && !isMobile) {
      canvas.addEventListener('pointermove', onPointerMove, { passive: true })
    }

    // Graceful handling of WebGL context lost/restored (common on phone tab switching & Brave Shields)
    const onContextLost = (e: Event) => {
      e.preventDefault()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    canvas.addEventListener('webglcontextlost', onContextLost, false)

    const loop = (t: number) => {
      rafRef.current = requestAnimationFrame(loop)
      if (!isVisible || document.hidden || paused || !gl || gl.isContextLost()) return

      if (uTime) gl.uniform1f(uTime, t * 0.001)

      if (mouseDampening > 0 && !isMobile) {
        if (!lastTimeRef.current) lastTimeRef.current = t
        const dt = (t - lastTimeRef.current) / 1000
        lastTimeRef.current = t
        const tau = Math.max(1e-4, mouseDampening)
        const factor = Math.min(1.0, 1 - Math.exp(-dt / tau))
        const target = mouseTargetRef.current
        mouseCur[0] += (target[0] - mouseCur[0]) * factor
        mouseCur[1] += (target[1] - mouseCur[1]) * factor
        if (uMouse) gl.uniform2f(uMouse, mouseCur[0], mouseCur[1])
      } else {
        lastTimeRef.current = t
      }

      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (mouseInteraction && !isMobile) {
        canvas.removeEventListener('pointermove', onPointerMove)
      }
      canvas.removeEventListener('webglcontextlost', onContextLost)
      ro.disconnect()
      io.disconnect()
      if (canvas.parentElement === container) {
        container.removeChild(canvas)
      }
      try {
        if (gl && !gl.isContextLost()) {
          if (quadBuffer) gl.deleteBuffer(quadBuffer)
          if (program) gl.deleteProgram(program)
          if (vs) gl.deleteShader(vs)
          if (fs) gl.deleteShader(fs)
        }
      } catch {}
    }
  }, [
    dpr,
    paused,
    colorKey,
    backgroundColor,
    speed,
    streakCount,
    streakWidth,
    streakLength,
    glow,
    density,
    twinkle,
    zoom,
    backgroundGlow,
    opacity,
    mouseInteraction,
    mouseStrength,
    mouseRadius,
    mouseDampening,
    lightMode,
  ])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`relative h-full w-full overflow-hidden ${className ?? ''}`}
      style={{
        ...(mixBlendMode && {
          mixBlendMode: mixBlendMode as React.CSSProperties['mixBlendMode'],
        }),
      }}
    />
  )
}

export { Lightfall }
export default Lightfall
