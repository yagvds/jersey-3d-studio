import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function makeTexture({ logoUrl, motifUrl, color = '#f4f5f7', number = '10', player = 'PLAYER' }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color; ctx.fillRect(0, 0, 1024, 1024);

  if (motifUrl) {
    const img = new Image();
    img.onload = () => {
      const tile = document.createElement('canvas'); tile.width=220; tile.height=220;
      const tctx=tile.getContext('2d'); tctx.drawImage(img,0,0,220,220);
      const pattern=ctx.createPattern(tile,'repeat');
      if(pattern){ctx.save();ctx.globalAlpha=.34;ctx.fillStyle=pattern;ctx.fillRect(0,0,1024,1024);ctx.restore();texture.needsUpdate=true;}
    };
    img.src = motifUrl;
  } else {
    ctx.save(); ctx.globalAlpha = .10; ctx.strokeStyle = '#8da2b7'; ctx.lineWidth = 2;
    for (let x=-1024; x<2048; x+=72) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+1024,1024); ctx.stroke(); }
    ctx.restore();
  }
  // Front panel graphics occupy the front UV region (center of the texture).
  ctx.save();
  ctx.fillStyle = '#17283c'; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'center';
  ctx.fillText('CLUB', 512, 190);
  ctx.font = 'bold 104px Arial'; ctx.fillText(number, 512, 690);
  ctx.font = 'bold 27px Arial'; ctx.fillText(player, 512, 744);
  if (logoUrl) {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(110/img.naturalWidth, 110/img.naturalHeight);
      ctx.drawImage(img, 512-55, 220, img.naturalWidth*ratio, img.naturalHeight*ratio);
      texture.needsUpdate=true;
    };
    img.src = logoUrl;
  } else {
    ctx.beginPath(); ctx.arc(512, 270, 43, 0, Math.PI*2); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle='#17283c'; ctx.lineWidth=5; ctx.stroke();
    ctx.fillStyle='#17283c'; ctx.font='bold 24px Arial'; ctx.fillText('FC',512,278);
  }
  // Back-side number/name near texture seam; duplicated at both ends to remain visible.
  for (const x of [18, 1006]) {
    ctx.textAlign='center'; ctx.fillStyle='#17283c'; ctx.font='bold 26px Arial'; ctx.fillText(player,x,350);
    ctx.font='bold 112px Arial'; ctx.fillText(number,x,510);
  }
  ctx.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createBodyGeometry() {
  const rings = [
    { y: -1.05, w: .66, d: .245 },
    { y: -.82, w: .68, d: .255 },
    { y: -.48, w: .64, d: .245 },
    { y: -.10, w: .61, d: .235 },
    { y: .28, w: .64, d: .245 },
    { y: .57, w: .70, d: .25 },
    { y: .78, w: .69, d: .235 },
    { y: .91, w: .45, d: .19 },
    { y: .98, w: .22, d: .14 },
  ];
  const seg = 64, positions=[], uvs=[], indices=[];
  rings.forEach((r, j) => {
    for (let i=0;i<=seg;i++) {
      const u=i/seg, a=(u-.5)*Math.PI*2;
      positions.push(Math.sin(a)*r.w, r.y, Math.cos(a)*r.d);
      uvs.push(u, j/(rings.length-1));
    }
  });
  for(let j=0;j<rings.length-1;j++) for(let i=0;i<seg;i++){
    const a=j*(seg+1)+i, b=a+seg+1;
    indices.push(a,b,a+1,b,b+1,a+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  g.setIndex(indices); g.computeVertexNormals();
  return g;
}

function createSleeveGeometry(side=1) {
  const steps=20, seg=32, positions=[],uvs=[],indices=[];
  for(let j=0;j<=steps;j++){
    const t=j/steps;
    const x=side*(.52+.72*t);
    const y=.60-.33*t;
    const z=0;
    const radius=.245*(1-t)+.155*t;
    for(let i=0;i<=seg;i++){
      const a=i/seg*Math.PI*2;
      positions.push(x, y+Math.cos(a)*radius*.72, z+Math.sin(a)*radius);
      uvs.push(i/seg,t);
    }
  }
  for(let j=0;j<steps;j++) for(let i=0;i<seg;i++){
    const a=j*(seg+1)+i,b=a+seg+1;
    indices.push(a,a+1,b,b,a+1,b+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  g.setIndex(indices);g.computeVertexNormals();return g;
}

export default function Jersey3D({ logoUrl, motifUrl, jerseyColor='#f4f5f7', autoRotate=true, view='front' }) {
  const host=useRef(null), api=useRef(null);
  useEffect(()=>{
    if(!host.current) return;
    const el=host.current;
    const scene=new THREE.Scene(); scene.background=new THREE.Color('#101a28');
    const camera=new THREE.PerspectiveCamera(34,1,.1,100); camera.position.set(0,.15,5.4);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
    el.appendChild(renderer.domElement);
    const controls=new OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;controls.dampingFactor=.06;controls.target.set(0,-.05,0);
    controls.minDistance=3.2;controls.maxDistance=8;
    scene.add(new THREE.HemisphereLight(0xeaf3ff,0x354052,2.0));
    const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(-3,4,5);scene.add(key);
    const rim=new THREE.DirectionalLight(0x79baff,2.2);rim.position.set(3,2,-4);scene.add(rim);
    const fill=new THREE.DirectionalLight(0xffffff,1.0);fill.position.set(2,-2,4);scene.add(fill);
    const texture=makeTexture({logoUrl,motifUrl,color:jerseyColor});
    const fabric=new THREE.MeshStandardMaterial({map:texture,color:0xffffff,roughness:.82,metalness:0,side:THREE.DoubleSide});
    const garment=new THREE.Group();scene.add(garment);
    const body=new THREE.Mesh(createBodyGeometry(),fabric);body.castShadow=true;body.receiveShadow=true;garment.add(body);
    const sleeveMat=fabric;
    const left=new THREE.Mesh(createSleeveGeometry(-1),sleeveMat);left.castShadow=true;garment.add(left);
    const right=new THREE.Mesh(createSleeveGeometry(1),sleeveMat);right.castShadow=true;garment.add(right);
    const collarMat=new THREE.MeshStandardMaterial({color:'#17283c',roughness:.72});
    const collar=new THREE.Mesh(new THREE.TorusGeometry(.205,.055,12,64),collarMat);
    collar.position.set(0,.94,0);collar.rotation.x=Math.PI/2;garment.add(collar);
    // Subtle seam piping on side seams and sleeve hems.
    const seamMat=new THREE.MeshStandardMaterial({color:'#c7d0da',roughness:.9});
    [-1,1].forEach(s=>{
      const pts=[new THREE.Vector3(s*.62,-1.0,.05),new THREE.Vector3(s*.60,-.45,.16),new THREE.Vector3(s*.58,.15,.16),new THREE.Vector3(s*.60,.56,.12)];
      const curve=new THREE.CatmullRomCurve3(pts);
      garment.add(new THREE.Mesh(new THREE.TubeGeometry(curve,28,.006,5,false),seamMat));
    });
    const floor=new THREE.Mesh(new THREE.CircleGeometry(2.4,64),new THREE.MeshBasicMaterial({color:'#162337'}));
    floor.rotation.x=-Math.PI/2;floor.position.y=-1.34;floor.position.z=0;scene.add(floor);
    const resize=()=>{const w=el.clientWidth||700,h=el.clientHeight||540;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);};
    const ro=new ResizeObserver(resize);ro.observe(el);resize();
    let frame;const animate=()=>{frame=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);};animate();
    api.current={camera,controls,garment};
    return ()=>{cancelAnimationFrame(frame);ro.disconnect();controls.dispose();renderer.dispose();texture.dispose();el.removeChild(renderer.domElement);};
  },[logoUrl,motifUrl,jerseyColor]);
  useEffect(()=>{
    if(!api.current)return;
    const {camera,controls}=api.current;
    if(view==='front') camera.position.set(0,.15,5.4);
    if(view==='back') camera.position.set(0,.15,-5.4);
    if(view==='side') camera.position.set(5.4,.15,0);
    if(view==='reset') camera.position.set(0,.15,5.4);
    controls.target.set(0,-.05,0);controls.update();
  },[view]);
  useEffect(()=>{if(api.current) api.current.controls.autoRotate=autoRotate;},[autoRotate]);
  return <div className="jersey-3d-host" ref={host}><div className="render-label">3D GARMENT VIEW • INTERACTIVE</div><div className="render-hint">Drag untuk memutar · Scroll untuk zoom</div></div>;
}
