import{i as M,r as z,V as R,M as A,j as G}from"./three-D4ATCD1o.js";import{S as k,p as T,t as P}from"./fractal-kit-9awC5duS.js";import{r as F}from"./index-BrPgstJA.js";import{s as g}from"./index-Cr6Jun1w.js";/*! Jiggle Peach (c) 2026 Maanraket. All rights reserved. */const L=[[783.99,0],[880,.12],[987.77,.24],[1174.66,.38],[1318.51,.52],[1567.98,.66]],q=`
  varying vec2 vP;
  void main() {
    vP = position.xy;
    vec3 p = position;
    p.z -= dot(p.xy, p.xy) * 0.045;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`,E=`
  uniform float uTime;
  uniform float uFade;
  uniform float uLevel;
  uniform float uWave;
  uniform float uSpin;
  uniform float uGlow;
  uniform sampler2D uBehind;
  uniform vec2 uResolution;
  varying vec2 vP;
  const float TAU = 6.2831853;
  const vec3 H = vec3(-0.24, 0.37, 0.9);
  ${k}

  float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  vec3 jewel(float h) {
    if (h < 0.3) return vec3(0.82, 0.16, 0.4);
    if (h < 0.5) return vec3(0.98, 0.5, 0.2);
    if (h < 0.68) return vec3(0.62, 0.1, 0.24);
    if (h < 0.86) return vec3(0.48, 0.15, 0.62);
    if (h < 0.97) return vec3(1.0, 0.72, 0.38);
    return vec3(0.38, 0.26, 0.8);
  }

  float seeds(vec2 s) {
    vec2 c = floor(s * 9.0);
    vec2 f = fract(s * 9.0) - 0.5;
    float h = hash2(c);
    vec2 o = (vec2(hash2(c + 3.1), hash2(c + 7.7)) - 0.5) * 0.6;
    float r = 0.06 + 0.08 * h;
    float ring = abs(length(f - o) - r);
    return step(0.55, h) * (smoothstep(0.035, 0.0, ring) * 0.6 + smoothstep(r, 0.0, length(f - o)) * 0.15);
  }

  vec3 ring(vec2 p, float segs, float turn, float at, float size, float depth, float sweep, inout vec3 spec) {
    float r = length(p);
    float phi = atan(p.y, p.x);
    float seg = TAU / segs;
    float id = mod(floor((phi + turn) / seg), segs);
    float a = mod(phi + turn, seg) - seg * 0.5;
    vec2 q = vec2(cos(a), sin(a)) * r;
    vec2 rel = (q - vec2(at, 0.0)) / size;
    vec2 s = vec2(rel.y, rel.x);
    vec3 c = peachAt(s);
    float e = 0.03;
    vec2 gq = normalize(vec2(peachAt(s + vec2(0.0, e)).x - c.x, peachAt(s + vec2(e, 0.0)).x - c.x) + 1e-6);
    float back = phi - a;
    vec2 g = vec2(cos(back) * gq.x - sin(back) * gq.y, sin(back) * gq.x + cos(back) * gq.y);

    float d = c.x * size;
    float lw = 0.01 + size * 0.028;
    float lead = 1.0 - smoothstep(lw - 0.003, lw + 0.003, abs(d));
    float inside = smoothstep(-lw + 0.003, -lw - 0.004, d);
    float t = clamp(d / lw, -1.0, 1.0);
    vec3 nl = normalize(vec3(g * t, sqrt(1.0 - t * t) + 0.1));
    float bevel = 1.0 - smoothstep(0.0, 0.05 + size * 0.06, -d - lw);
    vec3 ng = normalize(vec3(g * bevel * 0.8 + (c.y - 0.5) * vec2(-0.2, 0.25), 1.0));

    float h = hash(id * 7.3 + segs);
    vec3 tintA = jewel(h);
    vec3 tintB = mix(tintA, jewel(fract(h + 0.37)), 0.35);
    vec3 tint = mix(tintB, tintA, c.y) * (0.85 + 0.3 * hash(id + 1.7));
    float streak = 0.95 + 0.05 * sin(s.y * 17.0 + sin(s.x * 5.0 + id) * 2.5);
    float bubbles = seeds(s + id * 1.37);
    vec2 uv = gl_FragCoord.xy / uResolution + ng.xy * 0.018;
    float lum = dot(texture2D(uBehind, uv).rgb, vec3(0.3, 0.59, 0.11));
    float body = (0.32 + 0.68 * c.y) * (1.0 - smoothstep(0.35, 0.85, c.z) * 0.6);
    float leak = 0.75 + 0.25 * smoothstep(-0.9, 0.9, s.y);
    vec3 lit = tint * body * streak * leak * (0.5 + 1.7 * lum) * (1.0 + sweep * 0.9);
    lit += vec3(1.0, 0.92, 0.82) * bubbles * body * 0.35;

    float metal = pow(max(dot(nl, H), 0.0), 24.0);
    vec3 came = vec3(0.07, 0.05, 0.045) + vec3(0.85, 0.72, 0.55) * metal * (0.35 + sweep * 0.9);
    spec += vec3(1.0, 0.95, 0.88) * pow(max(dot(ng, H), 0.0), 70.0) * inside * (0.45 + sweep * 0.6) * depth;
    float spill = exp(-max(d - lw, 0.0) / (0.1 + size * 0.25)) * (1.0 - inside) * (1.0 - lead);
    return (lit * inside + tint * spill * 0.1) * depth + came * lead * mix(1.0, depth, 0.5);
  }

  void main() {
    vec2 p = vP;
    float r = length(p);
    float reach = smoothstep(1.6, 2.2, r) * (1.0 - smoothstep(4.5, 5.1, r));
    if (reach <= 0.0) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    float wave = uWave < 0.0 ? 0.0 : exp(-pow((r - uWave) * 1.1, 2.0));
    float travel = mod(uTime * 0.22, 9.0) - 4.5;
    float sweep = exp(-pow((dot(p, vec2(0.8, 0.6)) - travel * 2.2) / 0.9, 2.0));
    vec3 spec = vec3(0.0);
    vec3 col = ring(p, 10.0, uSpin, 2.65, 0.56, 1.0, sweep, spec);
    col += ring(p, 20.0, -uSpin * 0.7 + 0.157, 3.75, 0.33, 0.68, sweep, spec);
    col += ring(p, 40.0, uSpin * 0.5, 4.45, 0.19, 0.42, sweep, spec);
    float haze = smoothstep(3.0, 5.0, r);
    col = mix(col, col * vec3(0.8, 0.75, 1.0), haze * 0.5);
    col = (col * (0.24 + 0.08 * uLevel + wave * 0.2) * uGlow + spec * (0.32 + wave * 0.25)) * reach * uFade;
    gl_FragColor = vec4(col, 1.0);
  }
`,j="varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",B=`
  uniform float uGlow;
  varying vec2 vP;
  ${k}
  void main() {
    float d = peachAt(vP).x;
    float rim = exp(-max(d, 0.0) / 0.05) * smoothstep(-0.12, 0.0, d);
    float lift = 0.6 + 0.4 * smoothstep(-0.6, 0.9, vP.y);
    gl_FragColor = vec4(vec3(1.0, 0.45, 0.66) * rim * lift * uGlow, 1.0);
  }
`;function V(e){var y;const n={value:null},w=new M({uniforms:{uTime:{value:0},uFade:{value:0},uLevel:{value:0},uWave:{value:-1},uSpin:{value:0},uGlow:{value:1},uStamp:n,uBehind:{value:((y=e.backdrop)==null?void 0:y.texture)??null},uResolution:{value:new R(1,1)}},vertexShader:q,fragmentShader:E,transparent:!0,blending:z,depthWrite:!1}),r=new A(new G(11,11,24,24),w);r.renderOrder=-1,r.position.set(0,0,-3);const o=new A(new G(2.6,2.6),new M({uniforms:{uGlow:{value:0},uStamp:n},vertexShader:j,fragmentShader:B,transparent:!0,blending:z,depthWrite:!1}));o.renderOrder=-1,r.visible=!1,o.visible=!1,e.group.add(r,o);let h=!1;const b=()=>{h||!e.peach.mesh||(h=!0,T(e).then(t=>{n.value=t,r.visible=!0,o.visible=!0,e.warm()}).catch(()=>{h=!1}))};b();const i=w.uniforms;let v=0,u=0,m=2.5,l=-1,x=0,d=0,p=0;const _=()=>{l=0,d+=.1;const t=e.randomHit();t&&e.touch(t,{jiggle:.05,radius:.9,wobble:.08}),L.forEach(([f,s])=>[.997,1.003].forEach(c=>{const a={hz:f*c,attack:.04,cutoff:3200};P(e,{...a,at:s,volume:.0012,length:1.4}),P(e,{...a,at:s+.25,volume:5e-4,length:1.1})}))};return{update(t,f){if(!n.value){b();return}const s=e.level(),{still:c}=e;u=Math.min(1,u+t/3.5),m-=t,m<=0&&(m=F(5.5,8)/(1+s*1.4),e.live&&_()),l>=0?(l+=t*1.8,p=Math.sin(Math.PI*Math.min(1,l/2.5)),l>5&&(l=-1)):p=0,d*=Math.exp(-t*1.2),x+=(.025+d)*t*c,e.renderer.getDrawingBufferSize(i.uResolution.value),i.uTime.value=f*c,i.uFade.value=g(u),i.uLevel.value=s,i.uWave.value=l<0?-1:1.4+l,i.uSpin.value=x,i.uGlow.value=.92+.08*Math.sin(f*.5*c)+p*.25;const a=e.interaction.group,{phase:S}=e.interaction;v=S==="live"||S==="charging"?Math.min(1,v+t/1.2):Math.max(0,v-t/.1),o.position.set(a.position.x,a.position.y,a.position.z-.8),o.rotation.z=a.rotation.z,o.scale.set(1.8*a.scale.x,1.8*a.scale.y,1),o.material.uniforms.uGlow.value=g(u)*g(v)*(.12+s*.05+p*.15)},dispose(){var t;(t=n.value)==null||t.dispose()}}}const I={id:"fractal",create:V};export{I as default};
