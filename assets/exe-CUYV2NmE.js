import{i as g,r as w,M as y,j as L,m as k,n as W}from"./three-D4ATCD1o.js";import{c as E,t as b}from"./fractal-kit-9awC5duS.js";import{r as G}from"./index-BrPgstJA.js";import{s as x}from"./index-Cr6Jun1w.js";/*! Jiggle Peach (c) 2026 Maanraket. All rights reserved. */const N=`
  uniform vec4 uBounds;
  uniform float uPuff;
  uniform vec4 uGrab;
  uniform vec4 uGrabPull;
  uniform vec4 uGrabDent;
  varying vec3 vLocal;
  varying vec3 vNormalV;
  varying vec3 vView;
  void main() {
    vLocal = (position - uBounds.xyz) / uBounds.w;
    vec3 p = position;
    if (uGrabPull.w > 0.0) {
      float g = length(position - uGrab.xyz) / uGrab.w;
      float k = length(position - uGrab.xyz) / uGrabDent.w;
      p += (uGrabPull.xyz * exp(-g * g * 1.2) + uGrabDent.xyz * exp(-k * k * 2.0)) * uGrabPull.w;
    }
    vec4 view = modelViewMatrix * vec4(p + normal * uPuff * uBounds.w, 1.0);
    vView = -view.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * view;
  }
`,_=`
  uniform float uScan;
  uniform float uOpacity;
  varying vec3 vLocal;
  varying vec3 vNormalV;
  varying vec3 vView;
  float wire(float v, float w) {
    float d = abs(fract(v) - 0.5);
    return smoothstep(0.5 - w - fwidth(v), 0.5 - w, d);
  }
  void main() {
    float rim = 1.0 - abs(dot(normalize(vNormalV), normalize(vView)));
    float lat = wire(vLocal.y * 16.0, 0.03);
    float lon = wire(atan(vLocal.z, vLocal.x) / 6.2831853 * 32.0, 0.03);
    float lines = max(lat, lon);
    float d = vLocal.y - uScan;
    float beam = exp(-d * d * 6000.0);
    float trail = smoothstep(-0.005, 0.01, d) * exp(-d * 22.0);
    vec3 cyan = vec3(0.45, 0.95, 1.0);
    vec3 pink = vec3(1.0, 0.45, 0.82);
    vec3 col = mix(pink, cyan, smoothstep(0.0, 0.06, d));
    float a = lines * trail * 0.35 * (0.4 + rim * 0.6) + beam * (0.35 + rim * 0.5);
    gl_FragColor = vec4(col * a * uOpacity, 1.0);
  }
`,B=`
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`,A=`
  uniform float uFade;
  uniform float uScroll;
  varying vec3 vWorld;
  float grid(vec2 p) {
    vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    vec2 p = vWorld.xz;
    float lines = grid(vec2(p.x, p.y - uScroll) * 0.9);
    float depth = -p.y;
    float far = 1.0 - smoothstep(4.0, 12.0, depth);
    float near = smoothstep(7.0, 2.0, -depth);
    float side = 1.0 - smoothstep(4.5, 9.0, abs(p.x));
    vec3 pink = vec3(1.0, 0.35, 0.78);
    vec3 cyan = vec3(0.3, 0.92, 1.0);
    vec3 col = mix(cyan, pink, smoothstep(1.0, 12.0, depth));
    float a = lines * 0.5 * far * near * side * uFade;
    gl_FragColor = vec4(col * a, 1.0);
  }
`,M=.56,R=-.5;function C(e){var p,h;const u=new g({uniforms:{uFade:{value:0},uScroll:{value:0}},vertexShader:B,fragmentShader:A,transparent:!0,depthWrite:!1,blending:w,extensions:{derivatives:!0}}),i=new y(new L(26,32),u);i.rotation.x=-Math.PI/2,i.position.set(0,-2.15,-6),i.renderOrder=-1,e.group.add(i);const v=new g({uniforms:{uBounds:{value:((h=(p=e.peach.uniforms)==null?void 0:p.uBounds)==null?void 0:h.value)??new k(0,0,0,2)},uPuff:{value:.012},uGrab:e.peach.uniforms.uGrab,uGrabPull:e.peach.uniforms.uGrabPull,uGrabDent:e.peach.uniforms.uGrabDent,uScan:{value:2},uOpacity:{value:0}},vertexShader:N,fragmentShader:_,transparent:!0,depthWrite:!1,blending:w,extensions:{derivatives:!0}});let a=null;const d=()=>{a||!e.peach.mesh||(a=new y(E(e.peach.mesh.geometry,36),v),a.matrixAutoUpdate=!1,a.frustumCulled=!1,a.renderOrder=18,e.group.add(a),e.warm([a]))};d(),a||e.warm();const S=new W;let c=0,f=0,m=1.5,r=-1;const P=()=>{r>=0||!e.live||!a||(r=0,[98,98.7].forEach(o=>b(e,{hz:o,to:o*.84,type:"triangle",length:2.2,volume:.004,attack:.4,cutoff:500})))},O=()=>{const o=e.center(),t=e.hitFrom(S.set(o.x+G(-.6,.6),o.y-3,o.z+1.2));t&&e.touch(t,{jiggle:.06,radius:.8,lift:.35}),[[1174.66,"square",0,.09,.004,2600],[1568,"square",.07,.35,.004,2600],[392,"triangle",.07,.8,.006,1400],[587.33,"triangle",.07,.8,.004,1400]].forEach(([l,n,s,V,z,F])=>b(e,{hz:l,type:n,at:s,length:V,volume:z,cutoff:F,attack:.006}))};return{update(o){d();const t=e.level();f=Math.min(1,f+o/2.5);const l=x(f);m-=o,m<=0&&(m=G(8,12)/(1+t*1.5),P());let n=2;r>=0&&(r+=o/2.2,n=M+(R-M)*x(r),r>=1&&(r=-1,O())),c=(c+o*.22*e.still)%1e3,u.uniforms.uFade.value=l*(.3+t*.12),u.uniforms.uScroll.value=c,v.uniforms.uScan.value=n;const s=l*(r>=0?Math.min(1,Math.sin(Math.PI*r)*3):0);v.uniforms.uOpacity.value=s,a&&(a.visible=s>0,a.visible&&(e.peach.mesh.updateWorldMatrix(!0,!1),a.matrix.copy(e.peach.mesh.matrixWorld)))}}}const I={id:"exe",create:C};export{I as default};
