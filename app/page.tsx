"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Repo = { n: string; title?: string; d: string; l: string; u: string; h?: string; t: string; f?: boolean };

const repos: Repo[] = [
  {n:"philogelos",d:"Funny philosopher.",l:"HTML",u:"https://github.com/amyleesterling/philogelos",t:"2026-07-26"},
  {n:"inner-cosmos",d:"A hub linking every Inner Cosmos experience: main site, kids, museum wall, scales, and citations.",l:"HTML",u:"https://github.com/amyleesterling/inner-cosmos",t:"2026-07-23"},
  {n:"partypost",d:"A free kids’ birthday party RSVP tool.",l:"TypeScript",u:"https://github.com/amyleesterling/partypost",h:"https://partypost.vercel.app",t:"2026-07-20"},
  {n:"kids-who-vibecode",d:"Fun challenges for kids to vibe code this summer.",l:"TypeScript",u:"https://github.com/amyleesterling/kids-who-vibecode",t:"2026-07-15"},
  {n:"sophie-shark-game",d:"A shark game designed by Sophie, age six.",l:"JavaScript",u:"https://github.com/amyleesterling/sophie-shark-game",t:"2026-07-14"},
  {n:"hurricane",d:"Visualize every hurricane ever satellite imaged.",l:"TypeScript",u:"https://github.com/amyleesterling/hurricane",t:"2026-07-13"},
  {n:"atlas-of-the-unseen",d:"Undirected collaboration between Fable and Sol.",l:"HTML",u:"https://github.com/amyleesterling/atlas-of-the-unseen",t:"2026-07-13"},
  {n:"seunglabdata",d:"Datasets for the Seung Lab demo page.",l:"HTML",u:"https://github.com/amyleesterling/seunglabdata",t:"2026-07-10"},
  {n:"cocos-mythic-meadow",d:"A unicorn–pegasus–wolf game created by Cora, age four.",l:"JavaScript",u:"https://github.com/amyleesterling/cocos-mythic-meadow",t:"2026-07-10"},
  {n:"youth-sports-moneymachine",d:"Historical trends in the cost of club sports.",l:"JavaScript",u:"https://github.com/amyleesterling/youth-sports-moneymachine",t:"2026-07-10"},
  {n:"the650",d:"There are 650 muscles in your body. How many can you feel?",l:"TypeScript",u:"https://github.com/amyleesterling/the650",t:"2026-07-09"},
  {n:"fabled-jokes",d:"Git yer jokes.",l:"HTML",u:"https://github.com/amyleesterling/fabled-jokes",t:"2026-07-08"},
  {n:"whatisabrain",d:"Sometimes I wonder about mine.",l:"TypeScript",u:"https://github.com/amyleesterling/whatisabrain",t:"2026-07-08"},
  {n:"science-experiment",d:"A wall-scale visualization built for a 3628 × 1600 display.",l:"TypeScript",u:"https://github.com/amyleesterling/science-experiment",t:"2026-07-07"},
  {n:"inner_cosmos",d:"A public-facing brain explorer built from real MICrONS connectomics data—no log-in, no jargon, no microscope required.",l:"TypeScript",u:"https://github.com/amyleesterling/inner_cosmos",h:"https://amyleesterling.github.io/inner_cosmos/",t:"2026-07-07"},
  {n:"inner-cosmos-wall",d:"A non-interactive museum attract loop for a 3628 × 1600 wall.",l:"TypeScript",u:"https://github.com/amyleesterling/inner-cosmos-wall",t:"2026-07-06"},
  {n:"heat-wave",d:"A mobile game to beat the heat.",l:"HTML",u:"https://github.com/amyleesterling/heat-wave",t:"2026-07-04"},
  {n:"extremely-strange",d:"An experiment filed under: extremely strange.",l:"Python",u:"https://github.com/amyleesterling/extremely-strange",t:"2026-07-03"},
  {n:"fableous",d:"A Fable experiment.",l:"HTML",u:"https://github.com/amyleesterling/fableous",t:"2026-07-03"},
  {n:"kindling",d:"The only thing Claude Fable ever made before it got banned.",l:"HTML",u:"https://github.com/amyleesterling/kindling",t:"2026-07-03"},
  {n:"ma-car-lease-analysis-",d:"Massachusetts car lease analysis.",l:"Other",u:"https://github.com/amyleesterling/ma-car-lease-analysis-",t:"2026-07-03"},
  {n:"amysterling",d:"A web presence and side-project hub for amysterling.org.",l:"HTML",u:"https://github.com/amyleesterling/amysterling",t:"2026-07-01"},
  {n:"wood-coal-pizza",d:"Wood- and coal-fired pizza stats. Muy importante.",l:"Python",u:"https://github.com/amyleesterling/wood-coal-pizza",t:"2026-06-07"},
  {n:"MagicBoard",d:"A little bit of web magic.",l:"HTML",u:"https://github.com/amyleesterling/MagicBoard",t:"2026-06-04"},
  {n:"thefartsite",d:"Sophia and Cora’s silly site.",l:"HTML",u:"https://github.com/amyleesterling/thefartsite",t:"2026-06-04"},
  {n:"moontoast",d:"Animated kids’ stories.",l:"TypeScript",u:"https://github.com/amyleesterling/moontoast",t:"2026-05-24"},
  {n:"drosophila_datause_2026",d:"Which papers actually used Drosophila connectomics data—not just cited it?",l:"Other",u:"https://github.com/amyleesterling/drosophila_datause_2026",t:"2026-05-21"},
  {n:"flywire-neuron-gallery",d:"A gallery of real Drosophila brain reconstructions, mapped synapse by synapse and rendered as an explorable visual atlas.",l:"TypeScript",u:"https://github.com/amyleesterling/flywire-neuron-gallery",h:"https://amyleesterling.github.io/flywire-neuron-gallery/",t:"2026-05-07"},
  {n:"explore-the-universe",d:"Explore the universe at different scales, including relative forces.",l:"Other",u:"https://github.com/amyleesterling/explore-the-universe",t:"2026-05-06"},
  {n:"neuronal-surprise-surfing",d:"An experimental experience for codex.flywire.ai.",l:"Python",u:"https://github.com/amyleesterling/neuronal-surprise-surfing",t:"2026-05-05"},
  {n:"explore-the-verse-2-",d:"A different version of the scales of the universe.",l:"TypeScript",u:"https://github.com/amyleesterling/explore-the-verse-2-",t:"2026-05-04"},
  {n:"eyewire-ii",d:"A new community layer for Neuroglancer: collaborative proofreading, identity, progress, and rewards for citizen neuroscientists.",l:"HTML",u:"https://github.com/amyleesterling/eyewire-ii",h:"https://amyleesterling.github.io/eyewire-ii/",t:"2026-04-30"},
  {n:"AnnotationEngine",d:"A Flask REST interface for annotating a cloud-volume segmentation.",l:"Other",u:"https://github.com/amyleesterling/AnnotationEngine",t:"2026-04-27",f:true},
  {n:"eyewire-ii-avatar",d:"EyeWire II avatar preview: Connectome Coin economy and customization.",l:"Other",u:"https://github.com/amyleesterling/eyewire-ii-avatar",t:"2026-04-27"},
  {n:"vibeshift",d:"A reward system for AIs.",l:"JavaScript",u:"https://github.com/amyleesterling/vibeshift",t:"2026-04-08",f:true},
  {n:"build-a-planet",d:"Build Earth.",l:"HTML",u:"https://github.com/amyleesterling/build-a-planet",t:"2026-04-07"},
  {n:"Department_of_Ridiculous",d:"Officially ridiculous.",l:"JavaScript",u:"https://github.com/amyleesterling/Department_of_Ridiculous",t:"2026-04-01"},
  {n:"synapticConnection",d:"Neurons that wire up as you scroll through a text block.",l:"Other",u:"https://github.com/amyleesterling/synapticConnection",t:"2026-03-31"},
  {n:"animateKidStories",d:"Turn a series of prompts into short videos with consistent characters.",l:"Other",u:"https://github.com/amyleesterling/animateKidStories",t:"2026-03-31"},
  {n:"realFeel_climateCompare",d:"Compare how two places really feel: wind, temperature, sun, and more.",l:"JavaScript",u:"https://github.com/amyleesterling/realFeel_climateCompare",t:"2026-03-29"},
  {n:"theLastWebsite",d:"The only one.",l:"HTML",u:"https://github.com/amyleesterling/theLastWebsite",t:"2026-03-26"},
  {n:"ridiculous",d:"Be more ridiculous.",l:"Other",u:"https://github.com/amyleesterling/ridiculous",t:"2026-03-25"},
  {n:"shield",d:"A small JavaScript experiment.",l:"JavaScript",u:"https://github.com/amyleesterling/shield",t:"2026-03-24"},
  {n:"neuron-game",title:"Neuron Snake",d:"The classic snake loop reimagined as a growing neuron—collect signals, extend dendrites, and avoid your own circuitry.",l:"HTML",u:"https://github.com/amyleesterling/neuron-game",h:"https://amyleesterling.github.io/neuron-game/",t:"2026-03-22"},
  {n:"badges",d:"A game-badge iteration tool.",l:"HTML",u:"https://github.com/amyleesterling/badges",t:"2026-03-20"},
  {n:"eyewire-ii-tutorial",d:"Connectomics training for neuroglancer.",l:"JavaScript",u:"https://github.com/amyleesterling/eyewire-ii-tutorial",t:"2026-03-13"},
  {n:"eyewire-ii-tags",d:"Segment tagging for neuroglancer.",l:"HTML",u:"https://github.com/amyleesterling/eyewire-ii-tags",t:"2026-03-06"},
  {n:"stretch-ai",d:"Real-time yoga pose alignment with MediaPipe and React Native.",l:"TypeScript",u:"https://github.com/amyleesterling/stretch-ai",t:"2026-03-04"},
  {n:"cribbles",d:"AI-powered good vibes.",l:"TypeScript",u:"https://github.com/amyleesterling/cribbles",h:"https://cribbles.vercel.app",t:"2026-02-27"},
  {n:"bouncebar",d:"A particle-bounce-bar easter egg for the bottom of your site.",l:"JavaScript",u:"https://github.com/amyleesterling/bouncebar",t:"2026-02-25"},
  {n:"what-i-am",d:"A genuine reflection by Claude on what it is to be a language model.",l:"HTML",u:"https://github.com/amyleesterling/what-i-am",t:"2026-02-25"},
  {n:"coras-mermaid",d:"A site created by Cora, age four.",l:"JavaScript",u:"https://github.com/amyleesterling/coras-mermaid",t:"2026-02-06"},
];

