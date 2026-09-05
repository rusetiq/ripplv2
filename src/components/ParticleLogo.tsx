import { useEffect, useRef, useState } from 'react'

export default function ParticleWordmark() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    })
    if (!gl) {
      setFallback(true)
      return
    }

    const vertexSource = `
      attribute vec3 position;
      attribute float seed;
      uniform float time;
      uniform vec2 pointer;
      uniform float pixelRatio;
      varying float glow;
      varying float hue;

      void main() {
        vec3 p = position;
        float breathe = sin(time * .72 + seed * 8.0 + p.x * 3.0) * .032;
        p.z += breathe;

        float ry = pointer.x * .2 + sin(time * .16) * .045;
        float rx = pointer.y * -.16 + cos(time * .13) * .035;
        mat3 rotateY = mat3(cos(ry), 0., sin(ry), 0., 1., 0., -sin(ry), 0., cos(ry));
        mat3 rotateX = mat3(1., 0., 0., 0., cos(rx), -sin(rx), 0., sin(rx), cos(rx));
        p = rotateX * rotateY * p;

        float perspective = 1.0 / (1.45 - p.z * .32);
        gl_Position = vec4(p.x * perspective, p.y * perspective, 0., 1.);
        gl_PointSize = (3.15 + seed * 2.35 + p.z * 1.1) * pixelRatio;
        glow = .92 + seed * .08;
        hue = p.y * .45 + p.z * .55;
      }
    `

    const fragmentSource = `
      precision mediump float;
      varying float glow;
      varying float hue;

      void main() {
        vec2 point = gl_PointCoord - .5;
        float distanceToCenter = length(point);
        if (distanceToCenter > .5) discard;
        float alpha = smoothstep(.5, .15, distanceToCenter) * glow;
        vec3 ice = vec3(.72, .9, 1.0);
        vec3 pearl = vec3(1.0, 1.0, 1.0);
        vec3 pink = vec3(1.0, .82, .98);
        vec3 color = mix(ice, pearl, smoothstep(-.65, .02, hue));
        color = mix(color, pink, smoothstep(.38, .82, hue) * .18);
        gl_FragColor = vec4(color, alpha);
      }
    `

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) throw new Error('Unable to create shader')
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        throw new Error('Unable to compile particle shader')
      }
      return shader
    }

    let vertexShader: WebGLShader
    let fragmentShader: WebGLShader
    let program: WebGLProgram
    try {
      vertexShader = compile(gl.VERTEX_SHADER, vertexSource)
      fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource)
      const nextProgram = gl.createProgram()
      if (!nextProgram) throw new Error('Unable to create particle program')
      program = nextProgram
      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Unable to link particle program')
    } catch {
      setFallback(true)
      return
    }

    gl.useProgram(program)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    const positionBuffer = gl.createBuffer()
    const seedBuffer = gl.createBuffer()
    const positionLocation = gl.getAttribLocation(program, 'position')
    const seedLocation = gl.getAttribLocation(program, 'seed')
    const timeLocation = gl.getUniformLocation(program, 'time')
    const pointerLocation = gl.getUniformLocation(program, 'pointer')
    const pixelRatioLocation = gl.getUniformLocation(program, 'pixelRatio')
    const pointer = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let count = 0
    let frame = 0
    let running = true
    let disposed = false

    const draw = (milliseconds: number) => {
      if (disposed || !count || !running) return
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75)
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio))
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
      pointer.x += (target.x - pointer.x) * .055
      pointer.y += (target.y - pointer.y) * .055
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(timeLocation, reducedMotion.matches ? 0 : milliseconds / 1000)
      gl.uniform2f(pointerLocation, pointer.x, pointer.y)
      gl.uniform1f(pixelRatioLocation, ratio)
      gl.drawArrays(gl.POINTS, 0, count)
      if (!reducedMotion.matches) frame = requestAnimationFrame(draw)
    }

    const buildParticles = () => {
      if (disposed) return
      const sample = document.createElement('canvas')
      const width = 900
      const height = 320
      sample.width = width
      sample.height = height
      const context = sample.getContext('2d', { willReadFrequently: true })
      if (!context) {
        setFallback(true)
        return
      }
      context.fillStyle = '#ffffff'
      context.font = '600 280px Manrope, Arial, sans-serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText('rippl', width / 2, height / 2 - 10)
      const pixels = context.getImageData(0, 0, width, height).data
      const positions: number[] = []
      const seeds: number[] = []
      for (let y = 2; y < height - 2; y += 2) {
        for (let x = 2; x < width - 2; x += 2) {
          const alpha = pixels[(y * width + x) * 4 + 3]
          if (alpha < 70 || Math.random() > .78) continue
          const nx = (x / width - .5) * 2.3
          const ny = (.5 - y / height) * 2.3
          const seed = Math.random()
          const depth = Math.sin(nx * 4.7 + seed * 5.) * .14 + Math.cos(ny * 5.3 - seed * 4.) * .12
          positions.push(nx, ny, depth)
          seeds.push(seed)
        }
      }
      count = seeds.length
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(seeds), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(seedLocation)
      gl.vertexAttribPointer(seedLocation, 1, gl.FLOAT, false, 0, 0)
      frame = requestAnimationFrame(draw)
    }
    void document.fonts.ready.then(buildParticles)

    const move = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      target.x = ((event.clientX - bounds.left) / bounds.width - .5) * 2
      target.y = ((event.clientY - bounds.top) / bounds.height - .5) * 2
    }
    const leave = () => { target.x = 0; target.y = 0 }
    const visibility = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (running && count) frame = requestAnimationFrame(draw)
    }, { threshold: .05 })
    visibility.observe(canvas)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerleave', leave)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      visibility.disconnect()
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', leave)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(seedBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  if (fallback) {
    return <span className="particle-wordmark-fallback">rippl</span>
  }

  return (
    <canvas
      ref={canvasRef}
      className="particle-wordmark-canvas"
      role="img"
      aria-label="Rippl rendered as an interactive three-dimensional particle wordmark"
    />
  )
}
