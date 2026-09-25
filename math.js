/* MathLab V10: 外部の数学ライブラリを使わない小さな数値計算部です。 */

const MathFunctions = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  exp: Math.exp, log: Math.log, log10: Math.log10, log2: Math.log2,
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
  floor: Math.floor, ceil: Math.ceil, round: Math.round,
  min: Math.min, max: Math.max
};

function gamma(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));

  const coefficients = [
    676.5203681218851, -1259.1392167224028, 771.3234287776531,
    -176.6150291621406, 12.5073432786869, -0.1385710952657201,
    9.98436957801957e-6, 1.505632735149312e-7
  ];

  z -= 1;
  let sum = 0.9999999999998099;
  for (let i = 0; i < coefficients.length; i++) {
    sum += coefficients[i] / (z + i + 1);
  }

  const t = z + 7.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * sum;
}

function factorial(value) {
  if (value < 0 || !Number.isFinite(value)) return NaN;
  if (Math.abs(value - Math.round(value)) < 1e-10) {
    let result = 1;
    for (let i = 2; i <= Math.round(value); i++) result *= i;
    return result;
  }
  return gamma(value + 1);
}

function zetaReal(s) {
  if (s === 1) return Infinity;
  let sum = 0;
  for (let n = 1; n <= 12000; n++) sum += 1 / Math.pow(n, s);
  return sum;
}

function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const q = (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t;
  return sign * (1 - q * Math.exp(-x * x));
}

function besselJ0(x) {
  let sum = 0;
  for (let k = 0; k < 35; k++) {
    sum += Math.pow(-1, k) * Math.pow(x / 2, 2 * k) /
      (factorial(k) * factorial(k));
  }
  return sum;
}

function besselJ1(x) {
  let sum = 0;
  for (let k = 0; k < 35; k++) {
    sum += Math.pow(-1, k) * Math.pow(x / 2, 2 * k + 1) /
      (factorial(k) * factorial(k + 1));
  }
  return sum;
}

function normalizeExpression(expression) {
  return expression
    .replaceAll("π", "pi")
    .replaceAll("√", "sqrt")
    .replaceAll("−", "-")
    .replace(/\bln\b/g, "log")
    .replace(/\^/g, "**");
}

function evaluateExpression(expression, variables = {}) {
  const scope = {
    x: variables.x ?? 0, y: variables.y ?? 0,
    t: variables.t ?? 0, theta: variables.theta ?? 0,
    pi: Math.PI, e: Math.E, factorial, gamma, zeta: zetaReal,
    erf, j0: besselJ0, j1: besselJ1,
    sinc: value => value === 0 ? 1 : Math.sin(value) / value,
    ...MathFunctions
  };

  let text = normalizeExpression(expression);
  text = text.replace(/(\d|\)|x|y|t|theta|pi|e)\s*(?=\()/gi, "$1*");

  try {
    const names = Object.keys(scope);
    return Function(...names, '"use strict"; return (' + text + ');')
      (...Object.values(scope));
  } catch {
    return NaN;
  }
}