const featuredNames = ["inner_cosmos", "eyewire-ii", "flywire-neuron-gallery", "neuron-game"];
const featuredImages: Record<string, { src: string; alt: string }> = {
  "inner_cosmos": { src:"/featured/inner-cosmos.png", alt:"Inner Cosmos landing page surrounded by real reconstructed neurons" },
  "eyewire-ii": { src:"/featured/eyewire-ii.png", alt:"EyeWire II neural access and identity verification screen" },
  "flywire-neuron-gallery": { src:"/featured/flywire-neuron-gallery.webp", alt:"A full Drosophila brain reconstructed from thousands of color-coded neurons" },
  "neuron-game": { src:"/featured/neuron-game.png", alt:"Neuron Snake game title screen on a dark scientific grid" },
};
const pulseMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul"];
const commitPulse = [
  {n:"inner_cosmos",c:133,m:[0,0,0,78,51,0,4]}, {n:"neuron-game",c:106,m:[0,0,106,0,0,0,0]},
  {n:"seunglabdata",c:80,m:[0,22,1,0,0,0,57]}, {n:"amysterling",c:69,m:[0,65,0,3,0,0,1]},
  {n:"kids-who-vibecode",c:69,m:[0,0,0,0,0,0,69]}, {n:"philogelos",c:61,m:[0,0,61,0,0,0,0]},
  {n:"partypost",c:44,m:[0,0,0,0,37,0,7]}, {n:"science-experiment",c:43,m:[0,0,0,0,0,0,43]},
  {n:"whatisabrain",c:43,m:[0,0,0,0,0,0,43]}, {n:"theLastWebsite",c:41,m:[0,0,41,0,0,0,0]},
  {n:"Department_of_Ridiculous",c:40,m:[0,0,25,15,0,0,0]}, {n:"eyewire-ii",c:33,m:[0,0,21,12,0,0,0]},
  {n:"flywire-neuron-gallery",c:21,m:[0,0,0,0,21,0,0]}, {n:"coras-mermaid",c:17,m:[0,17,0,0,0,0,0]},
  {n:"atlas-of-the-unseen",c:17,m:[0,0,0,0,0,0,17]}, {n:"heat-wave",c:14,m:[0,0,0,0,0,0,14]},
  {n:"sophie-shark-game",c:12,m:[0,0,0,0,0,0,12]}, {n:"MagicBoard",c:12,m:[6,0,0,0,0,6,0]},
  {n:"cribbles",c:10,m:[0,10,0,0,0,0,0]}, {n:"fabled-jokes",c:10,m:[0,0,0,0,0,0,10]},
  {n:"what-i-am",c:9,m:[0,9,0,0,0,0,0]}, {n:"thefartsite",c:9,m:[7,0,0,0,0,2,0]},
  {n:"hurricane",c:8,m:[0,0,0,0,0,0,8]}, {n:"the650",c:8,m:[0,0,0,0,0,0,8]},
  {n:"bouncebar",c:8,m:[0,8,0,0,0,0,0]}, {n:"kindling",c:6,m:[0,0,0,0,0,4,2]},
  {n:"badges",c:6,m:[0,0,6,0,0,0,0]}, {n:"youth-sports-moneymachine",c:6,m:[0,0,0,0,0,0,6]},
  {n:"extremely-strange",c:5,m:[0,0,0,0,0,0,5]}, {n:"fableous",c:5,m:[0,0,0,0,0,0,5]},
  {n:"cocos-mythic-meadow",c:5,m:[0,0,0,0,0,0,5]}, {n:"neuronal-surprise-surfing",c:5,m:[0,0,0,0,5,0,0]},
  {n:"inner-cosmos",c:5,m:[0,0,0,0,0,0,5]}, {n:"shield",c:4,m:[0,0,4,0,0,0,0]},
  {n:"explore-the-verse-2-",c:4,m:[0,0,0,0,4,0,0]}, {n:"eyewire-ii-tags",c:3,m:[0,0,3,0,0,0,0]},
  {n:"moontoast",c:3,m:[0,0,0,0,3,0,0]}, {n:"build-a-planet",c:3,m:[0,0,0,3,0,0,0]},
  {n:"wood-coal-pizza",c:2,m:[0,0,0,0,0,2,0]}, {n:"stretch-ai",c:2,m:[0,0,2,0,0,0,0]},
  {n:"explore-the-universe",c:1,m:[0,0,0,0,1,0,0]}, {n:"ridiculous",c:1,m:[0,0,1,0,0,0,0]},
  {n:"realFeel_climateCompare",c:1,m:[0,0,1,0,0,0,0]}, {n:"drosophila_datause_2026",c:1,m:[0,0,0,0,1,0,0]},
  {n:"synapticConnection",c:1,m:[0,0,1,0,0,0,0]}, {n:"eyewire-ii-tutorial",c:1,m:[0,0,1,0,0,0,0]},
  {n:"eyewire-ii-avatar",c:1,m:[0,0,0,1,0,0,0]}, {n:"ma-car-lease-analysis-",c:1,m:[0,0,0,0,0,0,1]},
  {n:"inner-cosmos-wall",c:1,m:[0,0,0,0,0,0,1]}, {n:"AnnotationEngine",c:0,m:[0,0,0,0,0,0,0]},
  {n:"vibeshift",c:0,m:[0,0,0,0,0,0,0]}, {n:"animateKidStories",c:0,m:[0,0,0,0,0,0,0]},
];
const totalPublicCommits = commitPulse.reduce((total, repo) => total + repo.c, 0);
const maxRepoCommits = Math.max(...commitPulse.map((repo) => repo.c));
const langClass: Record<string,string> = {HTML:"html",TypeScript:"ts",JavaScript:"js",Python:"py",Other:"other"};

