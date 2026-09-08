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
    let homePositions = new Float32Array(0)
    let livePositions = new Float32Array(0)
    let velocities = new Float32Array(0)
    let returnAt = new Float64Array(0)
    let previousImpact = { x: 0, y: 0, time: 0 }
    let lastFrameTime = 0
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

      const delta = lastFrameTime ? Math.min((milliseconds - lastFrameTime) / 1000, .034) : 1 / 60
      lastFrameTime = milliseconds
      if (!reducedMotion.matches) {
        let positionsChanged = false
        for (let i = 0; i < count; i += 1) {
          if (!returnAt[i]) continue
          const offset = i * 3
          const inFlight = milliseconds < returnAt[i]
          if (inFlight) {
            const flightDrag = Math.pow(.988, delta * 60)
            velocities[offset] *= flightDrag
            velocities[offset + 1] *= flightDrag
            velocities[offset + 2] *= flightDrag
          } else {
            const spring = 10.5
            velocities[offset] += (homePositions[offset] - livePositions[offset]) * spring * delta
            velocities[offset + 1] += (homePositions[offset + 1] - livePositions[offset + 1]) * spring * delta
            velocities[offset + 2] += (homePositions[offset + 2] - livePositions[offset + 2]) * spring * delta
            const returnDrag = Math.pow(.82, delta * 60)
            velocities[offset] *= returnDrag
            velocities[offset + 1] *= returnDrag
            velocities[offset + 2] *= returnDrag
          }
          livePositions[offset] += velocities[offset] * delta
          livePositions[offset + 1] += velocities[offset + 1] * delta
          livePositions[offset + 2] += velocities[offset + 2] * delta
          if (inFlight) {
            const horizontalLimit = 1.36
            const verticalLimit = 1.3
            if (Math.abs(livePositions[offset]) > horizontalLimit) {
              livePositions[offset] = Math.sign(livePositions[offset]) * horizontalLimit
              velocities[offset] *= -.76
            }
            if (Math.abs(livePositions[offset + 1]) > verticalLimit) {
              livePositions[offset + 1] = Math.sign(livePositions[offset + 1]) * verticalLimit
              velocities[offset + 1] *= -.76
            }
          }
          positionsChanged = true

          const displacement = Math.abs(homePositions[offset] - livePositions[offset]) + Math.abs(homePositions[offset + 1] - livePositions[offset + 1]) + Math.abs(homePositions[offset + 2] - livePositions[offset + 2])
          const speed = Math.abs(velocities[offset]) + Math.abs(velocities[offset + 1]) + Math.abs(velocities[offset + 2])
          if (milliseconds >= returnAt[i] && displacement < .0012 && speed < .004) {
            livePositions[offset] = homePositions[offset]
            livePositions[offset + 1] = homePositions[offset + 1]
            livePositions[offset + 2] = homePositions[offset + 2]
            velocities[offset] = 0
            velocities[offset + 1] = 0
            velocities[offset + 2] = 0
            returnAt[i] = 0
          }
        }
        if (positionsChanged) {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, livePositions)
        }
      }

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
      context.font = '700 300px Manrope, Arial, sans-serif'
      context.letterSpacing = '-12px'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText('rippl', width / 2, height / 2 - 10)
      const pixels = context.getImageData(0, 0, width, height).data

      // Measure what the type actually inked rather than assuming it fills the
      // sample. The wordmark is then fitted to the canvas it will be drawn on:
      // a phone's footer is close to square, and a scale derived from the
      // sample's own 900x320 proportions pushes the outer letters past the clip
      // volume, which is what cropped "rippl" down to "ipp".
      let minX = width, maxX = 0, minY = height, maxY = 0
      for (let y = 2; y < height - 2; y += 2) {
        for (let x = 2; x < width - 2; x += 2) {
          if (pixels[(y * width + x) * 4 + 3] < 70) continue
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
      if (maxX <= minX || maxY <= minY) {
        setFallback(true)
        return
      }

      const glyphWidth = maxX - minX
      const glyphHeight = maxY - minY
      const centreX = (minX + maxX) / 2
      const centreY = (minY + maxY) / 2
      const canvasWidth = Math.max(canvas.clientWidth, 1)
      const canvasHeight = Math.max(canvas.clientHeight, 1)
      // The vertex shader divides by roughly 1.4 in the nearest depth slice;
      // the margin leaves room for that plus the point radius.
      const perspective = 1 / 1.4
      const margin = 0.82
      // One sample pixel must cover the same distance on both axes, so the
      // vertical unit is derived from the horizontal one through the canvas
      // aspect, and the smaller of the two fits wins.
      const verticalUnit = Math.min(
        (2 * margin) / (perspective * glyphHeight),
        (2 * margin * canvasWidth) / (perspective * glyphWidth * canvasHeight),
      )
      const horizontalUnit = verticalUnit * canvasHeight / canvasWidth

      const positions: number[] = []
      const seeds: number[] = []
      for (let y = 2; y < height - 2; y += 2) {
        for (let x = 2; x < width - 2; x += 2) {
          const alpha = pixels[(y * width + x) * 4 + 3]
          if (alpha < 70 || Math.random() > .78) continue
          const nx = (x - centreX) * horizontalUnit
          const ny = (centreY - y) * verticalUnit
          const seed = Math.random()
          const depth = Math.sin(nx * 4.7 + seed * 5.) * .14 + Math.cos(ny * 5.3 - seed * 4.) * .12
          positions.push(nx, ny, depth)
          seeds.push(seed)
        }
      }
      count = seeds.length
      homePositions = new Float32Array(positions)
      livePositions = new Float32Array(homePositions)
      velocities = new Float32Array(homePositions.length)
      returnAt = new Float64Array(count)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, livePositions, gl.DYNAMIC_DRAW)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(seeds), gl.STATIC_DRAW)
      gl.enableVertexAttribArray(seedLocation)
      gl.vertexAttribPointer(seedLocation, 1, gl.FLOAT, false, 0, 0)
      frame = requestAnimationFrame(draw)
    }
    void document.fonts.ready.then(buildParticles)

    /* The wordmark is fitted to the canvas it was built for, so rotating the
       phone has to refit it; without this the letters crop again in landscape. */
    let builtAspect = 0
    let refitTimer = 0
    const refit = () => {
      if (disposed || !count) return
      const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1)
      if (!builtAspect) { builtAspect = aspect; return }
      if (Math.abs(aspect - builtAspect) / builtAspect < .08) return
      builtAspect = aspect
      window.clearTimeout(refitTimer)
      refitTimer = window.setTimeout(() => {
        if (disposed) return
        cancelAnimationFrame(frame)
        frame = 0
        buildParticles()
      }, 150)
    }
    const resize = new ResizeObserver(refit)
    resize.observe(canvas)

    const move = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      target.x = ((event.clientX - bounds.left) / bounds.width - .5) * 2
      target.y = ((event.clientY - bounds.top) / bounds.height - .5) * 2
      if (reducedMotion.matches || !livePositions.length) return

      const now = performance.now()
      const cursorX = ((event.clientX - bounds.left) / bounds.width - .5) * 2.9
      const cursorY = (.5 - (event.clientY - bounds.top) / bounds.height) * 2.9
      if (!previousImpact.time) {
        previousImpact = { x: cursorX, y: cursorY, time: now }
        return
      }

      const elapsed = Math.max((now - previousImpact.time) / 1000, .001)
      const aspect = bounds.width / bounds.height
      const startX = previousImpact.x * aspect
      const startY = previousImpact.y
      const endX = cursorX * aspect
      const endY = cursorY
      const travelX = endX - startX
      const travelY = endY - startY
      const travelSquared = travelX * travelX + travelY * travelY
      const travel = Math.sqrt(travelSquared)
      if (travel > .002 && elapsed < .18) {
        const directionX = travelX / travel
        const directionY = travelY / travel
        const missileSpeed = travel / elapsed
        const impulse = Math.min(1.75, .52 + missileSpeed * .075)
        const radius = .135

        for (let i = 0; i < count; i += 1) {
          const offset = i * 3
          const particleX = livePositions[offset] * aspect
          const particleY = livePositions[offset + 1]
          const projection = travelSquared ? Math.max(0, Math.min(1, ((particleX - startX) * travelX + (particleY - startY) * travelY) / travelSquared)) : 0
          const closestX = startX + travelX * projection
          const closestY = startY + travelY * projection
          const distance = Math.hypot(particleX - closestX, particleY - closestY)
          if (distance >= radius) continue

          const force = Math.pow(1 - distance / radius, 1.7)
          const variation = Math.sin(i * 12.9898) * .055
          const perpendicularX = -directionY * variation
          const perpendicularY = directionX * variation
          velocities[offset] += ((directionX + perpendicularX) / aspect) * impulse * force
          velocities[offset + 1] += (directionY + perpendicularY) * impulse * force
          velocities[offset + 2] += Math.cos(i * 4.731) * .22 * force
          returnAt[i] = now + 2000
        }
      }
      previousImpact = { x: cursorX, y: cursorY, time: now }
    }
    const leave = () => {
      target.x = 0
      target.y = 0
      previousImpact.time = 0
    }
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
      window.clearTimeout(refitTimer)
      resize.disconnect()
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
