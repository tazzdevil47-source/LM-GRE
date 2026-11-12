/* LM GRE App — APK source companion. Source: user's provided APK database. */
(()=>{'use strict';
const db=window.LM_APK_BANK; if(!db)return;
const catBy=new Map(db.categories.map(c=>[c.id,c]));
const qs=db.questions, Qby=new Map(qs.map(q=>[q.id,q]));
const nameOf=id=>catBy.get(id)?.name||'Other';
const childIds=id=>{let out=[id];for(const c of db.categories)if(c.parent_category_id===id)out.push(...childIds(c.id));return out};
const rootSets={math:[4716,6587],english:[4638,6575,6583]};
const roots=['math','english'];
const stateKey='lm-gre-apk-companion-v1';
let state={history:{},sessions:[],settings:{instant:true},bookmarks:[]};
try{let saved=JSON.parse(localStorage.getItem(stateKey));if(saved)state={...state,...saved}}catch(e){}
let area='math', chapter=null, active=null, working=null, startAt=0, watch=null, filter='all',examTimer=0;
const $=s=>document.querySelector(s), escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store=()=>{try{localStorage.setItem(stateKey,JSON.stringify(state))}catch(e){}};
// Keep the original APK source HTML, but normalize legacy Android WebView markup
// before rendering it in WebKit/Safari. Never change source question/answer data.
const markup=s=>s||'';
function improveMarkup(root){
 if(!root)return;
 // mfenced is legacy MathML and is inconsistently supported by WebKit.
 root.querySelectorAll('mfenced').forEach(el=>{
  const m=document.createElementNS('http://www.w3.org/1998/Math/MathML','mrow');
  const open=el.getAttribute('open')??'(';
  const close=el.getAttribute('close')??')';
  const sep=el.getAttribute('separators')??',';
  if(open){const x=document.createElementNS(m.namespaceURI,'mo');x.textContent=open;m.appendChild(x)}
  [...el.children].forEach((child,i)=>{if(i){const x=document.createElementNS(m.namespaceURI,'mo');x.textContent=sep[0]||',';m.appendChild(x)}m.appendChild(child)});
  if(close){const x=document.createElementNS(m.namespaceURI,'mo');x.textContent=close;m.appendChild(x)}
  el.replaceWith(m);
 });
 root.querySelectorAll('math').forEach(el=>{
  el.setAttribute('mathcolor','currentColor');
  if(el.getAttribute('display')==='block')el.classList.add('apk-block-math');
 });
 root.querySelectorAll('table').forEach(table=>{
  table.removeAttribute('width');table.removeAttribute('height');
  table.classList.add('apk-source-table');
  if(/Quantity\s*A/i.test(table.textContent)&&/Quantity\s*B/i.test(table.textContent))table.classList.add('apk-qc-table');
  if(!table.parentElement?.classList.contains('apk-table-scroll')){
   const sc=document.createElement('div');sc.className='apk-table-scroll';
   table.parentNode.insertBefore(sc,table);sc.appendChild(table);
  }
 });
 root.querySelectorAll('img').forEach(img=>{
  img.removeAttribute('width');img.removeAttribute('height');
  img.removeAttribute('max-width');
  img.style.width='';img.style.height='';img.style.maxWidth='';
  img.classList.add('apk-source-image');img.loading='lazy';img.decoding='async';
  img.addEventListener('error',()=>{
   if(img.dataset.failed)return;
   img.dataset.failed='1';
   const msg=document.createElement('p');msg.className='apk-image-error';
   msg.textContent='Diagram unavailable. Check that the apk-media folder is uploaded and reload while online.';
   img.insertAdjacentElement('afterend',msg);
  });
 });
 root.querySelectorAll('[style]').forEach(el=>{
  // Android's nowrap spans clip blanks and long verbal sentences on iPhones.
  if(el.style.whiteSpace==='nowrap')el.style.whiteSpace='normal';
 });
}
function improveVisible(){improveMarkup(getMain())}

const isCard=q=>q.question_type==='Multiple Choice'&&q.answers.length===1&&q.cats.some(id=>id===6576||childIds(6575).includes(id));
const getMain=()=>$('#main');
const btn=(text,action,cls='btn secondary')=>`<button class="${cls}" data-apk-action="${action}">${text}</button>`;
const sectionHeader=(heading,subtitle)=>`<div class="page-heading"><div class="eyebrow">APK SOURCE MODULE</div><h1>${heading}</h1><p>${subtitle}</p></div>`;
const allIds=key=>new Set(rootSets[key].flatMap(childIds));
const matching=(key,id)=>{let permitted=allIds(key);let byChapter=id?new Set(childIds(id)):permitted;return qs.filter(q=>q.cats.some(c=>permitted.has(c)&&byChapter.has(c)))};
const groupCounts=id=>matching(area,id).length;
const optionsHtml=(q,values)=>{
 if(q.question_type==='Blank Text Completion'){
  const n=q.blank_text_columns||3;
  let groups=[];for(let k=0;k<q.answers.length;k+=n)groups.push(q.answers.slice(k,k+n));
  return groups.map((group,g)=>`<fieldset class="apk-fieldset"><legend>Blank ${g+1}</legend>${group.map(a=>`<label class="apk-choice"><input type="radio" name="apkblank${g}" value="${a.id}" ${values?.includes(a.id)?'checked':''}/><span>${markup(a.text)}</span></label>`).join('')}</fieldset>`).join('');
 }
 if(q.question_type==='Numeric Entry'||q.question_type==='Fractional Numeric Entry'){
  if(q.question_type==='Fractional Numeric Entry')return `<div class="apk-numeric"><label>Numerator <input type="number" inputmode="decimal" id="apk-numerator" placeholder="Numerator"/></label><label>Denominator <input type="number" inputmode="decimal" id="apk-denominator" placeholder="Denominator"/></label></div>`;
  return `<label class="apk-numeric">Your answer <input type="text" inputmode="decimal" id="apk-numeric" placeholder="Enter number"/></label>`;
 }
 const multi=q.question_type==='Single Correct SATA'||q.answers.filter(a=>a.correct).length>1;
 return `<div class="apk-choices">${q.answers.map(a=>`<label class="apk-choice"><input type="${multi?'checkbox':'radio'}" name="apkchoice" value="${a.id}"/><span>${markup(a.text)}</span></label>`).join('')}</div>`;
};
function getAnswer(q){
 if(q.question_type==='Numeric Entry'||q.question_type==='Fractional Numeric Entry'){
  let raw=q.question_type==='Numeric Entry'?$('#apk-numeric')?.value.trim():[$('#apk-numerator')?.value.trim(),$('#apk-denominator')?.value.trim()];
  if(!raw||(Array.isArray(raw)&&raw.some(x=>!x)))return null;
  return raw;
 }
 if(q.question_type==='Blank Text Completion'){
  let out=[];for(let g=0;g<Math.ceil(q.answers.length/(q.blank_text_columns||3));g++){let v=document.querySelector(`input[name="apkblank${g}"]:checked`);if(!v)return null;out.push(Number(v.value))}return out;
 }
 const v=[...document.querySelectorAll('input[name="apkchoice"]:checked')].map(x=>+x.value);return v.length?v:null;
}
function frac(s){if(typeof s==='number')return s;if(typeof s==='string'){
 if(s.includes('/')){let p=s.split('/').map(Number);return p[1]!==0?p[0]/p[1]:NaN}return Number(s)
 }return NaN}
function checkAnswer(q,sel){
 if(q.question_type==='Numeric Entry'||q.question_type==='Fractional Numeric Entry'){
  const ans=q.answers.filter(a=>a.correct);let actual=q.question_type==='Fractional Numeric Entry'?frac(sel[0])/frac(sel[1]):frac(sel);
  return ans.some(a=>{try{let obj=JSON.parse(a.raw);let exp=('numeric'in obj)?Number(obj.numeric):Number(obj.numerator)/Number(obj.denominator);return Number.isFinite(actual)&&Number.isFinite(exp)&&Math.abs(actual-exp)<1e-8*Math.max(1,Math.abs(exp))}catch(e){return false}})
 }
 const right=q.answers.filter(a=>a.correct).map(a=>a.id).sort((a,b)=>a-b);
 const chosen=sel.slice().sort((a,b)=>a-b);
 return JSON.stringify(right)===JSON.stringify(chosen)
}
function answerLabel(q){return q.answers.filter(a=>a.correct).map(a=>q.question_type==='Numeric Entry'||q.question_type==='Fractional Numeric Entry'?escape(a.raw):a.text).join(' · ')}
function caseText(q){
 const c=db.cases[q.case_id];if(!c)return '';
 const raw=c.text||'';
 const isReading=q.cats.some(x=>[4641,5084,6584,6585,6586,5102].includes(x));
 if(isReading && raw.replace(/<[^>]+>/g,'').length>250)return `<div class="apk-passage"><strong>Shared passage / data</strong><div>${raw}</div></div>`;
 return '';
}
function stopWatch(){if(watch)clearInterval(watch);watch=null}
function tick(){if(!working)return;let elapsed=Math.round((Date.now()-startAt)/1000);let el=$('#apk-time');if(el)el.textContent= `${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`;let remaining=$('#apk-remaining');if(remaining&&examTimer&&active){let seconds=Math.max(0,Math.ceil((active.opened+examTimer*1000-Date.now())/1000));remaining.textContent=` · Remaining ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;}
 if(examTimer&&active&&Date.now()-active.opened>=examTimer*1000){if(working&&!working.done)submit(true);finish()}}
function launch(){stopWatch();active=null;working=null;renderHome()}
function renderHome(){
 const mathCount=matching('math').length,englishCount=matching('english').length;
 getMain().innerHTML=sectionHeader('APK · Source practice','Chapter-by-chapter content recovered from your uploaded 2016 Android APK. Separate English and Math, with original questions, answer keys and explanations.')+
 `<div class="apk-tabs"><button class="${area==='math'?'active':''}" data-apk-action="area-math">∑ Math · ${mathCount}</button><button class="${area==='english'?'active':''}" data-apk-action="area-english">≡ English · ${englishCount}</button></div>`+
 `<div class="apk-toolbar"><label><input type="checkbox" id="apk-instant" ${state.settings.instant?'checked':''}/> Reveal answers after each question</label><span>Progress is saved separately from existing GRE modules</span></div>`+
 `<div class="apk-chapters">${rootSets[area].map(id=>chapterTree(id)).join('')}</div>`;
}
function chapterTree(id){let cat=catBy.get(id);if(!cat)return '';let children=db.categories.filter(c=>c.parent_category_id===id);let count=groupCounts(id);return `<section class="apk-chapter-group"><div class="apk-cat-header"><strong>${escape(cat.name)}</strong><span>${count} questions/cards</span><button data-apk-start="${id}" ${count?'':'disabled'}>Practice all</button></div>${children.length?`<div class="apk-subchapters">${children.map(c=>c.has_children?chapterTree(c.id):`<button class="apk-chapter" data-apk-start="${c.id}" ${!groupCounts(c.id)?'disabled':''}><strong>${escape(c.name)}</strong><small>${groupCounts(c.id)} questions</small></button>`).join('')}</div>`:''}</section>`}
function start(id){chapter=+id;let pool=matching(area,chapter);if(!pool.length)return;active={ids:pool.map(x=>x.id),index:0,answered:0,right:0,opened:Date.now(),chapter,area,instant:state.settings.instant,seen:new Set()};setupSession()}
function setupSession(){stopWatch();getMain().innerHTML=sectionHeader('APK · '+escape(nameOf(chapter)),'Set your practice pace. Questions follow the chapter structure found in the APK.')+
 `<div class="panel apk-setup"><p><strong>${active.ids.length}</strong> available questions</p><label>Session questions <select id="apk-limit"><option value="10">10 questions</option><option value="20">20 questions</option><option value="50">50 questions</option><option value="0">All questions</option></select></label><label>Timer <select id="apk-timer"><option value="0">Stopwatch — untimed</option><option value="120">2-minute sprint</option><option value="600">10-minute drill</option><option value="1200">20-minute drill</option></select></label><label><input type="checkbox" id="apk-shuffle"> Shuffle questions (off = APK source order)</label>${btn('Begin practice','begin','btn primary')} ${btn('Back to chapters','home')}</div>`}
function begin(){let n=Number($('#apk-limit')?.value||10);examTimer=Number($('#apk-timer')?.value||0);let ordered=active.ids.slice();if($('#apk-shuffle')?.checked)ordered.sort(()=>Math.random()-.5);active.ids=n?ordered.slice(0,n):ordered;active.index=0;active.answered=0;active.right=0;active.opened=Date.now();showQuestion()}
function showQuestion(){stopWatch();let id=active?.ids[active.index];if(!id)return finish();let q=Qby.get(id);if(!q)return finish();working={q,done:false,correct:false,chosen:null,questionStarted:Date.now()};startAt=Date.now();
 const type=isCard(q)?'Vocabulary Flashcard':q.question_type;
 getMain().innerHTML=`<div class="apk-question-top"><div><span class="eyebrow">APK / ${escape(active.area.toUpperCase())} / ${escape(nameOf(active.chapter))}</span><h2>Question ${active.index+1} of ${active.ids.length}</h2></div><div class="apk-clock">⏱ <span id="apk-time">0:00</span><span id="apk-remaining"></span></div></div><div class="progress-track"><div class="progress-fill" style="width:${100*active.index/active.ids.length}%"></div></div>`+
 `<div class="panel apk-question"><div class="apk-qtype">${escape(type)}</div>${caseText(q)}<div class="apk-prompt">${markup(q.question)}</div><div id="apk-options">${isCard(q)?'<p class="apk-neutral">Recall the meaning before revealing the answer.</p>':optionsHtml(q)}</div><div id="apk-feedback"></div><div class="apk-controls">${isCard(q)?btn('Reveal definition','reveal','btn primary'):btn('Submit answer','submit','btn primary')}${btn('Skip','skip')} ${btn('End session','finish','btn ghost')}</div></div>`;
 improveVisible();watch=setInterval(tick,250);
}
function revealCard(){if(!working||working.done||working.revealed||!isCard(working.q))return;working.revealed=true;$('#apk-feedback').innerHTML=`<div class="apk-answer apk-correct"><strong>Definition and example</strong><div class="apk-rationale">${markup(working.q.answers[0].text)}</div></div>`;improveVisible();$('.apk-controls').innerHTML=btn('I knew it','card-known','btn primary')+btn('Study again','card-again')+btn('End session','finish','btn ghost')}
function rateCard(known){if(!working||working.done||!isCard(working.q))return;working.revealed=true;recordAnswer(known?working.q.answers.map(a=>a.id):[],known)}
function recordAnswer(answer,correct){const q=working.q;working.done=true;working.chosen=answer;working.correct=correct;
 const elapsed=Math.round((Date.now()-working.questionStarted)/1000);active.answered++;if(correct)active.right++;active.results=active.results||{};active.results[q.id]={correct,chosen:answer,elapsed};
 const h=state.history[q.id]||{right:0,wrong:0,time:0,attempts:0};h.attempts++;if(correct)h.right++;else h.wrong++;h.time+=elapsed;h.last=Date.now();state.history[q.id]=h;store();
 document.querySelectorAll('#apk-options input').forEach(x=>x.disabled=true);
 if(!isCard(q))$('#apk-feedback').innerHTML=active.instant?feedback(q,correct):`<p class="apk-neutral">Answer saved. Explanations are hidden until the end.</p>`;
 else if(!working.revealed)$('#apk-feedback').innerHTML=`<div class="apk-answer"><strong>Definition and example</strong><div class="apk-rationale">${markup(q.answers[0].text)}</div></div>`;
 improveVisible();$('.apk-controls').innerHTML=btn(active.index+1===active.ids.length?'Finish session':'Next question','next','btn primary')+btn('End session','finish','btn ghost');if(!examTimer)stopWatch();}
function submit(forced=false){if(!working||working.done)return;const q=working.q,answer=forced?null:getAnswer(q);if(!answer&&!forced)return alert('Choose or enter an answer first.');
 recordAnswer(answer,answer?checkAnswer(q,answer):false);
}
function feedback(q,correct){if(isCard(q))return `<div class="apk-answer ${correct?'apk-correct':'apk-wrong'}"><strong>${correct?'✓ Known':'↻ Review again'}</strong><div class="apk-rationale">${markup(q.answers[0].text)}</div></div>`;return `<div class="apk-answer ${correct?'apk-correct':'apk-wrong'}"><strong>${correct?'✓ Correct':'✕ Incorrect'} · Answer: ${answerLabel(q)}</strong><div class="apk-rationale">${markup(q.rationale)||'Explanation was not present in the source APK.'}</div></div>`}
function skip(){submit(true)}
function next(){if(!working?.done)return;active.index++;showQuestion()}
function finish(){stopWatch();if(!active)return renderHome();let completed={at:Date.now(),area:active.area,chapter:active.chapter,total:active.answered,right:active.right,seconds:Math.round((Date.now()-active.opened)/1000)};state.sessions.unshift(completed);state.sessions=state.sessions.slice(0,100);store();
 let done=active.ids.filter(id=>active.results?.[id]).map(x=>Qby.get(x)).filter(Boolean);
 getMain().innerHTML=sectionHeader('APK · Session complete',`${escape(nameOf(active.chapter))} · ${active.area==='math'?'Math':'English'}`)+`<div class="grid" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px"><div class="panel"><strong>${active.right}/${active.answered}</strong><p>Correct</p></div><div class="panel"><strong>${active.answered?Math.round(100*active.right/active.answered):0}%</strong><p>Accuracy</p></div><div class="panel"><strong>${Math.round(completed.seconds/60)} min</strong><p>Time elapsed</p></div></div>`+
 `<div class="panel" style="margin-top:14px"><h3>Answer review</h3><p>Review your source questions and their original explanations.</p>${done.map((q,i)=>`<details class="apk-review"><summary>${i+1}. ${escape(q.question.replace(/<[^>]*>/g,'').slice(0,115))}</summary><div class="apk-prompt">${q.question}</div>${feedback(q,active.results?.[q.id]?.correct||false)}</details>`).join('')}${btn('Back to APK chapters','home','btn primary')}</div>`;improveVisible();active=null;working=null;
}
function leave(){stopWatch();working=null;active=null}
function getData(){return state}
function restore(x){if(x&&typeof x==='object'&&x.history&&x.sessions){state=x;store()}}
function reset(){state={history:{},sessions:[],settings:{instant:true},bookmarks:[]};store()}
document.addEventListener('click',e=>{
 const ch=e.target.closest('[data-apk-start]');if(ch){e.preventDefault();start(ch.dataset.apkStart);return}
 const b=e.target.closest('[data-apk-action]');if(!b)return;e.preventDefault();let a=b.dataset.apkAction;
 if(a.startsWith('area-')){area=a.slice(5);renderHome();return}
 if(a==='home'){leave();renderHome()}else if(a==='begin')begin();else if(a==='submit')submit();else if(a==='reveal')revealCard();else if(a==='card-known')rateCard(true);else if(a==='card-again')rateCard(false);else if(a==='next')next();else if(a==='skip')skip();else if(a==='finish')finish();
});
document.addEventListener('change',e=>{if(e.target.id==='apk-instant'){state.settings.instant=e.target.checked;store()}});
const css=document.createElement('style');css.textContent=`
.apk-tabs{display:flex;gap:10px;margin:18px 0;flex-wrap:wrap}.apk-tabs button{border:1px solid #49607e;border-radius:12px;background:#1c2b43;color:#dce8fb;padding:14px 20px;font-weight:800;cursor:pointer}.apk-tabs button.active{background:#195746;border-color:#38ad8b;color:white}.apk-toolbar{display:flex;gap:15px;justify-content:space-between;flex-wrap:wrap;font-size:13px;color:#b7c9df;margin:14px 0}.apk-toolbar label{display:flex;align-items:center;gap:7px}.apk-chapters{display:grid;gap:16px}.apk-chapter-group{border:1px solid #354962;background:#142239;padding:18px;border-radius:16px}.apk-cat-header{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.apk-cat-header strong{font-size:18px}.apk-cat-header span{color:#9bb0c7;font-size:13px;margin-left:auto}.apk-cat-header button,.apk-chapter{cursor:pointer;background:#263b53;color:white;border:1px solid #455c73;border-radius:10px;padding:12px;text-align:left}.apk-cat-header button:disabled,.apk-chapter:disabled{opacity:.4}.apk-subchapters{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:9px;margin-top:14px}.apk-chapter{display:flex;flex-direction:column;gap:6px}.apk-chapter small{color:#aac1d6}.apk-setup{display:grid;gap:14px;max-width:700px}.apk-setup label{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.apk-setup select,.apk-numeric input{background:#17283d;color:white;border:1px solid #526986;padding:12px;border-radius:10px}.apk-question-top{display:flex;align-items:center;justify-content:space-between;gap:15px;margin:10px 0 20px}.apk-question-top h2{margin:5px 0}.apk-clock{white-space:nowrap;font-size:20px;font-weight:800}.apk-question{margin-top:18px;max-width:1000px}.apk-qtype{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#83d4bd;font-weight:700}.apk-prompt{font-size:17px;line-height:1.65;margin:18px 0;overflow-x:auto}.apk-prompt math,.apk-rationale math{font-size:110%}.apk-prompt img,.apk-rationale img,.apk-passage img{display:block;max-width:100%;height:auto}.apk-choices{display:grid;gap:9px}.apk-choice{display:flex;align-items:flex-start;gap:14px;padding:13px 15px;border:1px solid #415671;border-radius:12px;background:#18263b;cursor:pointer}.apk-choice input{accent-color:#59d4ac;flex:0 0 auto;margin-top:6px}.apk-choice span p{margin:0}.apk-fieldset{border:1px solid #455b75;border-radius:12px;margin:12px 0;padding:12px}.apk-fieldset legend{font-weight:700;padding:0 8px}.apk-fieldset .apk-choice{margin:5px 0}.apk-controls{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.apk-passage{background:#1b3047;border:1px solid #526883;border-radius:12px;max-height:340px;overflow:auto;padding:17px;margin:14px 0;line-height:1.65;white-space:normal}.apk-answer{border-radius:12px;padding:16px;margin-top:20px;border:1px solid #476a60;background:#173a37}.apk-wrong{border-color:#945661;background:#3a222d}.apk-rationale{font-size:15px;line-height:1.7;margin-top:12px}.apk-rationale p{margin:8px 0}.apk-review{border-top:1px solid #41526b;padding:12px 0}.apk-review summary{cursor:pointer}.apk-numeric{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:16px 0}.apk-numeric label{display:flex;gap:8px;align-items:center}.apk-neutral{color:#c6d3e4;margin:16px 0}@media(max-width:600px){.apk-cat-header span{margin-left:0}.apk-question-top h2{font-size:21px}.apk-subchapters{grid-template-columns:1fr}.apk-question{padding:14px}.apk-prompt{font-size:16px}}
`;
css.textContent += '\n/* Safari/iPhone Android-HTML compatibility; scoped to APK source only. */\n.apk-question,.apk-answer,.apk-review,.apk-passage{min-width:0;overflow-wrap:break-word;word-break:normal}\n.apk-prompt,.apk-rationale,.apk-passage,.apk-choice span,.apk-review{overflow-wrap:anywhere}\n.apk-prompt p,.apk-rationale p,.apk-passage p{max-width:100%;white-space:normal}\n.apk-prompt math,.apk-rationale math,.apk-passage math,.apk-choice math,.apk-review math{font-family:math,serif;font-size:1.08em;max-width:100%;vertical-align:middle;color:inherit}\n.apk-prompt math[display="block"],.apk-rationale math[display="block"],.apk-passage math[display="block"]{display:block;overflow-x:auto;overflow-y:hidden;padding:.35em 0;-webkit-overflow-scrolling:touch}\n.apk-table-scroll{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;margin:12px 0;border-radius:9px}\n.apk-source-table{width:100%;max-width:100%;min-width:290px;border-collapse:collapse;table-layout:auto;color:inherit}\n.apk-source-table td,.apk-source-table th{padding:8px 6px;vertical-align:middle;overflow-wrap:normal;word-break:normal;min-width:0;border:1px solid rgba(158,177,202,.25)}\n.apk-source-table p{margin:4px 0;text-align:center}\n.apk-qc-table{min-width:290px;table-layout:fixed}\n.apk-qc-table td:first-child,.apk-qc-table th:first-child,.apk-qc-table td:last-child,.apk-qc-table th:last-child{width:45%}\n.apk-qc-table td:nth-child(2),.apk-qc-table th:nth-child(2){width:10%}\n.apk-source-image{display:block;width:auto!important;height:auto!important;max-width:100%!important;object-fit:contain;margin:12px auto;image-rendering:auto}\n.apk-image-error{background:#3d2630;border:1px solid #a85d68;padding:10px;border-radius:8px;font-size:13px}\n.apk-choice{min-width:0;overflow-wrap:anywhere}\n.apk-choice span{min-width:0;flex:1}\n.apk-question-top{flex-wrap:wrap}.apk-clock{font-variant-numeric:tabular-nums}\n@media(max-width:600px){.apk-question{width:100%;max-width:100%;box-sizing:border-box}.apk-prompt,.apk-rationale,.apk-passage{font-size:16px;line-height:1.65}.apk-choice{padding:12px 10px}.apk-source-table td,.apk-source-table th{padding:7px 3px;font-size:14px}.apk-clock{font-size:16px}}\n';
document.head.appendChild(css);
window.LM_APK={launch,leave,getData,restore,reset,stats:()=>({questions:qs.length,math:matching('math').length,english:matching('english').length})};
})();
