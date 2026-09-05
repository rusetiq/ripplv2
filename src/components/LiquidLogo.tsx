import { useEffect, useRef, useState } from 'react'

// The supplied liquid sculpture is sampled directly; the shader adds local
// refraction and removes its flat background without changing the source asset.
export default function LiquidLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [available, setAvailable] = useState(true)
  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) { setAvailable(false); return }
    const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`
    const fragment = `precision mediump float;
      varying vec2 uv; uniform sampler2D art; uniform vec2 pointer; uniform float time; uniform float strength;
      void main(){
        vec2 p=vec2(uv.x,1.-uv.y); vec2 delta=p-pointer; float d=length(delta);
        float influence=exp(-d*d*14.); float wave=sin(d*38.-time*5.);
        p+=normalize(delta+vec2(.0001))*wave*influence*.021*strength;
        p+=vec2(sin(p.y*15.+time),cos(p.x*13.+time))*.0025*strength;
        vec3 c=texture2D(art,clamp(p,0.,1.)).rgb;
        vec3 bg=vec3(.502,.329,1.); float difference=length(c-bg);
        float alpha=smoothstep(.045,.17,difference);
        vec3 blue=vec3(c.r*.34,c.g*.96,c.b*.98);
        blue+=vec3(.13,.24,.3)*influence*strength*.28;
        gl_FragColor=vec4(blue,alpha);
      }`
    const shaders: WebGLShader[] = []
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source); gl.compileShader(shader); shaders.push(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader unavailable')
      return shader
    }
    const program = gl.createProgram()!
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex))
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment)); gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program unavailable')
    } catch { setAvailable(false); shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); return }
    gl.useProgram(program)
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const pointerLocation = gl.getUniformLocation(program, 'pointer')
    const timeLocation = gl.getUniformLocation(program, 'time')
    const strengthLocation = gl.getUniformLocation(program, 'strength')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0, disposed = false, ready = false, target = 0, strength = 0
    const pointer = { x: .5, y: .5 }
    const draw = (time: number) => {
      if (disposed || !ready) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.round(canvas.clientWidth * ratio), height = Math.round(canvas.clientHeight * ratio)
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height) }
      strength += (target - strength) * .075
      gl.uniform2f(pointerLocation, pointer.x, pointer.y)
      gl.uniform1f(timeLocation, time / 1000)
      gl.uniform1f(strengthLocation, reduced.matches ? 0 : strength)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      if (!reduced.matches && (target > 0 || strength > .001)) frame = requestAnimationFrame(draw)
      else frame = 0
    }
    const start = () => { if (!frame && ready) frame = requestAnimationFrame(draw) }
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = (event.clientX - rect.left) / rect.width; pointer.y = (event.clientY - rect.top) / rect.height
      target = 1; start()
    }
    const leave = () => { target = 0; start() }
    const visibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; target = 0; strength = 0 }
      else start()
    }
    const motionPreference = () => { target = 0; strength = 0; start() }
    const img = new Image()
    img.onload = () => { if (disposed) return; gl.bindTexture(gl.TEXTURE_2D, texture); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); ready = true; start() }
    img.onerror = () => { if (!disposed) setAvailable(false) }
    img.src = '/brand/liquid-reference.png'
    canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerleave', leave)
    canvas.addEventListener('pointerup', leave)
    canvas.addEventListener('pointerdown', move)
    canvas.addEventListener('pointercancel', leave)
    document.addEventListener('visibilitychange', visibility)
    reduced.addEventListener('change', motionPreference)
    const observer = new ResizeObserver(start); observer.observe(canvas)
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('pointerup', leave); canvas.removeEventListener('pointerdown', move); canvas.removeEventListener('pointercancel', leave); document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', motionPreference); gl.deleteTexture(texture); gl.deleteBuffer(buffer); shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program) }
  }, [])
  return available ? <canvas ref={canvasRef} className="liquid-canvas" role="img" aria-label="Rippl’s blue liquid logo, which ripples when you move your pointer across it" /> : <img className="liquid-fallback" src="/brand/liquid-reference.png" alt="Rippl liquid logo" />
}
