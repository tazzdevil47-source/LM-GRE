/* Unified GRE Quant format and grading, used by practice and mocks. */
window.LM_QFMT={
 choices(q){if(q.type==='qc')return [['A','Quantity A is greater'],['B','Quantity B is greater'],['C','The two quantities are equal'],['D','The relationship cannot be determined']];return(q.options||[]).map(v=>[String(v),String(v)])},
 normalize(x){return String(x??'').trim().toLowerCase().replaceAll('−','-').replaceAll(',','').replace(/\s+/g,'')},
 equal(q,got){if(q.type==='multi'){const a=Array.isArray(got)?got:[];return a.length===q.answer.length&&q.answer.every(z=>a.some(x=>this.normalize(x)===this.normalize(z)))}if(q.type==='entry'){let a=this.normalize(got),b=this.normalize(q.answer);if(a===b)return true;function val(s){if(/^[-+]?\d+(\.\d+)?$/.test(s))return Number(s);let m=s.match(/^([-+]?\d+)\/([-+]?\d+)$/);return m&&+m[2]!==0?+m[1]/+m[2]:null}let x=val(a),y=val(b);return x!==null&&y!==null&&Math.abs(x-y)<1e-8}return this.normalize(got)===this.normalize(q.answer)}
};
