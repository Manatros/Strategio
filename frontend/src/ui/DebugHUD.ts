import * as PIXI from "pixi.js";


export function attachHUD(mount: HTMLElement, app: PIXI.Application, root: PIXI.Container) {
const el = document.createElement("div");
el.className = "hud";
el.innerHTML = `<div class="row">
<span class="badge">WASD / Drag</span>
<span class="badge">Wheel = Zoom</span>
</div>
<div id="stats"></div>`;
mount.querySelector(".canvas-wrap")?.appendChild(el);


const stats = el.querySelector("#stats")! as HTMLDivElement;
let last = performance.now(), frames = 0;
app.ticker.add(() => {
frames++;
const now = performance.now();
if (now - last > 500) {
const fps = Math.round((frames * 1000) / (now - last));
frames = 0; last = now;
stats.textContent = `FPS: ${fps} | Scale: ${root.scale.x.toFixed(2)} | Pos: ${root.position.x.toFixed(0)}, ${root.position.y.toFixed(0)}`;
}
});
}
