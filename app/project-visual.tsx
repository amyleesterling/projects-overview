"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Particle = {
  x:number; y:number; baseX:number; baseY:number; vx:number; vy:number;
  mass:number; size:number; phase:number; accent:boolean;
};

const TAU = Math.PI * 2;

function hashName(name: string) {
  return [...name].reduce((hash, letter) => ((hash << 5) - hash + letter.charCodeAt(0)) | 0, 2166136261) >>> 0;
}

function drawProjectIcon(context: CanvasRenderingContext2D, name: string) {
  const line = (points: number[][], close = false) => {
    context.beginPath();
    points.forEach(([x,y], index) => index ? context.lineTo(x,y) : context.moveTo(x,y));
    if (close) context.closePath();
    context.stroke();
  };
  const circle = (x:number,y:number,r:number,fill = false) => {
    context.beginPath(); context.arc(x,y,r,0,TAU); fill ? context.fill() : context.stroke();
  };
  const ellipse = (x:number,y:number,rx:number,ry:number,rotation = 0,fill = false) => {
    context.beginPath(); context.ellipse(x,y,rx,ry,rotation,0,TAU); fill ? context.fill() : context.stroke();
  };
  const rect = (x:number,y:number,w:number,h:number,r = 0) => {
    context.beginPath(); context.roundRect(x,y,w,h,r); context.stroke();
  };
  const arc = (x:number,y:number,r:number,start:number,end:number) => {
    context.beginPath(); context.arc(x,y,r,start,end); context.stroke();
  };
  const star = (x:number,y:number,r=18) => {
    const points:number[][] = [];
    for (let index=0; index<10; index++) {
      const radius = index % 2 ? r*.42 : r;
      const angle = -Math.PI/2 + index*Math.PI/5;
      points.push([x+Math.cos(angle)*radius,y+Math.sin(angle)*radius]);
    }
    line(points,true);
  };
  const spark = (x:number,y:number,r=14) => {
    line([[x-r,y],[x+r,y]]); line([[x,y-r],[x,y+r]]);
    line([[x-r*.65,y-r*.65],[x+r*.65,y+r*.65]]);
    line([[x+r*.65,y-r*.65],[x-r*.65,y+r*.65]]);
  };
  const neuron = (x=150,y=92,scale=1) => {
    circle(x,y,18*scale);
    [[-58,-44],[-67,4],[-48,49],[45,-52],[67,-6],[54,44]].forEach(([dx,dy], index) => {
      const midX=x+dx*.52, midY=y+dy*.52;
      line([[x+(index%2?7:-7),y],[midX,midY],[x+dx,y+dy]]);
      if (index%2===0) line([[midX,midY],[midX+dx*.22,midY-dy*.18]]);
    });
  };
  const planet = (x=150,y=88,r=43) => {
    circle(x,y,r); ellipse(x,y,r*1.45,r*.34,-.22); arc(x-5,y,r*.72,-1.1,1.2);
  };
  const eye = (x=150,y=88,scale=1) => {
    context.beginPath(); context.moveTo(x-58*scale,y); context.quadraticCurveTo(x,y-48*scale,x+58*scale,y);
    context.quadraticCurveTo(x,y+48*scale,x-58*scale,y); context.stroke(); circle(x,y,17*scale); circle(x,y,5*scale,true);
  };
  const brain = (x=150,y=88,scale=1) => {
    context.beginPath();
    context.moveTo(x,y+48*scale);
    context.bezierCurveTo(x-63*scale,y+52*scale,x-70*scale,y+5*scale,x-48*scale,y-10*scale);
    context.bezierCurveTo(x-65*scale,y-48*scale,x-19*scale,y-65*scale,x,y-38*scale);
    context.bezierCurveTo(x+19*scale,y-65*scale,x+65*scale,y-48*scale,x+48*scale,y-10*scale);
    context.bezierCurveTo(x+70*scale,y+5*scale,x+63*scale,y+52*scale,x,y+48*scale);
    context.stroke(); line([[x,y-38*scale],[x,y+48*scale]]);
    arc(x-22*scale,y-9*scale,18*scale,-2.7,.7); arc(x+22*scale,y+10*scale,18*scale,.4,3.7);
  };

  context.save();
  context.strokeStyle = "#fff";
  context.fillStyle = "#fff";
  context.lineWidth = 7;
  context.lineCap = "round";
  context.lineJoin = "round";

  switch (name) {
    case "philogelos":
      rect(92,38,116,108,10); line([[110,66],[190,66],[110,88],[174,88],[110,110],[158,110]]);
      context.beginPath(); context.moveTo(176,146); context.quadraticCurveTo(199,157,210,132); context.stroke(); spark(225,42,10); break;
    case "inner-cosmos":
      circle(150,88,23); [[76,35],[224,35],[62,116],[238,116],[150,25],[150,151]].forEach(([x,y])=>{line([[150,88],[x,y]]);circle(x,y,9);}); break;
    case "partypost":
      rect(72,48,156,94,10); line([[76,57],[150,110],[224,57]]); spark(242,40,11); circle(57,50,5,true); circle(246,128,5,true); break;
    case "kids-who-vibecode":
      line([[117,48],[72,88],[117,128]]); line([[183,48],[228,88],[183,128]]); line([[165,37],[136,139]]); star(150,88,10); break;
    case "sophie-shark-game":
      context.beginPath(); context.moveTo(66,94); context.quadraticCurveTo(134,29,224,82); context.lineTo(252,55); context.lineTo(245,101); context.lineTo(252,128);
      context.lineTo(222,105); context.quadraticCurveTo(137,151,66,94); context.stroke(); line([[132,60],[154,29],[174,65]]); circle(197,80,4,true); break;
    case "hurricane":
      for(let radius=12;radius<68;radius+=13) arc(150,88,radius,-.45,Math.PI*1.45); circle(150,88,6,true); line([[84,41],[56,34]]); line([[216,135],[245,144]]); break;
    case "atlas-of-the-unseen":
      ellipse(150,88,72,49,-.15); ellipse(150,88,50,72,.85); [[91,59],[182,39],[209,111],[121,127]].forEach(([x,y])=>circle(x,y,5,true)); star(150,88,16); break;
    case "seunglabdata":
      ellipse(150,45,65,20); line([[85,45],[85,129]]); line([[215,45],[215,129]]); arc(150,87,65,0,Math.PI); arc(150,129,65,0,Math.PI); line([[85,86],[215,86]]); break;
    case "cocos-mythic-meadow":
      context.beginPath(); context.moveTo(93,129); context.quadraticCurveTo(91,65,139,55); context.quadraticCurveTo(182,48,204,91);
      context.quadraticCurveTo(181,143,93,129); context.stroke(); line([[137,55],[159,20],[168,59]]); line([[101,81],[73,58],[92,100]]); star(224,53,13); circle(167,81,4,true); break;
    case "youth-sports-moneymachine":
      circle(102,101,38); line([[64,101],[140,101],[102,63],[102,139]]); line([[161,132],[161,93],[191,93],[191,66],[224,66],[224,35]]); line([[210,46],[224,32],[238,46]]); break;
    case "the650":
      context.beginPath(); context.moveTo(74,116); context.quadraticCurveTo(101,131,122,111); context.quadraticCurveTo(143,91,133,68);
      context.quadraticCurveTo(153,49,171,67); context.quadraticCurveTo(208,52,225,84); context.quadraticCurveTo(208,139,151,140); context.quadraticCurveTo(107,147,74,116); context.stroke();
      line([[130,106],[177,93],[207,86]]); break;
    case "fabled-jokes":
      circle(150,88,61); arc(150,91,34,.12,Math.PI-.12); arc(121,73,8,Math.PI,TAU); arc(179,73,8,Math.PI,TAU); spark(224,40,10); break;
    case "whatisabrain":
      brain(125,91,.85); context.beginPath(); context.moveTo(203,62); context.quadraticCurveTo(238,29,246,63); context.quadraticCurveTo(247,82,226,89); context.lineTo(226,101); context.stroke(); circle(226,124,4,true); break;
    case "science-experiment":
      rect(49,35,202,105,9); line([[92,154],[208,154],[150,140],[150,154]]); line([[69,114],[112,76],[151,102],[196,55],[231,78]]); break;
    case "inner_cosmos":
      neuron(150,88,1.05); spark(228,43,9); break;
    case "inner-cosmos-wall":
      rect(45,35,210,108,8); neuron(150,88,.62); line([[108,157],[192,157],[150,143],[150,157]]); break;
    case "heat-wave":
      circle(98,67,28); for(let angle=0;angle<TAU;angle+=Math.PI/4) line([[98+Math.cos(angle)*39,67+Math.sin(angle)*39],[98+Math.cos(angle)*52,67+Math.sin(angle)*52]]);
      context.beginPath(); context.moveTo(145,115); context.bezierCurveTo(171,90,190,141,217,113); context.bezierCurveTo(234,97,245,110,253,116); context.stroke(); break;
    case "extremely-strange":
      context.beginPath(); context.moveTo(98,30); context.bezierCurveTo(211,56,87,122,202,150); context.stroke();
      context.beginPath(); context.moveTo(202,30); context.bezierCurveTo(89,56,213,122,98,150); context.stroke();
      for(let y=48;y<146;y+=24) line([[113+(y%48?24:0),y],[187-(y%48?24:0),y]]); break;
    case "fableous":
      line([[74,135],[74,52],[145,67],[150,140],[155,67],[226,52],[226,135],[155,151],[145,151],[74,135]]);
      line([[150,68],[150,31]]); line([[150,45],[128,29]]); line([[150,48],[174,31]]); break;
    case "kindling":
      context.beginPath(); context.moveTo(151,151); context.bezierCurveTo(88,131,117,87,146,67); context.bezierCurveTo(132,45,156,27,174,18);
      context.bezierCurveTo(169,51,212,69,195,112); context.bezierCurveTo(188,139,169,151,151,151); context.stroke();
      context.beginPath(); context.moveTo(151,139); context.quadraticCurveTo(133,114,160,91); context.quadraticCurveTo(185,122,151,139); context.stroke(); break;
    case "ma-car-lease-analysis-":
      line([[64,111],[78,75],[112,59],[195,59],[225,82],[239,111],[64,111]]); circle(101,118,17); circle(205,118,17); line([[118,65],[131,92],[204,92],[187,64]]); break;
    case "amysterling":
      circle(150,58,25); arc(150,141,62,Math.PI,TAU); [[63,45],[235,54],[72,132],[229,129]].forEach(([x,y])=>{circle(x,y,5,true);line([[150,88],[x,y]]);}); break;
    case "wood-coal-pizza":
      line([[91,43],[224,82],[107,151],[91,43]]); arc(143,70,32,.25,2.2); circle(142,92,7,true); circle(174,107,7,true);
      context.beginPath(); context.moveTo(70,131); context.quadraticCurveTo(55,103,81,86); context.quadraticCurveTo(68,63,91,51); context.stroke(); break;
    case "MagicBoard":
      line([[82,140],[196,42]]); line([[92,130],[105,143]]); spark(218,42,20); spark(181,88,9); spark(235,106,11); break;
    case "thefartsite":
      context.beginPath(); context.moveTo(69,119); context.bezierCurveTo(48,91,70,67,99,74); context.bezierCurveTo(106,38,154,37,167,65);
      context.bezierCurveTo(208,51,235,80,218,109); context.bezierCurveTo(240,132,208,150,178,138); context.lineTo(88,138); context.quadraticCurveTo(65,137,69,119); context.stroke();
      circle(229,46,5,true); circle(248,28,3,true); break;
    case "moontoast":
      context.beginPath(); context.arc(115,76,48,.7,Math.PI*1.72); context.quadraticCurveTo(142,91,115,124); context.stroke();
      line([[154,105],[154,48],[207,61],[207,121],[154,109],[101,121]]); star(225,39,10); break;
    case "drosophila_datause_2026":
      ellipse(150,89,15,37); ellipse(111,73,38,23,-.45); ellipse(189,73,38,23,.45); circle(150,45,12);
      line([[138,111],[109,142],[91,145]]); line([[162,111],[191,142],[209,145]]); line([[137,63],[112,36]]); line([[163,63],[188,36]]); break;
    case "flywire-neuron-gallery":
      brain(150,88,.95); ellipse(102,89,31,19,-.3); ellipse(198,89,31,19,.3); spark(150,88,11); break;
    case "explore-the-universe":
      [18,37,61].forEach(r=>circle(150,88,r)); circle(150,88,6,true); line([[150,27],[150,9]]); line([[211,88],[232,88]]); break;
    case "neuronal-surprise-surfing":
      neuron(130,94,.78); star(213,55,25); line([[183,74],[202,64]]); break;
    case "explore-the-verse-2-":
      line([[70,126],[128,65],[165,83],[108,143],[70,126]]); circle(133,104,12); line([[157,75],[213,37]]); circle(225,29,8); arc(225,29,25,.2,2.9); break;
    case "eyewire-ii":
      eye(150,88,1); neuron(150,88,.33); break;
    case "AnnotationEngine":
      ellipse(113,52,45,15); line([[68,52],[68,115]]); line([[158,52],[158,115]]); arc(113,84,45,0,Math.PI); arc(113,115,45,0,Math.PI);
      context.beginPath(); context.moveTo(214,56); context.bezierCurveTo(174,56,174,105,214,140); context.bezierCurveTo(254,105,254,56,214,56); context.stroke(); circle(214,83,10); break;
    case "eyewire-ii-avatar":
      circle(133,66,28); arc(133,151,62,Math.PI,TAU); circle(214,108,27); line([[214,93],[214,123],[203,113],[225,113]]); break;
    case "vibeshift":
      rect(75,51,116,92,17); circle(108,87,6,true); circle(158,87,6,true); arc(133,102,24,.2,Math.PI-.2);
      line([[98,51],[88,30]]); line([[168,51],[179,30]]); star(221,75,18); break;
    case "build-a-planet":
      planet(); line([[104,56],[130,74],[126,99],[156,112],[176,88],[197,99]]); spark(225,36,9); break;
    case "Department_of_Ridiculous":
      arc(150,106,55,Math.PI,TAU); line([[95,106],[95,132],[205,132],[205,106]]); line([[118,106],[125,64],[175,64],[182,106]]);
      spark(150,37,11); line([[91,53],[72,39]]); line([[209,53],[228,39]]); break;
    case "synapticConnection":
      neuron(91,89,.57); neuron(209,89,.57); line([[124,89],[140,89],[150,74],[160,102],[176,102]]); circle(150,74,5,true); break;
    case "animateKidStories":
      rect(58,51,184,101,8); line([[58,78],[242,78]]); for(let x=73;x<235;x+=34) line([[x,54],[x+16,76]]);
      context.beginPath(); context.moveTo(127,96); context.lineTo(127,137); context.lineTo(174,116); context.closePath(); context.stroke(); spark(233,34,9); break;
    case "realFeel_climateCompare":
      circle(95,67,25); line([[95,27],[95,16],[55,67],[43,67]]); arc(163,112,45,Math.PI,TAU); circle(207,105,22);
      rect(117,55,17,66,9); circle(125,132,17); line([[125,65],[125,116]]); break;
    case "theLastWebsite":
      line([[103,29],[197,29],[103,151],[197,151],[103,29]]); line([[118,45],[182,45],[150,86],[118,45]]); line([[118,135],[182,135],[150,94],[118,135]]);
      ellipse(150,90,28,10,.4); circle(150,90,4,true); break;
    case "ridiculous":
      line([[150,26],[150,117]]); circle(150,145,6,true); context.beginPath(); context.moveTo(90,118); context.quadraticCurveTo(115,86,140,118); context.quadraticCurveTo(165,150,210,105); context.stroke(); spark(221,48,10); break;
    case "shield":
      context.beginPath(); context.moveTo(150,25); context.lineTo(222,52); context.lineTo(210,112); context.quadraticCurveTo(192,145,150,158);
      context.quadraticCurveTo(108,145,90,112); context.lineTo(78,52); context.closePath(); context.stroke(); line([[112,89],[139,116],[192,62]]); break;
    case "neuron-game":
      line([[57,121],[106,121],[106,72],[151,72],[151,112],[202,112],[202,53],[243,53]]); neuron(57,121,.25); circle(243,53,7,true);
      line([[151,112],[151,150]]); break;
    case "badges":
      line([[150,22],[208,55],[208,121],[150,154],[92,121],[92,55],[150,22]]); star(150,82,28); line([[122,142],[111,164]]); line([[178,142],[189,164]]); break;
    case "eyewire-ii-tutorial":
      line([[63,72],[150,35],[237,72],[150,109],[63,72]]); line([[95,88],[95,126],[150,148],[205,126],[205,88]]); line([[237,72],[237,129]]); circle(237,139,6,true); eye(150,91,.35); break;
    case "eyewire-ii-tags":
      context.beginPath(); context.moveTo(72,55); context.lineTo(173,55); context.lineTo(231,113); context.lineTo(173,151); context.lineTo(72,55); context.stroke(); circle(111,79,10); line([[145,87],[188,118]]); break;
    case "stretch-ai":
      circle(150,37,14); line([[150,52],[150,101]]); line([[150,67],[97,89]]); line([[150,67],[206,78]]); line([[150,101],[105,143]]); line([[150,101],[200,143]]); arc(150,102,30,0,Math.PI); break;
    case "cribbles":
      context.beginPath(); context.moveTo(150,146); context.bezierCurveTo(81,112,78,48,124,48); context.bezierCurveTo(146,48,150,69,150,69);
      context.bezierCurveTo(150,69,154,48,176,48); context.bezierCurveTo(222,48,219,112,150,146); context.stroke(); arc(150,91,31,.2,Math.PI-.2); spark(231,42,9); break;
    case "bouncebar":
      line([[53,136],[247,136]]); circle(88,111,18); circle(150,80,14); circle(213,119,12); line([[88,93],[88,51]]); arc(150,80,43,Math.PI,TAU); break;
    case "what-i-am":
      context.beginPath(); context.roundRect(57,36,137,88,14); context.stroke(); line([[90,124],[77,149],[120,124]]);
      line([[215,39],[215,143]]); arc(215,91,32,-Math.PI/2,Math.PI/2); line([[211,59],[211,123]]); break;
    case "coras-mermaid":
      context.beginPath(); context.moveTo(109,29); context.bezierCurveTo(205,55,86,111,181,147); context.stroke();
      context.beginPath(); context.moveTo(181,147); context.quadraticCurveTo(214,132,231,151); context.quadraticCurveTo(205,164,181,147); context.stroke();
      line([[119,46],[86,30]]); circle(221,50,17); arc(221,50,11,0,Math.PI); break;
    default:
      star(150,88,58); circle(150,88,20);
  }
  context.restore();
}

