"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProjectVisual from "./project-visual";

export type RepositoryWorldProject = {
  name:string; title:string; description:string; language:string; url:string; liveUrl?:string; publicationUrl?:string; thumbnail?:string;
  category:string; categoryTitle:string; commits:number; months:number[]; touchedMonth:number; featured:boolean;
  stars?:number; topics?:string[]; lastTouched?:string;
};

type GraphNode = RepositoryWorldProject & { x:number; y:number; vx:number; vy:number; radius:number; community:number };
type GraphEdge = { source:number; target:number; weight:number };

const neighborhoodColors:Record<string,string> = {
  brains:"#69d8ff", kids:"#54d2c8", earth:"#7eb5ff", ai:"#a99cff",
  tools:"#a8e8ff", toys:"#4ebce9", ridiculous:"#ffd35f",
  models:"#69d8ff", agents:"#42d3c5", research:"#9b9dff", safety:"#ffd35f",
  developer:"#8ddcff", multimodal:"#729eff", learning:"#b7c9ff",
};
const centers:Record<string,[number,number]> = {
  brains:[.25,.28], kids:[.74,.25], earth:[.82,.55], ai:[.63,.76],
  tools:[.36,.75], toys:[.48,.48], ridiculous:[.12,.59],
  models:[.22,.26], agents:[.52,.22], research:[.78,.3], safety:[.82,.64],
  developer:[.53,.76], multimodal:[.22,.68], learning:[.48,.49],
};
const monthNames=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
const monthCount=monthNames.length;
const constellationTours = [
  {id:"connectome",title:"The Connectome Arc",description:"From mapping single neurons to making whole connectomes visible.",names:["ca3","drosophila_datause_2026","flywire-neuron-gallery","eyewire-ii","inner_cosmos"]},
  {id:"rendered",title:"Five Nervous Systems",description:"A year spent rendering real reconstructions: fly, mouse retina, mouse cortex, mouse hippocampus, human.",names:["banc-explorer","retina","microns","ca3","human-brain"]},
  {id:"kids",title:"Small Creative Directors",description:"Projects built with very opinionated young collaborators.",names:["kids-who-vibecode","sophie-shark-game","cocos-mythic-meadow","coras-mermaid","moontoast"]},
  {id:"ridiculous",title:"A Brief History of Ridiculousness",description:"A tour through useful uselessness and unnecessary excellence.",names:["philogelos","fabled-jokes","Department_of_Ridiculous","ridiculous","theLastWebsite","thefartsite"]},
];
const stopwords = new Set("a an and as at built by for from how in into is it just made more no not of on or some than that the their this through to turn up with your".split(" "));
const semanticAliases:Record<string,string[]> = {
  neuron:["brain","connectome","neural","synapse","neuroglancer","dendrite","retina","flywire","microns"],
  story:["stories","fable","jokes","kids","kid","mythic","mermaid"],
  planet:["earth","universe","climate","weather","hurricane","heat"],
  playful:["game","games","toy","silly","fun","magic","ridiculous"],
  intelligence:["ai","claude","language","model","collaboration"],
  data:["data","datasets","analysis","stats","trends","compare","annotation"],
};

function hash(value:string) {
  return [...value].reduce((result,character)=>((result<<5)-result+character.charCodeAt(0))|0,5381)>>>0;
}

function firstActiveMonth(project:RepositoryWorldProject) {
  const commitMonth=project.months.findIndex(commits=>commits>0);
  return commitMonth>=0?commitMonth+1:project.touchedMonth;
}

function terms(project:RepositoryWorldProject) {
  const raw=`${project.name} ${project.title} ${project.description} ${(project.topics||[]).join(" ")}`.toLowerCase().replace(/[^a-z0-9]+/g," ").split(" ").filter(term=>term.length>2&&!stopwords.has(term));
  const result=new Set(raw);
  Object.entries(semanticAliases).forEach(([alias,words])=>{ if(words.some(word=>result.has(word))) result.add(alias); });
  return result;
}

