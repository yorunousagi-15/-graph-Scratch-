const canvas = document.getElementById("graph");
const context = canvas.getContext("2d");
const mode = document.getElementById("mode");

const panels = {
  function: document.getElementById("functionPanel"),
  polar: document.getElementById("polarPanel"),
  parametric: document.getElementById("parametricPanel"),
  implicit: document.getElementById("implicitPanel"),
  complex: document.getElementById("complexPanel"),
  special: document.getElementById("specialPanel")
};

function number(id, fallback) {
  const value = Number(document.getElementById(id).value);
  return Number.isFinite(value) ? value : fallback;
}

function values(start, end, count) {
  return Array.from({length: count + 1}, (_, i) =>
    start + (end - start) * i / count
  );
}

function palette() {
  const dark = document.body.classList.contains("dark");
  return {
    background: dark ? "#0d131d" : "#fff",
    grid: dark ? "#273345" : "#e3e8ef",
    axis: dark ? "#8794a8" : "#68758a",
    lines: dark
      ? ["#79b8ff", "#ff9f80", "#9ee493", "#d5a6ff"]
      : ["#175ddc", "#d85b32", "#278447", "#8b45b5"]
  };
}

function resizeCanvas() {
  const ratio = devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw();
}

function niceStep(value) {
  const power = 10 ** Math.floor(Math.log10(value));
  const n = value / power;
  if (n < 1.5) return power;
  if (n < 3) return 2 * power;
  if (n < 7) return 5 * power;
  return 10 * power;
}

function toCanvas(x, y, xMin, xMax, yMin, yMax) {
  return {
    x: (x - xMin) / (xMax - xMin) * canvas.clientWidth,
    y: canvas.clientHeight - (y - yMin) / (yMax - yMin) * canvas.clientHeight
  };
}

function grid(xMin, xMax, yMin, yMax) {
  const colors = palette();
  context.fillStyle = colors.background;
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  context.strokeStyle = colors.grid;
  context.lineWidth = 1;

  const xs = niceStep((xMax - xMin) / 10);
  const ys = niceStep((yMax - yMin) / 8);

  for (let x = Math.ceil(xMin / xs) * xs; x <= xMax; x += xs) {
    const p = toCanvas(x, 0, xMin, xMax, yMin, yMax);
    context.beginPath(); context.moveTo(p.x, 0);
    context.lineTo(p.x, canvas.clientHeight); context.stroke();
  }

  for (let y = Math.ceil(yMin / ys) * ys; y <= yMax; y += ys) {
    const p = toCanvas(0, y, xMin, xMax, yMin, yMax);
    context.beginPath(); context.moveTo(0, p.y);
    context.lineTo(canvas.clientWidth, p.y); context.stroke();
  }

  context.strokeStyle = colors.axis;
  context.lineWidth = 1.5;

  if (xMin <= 0 && xMax >= 0) {
    const p = toCanvas(0, 0, xMin, xMax, yMin, yMax);
    context.beginPath(); context.moveTo(p.x, 0);
    context.lineTo(p.x, canvas.clientHeight); context.stroke();
  }

  if (yMin <= 0 && yMax >= 0) {
    const p = toCanvas(0, 0, xMin, xMax, yMin, yMax);
    context.beginPath(); context.moveTo(0, p.y);
    context.lineTo(canvas.clientWidth, p.y); context.stroke();
  }
}

function drawFunction() {
  const xMin = number("xmin", -10);
  const xMax = number("xmax", 10);
  grid(xMin, xMax, -10, 10);

  document.querySelectorAll(".functionInput").forEach((input, index) => {
    const color = palette().lines[index % palette().lines.length];
    const xs = values(xMin, xMax, 2500);

    context.strokeStyle = color;
    context.lineWidth = 2;
    context.beginPath();

    let previous = null;

    for (const x of xs) {
      const y = evaluateExpression(input.value, {x});

      if (!Number.isFinite(y) || Math.abs(y) > 1e7) {
        previous = null;
        continue;
      }

      const point = toCanvas(x, y, xMin, xMax, -10, 10);

      if (!previous || Math.abs(point.y - previous.y) > canvas.clientHeight * .8) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }

      previous = point;
    }

    context.stroke();
  });
}

