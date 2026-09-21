// 複素数は小さな自作クラスで扱う。計算の流れが追いやすいようにしている。
class Complex {
  constructor(re = 0, im = 0) { this.re = re; this.im = im; }
  add(z) { z = C(z); return new Complex(this.re + z.re, this.im + z.im); }
  sub(z) { z = C(z); return new Complex(this.re - z.re, this.im - z.im); }
  mul(z) { z = C(z); return new Complex(this.re*z.re - this.im*z.im, this.re*z.im + this.im*z.re); }
  div(z) { z = C(z); const d = z.re*z.re + z.im*z.im; return new Complex((this.re*z.re+this.im*z.im)/d, (this.im*z.re-this.re*z.im)/d); }
  abs() { return Math.hypot(this.re, this.im); }
  exp() { const e = Math.exp(this.re); return new Complex(e*Math.cos(this.im), e*Math.sin(this.im)); }
  pow(z) { z=C(z); return this.log().mul(z).exp(); }
  log() { return new Complex(Math.log(this.abs()), Math.atan2(this.im,this.re)); }
}
function C(z) { return z instanceof Complex ? z : new Complex(z, 0); }
function complexGamma(z) {
  if (z.re < 0.5) return new Complex(PI,0).div(new Complex(PI,0).mul(z).sin().mul(complexGamma(new Complex(1-z.re,-z.im))));
  const p=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.5073432786869,-0.13857109526572,9.98436957801957e-6,1.505632735149312e-7];
  const a=z.sub(1); let x=new Complex(0.9999999999998099,0); p.forEach((v,i)=>{ x=x.add(new Complex(v,0).div(a.add(i+1))); });
  const t=a.add(7.5); return new Complex(Math.sqrt(2*PI),0).mul(t.pow(a.add(0.5))).mul(t.mul(-1).exp()).mul(x);
}
Complex.prototype.sin=function(){return new Complex(Math.sin(this.re)*Math.cosh(this.im),Math.cos(this.re)*Math.sinh(this.im));};
function complexZeta(s, terms=700) {
  let eta=new Complex();
  for(let n=1;n<=terms;n++){ const term=new Complex(n,0).log().mul(s).mul(-1).exp(); eta=eta.add(n%2?term:term.mul(-1)); }
  return eta.div(new Complex(1,0).sub(new Complex(2,0).pow(new Complex(1,0).sub(s))));
}
function complexValue(expression,z){
  expression=expression.trim().replaceAll('ζ','zeta').replaceAll('Γ','gamma');
  if(expression==='gamma'||expression==='gamma(z)') return complexGamma(z);
  if(expression==='zeta'||expression==='zeta(z)') return complexZeta(z);
  if(expression==='1/z') return new Complex(1,0).div(z);
  if(expression==='exp(z)') return z.exp();
  if(expression==='z') return z;
  throw new Error('複素平面では Γ(z), ζ(z), 1/z, exp(z) などを使えます');
}