function buildGraph(projects:RepositoryWorldProject[]) {
  const bags=projects.map(terms);
  const candidates:{source:number;target:number;weight:number}[]=[];
  for(let source=0;source<projects.length;source++) for(let target=source+1;target<projects.length;target++) {
    const shared=[...bags[source]].filter(term=>bags[target].has(term));
    let weight=shared.reduce((score,term)=>score+(Object.hasOwn(semanticAliases,term)?1.8:1.15),0);
    if(projects[source].category===projects[target].category) weight+=1.35;
    if(projects[source].language===projects[target].language) weight+=.42;
    const family=["eyewire","inner","cosmos","fable","flywire","neuron","ridiculous"].some(term=>bags[source].has(term)&&bags[target].has(term));
    if(family) weight+=2.5;
    if(weight>=1.65) candidates.push({source,target,weight});
  }
  const chosen=new Map<string,GraphEdge>();
  projects.forEach((_,index)=>{
    candidates.filter(edge=>edge.source===index||edge.target===index).sort((a,b)=>b.weight-a.weight).slice(0,4).forEach(edge=>chosen.set(`${edge.source}-${edge.target}`,edge));
  });
  const edges=[...chosen.values()];

  // Deterministic weighted label propagation: repositories repeatedly adopt the
  // strongest neighboring community, with a small semantic-neighborhood prior.
  let labels=projects.map((_,index)=>index);
  for(let pass=0;pass<12;pass++) projects.forEach((project,index)=>{
    const scores=new Map<number,number>();
    edges.forEach(edge=>{
      const neighbor=edge.source===index?edge.target:edge.target===index?edge.source:-1;
      if(neighbor<0) return;
      const label=labels[neighbor];
      const prior=projects[neighbor].category===project.category?.62:0;
      scores.set(label,(scores.get(label)||0)+edge.weight+prior);
    });
    const best=[...scores.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0];
    if(best) labels[index]=best[0];
  });

  const nodes:GraphNode[]=projects.map((project,index)=>{
    const seed=hash(project.name); const [cx,cy]=centers[project.category]||[.5,.5];
    const angle=(seed%628)/100; const distance=24+(seed%62);
    const signal=project.stars===undefined?Math.sqrt(project.commits)*.28:Math.log10(project.stars+1)*1.1;
    return {...project,x:cx*1000+Math.cos(angle)*distance,y:cy*650+Math.sin(angle)*distance,vx:0,vy:0,radius:project.featured?9:5.5+Math.min(4,signal),community:labels[index]};
  });
  return {nodes,edges};
}

type RepositoryWorldProps = {
  projects:RepositoryWorldProject[];
  heading?:string;
  description?:string;
  kicker?:string;
  showTours?:boolean;
  year?:number;
};