function drawPointSet(points) {
  const valid = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (!valid.length) return;

  let xMin = Math.min(...valid.map(p => p.x));
  let xMax = Math.max(...valid.map(p => p.x));
  let yMin = Math.min(...valid.map(p => p.y));
  let yMax = Math.max(...valid.map(p => p.y));

  if (xMin === xMax) { xMin--; xMax++; }
  if (yMin === yMax) { yMin--; yMax++; }

  const xp = (xMax - xMin) * .08;
  const yp = (yMax - yMin) * .08;
  xMin -= xp; xMax += xp; yMin -= yp; yMax += yp;

  grid(xMin, xMax, yMin, yMax);
  context.strokeStyle = palette().lines[0];
  context.lineWidth = 2;
  context.beginPath();

  let previous = null;
  for (const point of valid) {
    const q = toCanvas(point.x, point.y, xMin, xMax, yMin, yMax);
    if (!previous || Math.hypot(q.x - previous.x, q.y - previous.y) > canvas.clientWidth * .2)
      context.moveTo(q.x, q.y);
    else
      context.lineTo(q.x, q.y);
    previous = q;
  }
  context.stroke();
}

function drawPolar() {
  const start = number("thetaMin", 0);
  const end = number("thetaMax", 2 * Math.PI);
  const expression = document.getElementById("polarFunction").value;

  drawPointSet(values(start, end, 3000).map(theta => {
    const radius = evaluateExpression(expression, {theta});
    return {x: radius * Math.cos(theta), y: radius * Math.sin(theta)};
  }));
}

function drawParametric() {
  const start = number("paramMin", 0);
  const end = number("paramMax", 2 * Math.PI);
  const xExpression = document.getElementById("paramX").value;
  const yExpression = document.getElementById("paramY").value;

  drawPointSet(values(start, end, 3000).map(t => ({
    x: evaluateExpression(xExpression, {t}),
    y: evaluateExpression(yExpression, {t})
  })));
}

function drawImplicit() {
  const xMin = number("implicitXMin", -5);
  const xMax = number("implicitXMax", 5);
  const yMin = number("implicitYMin", -5);
  const yMax = number("implicitYMax", 5);
  const expression = document.getElementById("implicitFunction").value;

  grid(xMin, xMax, yMin, yMax);
  context.fillStyle = palette().lines[0];

  const size = 180;
  const dx = (xMax - xMin) / size;
  const dy = (yMax - yMin) / size;

  for (let ix = 0; ix < size; ix++) {
    for (let iy = 0; iy < size; iy++) {
      const x = xMin + ix * dx;
      const y = yMin + iy * dy;
      const a = evaluateExpression(expression, {x, y});
      const b = evaluateExpression(expression, {x: x + dx, y});
      const c = evaluateExpression(expression, {x, y: y + dy});

      if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) continue;

      if (a * b <= 0 || a * c <= 0) {
        const p = toCanvas(x, y, xMin, xMax, yMin, yMax);
        context.fillRect(p.x, p.y, 2, 2);
      }
    }
  }
}

function drawSpecial() {
  const start = number("specialMin", -5);
  const end = number("specialMax", 10);
  const name = document.getElementById("specialFunction").value;

  const points = values(start, end, 1800).map(x => {
    let y;
    if (name === "gamma") y = gamma(x);
    if (name === "zeta") y = zetaReal(x);
    if (name === "erf") y = erf(x);
    if (name === "j0") y = besselJ0(x);
    if (name === "j1") y = besselJ1(x);
    if (name === "sinc") y = x === 0 ? 1 : Math.sin(x) / x;
    if (name === "loggamma") {
      const g = gamma(x);
      y = g > 0 ? Math.log(g) : NaN;
    }
    return {x, y};
  });

  drawPointSet(points);
}

