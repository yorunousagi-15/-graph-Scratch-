const $=id=>document.getElementById(id);let fs=["sin(x)","x^2/10"];
function rebuild(){const b=$("fns");b.innerHTML="";fs.forEach((f,i)=>{let r=document.createElement("div");r.className="fnrow";r.innerHTML='<span class="dot"></span><input class="f"><button class="del">×</button>';r.querySelector(".f").value=f;r.querySelector(".del").onclick=()=>{fs.splice(i,1);rebuild()};b.appendChild(r)})}rebuild();
function seq(a,b,n){return Array.from({length:n+1},(_,i)=>a+(b-a)*i/n)}function V(s,o={}){return Number(math.evaluate(s,o))}
function gamma(z){const p=[676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];if(math.re(z)<.5)return math.divide(Math.PI,math.multiply(math.sin(math.multiply(Math.PI,z)),gamma(math.subtract(1,z))));let a=math.subtract(z,1),x=math.complex(.9999999999998099,0);p.forEach((v,i)=>x=math.add(x,math.divide(v,math.add(a,i+1))));let t=math.add(a,7.5);return math.multiply(Math.sqrt(2*Math.PI),math.multiply(math.pow(t,math.add(a,.5)),math.multiply(math.exp(math.unaryMinus(t)),x)))}
function zeta(s,N=500){let e=math.complex(0,0);for(let n=1;n<=N;n++){let q=math.pow(n,math.multiply(-1,s));e=math.add(e,n%2?q:math.multiply(-1,q))}return math.divide(e,math.subtract(1,math.pow(2,math.subtract(1,s))))}
function special(k,x){if(k==="gamma")return gamma(math.complex(x,0));if(k==="zeta")return zeta(math.complex(x,0));if(k==="erf")return math.erf(x);if(k==="sinc")return x===0?1:Math.sin(x)/x;if(k==="loggamma")return math.log(gamma(math.complex(x,0)));if(k==="besselJ"){let s=0;for(let m=0;m<35;m++)s+=(-1)**m*Math.pow(x/2,2*m)/(math.factorial(m)*math.factorial(m));return s}if(k==="digamma"){let h=1e-5;return (Math.log(Math.abs(gamma(math.complex(x+h,0))))-Math.log(Math.abs(gamma(math.complex(x-h,0)))))/(2*h)}if(k==="polygamma"){let h=1e-3;return (Math.log(Math.abs(gamma(math.complex(x+h,0))))-2*Math.log(Math.abs(gamma(math.complex(x,0))))+Math.log(Math.abs(gamma(math.complex(x-h,0)))))/(h*h)}}
function ev(e,z){let q=e.trim().toLowerCase();if(q==="gamma"||q==="gamma(z)")return gamma(z);if(q==="zeta"||q==="ζ(z)")return zeta(z);return math.evaluate(e,{z})}function sc(w,m){let a=math.re(w),b=math.im(w);if(m==="phase")return Math.atan2(b,a);if(m==="re")return a;if(m==="im")return b;return Math.log1p(Math.min(1e8,Math.hypot(a,b)))}
function layout(x,y,t){
  const dark=document.body.classList.contains("dark");
  return{title:t||"",margin:{l:55,r:20,t:42,b:50},paper_bgcolor:dark?"#0d131d":"#fff",plot_bgcolor:dark?"#0d131d":"#fff",font:{color:dark?"#e8edf6":"#172033"},xaxis:{title:x,zeroline:true,gridcolor:dark?"#354052":"#e1e6ee",zerolinecolor:dark?"#8b98aa":"#667085"},yaxis:{title:y,zeroline:true,gridcolor:dark?"#354052":"#e1e6ee",zerolinecolor:dark?"#8b98aa":"#667085"},hovermode:"x unified"}
}
function real(){let a=V($("xmin").value),b=V($("xmax").value),x=seq(a,b,Math.min(10000,+$("samples").value||1800)),tr=[];document.querySelectorAll(".f").forEach(e=>tr.push({x,y:x.map(q=>{try{let y=V(e.value,{x:q});return isFinite(y)?y:null}catch{return null}}),mode:"lines",name:e.value}));Plotly.newPlot("plot",tr,layout("x","y"),{responsive:true,displaylogo:false})}
function specialPlot(){let a=V($("smin").value),b=V($("smax").value),x=seq(a,b,1400),k=$("sf").value,y=x.map(q=>{try{let w=special(k,q);return isFinite(math.re(w))?math.re(w):null}catch{return null}});Plotly.newPlot("plot",[{x,y,mode:"lines",name:$("sf").value}],layout("x","value",$("sf").value),{responsive:true,displaylogo:false})}
function complexPlot(){let xa=V($("cxa").value),xb=V($("cxb").value),ya=V($("cya").value),yb=V($("cyb").value),n=75,x=seq(xa,xb,n),y=seq(ya,yb,n),z=y.map(Y=>x.map(X=>{try{return sc(ev($("cf").value,math.complex(X,Y)),$("cview").value)}catch{return null}}));Plotly.newPlot("plot",[{x,y,z,type:"heatmap"}],{...layout("Re(z)","Im(z)",$("cf").value+" on C"),yaxis:{title:"Im(z)",scaleanchor:"x"}},{responsive:true,displaylogo:false})}
function critical(){let a=V($("tmin").value),b=V($("tmax").value),t=seq(a,b,+$("tn").value||800),y=t.map(q=>{try{return Math.abs(zeta(math.complex(.5,q)))}catch{return null}});Plotly.newPlot("plot",[{x:t,y,mode:"lines",name:"|ζ(1/2+it)|"}],layout("t","|ζ|","ζ(s), s=1/2+it"),{responsive:true,displaylogo:false})}
function pts(){let x1=V($("x1").value),x2=V($("x2").value),y1=V($("y1").value),y2=V($("y2").value),q=150,p=[];for(let i=0;i<=q;i++)p.push(math.complex(x1+(x2-x1)*i/q,y1));for(let i=1;i<=q;i++)p.push(math.complex(x2,y1+(y2-y1)*i/q));for(let i=1;i<=q;i++)p.push(math.complex(x2-(x2-x1)*i/q,y2));for(let i=1;i<=q;i++)p.push(math.complex(x1,y2-(y2-y1)*i/q));p.push(p[0]);return p}
function cint(){let p=pts(),I=math.complex(0,0),e=$("qf").value;for(let i=0;i<p.length-1;i++){try{I=math.add(I,math.multiply(.5,math.add(ev(e,p[i]),ev(e,p[i+1])),math.subtract(p[i+1],p[i])))}catch{}}return I}function fmt(z){return math.re(z).toPrecision(8)+" "+(math.im(z)>=0?"+":"-")+" "+Math.abs(math.im(z)).toPrecision(8)+"i"}
function contour(){let p=pts();Plotly.newPlot("plot",[{x:p.map(z=>math.re(z)),y:p.map(z=>math.im(z)),mode:"lines+markers",name:"C"}],layout("Re(z)","Im(z)","積分経路 C"),{responsive:true,displaylogo:false})}function polar(){let a=V($("pa").value),b=V($("pb").value),t=seq(a,b,1800),x=[],y=[];t.forEach(q=>{let r=V($("rf").value,{theta:q});x.push(r*Math.cos(q));y.push(r*Math.sin(q))});Plotly.newPlot("plot",[{x,y,mode:"lines"}],layout("x","y","Polar"),{responsive:true,displaylogo:false})}function param(){let a=V($("ta").value),b=V($("tb").value),t=seq(a,b,1800),x=t.map(q=>V($("px").value,{t:q})),y=t.map(q=>V($("py").value,{t:q}));Plotly.newPlot("plot",[{x,y,mode:"lines"}],layout("x(t)","y(t)","Parametric"),{responsive:true,displaylogo:false})}
function draw(){let m=$("mode").value;if(m==="real")real();if(m==="special")specialPlot();if(m==="complex")complexPlot();if(m==="critical")critical();if(m==="contour")contour();if(m==="polar")polar();if(m==="param")param()}$("mode").onchange=()=>{document.querySelectorAll(".pane").forEach(x=>x.classList.add("hidden"));$( $("mode").value).classList.remove("hidden");draw()};$("draw").onclick=draw;$("spPlot").onclick=specialPlot;$("critPlot").onclick=critical;$("add").onclick=()=>{fs.push("cos(x)");rebuild()};document.querySelectorAll("[data-f]").forEach(b=>b.onclick=()=>{$("cf").value=b.dataset.f;draw()});document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{$("qf").value=b.dataset.q;draw()});$("ci").onclick=()=>{let I=cint();$("cres").innerHTML="∮ f(z)dz ≈ <b>"+fmt(I)+"</b>"};$("res").onclick=()=>{let I=cint(),R=math.divide(I,math.multiply(2*Math.PI,math.complex(0,1)));$("cres").innerHTML="留数総和 ≈ <b>"+fmt(R)+"</b>"};$("deriv").onclick=()=>{
  try {
    const f=document.querySelector(".f").value.trim();
    const d=math.derivative(f,"x");
    $("analysis").innerHTML="f'(x) = <b>"+d.toString()+"</b>";
  } catch(e) { $("analysis").textContent="微分できません: "+e.message; }
};
function bisect(f,a,b){
  let fa=V(f,{x:a}), fb=V(f,{x:b});
  for(let i=0;i<70;i++){
    const m=(a+b)/2, fm=V(f,{x:m});
    if(!isFinite(fm)) return null;
    if(Math.abs(fm)<1e-10) return m;
    if(fa*fm<=0){b=m;fb=fm;}else{a=m;fa=fm;}
  }
  return (a+b)/2;
}
function findRoots(){
  const f=document.querySelector(".f").value.trim();
  const a=V($("xmin").value), b=V($("xmax").value), n=5000, h=(b-a)/n, roots=[];
  let prevX=a, prevY;
  try{prevY=V(f,{x:a});}catch{prevY=NaN;}
  for(let i=1;i<=n;i++){
    const x=a+i*h; let y;
    try{y=V(f,{x});}catch{y=NaN;}
    if(isFinite(y)){
      if(Math.abs(y)<1e-7) roots.push(x);
      if(isFinite(prevY) && prevY*y<0){const r=bisect(f,prevX,x);if(r!==null)roots.push(r);}
      if(i<n){
        const xm=(prevX+x)/2; let ym;
        try{ym=V(f,{x:xm});}catch{ym=NaN;}
        if(isFinite(prevY)&&isFinite(ym)&&isFinite(y)&&Math.abs(ym)<Math.abs(prevY)&&Math.abs(ym)<Math.abs(y)&&Math.abs(ym)<1e-4){
          const span=x-prevX; const l=xm-span/2, r=xm+span/2;
          try{if(Math.abs(V(f,{x:l}))>Math.abs(ym)&&Math.abs(V(f,{x:r}))>Math.abs(ym)&&Math.abs(ym)<1e-6) roots.push(xm);}catch{}
        }
      }
      prevX=x; prevY=y;
    } else { prevX=x; prevY=NaN; }
  }
  const uniq=roots.sort((u,v)=>u-v).filter((r,i,arr)=>i===0||Math.abs(r-arr[i-1])>1e-5);
  $("analysis").innerHTML=uniq.length?"零点候補: <b>"+uniq.map(r=>r.toPrecision(10)).join(", ")+"</b>":"零点候補が見つかりませんでした。";
}
function integ(ab){let f=document.querySelector(".f").value,a=V($("xmin").value),b=V($("xmax").value),n=4000,h=(b-a)/n,s=0;for(let i=0;i<=n;i++){let y=V(f,{x:a+i*h});if(!isFinite(y))return $("analysis").textContent="評価不能";if(ab)y=Math.abs(y);s+=((i===0||i===n)?.5:1)*y}$("analysis").textContent="積分 ≈ "+(s*h).toPrecision(12)}$("integral").onclick=()=>integ(false);$("absint").onclick=()=>integ(true);$("roots").onclick=findRoots;$("theme").onclick=()=>{document.body.classList.toggle("dark");draw()};window.onload=draw;
