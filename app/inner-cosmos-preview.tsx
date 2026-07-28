"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function InnerCosmosPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .05, 60);
    camera.position.set(2.6,.9,3.4);
    const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.6));
    renderer.setClearColor(0x000000,0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.prepend(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x536ac4,1.1));
    const cyan = new THREE.DirectionalLight(0x70ddff,3.8);
    cyan.position.set(4,5,5);
    scene.add(cyan);
    const violet = new THREE.PointLight(0xc34cff,22,14);
    violet.position.set(-3,-1,2);
    scene.add(violet);

    const controls = new OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;
    controls.dampingFactor=.08;
    controls.enablePan=false;
    controls.autoRotate=!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    controls.autoRotateSpeed=.38;
    controls.minDistance=1.2;
    controls.maxDistance=8;
    renderer.domElement.style.touchAction="none";
    renderer.domElement.style.cursor="grab";
    let resumeTimer=0;
    const pause=()=>{controls.autoRotate=false;window.clearTimeout(resumeTimer);renderer.domElement.style.cursor="grabbing";};
    const resume=()=>{renderer.domElement.style.cursor="grab";window.clearTimeout(resumeTimer);resumeTimer=window.setTimeout(()=>{controls.autoRotate=true;},2200);};
    renderer.domElement.addEventListener("pointerdown",pause);
    renderer.domElement.addEventListener("pointerup",resume);
    renderer.domElement.addEventListener("pointercancel",resume);

    const motes=140;
    const motePositions=new Float32Array(motes*3);
    for(let index=0;index<motes;index++){
      const radius=2.4+Math.random()*3.2;
      const angle=Math.random()*Math.PI*2;
      motePositions[index*3]=Math.cos(angle)*radius;
      motePositions[index*3+1]=(Math.random()-.5)*4.5;
      motePositions[index*3+2]=Math.sin(angle)*radius;
    }
    const moteGeometry=new THREE.BufferGeometry();
    moteGeometry.setAttribute("position",new THREE.BufferAttribute(motePositions,3));
    const moteMaterial=new THREE.PointsMaterial({color:0x6dd9ff,size:.018,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false});
    const moteCloud=new THREE.Points(moteGeometry,moteMaterial);
    scene.add(moteCloud);

    let cortex:THREE.Group|null=null;
    new GLTFLoader().load("/meshes/human-brain.glb",(gltf)=>{
      cortex=new THREE.Group();
      gltf.scene.traverse((object)=>{
        if (!(object instanceof THREE.Mesh)) return;
        const geometry=object.geometry as THREE.BufferGeometry;
        const solid=new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({
          color:0x3556b8,emissive:0x24146f,emissiveIntensity:.72,roughness:.42,metalness:.15,
          clearcoat:.45,clearcoatRoughness:.3,side:THREE.DoubleSide,transparent:true,opacity:.97,
        }));
        const wire=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({
          color:0x62d8ff,wireframe:true,transparent:true,opacity:.105,blending:THREE.AdditiveBlending,depthWrite:false,
        }));
        wire.scale.setScalar(1.004);
        cortex!.add(solid,wire);
      });
      scene.add(cortex);
      const box=new THREE.Box3().setFromObject(cortex);
      const center=new THREE.Vector3();
      const size=new THREE.Vector3();
      box.getCenter(center);box.getSize(size);
      const radius=Math.max(size.x,size.y,size.z)*.55;
      const distance=radius/Math.tan(camera.fov*Math.PI/360)+.35;
      camera.position.set(center.x+distance*.5,center.y+distance*.18,center.z+distance*.82);
      controls.target.copy(center);
      controls.minDistance=Math.max(.5,distance*.43);
      controls.maxDistance=distance*3;
      controls.update();
      setReady(true);
    });

    let frame=0;
    let visible=true;
    const render=()=>{
      frame=0;
      controls.update();
      moteCloud.rotation.y+=.0007;
      renderer.render(scene,camera);
      if(visible) frame=requestAnimationFrame(render);
    };
    const start=()=>{if(!frame)frame=requestAnimationFrame(render);};
    const resize=()=>{
      const width=Math.max(1,container.clientWidth),height=Math.max(1,container.clientHeight);
      camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false);start();
    };
    const resizeObserver=new ResizeObserver(resize);
    const visibilityObserver=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(visible)start();else if(frame){cancelAnimationFrame(frame);frame=0;}
    },{rootMargin:"150px"});
    resizeObserver.observe(container);visibilityObserver.observe(container);resize();start();
    return()=>{
      cancelAnimationFrame(frame);window.clearTimeout(resumeTimer);resizeObserver.disconnect();visibilityObserver.disconnect();controls.dispose();
      renderer.domElement.removeEventListener("pointerdown",pause);renderer.domElement.removeEventListener("pointerup",resume);renderer.domElement.removeEventListener("pointercancel",resume);
      cortex?.traverse((object)=>{if(object instanceof THREE.Mesh){object.geometry.dispose();if(Array.isArray(object.material))object.material.forEach(material=>material.dispose());else object.material.dispose();}});
      moteGeometry.dispose();moteMaterial.dispose();renderer.dispose();renderer.domElement.remove();
    };
  },[]);

  return <div className="innerCosmosPreview" ref={containerRef} aria-label="Interactive rotating three-dimensional human brain surface mesh">
    <div className="brainMeshHud"><span>LIVE CORTEX</span><b>MICrONS / SURFACE MESH</b></div>
    <div className="brainMeshControl">DRAG · ROTATE · ZOOM</div>
    {!ready&&<div className="brainMeshLoading">LOADING CORTEX…</div>}
  </div>;
}