export default function ProjectVisual({ name, category, compact = false }: { name:string; category:string; compact?:boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seed = hashName(name);
  const hue = 190 + seed % 28;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let inView = true;
    const pointer = { x:-1000, y:-1000, active:false };

    const build = () => {
      const shape = document.createElement("canvas");
      shape.width = 300;
      shape.height = 180;
      const shapeContext = shape.getContext("2d", { willReadFrequently:true });
      if (!shapeContext) return;
      drawProjectIcon(shapeContext, name);
      const pixels = shapeContext.getImageData(0,0,300,180).data;
      const next:Particle[] = [];
      const spacing = width < 450 ? 5 : 4;
      let index = 0;
      for (let y=0;y<180;y+=spacing) for (let x=0;x<300;x+=spacing) {
        if (pixels[(y*300+x)*4+3] > 30) {
          const baseX = x/300*width;
          const baseY = y/180*height;
          const random = ((seed + index*2654435761) >>> 0) / 4294967295;
          next.push({x:baseX,y:baseY,baseX,baseY,vx:0,vy:0,mass:.55+random*1.8,size:1.05+random*1.2,phase:random*TAU,accent:index%47===0});
          index++;
        }
      }
      particles = next;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1,rect.width);
      height = Math.max(1,rect.height);
      canvas.width = Math.round(width*ratio);
      canvas.height = Math.round(height*ratio);
      context.setTransform(ratio,0,0,ratio,0,0);
      build();
    };

    const draw = (time=0) => {
      context.clearRect(0,0,width,height);
      for (const particle of particles) {
        const orbitX = reduceMotion ? 0 : Math.sin(time*.00055+particle.phase)*1.7;
        const orbitY = reduceMotion ? 0 : Math.cos(time*.00048+particle.phase)*1.15 + particle.mass*1.35;
        if (pointer.active && !reduceMotion) {
          const dx = particle.x-pointer.x;
          const dy = particle.y-pointer.y;
          const distance = Math.hypot(dx,dy) || 1;
          const radius = Math.min(125,width*.28);
          if (distance < radius) {
            const gravity = (1-distance/radius)*(.92/particle.mass);
            particle.vx += dx/distance*gravity - dy/distance*gravity*.22;
            particle.vy += dy/distance*gravity + dx/distance*gravity*.22;
          }
        }
        const spring = .018/particle.mass;
        particle.vx += (particle.baseX+orbitX-particle.x)*spring;
        particle.vy += (particle.baseY+orbitY-particle.y)*spring;
        particle.vx *= .9;
        particle.vy *= .9;
        particle.x += particle.vx;
        particle.y += particle.vy;
        context.save();
        context.fillStyle = particle.accent ? "rgba(255,205,86,.96)" : "rgba(132,224,255,.9)";
        context.shadowColor = particle.accent ? "#ffd05b" : "#42c8f4";
        context.shadowBlur = particle.accent ? 8 : 3;
        context.beginPath();
        context.arc(particle.x,particle.y,particle.size,0,TAU);
        context.fill();
        context.restore();
      }
    };

    const animate = (time:number) => {
      frame = 0;
      draw(time);
      if (inView && !reduceMotion) frame = requestAnimationFrame(animate);
    };
    const start = () => { if (!frame && !reduceMotion) frame=requestAnimationFrame(animate); };
    const move = (event:PointerEvent) => {
      const rect=canvas.getBoundingClientRect();
      pointer.x=event.clientX-rect.left;
      pointer.y=event.clientY-rect.top;
      pointer.active=true;
      start();
    };
    const leave = () => { pointer.active=false; pointer.x=-1000; pointer.y=-1000; };
    const visibility = new IntersectionObserver(([entry]) => {
      inView=entry.isIntersecting;
      if (inView) start();
      else if (frame) { cancelAnimationFrame(frame); frame=0; }
    },{rootMargin:"120px"});
    const observer = new ResizeObserver(() => {resize();draw();start();});
    visibility.observe(canvas);
    observer.observe(canvas);
    resize();
    draw();
    start();
    canvas.addEventListener("pointermove",move);
    canvas.addEventListener("pointerleave",leave);
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      observer.disconnect();
      canvas.removeEventListener("pointermove",move);
      canvas.removeEventListener("pointerleave",leave);
    };
  },[name]);

  return <div className={`projectVisual visual-${category} ${compact ? "compact" : ""}`} style={{"--project-hue":hue} as CSSProperties} aria-hidden="true">
    <span className="visualField"/>
    <canvas ref={canvasRef}/>
    <span className="visualGravity">interactive gravity field</span>
  </div>;
}