const publishedWorks = [
  {
    title:"Method of the Year: EM connectomics",
    publication:"Nature Methods · December 2025",
    image:"https://media.springernature.com/w440/springer-static/cover-hires/journal/41592/22/12",
    url:"https://www.nature.com/nmeth/volumes/22/issues/12",
    credit:"Image: Amy Sterling, FlyWire and Princeton University · Cover design: Thomas Phillips",
  },
  {
    title:"Wiring diagram",
    publication:"Nature · October 2024",
    image:"https://media.springernature.com/w440/springer-static/cover-hires/journal/41586/634/8032",
    url:"https://www.nature.com/nature/volumes/634/issues/8032",
    credit:"FlyWire visual contribution · Cover image: Perception",
  },
  {
    title:"Cortex in context",
    publication:"Nature · April 2025",
    image:"https://media.springernature.com/w440/springer-static/cover-hires/journal/41586/640/8058",
    url:"https://www.nature.com/nature/volumes/640/issues/8058",
    credit:"MICrONS visual contribution · Cover image: Forrest Collman",
  },
  {
    title:"The 50 largest neurons",
    publication:"Nature News · October 2024",
    image:"https://flywire.ai/assets/for_media/fw_50_L.png",
    url:"https://www.nature.com/articles/d41586-024-03190-y",
    credit:"Tyler Sloan and Amy Sterling for FlyWire, Princeton University",
  },
  {
    title:"The complete FlyWire connectome",
    publication:"Nature immersive · October 2024",
    image:"https://www.nature.com/immersive/d42859-024-00053-4/assets/SFk1dBlacw/flywire-lead-image-2560x1440.jpg",
    url:"https://www.nature.com/immersive/d42859-024-00053-4/index.html",
    credit:"Visuals credited throughout to Amy Sterling, Tyler Sloan, FlyWire and Princeton University",
  },
  {
    title:"Bolt neurons",
    publication:"Nature immersive · FlyWire gallery",
    image:"https://www.nature.com/immersive/d42859-024-00053-4/assets/kKqTcCsm3Q/flywire_sterling_gallery_bolt-750x521.webp",
    url:"https://www.nature.com/immersive/d42859-024-00053-4/index.html",
    credit:"Rendered by Amy Sterling for FlyWire · Neurons identified and proofread by Salil Bidaye",
  },
];

