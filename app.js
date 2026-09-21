const $ = id => document.getElementById(id);
let functions = ['sin(x)', 'x^2/10'];

function values(a,b,n){const result=[];for(let i=0;i<=n;i++)result.push(a+(b-a)*i/n);return result;}
function numberOf(id){return Number($(id).value);}
function plotLayout(xTitle,yTitle,title=''){
  const dark=document.body.classList.contains('dark');
  return {title,margin:{l:55,r:20,t:42,b:50},paper_bgcolor:dark?'#0d131d':'#fff',plot_bgcolor:dark?'#0d131d':'#fff',font:{color:dark?'#e8edf6':'#172033'},xaxis:{title:xTitle,gridcolor:dark?'#354052':'#e1e6ee',zerolinecolor:dark?'#8b98aa':'#667085'},yaxis:{title:yTitle,gridcolor:dark?'#354052':'#e1e6ee',zerolinecolor:dark?'#8b98aa':'#667085'},hovermode:'x unified'};
}
function graph(data,layout){Plotly.newPlot('plot',data,layout,{responsive:true,displaylogo:false});}
function rebuildFunctions(){
  const box=$('fns'); box.innerHTML='';
  functions.forEach((formula,index)=>{
    const row=document.createElement('div'); row.className='fnrow';
    row.innerHTML='<span class="dot"></span><input class="f"><button class="del">×</button>';
    row.querySelector('.f').value=formula;
    row.querySelector('.del').onclick=()=>{functions.splice(index,1);rebuildFunctions();drawReal();};
    box.appendChild(row);
  });
}
function drawReal(){
  const a=numberOf('xmin'),b=numberOf('xmax'),x=values(a,b,Math.min(10000,numberOf('samples')||1800));
  const traces=[];
  document.querySelectorAll('.f').forEach(input=>{
    const formula=input.value.trim(); const y=x.map(v=>{try{const q=evaluateReal(formula,{x:v});return Number.isFinite(q)?q:null;}catch{return null;}});
    traces.push({x,y,mode:'lines',name:formula});
  });
  graph(traces,plotLayout('x','y'));
}
function drawSpecial(){
  const a=numberOf('smin'),b=numberOf('smax'),x=values(a,b,1400),name=$('sf').value;
  const y=x.map(v=>{try{const q=specialValue(name,v);return Number.isFinite(q)?q:null;}catch{return null;}});
  graph([{x,y,mode:'lines',name}],plotLayout('x','value',name));
}
function drawComplex(){
  const xa=numberOf('cxa'),xb=numberOf('cxb'),ya=numberOf('cya'),yb=numberOf('cyb'),n=75;
  const x=values(xa,xb,n),y=values(ya,yb,n),view=$('cview').value;
  const z=y.map(Y=>x.map(X=>{try{const w=complexValue($('cf').value,new Complex(X,Y));if(view==='phase')return Math.atan2(w.im,w.re);if(view==='re')return w.re;if(view==='im')return w.im;return Math.log1p(w.abs());}catch{return null;}}));
  graph([{x,y,z,type:'heatmap'}],{...plotLayout('Re(z)','Im(z)',$('cf').value+' on C'),yaxis:{title:'Im(z)',scaleanchor:'x'}});
}
function drawCritical(){
  const a=numberOf('tmin'),b=numberOf('tmax'),t=values(a,b,numberOf('tn')||800);
  const y=t.map(v=>{try{return complexZeta(new Complex(.5,v)).abs();}catch{return null;}});
  graph([{x:t,y,mode:'lines',name:'|ζ(1/2+it)|'}],plotLayout('t','|ζ|','ζ(s), s=1/2+it'));
}
function contourPoints(){
  const x1=numberOf('x1'),x2=numberOf('x2'),y1=numberOf('y1'),y2=numberOf('y2'),n=150,p=[];
  for(let i=0;i<=n;i++)p.push(new Complex(x1+(x2-x1)*i/n,y1));for(let i=1;i<=n;i++)p.push(new Complex(x2,y1+(y2-y1)*i/n));for(let i=1;i<=n;i++)p.push(new Complex(x2-(x2-x1)*i/n,y2));for(let i=1;i<=n;i++)p.push(new Complex(x1,y2-(y2-y1)*i/n));p.push(p[0]);return p;
}
function contourIntegral(){
  const p=contourPoints(),formula=$('qf').value;let total=new Complex();
  for(let i=0;i<p.length-1;i++){try{const a=complexValue(formula,p[i]),b=complexValue(formula,p[i+1]);total=total.add(a.add(b).mul(.5).mul(p[i+1].sub(p[i])));}catch{}}
  return total;
}
function formatComplex(z){return z.re.toPrecision(8)+' '+(z.im>=0?'+':'-')+' '+Math.abs(z.im).toPrecision(8)+'i';}
function drawContour(){const p=contourPoints();graph([{x:p.map(z=>z.re),y:p.map(z=>z.im),mode:'lines+markers',name:'C'}],plotLayout('Re(z)','Im(z)','積分経路 C'));}
function drawPolar(){const a=numberOf('pa'),b=numberOf('pb'),t=values(a,b,1800),x=[],y=[];t.forEach(theta=>{const r=evaluateReal($('rf').value,{theta});x.push(r*Math.cos(theta));y.push(r*Math.sin(theta));});graph([{x,y,mode:'lines'}],plotLayout('x','y','Polar'));}
function drawParam(){const a=numberOf('ta'),b=numberOf('tb'),t=values(a,b,1800),x=t.map(v=>evaluateReal($('px').value,{t:v})),y=t.map(v=>evaluateReal($('py').value,{t:v}));graph([{x,y,mode:'lines'}],plotLayout('x(t)','y(t)','Parametric'));}
function draw(){const mode=$('mode').value;if(mode==='real')drawReal();else if(mode==='special')drawSpecial();else if(mode==='complex')drawComplex();else if(mode==='critical')drawCritical();else if(mode==='contour')drawContour();else if(mode==='polar')drawPolar();else drawParam();}
function switchMode(){
  document.querySelectorAll('.pane').forEach(pane => pane.classList.add('hidden'));
  $( $('mode').value ).classList.remove('hidden');
  draw();
}

rebuildFunctions();
$('draw').onclick = draw;
$('mode').onchange = switchMode;
$('add').onclick = () => {
  functions.push('cos(x)');
  rebuildFunctions();
};
$('spPlot').onclick = drawSpecial;
$('critPlot').onclick = drawCritical;
$('ci').onclick = () => {
  $('cres').innerHTML = '∮ f(z)dz ≈ <b>' + formatComplex(contourIntegral()) + '</b>';
};
$('res').onclick = () => {
  const integral = contourIntegral();
  const residueSum = integral.div(new Complex(0, 2 * PI));
  $('cres').innerHTML = '留数総和 ≈ <b>' + formatComplex(residueSum) + '</b>';
};
document.querySelectorAll('[data-f]').forEach(button => {
  button.onclick = () => {
    $('cf').value = button.dataset.f;
    drawComplex();
  };
});
document.querySelectorAll('[data-q]').forEach(button => {
  button.onclick = () => {
    $('qf').value = button.dataset.q;
    drawContour();
  };
});
$('theme').onclick = () => {
  document.body.classList.toggle('dark');
  draw();
};
window.onload = draw;
