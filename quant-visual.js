/* SVG / table visualization for original linked-source Quant questions. */
window.LM_QVIS=(v)=>{
 if(!v)return '';
 const e=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const table=(headers,rows)=>`<div class="q-source-scroll"><table class="q-source-table"><thead><tr>${headers.map(x=>`<th>${e(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${e(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 const bar=(labs,nums)=>{let max=Math.max(...nums,1);return `<div class="q-bars" role="img" aria-label="Bar chart ${labs.map((x,i)=>x+': '+nums[i]).join(', ')}">${labs.map((x,i)=>`<div class="q-bar-row"><span>${e(x)}</span><div class="q-bar-track"><div class="q-bar-fill" style="width:${Math.round(nums[i]/max*100)}%"></div></div><b>${e(nums[i])}</b></div>`).join('')}</div>`};
 const scatter=(points)=>{let xx=points.map(x=>x[0]),yy=points.map(x=>x[1]),xmin=Math.min(...xx)-.5,xmax=Math.max(...xx)+.5,ymin=Math.min(...yy)-5,ymax=Math.max(...yy)+5;let circles=points.map(([x,y])=>`<circle cx="${40+(x-xmin)/(xmax-xmin)*320}" cy="${188-(y-ymin)/(ymax-ymin)*153}" r="6" fill="#9dd8ff"><title>${e(`Hours ${x}, Score ${y}`)}</title></circle>`).join('');return `<svg viewBox="0 0 410 215" class="q-scatter" role="img" aria-label="Scatterplot: ${e(points.map(x=>x.join(' hours yields ')).join('; '))}"><path d="M40 12 V188 H394" fill="none" stroke="#b1c4de" stroke-width="2"/>${circles}${points.map(([x,y])=>`<text x="${40+(x-xmin)/(xmax-xmin)*320}" y="208" text-anchor="middle" font-size="12" fill="#c8d9ea">${x}</text>`).join('')}</svg>`};
 let inner='';
 if(v.kind==='table')inner=table(v.headers,v.rows);
 if(v.kind==='bar')inner=bar(v.labels,v.values);
 if(v.kind==='scatter')inner=scatter(v.points);
 if(v.kind==='pie'){let colors=['#7698f2','#81c7b5','#e6bd73','#c2a0ea'];let stop=0;let seg=v.values.map((x,i)=>{let ret=`${colors[i]} ${stop}% ${stop+x}%`;stop+=x;return ret}).join(',');inner=`<div class="q-pie-layout"><div class="q-pie" style="background:conic-gradient(${seg})" role="img" aria-label="Pie chart: ${e(v.labels.map((l,i)=>l+' '+v.values[i]+' percent').join(', '))}"></div><div>${v.labels.map((label,i)=>`<div class="q-pie-label"><span style="background:${colors[i]}"></span>${e(label)}: <strong>${v.values[i]}%</strong></div>`).join('')}</div></div>`}
 if(v.kind==='multi')inner=table(v.headers,v.rows)+bar(v.labels,v.values);
 return `<section class="q-source"><div class="eyebrow">SOURCE DATA</div><h3>${e(v.title||'Question source')}</h3>${inner}</section>`;
};