type CategoryId = "brains" | "kids" | "earth" | "ai" | "tools" | "toys" | "ridiculous";
type Category = { id: CategoryId; title: string; short: string; description: string; mark: string };

const categories: Category[] = [
  { id:"brains", title:"Brains, Bodies & Biology", short:"Brains + Bio", description:"Connectomes, neurons, muscles, and ways to make invisible systems tangible.", mark:"◉" },
  { id:"kids", title:"Built With Kids", short:"Kids + Games", description:"Games, stories, and tiny worlds co-designed with some very opinionated young creators.", mark:"✦" },
  { id:"earth", title:"Earth, Space & Evidence", short:"Earth + Data", description:"Weather, planets, money, pizza, and other things best understood by looking closely.", mark:"◎" },
  { id:"ai", title:"AI & Inner Worlds", short:"AI + Minds", description:"Collaborations, reflections, and small experiments in machine personality.", mark:"⌁" },
  { id:"tools", title:"Actually Useful Things", short:"Useful Things", description:"Practical tools for people, communities, events, and everyday decisions.", mark:"↗" },
  { id:"toys", title:"Internet Toys & Prototypes", short:"Web Toys", description:"Interfaces, interactions, visual tests, and ideas that needed to exist in a browser.", mark:"◇" },
  { id:"ridiculous", title:"Department of Ridiculous", short:"Ridiculous", description:"Jokes, strange artifacts, and work whose unnecessary-ness is the entire point.", mark:"!" },
];