function drawComplex() {
  const xMin = number("complexXMin", -3);
  const xMax = number("complexXMax", 3);
  const yMin = number("complexYMin", -3);
  const yMax = number("complexYMax", 3);
  const expression = document.getElementById("complexFunction").value;
  const view = document.getElementById("complexView").value;

  grid(xMin, xMax, yMin, yMax);

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const image = context.createImageData(width, height);

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const real = xMin + px / width * (xMax - xMin);
      const imag = yMax - py / height * (yMax - yMin);
      const value = complexValue(expression, real, imag);

      let amount;
      if (view === "magnitude") amount = Math.log1p(Math.hypot(value.re, value.im));
      if (view === "real") amount = value.re;
      if (view === "imag") amount = value.im;
      if (view === "phase") amount = Math.atan2(value.im, value.re);

      if (!Number.isFinite(amount)) continue;

      const n = .5 + Math.atan(amount) / Math.PI;
      const i = (py * width + px) * 4;
      image.data[i] = 50 + 180 * n;
      image.data[i + 1] = 80 + 130 * (1 - n);
      image.data[i + 2] = 210;
      image.data[i + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
}

function complexValue(expression, real, imag) {
  if (expression === "z") return {re: real, im: imag};

  if (expression === "z^2")
    return {re: real * real - imag * imag, im: 2 * real * imag};

  if (expression === "z^3")
    return complexMultiply(complexValue("z^2", real, imag), {re: real, im: imag});

  if (expression === "1/z") {
    const d = real * real + imag * imag;
    return {re: real / d, im: -imag / d};
  }

  if (expression === "exp(z)") {
    const a = Math.exp(real);
    return {re: a * Math.cos(imag), im: a * Math.sin(imag)};
  }

  if (expression === "sin(z)")
    return {re: Math.sin(real) * Math.cosh(imag), im: Math.cos(real) * Math.sinh(imag)};

  if (expression === "cos(z)")
    return {re: Math.cos(real) * Math.cosh(imag), im: -Math.sin(real) * Math.sinh(imag)};

  return {re: real, im: imag};
}

function complexMultiply(a, b) {
  return {re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re};
}

function draw() {
  const selected = mode.value;
  if (selected === "function") drawFunction();
  if (selected === "polar") drawPolar();
  if (selected === "parametric") drawParametric();
  if (selected === "implicit") drawImplicit();
  if (selected === "complex") drawComplex();
  if (selected === "special") drawSpecial();
}

function updatePanels() {
  Object.values(panels).forEach(panel => panel.classList.add("hidden"));
  panels[mode.value].classList.remove("hidden");
  draw();
}

function addFunction(expression) {
  const row = document.createElement("div");
  row.className = "fn-row";

  const input = document.createElement("input");
  input.className = "functionInput";
  input.value = expression;

  const remove = document.createElement("button");
  remove.textContent = "×";
  remove.onclick = () => { row.remove(); draw(); };

  input.oninput = draw;
  row.append(input, remove);
  document.getElementById("functionList").appendChild(row);
}

document.getElementById("addFunction").onclick = () => addFunction("cos(x)");
document.getElementById("draw").onclick = draw;
document.getElementById("clear").onclick = () => {
  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
};
mode.onchange = updatePanels;

document.querySelectorAll("[data-function]").forEach(button => {
  button.onclick = () => {
    mode.value = "function";
    updatePanels();
    document.querySelector(".functionInput").value = button.dataset.function;
    draw();
  };
});

document.getElementById("theme").onclick = () => {
  document.body.classList.toggle("dark");
  draw();
};

window.addEventListener("resize", resizeCanvas);

addFunction("sin(x)");
addFunction("x^2 / 10");
resizeCanvas();
