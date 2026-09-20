import { publicPath } from "./site";
import RepositoryWorld, { type RepositoryWorldProject } from "./repository-world";

type ImportedRepository = {
  n:string;
  d:string;
  l:string;
  u:string;
  h?:string;
  t:string;
  f?:boolean;
  topics?:string[];
  stars?:number;
};

type OrganizationCatalog = {
  owner:string;
  year:number|null;
  generatedAt:string;
  source:string;
  repositories:ImportedRepository[];
};

type CommunityId = "models"|"agents"|"research"|"safety"|"developer"|"multimodal"|"learning";

const communityTitles:Record<CommunityId,string> = {
  models:"Models & Inference",
  agents:"Agents & Interfaces",
  research:"Research Systems",
  safety:"Safety & Evaluation",
  developer:"Developer Infrastructure",
  multimodal:"Voice, Vision & Media",
  learning:"Examples & Learning",
};

const rules:Array<[CommunityId,string[]]> = [
  ["safety",["safety","eval","evaluation","alignment","security","interpretability","red-team","preparedness","grader"]],
  ["agents",["agent","agents","assistant","computer-use","computer use","codex","claude-code","claude code","plugin","plugins","mcp","tool-use","tool use"]],
  ["multimodal",["audio","voice","speech","whisper","vision","image","video","multimodal","realtime","realtime"]],
  ["learning",["cookbook","example","examples","tutorial","course","guide","prompt-engineering","prompt engineering","demo","starter"]],
  ["developer",["sdk","api","client","typescript","python","java","go","ruby","csharp","c#","rust","cli","library","connector"]],
  ["research",["research","paper","benchmark","science","mechanistic","transformer-circuits","interpretability","dataset","simulation"]],
  ["models",["model","models","gpt","claude","transformer","inference","tokenizer","embedding","language-model","language model"]],
];

function communityFor(repo:ImportedRepository):CommunityId {
  const signal=`${repo.n} ${repo.d} ${repo.l} ${(repo.topics||[]).join(" ")}`.toLowerCase();
  const match=rules.find(([,terms])=>terms.some(term=>signal.includes(term)));
  return match?.[0]||"research";
}

function titleFor(name:string) {
  return name.replaceAll("_"," ").replaceAll("-"," ").replace(/\b\w/g,letter=>letter.toUpperCase());
}

function projectsFor(catalog:OrganizationCatalog):RepositoryWorldProject[] {
  const throughMonth=new Date(catalog.generatedAt).getUTCMonth()+1;
  const featured=new Set([...catalog.repositories].sort((a,b)=>(b.stars||0)-(a.stars||0)).slice(0,7).map(repo=>repo.n));
  return catalog.repositories.map(repo=>{
    const category=communityFor(repo);
    return {
      name:repo.n,
      title:titleFor(repo.n),
      description:repo.d,
      language:repo.l,
      url:repo.u,
      liveUrl:repo.h,
      category,
      categoryTitle:communityTitles[category],
      commits:0,
      months:Array.from({length:throughMonth},()=>0),
      activityKnown:false,
      touchedMonth:Number(repo.t.slice(5,7)),
      featured:featured.has(repo.n),
      stars:repo.stars||0,
      topics:repo.topics||[],
      lastTouched:new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(`${repo.t}T12:00:00Z`)),
    };
  });
}

export default function OrganizationOverview({catalog,displayName,peer}:{catalog:OrganizationCatalog;displayName:string;peer:{label:string;href:string}}) {
  const projects=projectsFor(catalog);
  const top=[...catalog.repositories].sort((a,b)=>(b.stars||0)-(a.stars||0)).slice(0,8);
  const capture=new Date(catalog.generatedAt);
  const year=catalog.year||capture.getUTCFullYear();
  const snapshotDate=new Intl.DateTimeFormat("en-US",{month:"long",day:"numeric",year:"numeric",timeZone:"UTC"}).format(capture);
  const stars=catalog.repositories.reduce((sum,repo)=>sum+(repo.stars||0),0);
  const languages=new Set(catalog.repositories.map(repo=>repo.l).filter(language=>language!=="Other")).size;

  return <main className="orgPage">
    <nav className="topbar orgTopbar" aria-label={`${displayName} repository navigation`}>
      <a className="wordmark" href={publicPath("/")}><span>AS</span> Projects Overview</a>
      <div className="navlinks"><a href="#world">Explore graph</a><a href={publicPath(peer.href)}>{peer.label}</a><a className="navButton" href={catalog.source} target="_blank" rel="noreferrer">GitHub ↗</a></div>
    </nav>

    <header className="orgHero">
      <div><p className="eyebrow"><span className="liveDot"/>PUBLIC GITHUB CONSTELLATION · {year}</p><h1>{displayName}<br/><em>repository world.</em></h1></div>
      <div className="orgHeroCopy"><strong>{projects.length}</strong><span>repositories pushed in {year}</span><p>Public projects arranged into automatically inferred neighborhoods. Drag the nodes and open any repository for its field guide.</p><p className="orgSnapshot">Updated <time dateTime={catalog.generatedAt}>{snapshotDate}</time></p></div>
    </header>

    <div className="orgStats" aria-label={`${displayName} snapshot statistics`}><span><strong>{stars.toLocaleString("en-US")}</strong> GitHub stars</span><span><strong>{languages}</strong> languages</span><p>Public, non-fork, non-archived repositories. Stars are snapshot totals; the timeline filters by each repository’s latest push, not commit history.</p></div>

    <RepositoryWorld
      projects={projects}
      year={year}
      throughMonth={capture.getUTCMonth()+1}
      showTours={false}
      kicker={`${projects.length} PUBLIC REPOSITORIES · AUTOMATIC COMMUNITY DETECTION`}
      heading={`${displayName} repository world`}
      description="Neighborhoods are inferred from repository names, descriptions, topics, and languages. Stronger semantic relationships pull projects closer together."
    />

    <section className="orgTopProjects section">
      <div className="sectionHeading"><div><p className="kicker">MOST-STARRED IN THIS {year} SNAPSHOT</p><h2>Gravitational centers</h2></div><p>The repositories with the strongest public signal become the largest landmarks in the graph.</p></div>
      <div className="orgRepoGrid">{top.map((repo,index)=><a href={repo.u} target="_blank" rel="noreferrer" key={repo.n}><i>{String(index+1).padStart(2,"0")}</i><div><span>{repo.l}</span><h3>{titleFor(repo.n)}</h3><p>{repo.d}</p></div><strong>{(repo.stars||0).toLocaleString()} ★</strong></a>)}</div>
    </section>

    <footer className="orgFooter"><a href={publicPath("/")}>← Amy Sterling’s Projects Overview</a><span>PUBLIC METADATA · GITHUB · {year}</span><a href={catalog.source} target="_blank" rel="noreferrer">{catalog.owner} on GitHub ↗</a></footer>
  </main>;
}