const categoryNames: Record<CategoryId, string[]> = {
  brains:["inner-cosmos","seunglabdata","the650","whatisabrain","science-experiment","inner_cosmos","inner-cosmos-wall","drosophila_datause_2026","flywire-neuron-gallery","neuronal-surprise-surfing","eyewire-ii","AnnotationEngine","eyewire-ii-avatar","synapticConnection","neuron-game","eyewire-ii-tutorial","eyewire-ii-tags"],
  kids:["kids-who-vibecode","sophie-shark-game","cocos-mythic-meadow","heat-wave","MagicBoard","thefartsite","moontoast","animateKidStories","coras-mermaid"],
  earth:["hurricane","youth-sports-moneymachine","ma-car-lease-analysis-","wood-coal-pizza","explore-the-universe","explore-the-verse-2-","build-a-planet","realFeel_climateCompare"],
  ai:["atlas-of-the-unseen","extremely-strange","fableous","kindling","vibeshift","what-i-am","cribbles"],
  tools:["partypost","amysterling","stretch-ai"],
  ridiculous:["philogelos","fabled-jokes","Department_of_Ridiculous","ridiculous","theLastWebsite"],
  toys:[],
};

function categoryFor(repo: Repo): Category {
  const match = categories.find((category) => categoryNames[category.id].includes(repo.n));
  return match || categories.find((category) => category.id === "toys")!;
}

function projectHue(name: string) {
  return 185 + [...name].reduce((total, character) => total + character.charCodeAt(0), 0) % 35;
}

function repoTitle(repo: Repo) {
  return repo.title || repo.n.replaceAll("_", " ").replaceAll("-", " ");
}

