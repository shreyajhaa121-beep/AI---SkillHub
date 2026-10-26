(() => {
"use strict";
const tools=Array.isArray(window.AI_TOOLS)?window.AI_TOOLS:[];
const tutorials=Array.isArray(window.AI_TUTORIALS)?window.AI_TUTORIALS:[];
const KEYS={saved:"aiSkillHub.savedTools.v1",score:"aiSkillHub.lastQuizScore.v1"};
const $=s=>document.querySelector(s);
const toolGrid=$("#toolGrid"),categoryFilter=$("#categoryFilter"),searchInput=$("#searchInput");
const toolResultCount=$("#toolResultCount"),toolEmpty=$("#toolEmpty"),savedGrid=$("#savedGrid"),savedEmpty=$("#savedEmpty");
const savedCount=$("#savedCount"),recommendationResults=$("#recommendationResults"),tutorialList=$("#tutorialList"),tutorialDetail=$("#tutorialDetail");
function readSaved(){try{const v=JSON.parse(localStorage.getItem(KEYS.saved)||"[]");return Array.isArray(v)?v.filter(id=>tools.some(t=>t.id===id)):[]}catch{return[]}}
let savedIds=readSaved();
function updateCount(){savedCount.textContent=String(savedIds.length)}
function persistSaved(){try{localStorage.setItem(KEYS.saved,JSON.stringify(savedIds))}catch{alert("Your browser could not save favourites. Browsing still works.")}updateCount()}
function card(tool){
 const el=document.createElement("article");el.className="tool-card";
 const top=document.createElement("div");top.className="tool-card-top";
 const icon=document.createElement("div");icon.className="tool-icon";icon.setAttribute("aria-hidden","true");icon.textContent=tool.icon||"✨";
 const wrap=document.createElement("div"),title=document.createElement("h3"),cat=document.createElement("div");
 title.textContent=tool.name;cat.className="category-label";cat.textContent=tool.category;wrap.append(title,cat);top.append(icon,wrap);
 const desc=document.createElement("p");desc.textContent=tool.description;
 const actions=document.createElement("div");actions.className="tool-card-actions";
 const save=document.createElement("button");save.type="button";save.className="small-button save-button";
 const updateSave=()=>{const yes=savedIds.includes(tool.id);save.textContent=yes?"♥ Saved":"♡ Save tool";save.setAttribute("aria-pressed",String(yes))};updateSave();
 save.addEventListener("click",()=>{savedIds=savedIds.includes(tool.id)?savedIds.filter(id=>id!==tool.id):[...savedIds,tool.id];persistSaved();renderTools();renderSaved();if(recommendationResults.children.length)renderRecommendations($("#goalSelect").value)});
 const learn=document.createElement("button");learn.type="button";learn.className="small-button";learn.textContent="Learn";
 learn.addEventListener("click",()=>{const t=tutorials.find(x=>x.toolId===tool.id);if(t){showTutorial(t.id);$("#tutorials").scrollIntoView({behavior:"smooth"})}else alert("A tutorial for this tool is coming soon. Check its official help pages in the meantime.")});
 const link=document.createElement("a");link.className="text-link";link.href=tool.url;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Official website ↗";
 actions.append(save,learn,link);el.append(top,desc,actions);return el;
}
function renderTools(){
 const q=searchInput.value.trim().toLowerCase(),c=categoryFilter.value;
 const found=tools.filter(t=>(c==="all"||t.category===c)&&`${t.name} ${t.category} ${t.description} ${(t.goals||[]).join(" ")}`.toLowerCase().includes(q));
 toolGrid.replaceChildren(...found.map(card));toolResultCount.textContent=`${found.length} ${found.length===1?"tool":"tools"} found`;toolEmpty.classList.toggle("hidden",found.length>0);
}
function renderSaved(){const list=savedIds.map(id=>tools.find(t=>t.id===id)).filter(Boolean);savedGrid.replaceChildren(...list.map(card));savedEmpty.classList.toggle("hidden",list.length>0)}
function renderRecommendations(goal){const found=tools.filter(t=>(t.goals||[]).includes(goal)).slice(0,6);recommendationResults.replaceChildren();if(!found.length){const p=document.createElement("p");p.className="empty-state";p.textContent="No matching tools yet. Try another goal.";recommendationResults.append(p);return}found.forEach(t=>recommendationResults.append(card(t)))}
function setupCategories(){[...new Set(tools.map(t=>t.category))].sort().forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;categoryFilter.append(o)})}
function showTutorial(id){
 const t=tutorials.find(x=>x.id===id);if(!t)return;
 tutorialList.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tutorialId===id)));
 const tool=tools.find(x=>x.id===t.toolId);tutorialDetail.replaceChildren();
 const eyebrow=document.createElement("p");eyebrow.className="eyebrow";eyebrow.textContent=t.level;
 const h=document.createElement("h3");h.textContent=t.title;const intro=document.createElement("p");intro.className="muted";intro.textContent=t.intro;
 const sh=document.createElement("h4");sh.textContent="Step by step";const ol=document.createElement("ol");
 t.steps.forEach(s=>{const li=document.createElement("li");li.textContent=s;ol.append(li)});
 const ph=document.createElement("h4");ph.textContent="Example prompt to try";const box=document.createElement("div");box.className="prompt-box";const p=document.createElement("p");p.textContent=t.prompt;box.append(p);
 const copy=document.createElement("button");copy.type="button";copy.className="button button-secondary";copy.textContent="Copy example prompt";
 copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(t.prompt);copy.textContent="Copied!"}catch{alert("Automatic copy is unavailable. Select and copy the example prompt manually.")}});
 tutorialDetail.append(eyebrow,h,intro,sh,ol,ph,box,copy);
 if(tool){const a=document.createElement("a");a.className="button button-primary";a.href=tool.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=`Open ${tool.name} ↗`;tutorialDetail.append(a)}
}
function renderTutorials(){
 tutorials.forEach((t,i)=>{const tool=tools.find(x=>x.id===t.toolId),b=document.createElement("button");b.type="button";b.className="tutorial-list-item";b.dataset.tutorialId=t.id;b.setAttribute("aria-pressed","false");
 const emoji=document.createElement("span");emoji.className="tutorial-emoji";emoji.textContent=tool?.icon||"📘";
 const wrap=document.createElement("span"),strong=document.createElement("strong"),small=document.createElement("small");strong.textContent=t.title;small.textContent=t.level;wrap.append(strong,small);b.append(emoji,wrap);b.addEventListener("click",()=>showTutorial(t.id));tutorialList.append(b);if(i===0)showTutorial(t.id)});
}
const questions=[
{q:"What is a good way to use an AI assistant when studying?",o:["Copy its answer without reading it","Ask for an explanation, then practise yourself","Assume every answer is correct","Avoid checking your understanding"],a:1,e:"AI can help explain a topic, but practising and checking your understanding helps you learn."},
{q:"What should you do with an important factual claim from an AI tool?",o:["Share it immediately","Trust it if it sounds confident","Check reliable sources","Assume it is current"],a:2,e:"AI tools can make mistakes or use outdated information. Verify important claims with reliable sources."},
{q:"Which prompt is generally most useful?",o:["Do everything","Help","Explain Python loops to a beginner with two examples","Write something good"],a:2,e:"A clear prompt gives the tool a topic, audience and expected output."},
{q:"What is a sensible way to use an AI coding assistant?",o:["Run all generated code without review","Share your passwords so it can help","Understand and test suggested code","Delete all tests"],a:2,e:"Review and test suggested code. Never share passwords, private keys or confidential data."},
{q:"Which information should you avoid putting into an untrusted AI service?",o:["A public science question","A made-up example","Your private password","A general writing topic"],a:2,e:"Keep passwords, private keys, sensitive personal data and confidential information out of prompts."},
{q:"Why should you open and check research source links?",o:["To make the answer longer","To see whether the evidence supports the claim","To avoid reading the sources","To guarantee every source is correct"],a:1,e:"A source link is a starting point. Read it and assess its relevance, reliability and date."},
{q:"What does the recommendation system in this version do?",o:["Reads the user's mind","Matches selected goals to stored tool tags","Trains a new AI model","Guarantees the best tool for everyone"],a:1,e:"The first version matches the selected goal against predefined tags. It does not call an AI model."},
{q:"What is browser LocalStorage used for in this project?",o:["Saving simple data in the current browser","Publishing a website automatically","Sending data to every user","Replacing HTML and CSS"],a:0,e:"LocalStorage can save small values such as favourites on the same browser and device."},
{q:"What should you consider when using AI-generated images or text?",o:["Ignore the tool's terms","Claim all content is verified","Check accuracy, rights and relevant usage rules","Use private data as a prompt"],a:2,e:"Review accuracy, rights or licensing considerations, and the tool's terms before publishing."},
{q:"What is the most responsible attitude toward AI tools?",o:["Let AI make every decision","Never use any AI tool","Use AI to support your judgement and verify important outputs","Assume AI cannot be wrong"],a:2,e:"AI can be useful, but people should think critically, protect information and check important results."}
];
let qi=0,score=0,answered=false;
function startQuiz(){qi=0;score=0;answered=false;$("#quizStart").classList.add("hidden");$("#quizResult").classList.add("hidden");$("#quizQuestionArea").classList.remove("hidden");renderQuestion()}
function renderQuestion(){
 answered=false;const q=questions[qi],area=$("#quizQuestionArea");area.replaceChildren();
 const meta=document.createElement("div");meta.className="quiz-meta";const count=document.createElement("span"),sc=document.createElement("span");count.textContent=`Question ${qi+1} of ${questions.length}`;sc.textContent=`Score: ${score}`;meta.append(count,sc);
 const track=document.createElement("div");track.className="progress-track";const fill=document.createElement("div");fill.className="progress-fill";fill.style.width=`${qi/questions.length*100}%`;track.append(fill);
 const h=document.createElement("h3");h.className="quiz-question";h.textContent=q.q;const opts=document.createElement("div");opts.className="quiz-options";const feedback=document.createElement("div");feedback.className="quiz-feedback hidden";
 q.o.forEach((label,i)=>{const b=document.createElement("button");b.type="button";b.className="quiz-option";const letter=document.createElement("span");letter.className="option-letter";letter.textContent=String.fromCharCode(65+i);const txt=document.createElement("span");txt.textContent=label;b.append(letter,txt);b.addEventListener("click",()=>answer(i,opts,feedback,sc));opts.append(b)});
 const controls=document.createElement("div");controls.className="quiz-controls";const hint=document.createElement("span");hint.className="small muted";hint.textContent="Choose one answer.";const next=document.createElement("button");next.type="button";next.className="button button-primary";next.textContent=qi===questions.length-1?"See results":"Next question";next.disabled=true;next.addEventListener("click",()=>{if(!answered)return;qi++;if(qi>=questions.length)showResult();else renderQuestion()});controls.append(hint,next);area.append(meta,track,h,opts,feedback,controls);
}
function answer(selected,opts,feedback,scoreLabel){
 if(answered)return;answered=true;const q=questions[qi];[...opts.children].forEach((b,i)=>{b.disabled=true;if(i===q.a)b.classList.add("correct");if(i===selected&&selected!==q.a)b.classList.add("wrong")});
 if(selected===q.a)score++;scoreLabel.textContent=`Score: ${score}`;feedback.classList.remove("hidden");const strong=document.createElement("strong");strong.textContent=selected===q.a?"That's right!":"Let's learn from this.";const p=document.createElement("p");p.textContent=q.e;feedback.replaceChildren(strong,p);const next=$("#quizQuestionArea .quiz-controls button");next.disabled=false;$("#quizQuestionArea .quiz-controls .small").textContent="Answer recorded.";
}
function showResult(){
 $("#quizQuestionArea").classList.add("hidden");const result=$("#quizResult");result.classList.remove("hidden");result.replaceChildren();
 try{localStorage.setItem(KEYS.score,JSON.stringify({score,total:questions.length,date:new Date().toISOString()}))}catch{}
 const wrap=document.createElement("div");wrap.className="quiz-result-content";const circle=document.createElement("div");circle.className="score-circle";circle.textContent=`${score}/${questions.length}`;const h=document.createElement("h3"),p=document.createElement("p"),again=document.createElement("button");const percent=Math.round(score/questions.length*100);h.textContent=percent>=80?"Great work!":percent>=50?"Good start!":"Keep practising!";p.textContent=`You answered ${score} out of ${questions.length} questions correctly (${percent}%). Review the tutorials and try again to strengthen your understanding.`;again.type="button";again.className="button button-primary";again.textContent="Try again";again.addEventListener("click",startQuiz);wrap.append(circle,h,p,again);result.append(wrap);showLastScore();
}
function showLastScore(){try{const s=JSON.parse(localStorage.getItem(KEYS.score)||"null");$("#lastScore").textContent=s?`Previous score on this device: ${s.score}/${s.total}`:""}catch{$("#lastScore").textContent=""}}
function setupMenu(){const toggle=$("#menuToggle"),links=$("#navLinks");toggle.addEventListener("click",()=>{const open=links.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));toggle.textContent=open?"✕ Close menu":"☰ Menu"});links.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{links.classList.remove("open");toggle.setAttribute("aria-expanded","false");toggle.textContent="☰ Menu"}))}
function init(){
 $("#year").textContent=String(new Date().getFullYear());setupCategories();setupMenu();searchInput.addEventListener("input",renderTools);categoryFilter.addEventListener("change",renderTools);
 $("#recommendForm").addEventListener("submit",e=>{e.preventDefault();renderRecommendations($("#goalSelect").value)});$("#startQuiz").addEventListener("click",startQuiz);
 updateCount();renderTools();renderSaved();renderTutorials();showLastScore();renderRecommendations("study");
}
function setupCategories(){[...new Set(tools.map(t=>t.category))].sort().forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;categoryFilter.append(o)})}
document.addEventListener("DOMContentLoaded",init);
})();
   
