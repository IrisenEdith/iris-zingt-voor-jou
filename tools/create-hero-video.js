const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.join(__dirname, "..");
const outFile = path.join(root, "assets", "iris-malta-motion.webm");
const candidates = [
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
  process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
].filter(Boolean);

const browserPath = candidates.find((file) => fs.existsSync(file));
if (!browserPath) {
  console.error("No Chromium browser found for video generation.");
  process.exit(1);
}

const page = `<!doctype html>
<html>
<body>
<canvas id="c" width="1280" height="720"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
let frame = 0;
function lerp(a,b,t){ return a+(b-a)*t; }
function color(a,b,t){ return 'rgb('+[0,1,2].map(i=>Math.round(lerp(a[i],b[i],t))).join(',')+')'; }
function draw(){
  const t = frame / 180;
  const g = ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0, color([38,45,94],[255,246,219],Math.sin(t)*0.08+0.08));
  g.addColorStop(.42, color([239,137,104],[244,198,122],Math.sin(t+1)*0.08+0.18));
  g.addColorStop(1, color([35,113,143],[103,188,199],Math.sin(t+2)*0.08+0.18));
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);
  const sunX = W * (.46 + Math.sin(t*.7)*.025);
  const sunY = H * (.42 + Math.cos(t*.6)*.018);
  const sun = ctx.createRadialGradient(sunX,sunY,10,sunX,sunY,W*.34);
  sun.addColorStop(0,'rgba(255,240,180,.88)');
  sun.addColorStop(.48,'rgba(255,188,116,.28)');
  sun.addColorStop(1,'rgba(255,188,116,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0,0,W,H);
  ctx.globalAlpha = .28;
  for(let i=0;i<7;i++){
    ctx.beginPath();
    ctx.strokeStyle = 'hsla('+(205+i*26)+',82%,78%,.42)';
    ctx.lineWidth = 10 - i;
    for(let x=-60;x<W+60;x+=20){
      const y = H*.63 + i*22 + Math.sin(x*.013 + t*2.8 + i)*12;
      if(x === -60) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = .2;
  for(let i=0;i<6;i++){
    ctx.strokeStyle = 'hsla('+(20+i*44)+',85%,78%,.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(W*(.66+i*.038), H*(.34+i*.018), 120+i*34+Math.sin(t+i)*8, Math.PI*.15, Math.PI*1.15);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(38,27,20,.4)';
  ctx.beginPath();
  ctx.moveTo(0,H*.82);
  for(let x=0;x<=W;x+=80){
    ctx.lineTo(x,H*(.78 + Math.sin(x*.018+t)*.022));
  }
  ctx.lineTo(W,H);
  ctx.lineTo(0,H);
  ctx.closePath();
  ctx.fill();
  frame++;
  requestAnimationFrame(draw);
}
draw();
const stream = canvas.captureStream(30);
const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 2400000 });
const chunks = [];
recorder.ondataavailable = e => chunks.push(e.data);
recorder.onstop = async () => {
  const blob = new Blob(chunks, { type: 'video/webm' });
  await fetch('/upload', { method: 'POST', body: blob });
  document.body.textContent = 'done';
};
recorder.start();
setTimeout(() => recorder.stop(), 6200);
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/upload") {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      fs.writeFileSync(outFile, Buffer.concat(chunks));
      res.end("ok");
      server.close();
      if (browserProcess) browserProcess.kill();
    });
    return;
  }
  res.setHeader("content-type", "text/html");
  res.end(page);
});

let browserProcess;

server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  const userData = path.join(os.tmpdir(), "iris-hero-video-profile");
  fs.mkdirSync(userData, { recursive: true });
  browserProcess = spawn(browserPath, [
    "--headless=new",
    "--autoplay-policy=no-user-gesture-required",
    "--disable-gpu",
    "--no-first-run",
    "--mute-audio",
    `--user-data-dir=${userData}`,
    `http://127.0.0.1:${port}/`,
  ], { stdio: "ignore" });
  browserProcess.on("exit", () => {
    if (!fs.existsSync(outFile)) process.exit(1);
  });
});

setTimeout(() => {
  if (!fs.existsSync(outFile)) {
    console.error("Timed out generating video.");
    process.exit(1);
  }
}, 20000);