export default function RepositoryWorld({projects,heading="The repository world",description="A living map of the projects. Proximity comes from shared ideas, language, project families, and purpose; stronger relationships pull repositories closer together.",kicker,showTours=true,year=2026}:RepositoryWorldProps) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const graph=useMemo(()=>buildGraph(projects),[projects]);
  const [active,setActive]=useState("all");
  const [selected,setSelected]=useState<RepositoryWorldProject|null>(null);
  const [infoOpen,setInfoOpen]=useState(false);
  const [month,setMonth]=useState(monthCount);
  const [playing,setPlaying]=useState(false);
  const [activeTour,setActiveTour]=useState<string|null>(null);
  const [tourStep,setTourStep]=useState(0);
  const [ridiculousTaps,setRidiculousTaps]=useState(0);
  const [easterEgg,setEasterEgg]=useState(false);
  const categories=useMemo(()=>[...new Map(projects.map(project=>[project.category,{id:project.category,title:project.categoryTitle}])).values()],[projects]);
  const currentTour=constellationTours.find(tour=>tour.id===activeTour);
  const tourNames=useMemo(()=>currentTour?.names.filter(name=>projects.some(project=>project.name===name))||[],[currentTour,projects]);
  const selectedIndex=selected?graph.nodes.findIndex(node=>node.name===selected.name):-1;
  const related=useMemo(()=>{
    if(selectedIndex<0)return [];
    return graph.edges.filter(edge=>edge.source===selectedIndex||edge.target===selectedIndex).sort((a,b)=>b.weight-a.weight).slice(0,4).map(edge=>graph.nodes[edge.source===selectedIndex?edge.target:edge.source]);
  },[graph,selectedIndex]);

  const chooseProject=(project:RepositoryWorldProject)=>{setActive("all");setMonth(monthCount);setSelected(project);setInfoOpen(false);};
  const startTour=(id:string)=>{const tour=constellationTours.find(item=>item.id===id);if(!tour)return;setActive("all");setMonth(monthCount);setPlaying(false);setInfoOpen(false);setActiveTour(id);setTourStep(0);const first=projects.find(project=>project.name===tour.names[0]);if(first)setSelected(first);};
  const stopTour=()=>{setActiveTour(null);setTourStep(0);};
  const selectCategory=(id:string)=>{
    setActive(id);stopTour();
    if(id!=="ridiculous"){setRidiculousTaps(0);return;}
    const next=ridiculousTaps+1;setRidiculousTaps(next);
    if(next>=3){setEasterEgg(true);setRidiculousTaps(0);setActive("all");}
  };

  useEffect(()=>{
    if(!playing)return;
    const timer=window.setInterval(()=>setMonth(current=>{if(current>=monthCount){setPlaying(false);return monthCount;}return current+1;}),1050);
    return()=>window.clearInterval(timer);
  },[playing]);

  useEffect(()=>{if(selected&&firstActiveMonth(selected)>month)setSelected(null);},[month,selected]);
  useEffect(()=>{if(!easterEgg)return;const timer=window.setTimeout(()=>setEasterEgg(false),9000);return()=>window.clearTimeout(timer);},[easterEgg]);
  useEffect(()=>{if(!currentTour)return;const project=projects.find(item=>item.name===tourNames[tourStep]);if(project)setSelected(project);},[currentTour,projects,tourNames,tourStep]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const context=canvas.getContext("2d"); if(!context) return;
    const nodes=graph.nodes.map(node=>({...node}));
    let width=0,height=0,frame=0,inView=true,drag=-1,hover=-1,moved=false;
    const pointer={x:-1000,y:-1000};
    const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize=()=>{
      const rect=canvas.getBoundingClientRect(); const ratio=Math.min(devicePixelRatio||1,2);
      width=Math.max(1,rect.width); height=Math.max(1,rect.height); canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio);
      context.setTransform(ratio,0,0,ratio,0,0);
    };
    const visible=(node:GraphNode)=>(active==="all"||node.category===active)&&firstActiveMonth(node)<=month;
    const inTour=(node:GraphNode)=>!tourNames.length||tourNames.includes(node.name);
    const cumulative=(node:GraphNode)=>node.months.slice(0,month).reduce((sum,value)=>sum+value,0);
    const nodeRadius=(node:GraphNode)=>node.featured?9:5.5+Math.min(4,node.stars===undefined?Math.sqrt(cumulative(node))*.28:Math.log10(node.stars+1)*1.1);
    const projectPoint=(node:GraphNode)=>({x:node.x/1000*width,y:node.y/650*height});
    const tick=()=>{
      if(!reduceMotion) {
        nodes.forEach((node,index)=>{
          if(index===drag) return;
          const [cx,cy]=centers[node.category]||[.5,.5];
          node.vx+=(cx*1000-node.x)*.00052; node.vy+=(cy*650-node.y)*.00052;
          if(easterEgg){node.vx+=Math.sin(performance.now()*.006+index)*.12;node.vy+=Math.cos(performance.now()*.007+index*1.7)*.12;}
        });
        for(let a=0;a<nodes.length;a++) for(let b=a+1;b<nodes.length;b++) {
          if(!visible(nodes[a])||!visible(nodes[b])) continue;
          const dx=nodes[b].x-nodes[a].x,dy=nodes[b].y-nodes[a].y,distance=Math.max(18,Math.hypot(dx,dy));
          if(distance<115){const force=(115-distance)*.0018;nodes[a].vx-=dx/distance*force;nodes[a].vy-=dy/distance*force;nodes[b].vx+=dx/distance*force;nodes[b].vy+=dy/distance*force;}
        }
        graph.edges.forEach(edge=>{
          const a=nodes[edge.source],b=nodes[edge.target]; if(!visible(a)||!visible(b)) return;
          const dx=b.x-a.x,dy=b.y-a.y,distance=Math.max(1,Math.hypot(dx,dy)); const desired=68+Math.max(0,42-edge.weight*6);
          const force=(distance-desired)*.00038*Math.min(edge.weight,5); a.vx+=dx/distance*force;a.vy+=dy/distance*force;b.vx-=dx/distance*force;b.vy-=dy/distance*force;
        });
        nodes.forEach((node,index)=>{if(index!==drag){node.vx*=.9;node.vy*=.9;node.x=Math.max(35,Math.min(965,node.x+node.vx));node.y=Math.max(35,Math.min(615,node.y+node.vy));}});
      }
    };
    const draw=()=>{
      context.clearRect(0,0,width,height);
      categories.forEach(category=>{
        if(active!=="all"&&active!==category.id) return;
        const group=nodes.filter(node=>node.category===category.id); if(!group.length)return;
        const points=group.map(projectPoint); const cx=points.reduce((sum,p)=>sum+p.x,0)/points.length,cy=points.reduce((sum,p)=>sum+p.y,0)/points.length;
        const rx=Math.max(85,...points.map(p=>Math.abs(p.x-cx)+48)),ry=Math.max(58,...points.map(p=>Math.abs(p.y-cy)+35));
        const gradient=context.createRadialGradient(cx,cy,0,cx,cy,Math.max(rx,ry)); gradient.addColorStop(0,`${neighborhoodColors[category.id]}18`);gradient.addColorStop(1,`${neighborhoodColors[category.id]}00`);
        context.fillStyle=gradient;context.beginPath();context.ellipse(cx,cy,rx,ry,-.08,0,Math.PI*2);context.fill();
        context.fillStyle="rgba(177,226,244,.3)";context.font="600 10px ui-monospace, monospace";context.letterSpacing="1px";context.fillText(category.title.toUpperCase(),cx-rx+18,cy-ry+22);
      });
      graph.edges.forEach(edge=>{
        const a=nodes[edge.source],b=nodes[edge.target]; if(!visible(a)||!visible(b))return; const p1=projectPoint(a),p2=projectPoint(b);
        const incident=selectedIndex===edge.source||selectedIndex===edge.target;
        context.strokeStyle=incident?"rgba(151,231,255,.72)":tourNames.length&&(!inTour(a)||!inTour(b))?"rgba(100,150,180,.025)":a.community===b.community?"rgba(104,211,255,.18)":"rgba(111,157,188,.09)";context.lineWidth=incident?1.8:Math.min(1.6,.35+edge.weight*.15);context.beginPath();context.moveTo(p1.x,p1.y);context.lineTo(p2.x,p2.y);context.stroke();
      });
      if(tourNames.length){
        const route=tourNames.map(name=>nodes.find(node=>node.name===name)).filter(Boolean) as GraphNode[];
        context.save();context.strokeStyle="rgba(116,224,255,.72)";context.lineWidth=2;context.setLineDash([4,8]);context.shadowColor="#63d8ff";context.shadowBlur=12;context.beginPath();route.forEach((node,index)=>{const p=projectPoint(node);index?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y);});context.stroke();context.restore();
      }
      nodes.forEach((node,index)=>{
        if(!visible(node))return; const point=projectPoint(node); const color=neighborhoodColors[node.category]||"#69d8ff"; const highlighted=index===hover||index===drag;
        const radius=nodeRadius(node); const activeNow=node.months[month-1]>0;
        const chosen=index===selectedIndex;context.save();context.globalAlpha=inTour(node)?1:.14;context.shadowColor=color;context.shadowBlur=highlighted||chosen?25:node.featured?13:7;context.fillStyle=color;context.beginPath();context.arc(point.x,point.y,radius+(highlighted||chosen?3:0),0,Math.PI*2);context.fill();
        if(chosen){context.strokeStyle="rgba(226,249,255,.95)";context.lineWidth=1.5;context.beginPath();context.arc(point.x,point.y,radius+10+Math.sin(performance.now()*.005)*2,0,Math.PI*2);context.stroke();}
        if(activeNow){const pulse=radius+7+(Math.sin(performance.now()*.004+index)*.5+.5)*7;context.strokeStyle=`${color}${highlighted?"aa":"58"}`;context.lineWidth=1;context.beginPath();context.arc(point.x,point.y,pulse,0,Math.PI*2);context.stroke();}
        if(node.featured){context.strokeStyle="rgba(255,255,255,.82)";context.lineWidth=1.2;context.beginPath();context.arc(point.x,point.y,radius+5,0,Math.PI*2);context.stroke();}
        if(highlighted||node.featured){context.fillStyle="rgba(225,247,255,.95)";context.font=`${highlighted?12:10}px ui-monospace, monospace`;context.textAlign="center";context.fillText(node.title,point.x,point.y-radius-10);}
        if(easterEgg){const eye=radius*.48+2;context.shadowBlur=0;context.fillStyle="#f4fbff";[-1,1].forEach(side=>{context.beginPath();context.arc(point.x+side*eye*.72,point.y-eye*.35,eye,0,Math.PI*2);context.fill();context.fillStyle="#071421";context.beginPath();context.arc(point.x+side*eye*.72+Math.sin(performance.now()*.003+index)*eye*.25,point.y-eye*.25,eye*.38,0,Math.PI*2);context.fill();context.fillStyle="#f4fbff";});}
        context.restore();
      });
    };
    const animate=()=>{tick();draw();frame=inView&&!reduceMotion?requestAnimationFrame(animate):0;};
    const closest=(x:number,y:number)=>{let result=-1,best=26;nodes.forEach((node,index)=>{if(!visible(node))return;const p=projectPoint(node),distance=Math.hypot(p.x-x,p.y-y);if(distance<best&&distance<nodeRadius(node)+13){best=distance;result=index;}});return result;};
    const position=(event:PointerEvent)=>{const rect=canvas.getBoundingClientRect();pointer.x=event.clientX-rect.left;pointer.y=event.clientY-rect.top;};
    const move=(event:PointerEvent)=>{position(event);if(drag>=0){moved=true;nodes[drag].x=pointer.x/width*1000;nodes[drag].y=pointer.y/height*650;nodes[drag].vx=0;nodes[drag].vy=0;}hover=closest(pointer.x,pointer.y);canvas.style.cursor=hover>=0?drag>=0?"grabbing":"grab":"crosshair";if(reduceMotion)draw();};
    const down=(event:PointerEvent)=>{position(event);drag=closest(pointer.x,pointer.y);moved=false;if(drag>=0){canvas.setPointerCapture(event.pointerId);canvas.style.cursor="grabbing";}};
    const up=(event:PointerEvent)=>{if(drag>=0&&!moved)setSelected(nodes[drag]);drag=-1;if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);};
    const observer=new ResizeObserver(()=>{resize();draw();}); const visibility=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView&&!frame)animate();else if(!inView&&frame){cancelAnimationFrame(frame);frame=0;}},{rootMargin:"100px"});
    observer.observe(canvas);visibility.observe(canvas);resize();animate();canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerdown",down);canvas.addEventListener("pointerup",up);canvas.addEventListener("pointerleave",()=>{hover=-1;});
    return()=>{cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();canvas.removeEventListener("pointermove",move);canvas.removeEventListener("pointerdown",down);canvas.removeEventListener("pointerup",up);};
  },[active,categories,easterEgg,graph,month,selectedIndex,tourNames]);

  return <section className="repositoryWorld section" id="world">
    <div className="sectionHeading worldHeading"><div><p className="kicker">{kicker||`${projects.length} REPOSITORIES · ${categories.length} NEIGHBORHOODS`}</p><h2>{heading}</h2></div><p>{description}</p></div>
    <div className="worldControls" aria-label="Repository neighborhoods"><button className={active==="all"?"active":""} onClick={()=>{setActive("all");stopTour();}}>Whole world</button>{categories.map(category=><button className={active===category.id?"active":""} onClick={()=>selectCategory(category.id)} key={category.id}><i style={{background:neighborhoodColors[category.id]}}/>{category.title}</button>)}</div>
    <div className="worldTimeline">
      <button type="button" className="timelinePlay" aria-label={playing?"Pause repository timeline":"Play repository timeline"} onClick={()=>{if(playing){setPlaying(false);return;}if(month===7)setMonth(1);setPlaying(true);}}>{playing?"Ⅱ":"▶"}</button>
      <label><span>{year} / <b>{monthNames[month-1]}</b></span><input type="range" min="1" max={monthCount} step="1" value={month} aria-label={`Repository world through ${monthNames[month-1]} ${year}`} onChange={event=>{setPlaying(false);setMonth(Number(event.target.value));}}/><i style={{width:`${(month-1)/(monthCount-1)*100}%`}}/></label>
      <div className="timelineMonths" aria-hidden="true">{monthNames.map((name,index)=><span className={index+1<=month?"reached":""} key={name}>{name}</span>)}</div>
      <strong>{projects.filter(project=>firstActiveMonth(project)<=month).length}<small> repositories visible</small></strong>
    </div>
    {showTours&&<div className="constellationTours"><div><span>GUIDED CONSTELLATION TOURS</span><p>Follow a story through the repository world.</p></div>{constellationTours.map(tour=><button type="button" className={activeTour===tour.id?"active":""} onClick={()=>startTour(tour.id)} key={tour.id}><i>{String(tour.names.length).padStart(2,"0")}</i><span>{tour.title}</span></button>)}</div>}
    <div className="worldStage">
      <canvas ref={canvasRef} role="img" aria-label={`Interactive network graph of ${projects.length} repositories grouped into ${categories.length} semantic neighborhoods. Drag nodes to rearrange the map and select a repository for details.`}/>
      <button className="worldInfoButton" type="button" aria-label={infoOpen?"Close community detection information":"How are repository communities detected?"} aria-expanded={infoOpen} aria-controls="world-method" onClick={()=>setInfoOpen(open=>!open)}>{infoOpen?"×":"i"}</button>
      <aside className={`worldMethod ${infoOpen?"visible":""}`} id="world-method" aria-hidden={!infoOpen}>
        <p>HOW THIS WORLD ORGANIZES ITSELF</p>
        <h3>Community detection</h3>
        <ol>
          <li><b>Connect.</b><span>Names and descriptions become semantic signals. Shared ideas, technology, and project-family names create weighted links.</span></li>
          <li><b>Detect.</b><span>Repositories repeatedly adopt the strongest neighboring community through weighted label propagation. The seven editorial categories provide only a light prior.</span></li>
          <li><b>Settle.</b><span>Related projects attract, all projects repel, and neighborhood gravity keeps the world readable as the graph moves.</span></li>
        </ol>
        <div><span><i className="methodNode"/>Node size = {projects.some(project=>project.stars!==undefined)?"GitHub stars":`${year} commits`}</span><span><i className="methodRing"/>Ring = featured project</span><span><i className="methodLink"/>Line = inferred relationship</span></div>
      </aside>
      {currentTour&&tourNames.length>0&&<div className="tourHud"><p>GUIDED CONSTELLATION · {String(tourStep+1).padStart(2,"0")} / {String(tourNames.length).padStart(2,"0")}</p><h3>{currentTour.title}</h3><span>{currentTour.description}</span><strong>{selected?.title}</strong><div><button type="button" disabled={tourStep===0} onClick={()=>setTourStep(step=>Math.max(0,step-1))}>← Back</button><button type="button" onClick={()=>{if(tourStep>=tourNames.length-1)stopTour();else setTourStep(step=>step+1);}}>{tourStep>=tourNames.length-1?"Finish":"Next →"}</button><button type="button" onClick={stopTour}>Exit</button></div></div>}
      <aside className={`worldDrawer ${selected?"visible":""}`} aria-hidden={!selected}>
        {selected&&<><button className="drawerClose" type="button" aria-label="Close repository details" onClick={()=>{setSelected(null);stopTour();}}>×</button><div className="drawerVisual">{selected.thumbnail?<img src={selected.thumbnail} alt=""/>:<ProjectVisual name={selected.name} category={selected.category} compact/>}</div><p className="drawerKicker"><i style={{background:neighborhoodColors[selected.category]}}/>{selected.categoryTitle} · {selected.language}</p><h3>{selected.title}</h3><p className="drawerDescription">{selected.description}</p>{selected.stars!==undefined?<div className="drawerActivity orgSignal"><div><span>PUBLIC SIGNAL</span><strong>{selected.stars.toLocaleString()} stars</strong></div><p>Last pushed {selected.lastTouched||"this year"}</p>{selected.topics&&selected.topics.length>0&&<div className="drawerTopics">{selected.topics.slice(0,6).map(topic=><span key={topic}>{topic}</span>)}</div>}</div>:<div className="drawerActivity"><div><span>{year} ACTIVITY</span><strong>{selected.months.slice(0,month).reduce((sum,value)=>sum+value,0)} commits</strong></div><div className="drawerBars">{selected.months.map((value,index)=><i key={monthNames[index]} title={`${monthNames[index]}: ${value} commits`} className={index<month?"visible":""} style={{height:`${Math.max(3,value/Math.max(...selected.months,1)*100)}%`}}><span>{monthNames[index]}</span></i>)}</div></div>}{related.length>0&&<div className="drawerRelated"><span>STRONGEST RELATIONSHIPS</span>{related.map(project=><button type="button" key={project.name} onClick={()=>chooseProject(project)}><i style={{background:neighborhoodColors[project.category]}}/>{project.title}<b>→</b></button>)}</div>}<div className="drawerLinks">{selected.liveUrl&&<a href={selected.liveUrl} target="_blank" rel="noreferrer">Open project ↗</a>}{selected.publicationUrl&&<a href={selected.publicationUrl} target="_blank" rel="noreferrer">Read paper ↗</a>}<a href={selected.url} target="_blank" rel="noreferrer">View code ↗</a></div></>}
      </aside>
      {easterEgg&&<div className="worldEasterEgg" aria-live="polite"><strong>THE DEPARTMENT HAS SEIZED THE GRAPH</strong><span>compliance is optional</span></div>}
      <div className="worldReadout"><span>WORLD STATE · {monthNames[month-1].toUpperCase()} {year}</span><span>WEIGHTED LABEL PROPAGATION</span><span>DRAG · SELECT · EXPLORE</span></div>
    </div>
    <div className="worldSelection" aria-live="polite"><span>{selected?`${selected.title} selected.`:showTours?"Select a node to open its field guide, or take a constellation tour.":"Select a node to open its repository field guide."}</span></div>
  </section>;
}
