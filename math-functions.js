// 基本の数値計算は JavaScript の Math を使う。外部の計算ライブラリには頼らない。
const PI = Math.PI;
const realNames = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, sqrt: Math.sqrt, abs: Math.abs,
  exp: Math.exp, log: Math.log, log10: Math.log10, floor: Math.floor, ceil: Math.ceil,
  round: Math.round, sign: Math.sign, pow: Math.pow
};

function evaluateReal(source, vars = {}) {
  let expression = source.trim().replaceAll('π', 'pi').replaceAll('^', '**');
  expression = expression.replace(/\bpi\b/gi, 'PI');
  const names = Object.keys(realNames);
  const values = names.map(name => realNames[name]);
  const body = '"use strict"; return (' + expression + ');';
  return Function(...names, 'PI', ...Object.keys(vars), body)(...values, PI, ...Object.values(vars));
}

function gammaReal(z) {
  const coefficients = [676.5203681218851, -1259.1392167224028, 771.3234287776531,
    -176.6150291621406, 12.5073432786869, -0.13857109526572, 9.98436957801957e-6, 1.505632735149312e-7];
  if (z < 0.5) return PI / (Math.sin(PI * z) * gammaReal(1 - z));
  z -= 1;
  let sum = 0.9999999999998099;
  coefficients.forEach((c, i) => sum += c / (z + i + 1));
  const t = z + coefficients.length - 0.5;
  return Math.sqrt(2 * PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * sum;
}

function zetaReal(s, terms = 900) {
  if (s === 1) return Infinity;
  let eta = 0;
  for (let n = 1; n <= terms; n++) eta += (n % 2 ? 1 : -1) / Math.pow(n, s);
  return eta / (1 - Math.pow(2, 1 - s));
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function besselJ0(x) {
  let sum = 0;
  let term = 1;
  for (let k = 0; k < 40; k++) { if (k) term *= -x * x / (4 * k * k); sum += term; }
  return sum;
}

function specialValue(name, x) {
  if (name === 'gamma') return gammaReal(x);
  if (name === 'zeta') return zetaReal(x);
  if (name === 'erf') return erf(x);
  if (name === 'sinc') return x === 0 ? 1 : Math.sin(x) / x;
  if (name === 'loggamma') return Math.log(Math.abs(gammaReal(x)));
  if (name === 'besselJ') return besselJ0(x);
  if (name === 'digamma') return numericalDerivative(v => Math.log(Math.abs(gammaReal(v))), x);
  if (name === 'polygamma') return numericalSecondDerivative(v => Math.log(Math.abs(gammaReal(v))), x);
}

function numericalDerivative(fn, x) { const h = Math.max(1e-5, Math.abs(x) * 1e-5); return (fn(x + h) - fn(x - h)) / (2 * h); }
function numericalSecondDerivative(fn, x) { const h = Math.max(1e-4, Math.abs(x) * 1e-4); return (fn(x + h) - 2 * fn(x) + fn(x - h)) / (h * h); }
