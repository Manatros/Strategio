import * as PIXI from "pixi.js";


export function enableCameraControls(app: PIXI.Application, root: PIXI.Container) {
const state = { dragging: false, last: { x: 0, y: 0 } };


app.stage.eventMode = "static";
app.stage.hitArea = app.screen;


app.stage.on("pointerdown", (e) => {
state.dragging = true; state.last = { x: e.global.x, y: e.global.y };
});
app.stage.on("pointerupoutside", () => (state.dragging = false));
app.stage.on("pointerup", () => (state.dragging = false));
app.stage.on("pointermove", (e) => {
if (!state.dragging) return;
const dx = e.global.x - state.last.x;
const dy = e.global.y - state.last.y;
root.position.x += dx; root.position.y += dy;
state.last = { x: e.global.x, y: e.global.y };
});


// wheel zoom
(app.canvas as HTMLCanvasElement).addEventListener("wheel", (ev) => {
ev.preventDefault();
const s = root.scale.x;
const zoom = ev.deltaY < 0 ? 1.1 : 0.9;
const newS = Math.min(3, Math.max(0.35, s * zoom));


// zoom towards pointer
const rect = (app.canvas as HTMLCanvasElement).getBoundingClientRect();
const px = ev.clientX - rect.left; const py = ev.clientY - rect.top;
const worldBefore = app.stage.toLocal({ x: px, y: py }, root);
root.scale.set(newS);
const worldAfter = app.stage.toLocal({ x: px, y: py }, root);
root.position.x += (worldAfter.x - worldBefore.x) * root.scale.x;
root.position.y += (worldAfter.y - worldBefore.y) * root.scale.y;
}, { passive: false });
}