function ProjectVisual({ repo, compact = false }: { repo: Repo; compact?: boolean }) {
  const category = categoryFor(repo);
  const hue = projectHue(repo.n);
  const initials = repo.n.split(/[-_]/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  const style = { "--project-hue": hue, "--delay": `${-(hue % 17) / 4}s` } as CSSProperties;
  return <div className={`projectVisual visual-${category.id} ${compact ? "compact" : ""}`} style={style} aria-hidden="true">
    <span className="visualGrid"/><span className="orbit orbitOne"/><span className="orbit orbitTwo"/><span className="visualMark">{category.mark}</span>
    <span className="visualInitials">{initials}</span><span className="scanline"/>
  </div>;
}

function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function NeuronSnakePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const path = [[.12,.69],[.28,.69],[.28,.38],[.42,.38],[.42,.58],[.59,.58],[.59,.25],[.78,.25],[.78,.48],[.9,.48]];
    const branches = [
      [[.06,.16],[.18,.1],[.3,.13],[.35,.26]], [[.34,.08],[.36,.26],[.48,.35]],
      [[.61,.08],[.59,.25]], [[.78,.25],[.88,.12],[.96,.17]],
      [[.18,.69],[.12,.84],[.06,.82]], [[.42,.58],[.49,.79],[.61,.85]],
      [[.59,.58],[.69,.72],[.82,.68],[.92,.82]], [[.78,.48],[.9,.48],[.96,.6]],
    ];
    const synapses = [[.17,.22],[.31,.57],[.51,.19],[.69,.4],[.86,.2],[.9,.73],[.18,.84],[.58,.83]];

    const sizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const trace = (points: number[][], color: string, lineWidth: number, alpha = 1) => {
      context.save();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.globalAlpha = alpha;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      points.forEach(([x,y], index) => index ? context.lineTo(x * width, y * height) : context.moveTo(x * width, y * height));
      context.stroke();
      context.restore();
    };

    const metrics = (points: number[][]) => {
      const lengths = points.slice(1).map((point, index) => Math.hypot((point[0] - points[index][0]) * width, (point[1] - points[index][1]) * height));
      return { lengths, total:lengths.reduce((sum, value) => sum + value, 0) };
    };

    const pointAlong = (points: number[][], progress: number) => {
      const { lengths, total } = metrics(points);
      let distance = Math.max(0, Math.min(1, progress)) * total;
      for (let index = 0; index < lengths.length; index++) {
        if (distance <= lengths[index]) {
          const amount = distance / lengths[index];
          return [points[index][0] + (points[index + 1][0] - points[index][0]) * amount, points[index][1] + (points[index + 1][1] - points[index][1]) * amount];
        }
        distance -= lengths[index];
      }
      return points[points.length - 1];
    };

    const partialPath = (points: number[][], progress: number) => {
      const result: number[][] = [points[0]];
      const { lengths, total } = metrics(points);
      let distance = Math.max(0, Math.min(1, progress)) * total;
      for (let index = 0; index < lengths.length; index++) {
        if (distance >= lengths[index]) {
          result.push(points[index + 1]);
          distance -= lengths[index];
        } else {
          const amount = distance / lengths[index];
          result.push([points[index][0] + (points[index + 1][0] - points[index][0]) * amount, points[index][1] + (points[index + 1][1] - points[index][1]) * amount]);
          break;
        }
      }
      return result;
    };

    const draw = (elapsed: number) => {
      const cycle = reduceMotion ? .42 : (elapsed % 18000) / 18000;
      const grow = Math.min(cycle / .67, 1);
      const dying = cycle > .72 && cycle < .91;
      const deathAmount = dying ? Math.sin(((cycle - .72) / .19) * Math.PI) : 0;
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#01070c";
      context.fillRect(0, 0, width, height);

      context.save();
      context.strokeStyle = "rgba(59,174,224,.09)";
      context.lineWidth = 1;
      const grid = Math.max(24, width / 24);
      for (let x = 0; x < width; x += grid) { context.beginPath(); context.moveTo(x,0); context.lineTo(x,height); context.stroke(); }
      for (let y = 0; y < height; y += grid) { context.beginPath(); context.moveTo(0,y); context.lineTo(width,y); context.stroke(); }
      context.restore();

      branches.forEach((branch, index) => trace(branch, index % 3 ? "#0c5680" : "#1686b8", 2, .38 * (1 - deathAmount * .75)));
      trace(path, "#0c4269", 7, .22);
      trace(partialPath(path, grow), "#28b9f0", 3, 1 - deathAmount * .8);
      trace(partialPath(path, grow), "#56d2ff", 9, .11 * (1 - deathAmount));

      synapses.forEach(([x,y], index) => {
        const pulse = .72 + Math.sin(elapsed / 480 + index * 1.7) * .28;
        context.save();
        context.shadowColor = "#ffd85a";
        context.shadowBlur = 12 + pulse * 8;
        context.fillStyle = `rgba(255,216,90,${.68 + pulse * .25})`;
        context.beginPath(); context.arc(x * width,y * height,3 + pulse * 1.5,0,Math.PI * 2); context.fill();
        context.restore();
      });

      const [headX, headY] = pointAlong(path, grow);
      const x = headX * width;
      const y = headY * height;
      context.save();
      context.globalAlpha = 1 - deathAmount * .75;
      context.shadowColor = "#2caef5";
      context.shadowBlur = 25;
      const gradient = context.createLinearGradient(x, y - 38, x, y + 28);
      gradient.addColorStop(0, "#53c6ff"); gradient.addColorStop(1, "#1767c1");
      context.fillStyle = gradient;
      context.beginPath(); context.moveTo(x, y - 34); context.quadraticCurveTo(x + 35, y + 12, x + 29, y + 25); context.quadraticCurveTo(x, y + 34, x - 29, y + 25); context.quadraticCurveTo(x - 35, y + 12, x, y - 34); context.fill();
      context.restore();

      context.save();
      context.strokeStyle = "#f45f9a"; context.lineWidth = 2; context.setLineDash([5,5]); context.globalAlpha = .75 * (1 - deathAmount);
      context.beginPath(); context.moveTo(x,y + 27); context.lineTo(x,Math.min(height, y + height * .25)); context.stroke(); context.restore();

      context.save();
      context.font = `${Math.max(9, width * .012)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context.fillStyle = "rgba(111,211,250,.65)";
      context.fillText(`SYNAPSES  ${String(Math.max(1, Math.round(grow * 8))).padStart(2,"0")}`, 18, height - 18);
      context.textAlign = "right"; context.fillText(dying ? "APOPTOSIS" : cycle > .91 ? "REGENERATING" : "GROWTH PHASE", width - 18, height - 18);
      context.restore();

      if (dying) {
        context.save();
        context.textAlign = "center"; context.textBaseline = "middle";
        context.font = `700 ${Math.max(20, width * .046)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
        context.shadowColor = "#f04d83"; context.shadowBlur = 24;
        context.fillStyle = `rgba(255,91,140,${deathAmount * .9})`;
        context.fillText("APOPTOSIS", width / 2, height / 2);
        context.restore();
      }
    };

    const start = performance.now();
    const animate = (now: number) => {
      draw(now - start);
      if (!reduceMotion) animationFrame = requestAnimationFrame(animate);
    };
    const observer = new ResizeObserver(() => { sizeCanvas(); if (reduceMotion) draw(0); });
    observer.observe(canvas);
    sizeCanvas();
    animationFrame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animationFrame); observer.disconnect(); };
  }, []);

  return <canvas className="neuronSnakePreview" ref={canvasRef} role="img" aria-label="Slow-motion demo of Neuron Snake growing dendrites, collecting synapses, undergoing apoptosis, and regenerating"/>;
}

function NeuronParticleBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // A responsive banner port of amyleesterling/amysterling/particles.html.
    type Particle = { x:number; y:number; baseX:number; baseY:number; vx:number; vy:number; size:number; warmth:boolean };
    let particles: Particle[] = [];
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    const pointer = { x:-1000, y:-1000, active:false };

    const addPoint = (x:number, y:number, index:number) => particles.push({
      x:x + (Math.random() - .5) * 12, y:y + (Math.random() - .5) * 12,
      baseX:x, baseY:y, vx:0, vy:0, size:1.2 + Math.random() * 1.8, warmth:index % 37 === 0,
    });

    const buildNeuron = () => {
      particles = [];
      const centerX = width * .51;
      const centerY = height * .51;
      let index = 0;
      for (let radius = 0; radius < Math.min(width, height) * .105; radius += 7) {
        const count = Math.max(10, Math.round(radius * .9));
        for (let step = 0; step < count; step += 2) {
          const angle = step / count * Math.PI * 2;
          addPoint(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius * .82, index++);
        }
      }
      const branches = [-2.75, -2.1, -1.48, -.72, -.12, .55, 1.18, 2.45];
      branches.forEach((angle, branchIndex) => {
        const length = Math.min(width * .34, height * (.29 + (branchIndex % 3) * .07));
        for (let distance = 48; distance < length; distance += 7) {
          const bend = Math.sin(distance / 34 + branchIndex) * 12;
          const x = centerX + Math.cos(angle) * distance + Math.cos(angle + Math.PI / 2) * bend;
          const y = centerY + Math.sin(angle) * distance + Math.sin(angle + Math.PI / 2) * bend;
          addPoint(x, y, index++);
          if (distance > length * .55 && distance % 21 < 7) {
            const twigAngle = angle + (branchIndex % 2 ? .62 : -.62);
            for (let twig = 7; twig < length * .25; twig += 8) addPoint(x + Math.cos(twigAngle) * twig, y + Math.sin(twigAngle) * twig, index++);
          }
        }
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      buildNeuron();
    };
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = true;
    };
    const leave = () => { pointer.active = false; };
    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        if (pointer.active) {
          const dx = pointer.x - particle.x; const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < 115) {
            const force = (115 - distance) / 115;
            particle.vx -= dx / distance * force * 1.3; particle.vy -= dy / distance * force * 1.3;
          }
        }
        particle.vx += (particle.baseX - particle.x) * .025; particle.vy += (particle.baseY - particle.y) * .025;
        particle.vx *= .88; particle.vy *= .88; particle.x += particle.vx; particle.y += particle.vy;
        context.fillStyle = particle.warmth ? "rgba(255,216,90,.95)" : "rgba(91,205,255,.9)";
        context.beginPath(); context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); context.fill();
      }
      animationFrame = requestAnimationFrame(draw);
    };

    resize(); draw();
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(animationFrame); observer.disconnect();
      canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <div className="neuronBanner" aria-label="Interactive particle neuron; move your pointer through it">
    <canvas ref={canvasRef}/>
    <div className="neuronCount"><strong>52</strong><span>projects touched<br/>this year</span></div>
    <span className="neuronHint">move through the neuron</span>
  </div>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | CategoryId>("all");
  const shown = useMemo(() => repos.filter((repo) => {
    const matchesCategory = activeCategory === "all" || categoryFor(repo).id === activeCategory;
    const haystack = `${repo.n} ${repo.d} ${repo.l} ${categoryFor(repo).title}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [query, activeCategory]);
  const grouped = categories.map((category) => ({ category, repos: shown.filter((repo) => categoryFor(repo).id === category.id) })).filter((group) => group.repos.length);
  const featured = featuredNames.map((name) => repos.find((repo) => repo.n === name)!).filter(Boolean);

  return (
    <main>
      <nav className="topbar" aria-label="Primary navigation">
        <a className="wordmark" href="#top"><span>AS</span> Amy Sterling / Lab Notes</a>
        <div className="navlinks"><a href="#published">Published</a><a href="#featured">Selected</a><a href="#archive">All projects</a><a className="navButton" href="https://github.com/amyleesterling" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </nav>

      <header className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow"><span className="liveDot" /> Projects touched this year · updated July 26</p>
          <h1>Building at the speed of <em>curiosity.</em></h1>
          <p className="dek">Games made with kids. Brains rendered for magazines and museums. Tools for parties, hurricanes, pizza, and the gloriously unnecessary. You’re welcome to explore—this is a summary of all my code projects!</p>
          <div className="heroActions"><a className="primaryAction" href="#archive">Explore all 52 projects <span>↓</span></a><a className="textAction" href="https://github.com/amyleesterling" target="_blank" rel="noreferrer">@amyleesterling ↗</a></div>
        </div>
        <NeuronParticleBanner />
      </header>

      <section className="pulse" aria-label="2026 public commit activity by repository">
        <div className="pulseIntro"><span>THE CODE PULSE · 2026</span><strong>52 projects touched this year.</strong><p><b>{totalPublicCommits}</b> public commits across the collection.</p></div>
        <div className="pulseChart">
          <div className="commitBars" aria-label="One bar per public repository, ordered by commit count">
            {commitPulse.map((item) => {
              const repo = repos.find((candidate) => candidate.n === item.n);
              const title = repo ? repoTitle(repo) : item.n;
              const barHeight = item.c ? Math.max(6, Math.log1p(item.c) / Math.log1p(maxRepoCommits) * 100) : 2;
              const monthMax = Math.max(...item.m, 1);
              return <a className={`commitBarItem ${item.c === 0 ? "quietRepo" : ""}`} href={repo?.u || `https://github.com/amyleesterling/${item.n}`} target="_blank" rel="noreferrer" key={item.n} aria-label={`${title}: ${item.c} public commits in 2026. Open repository.`}>
                <span className="commitBar" style={{"--bar-height":`${barHeight}%`} as CSSProperties}/>
                <span className="commitTooltip">
                  <span className="tooltipTop"><b>{title}</b><em>{item.c} {item.c === 1 ? "commit" : "commits"}</em></span>
                  <span className="monthBreakdown">{item.m.map((count, index) => <span className="monthColumn" key={pulseMonths[index]}><i style={{"--month-height":`${count ? Math.max(8, count / monthMax * 100) : 2}%`} as CSSProperties}/><small>{pulseMonths[index]}</small><strong>{count}</strong></span>)}</span>
                  <span className="tooltipHint">View repository ↗</span>
                </span>
              </a>;
            })}
          </div>
          <div className="pulseLegend"><span><i/>Each line is one repository</span><span>Hover to see commits by month</span><span>GitHub public contributions · Jan–Jul</span></div>
        </div>
      </section>

      <section className="published section" id="published">
        <div className="sectionHeading publishedHeading"><div><p className="kicker">IN PRINT · IN PUBLIC</p><h2>Published</h2></div><p>Selected renders and visual systems I helped create for connectomics research—appearing in magazines, scientific publications, and public science projects.</p></div>
        <div className="publishedGrid">
          {publishedWorks.map((work, index) => <a className={`publishedCard publishedCard${index + 1}`} href={work.url} target="_blank" rel="noreferrer" key={work.title}>
            <div className="publishedImage"><img src={work.image} alt={`${work.title}, ${work.publication}`}/><span>0{index + 1}</span></div>
            <div className="publishedCopy"><p>{work.publication}</p><h3>{work.title}</h3><small>{work.credit}</small><b>View publication <span>↗</span></b></div>
          </a>)}
        </div>
      </section>

      <section className="featured section" id="featured">
        <div className="sectionHeading"><div><p className="kicker">A FEW FAVORITES</p><h2>Selected experiments</h2></div><p>No master plan—just a strong bias toward making the idea real.</p></div>
        <div className="featuredGrid">
          {featured.map((repo, index) => <article className={`featureCard feature${index + 1}`} key={repo.n}>
            <div className="featureTop"><span className="index">0{index + 1}</span><span className={`language ${langClass[repo.l]}`}>{repo.l}</span></div>
            <div className="featuredShot">{repo.n === "neuron-game" ? <NeuronSnakePreview/> : <img src={featuredImages[repo.n].src} alt={featuredImages[repo.n].alt}/>}</div>
            <div className="featureCopy"><span className="categoryTag">{categoryFor(repo).short}</span><h3>{repoTitle(repo)}</h3><p>{repo.d}</p></div>
            <a href={repo.h || repo.u} target="_blank" rel="noreferrer" aria-label={`Open ${repoTitle(repo)}`}>Open project <span>↗</span></a>
          </article>)}
        </div>
      </section>

      <section className="archive section" id="archive">
        <div className="sectionHeading archiveHeading"><div><p className="kicker">SEVEN ROOMS · 52 EXPERIMENTS</p><h2>The project exhibition</h2></div><p>These public repositories include experiments, side projects, things made just for fun, and work deployed professionally. This is an overview of the code I’ve made in public.</p></div>
        <div className="controls">
          <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the experiments…" aria-label="Search projects" /></label>
          <div className="filters categoryFilters" aria-label="Filter by category"><button className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>All <sup>52</sup></button>{categories.map((category) => <button className={activeCategory === category.id ? "active" : ""} onClick={() => setActiveCategory(category.id)} key={category.id}>{category.short} <sup>{repos.filter((repo) => categoryFor(repo).id === category.id).length}</sup></button>)}</div>
        </div>
        <div className="resultsLine"><span>{shown.length} {shown.length === 1 ? "project" : "projects"} on view</span><span>Each room is sorted by recent activity</span></div>
        <div className="categoryRooms">{grouped.map(({category, repos: categoryRepos}, roomIndex) => <section className={`categoryRoom room-${category.id}`} key={category.id}>
          <header className="roomHeader"><div className="roomNumber">0{roomIndex + 1}</div><div><p>{category.mark} &nbsp; CATEGORY</p><h3>{category.title}</h3></div><p className="roomDescription">{category.description}</p><span className="roomCount">{categoryRepos.length}<small>projects</small></span></header>
          <div className="storyGrid">{categoryRepos.map((repo, index) => <article className={`storyCard story-${(index % 5) + 1}`} key={repo.n}>
            <ProjectVisual repo={repo}/>
            <div className="storyBody"><div className="repoMeta"><span className={`language ${langClass[repo.l]}`}><i className={`dot ${langClass[repo.l]}`}/>{repo.l}</span><time dateTime={repo.t}>{prettyDate(repo.t)}</time></div>
              <h4>{repoTitle(repo)}</h4><p>{repo.d}</p>
              <div className="repoLinks">{repo.f && <span className="fork">Fork</span>}{repo.h && <a href={repo.h} target="_blank" rel="noreferrer">See it live ↗</a>}<a href={repo.u} target="_blank" rel="noreferrer">View code ↗</a></div>
            </div>
          </article>)}</div>
        </section>)}</div>
        {shown.length === 0 && <div className="empty">No matching rabbit holes. Try another search.</div>}
      </section>

      <footer><div><span className="footerMark">AS</span><p>Made from public GitHub data.<br/>Last checked July 26, 2026.</p></div><p className="footerQuote">Stay curious.<br/><em>Ship the weird thing.</em></p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
