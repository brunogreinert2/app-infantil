// Execute no navegador, com o SVG inserido no DOM; devolve a arte final.
export function adicionarMascaras() {
 const svg=document.querySelector('svg');
 if (!svg || svg.querySelector('mask')) throw new Error('Monte um SVG sem máscaras antes de processar.');
 const nodes=[...svg.querySelectorAll('path,rect,circle,ellipse')];
 const records=nodes.map(el=>{
  const b=el.getBBox(), m=el.getCTM();
  const corners=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(m));
  return {el,b,m,box:[Math.min(...corners.map(p=>p.x)),Math.min(...corners.map(p=>p.y)),Math.max(...corners.map(p=>p.x)),Math.max(...corners.map(p=>p.y))],filled:el.classList.contains('colorir-alvo')};
 });
 const ns=svg.namespaceURI,defs=document.createElementNS(ns,'defs');
 const prefix=svg.querySelector('title').id.replace('-titulo','');
 records.forEach((r,i)=>{
  const later=records.slice(i+1).filter(s=>s.filled&&s.box[0]<r.box[2]+4&&s.box[2]>r.box[0]-4&&s.box[1]<r.box[3]+4&&s.box[3]>r.box[1]-4);
  if(!later.length)return;
  const mask=document.createElementNS(ns,'mask');mask.id=prefix+'-oclusao-'+i;
  for(const [k,v] of Object.entries({maskUnits:'userSpaceOnUse',maskContentUnits:'userSpaceOnUse',x:r.b.x-8,y:r.b.y-8,width:r.b.width+16,height:r.b.height+16}))mask.setAttribute(k,v);
  const white=document.createElementNS(ns,'rect');
  for(const [k,v] of Object.entries({x:r.b.x-8,y:r.b.y-8,width:r.b.width+16,height:r.b.height+16,fill:'#ffffff',stroke:'none'}))white.setAttribute(k,v);
  mask.append(white);
  later.forEach(s=>{
   const el=s.el.cloneNode(false);
   for(const attr of ['id','class','mask','pointer-events'])el.removeAttribute(attr);
   el.setAttribute('fill','#000000');el.setAttribute('stroke','none');
   const m=r.m.inverse().multiply(s.m);
   el.setAttribute('transform',`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`);
   mask.append(el);
  });
  defs.append(mask);r.el.setAttribute('mask',`url(#${mask.id})`);
 });
 svg.prepend(defs);
 return svg.outerHTML;
}
