import * as PIXI from "pixi.js";
import type { MapConfig, Tile } from "./types";
import { generateMap, key } from "./MapData";
import { TileRenderer } from "./TileRenderer";
import { pixelToAxial } from "./HexMath";


export class MapView {
app!: PIXI.Application;
container = new PIXI.Container();
tilesLayer = new PIXI.Container();
overlayLayer = new PIXI.Container();
selection: PIXI.Graphics;
cfg: MapConfig;
tiles: Map<string, Tile>;
tr: TileRenderer;


constructor(cfg: MapConfig) {
this.cfg = cfg;
this.tr = new TileRenderer(cfg.hexSize);
this.tiles = generateMap(cfg);
this.selection = this.tr.makeSelection();
this.overlayLayer.addChild(this.selection);
this.container.addChild(this.tilesLayer, this.overlayLayer);
}


async initApp(mount: HTMLElement) {
this.app = new PIXI.Application();
await this.app.init({ resizeTo: mount, background: "#0f1115", antialias: true });


const wrapper = document.createElement("div");
wrapper.className = "canvas-wrap";
mount.appendChild(wrapper);
wrapper.appendChild(this.app.canvas);


this.app.stage.addChild(this.container);
this.container.position.set(this.app.renderer.width / 2, this.app.renderer.height / 2);
this.container.scale.set(1);


this.renderTiles();
this.enablePicking();
this.tilesLayer.on("pointermove", (e) => {
  const world = e.getLocalPosition(this.container);
  const axial = pixelToAxial(world.x, world.y, this.cfg.hexSize);
  const t = this.tiles.get(key(axial.q, axial.r));
  if (!t) return;
  this.app.renderer.events.cursor = "pointer";
  // quick tooltip in title for now
  (this.app.canvas as HTMLCanvasElement).title =
    `(${t.q},${t.r}) • ${t.type}
}


renderTiles() {
this.tilesLayer.removeChildren();
for (const t of this.tiles.values()) {
const g = this.tr.makeTileGfx(t);
this.tilesLayer.addChild(g);
}
}


centerOn(q: number, r: number) {
// optional: animate later
const { width, height } = this.app.renderer;
this.container.position.set(width / 2, height / 2);
}


enablePicking() {
this.tilesLayer.eventMode = "static";
this.tilesLayer.on("pointertap", (e: PIXI.FederatedPointerEvent) => {
const world = e.getLocalPosition(this.container);
const axial = pixelToAxial(world.x, world.y, this.cfg.hexSize);
const t = this.tiles.get(key(axial.q, axial.r));
if (!t) return;
const target = this.tilesLayer.children.find((c: any) => (c as any).__tile?.q === t.q && (c as any).__tile?.r === t.r) as PIXI.Graphics | undefined;
if (!target) return;
this.selection.visible = true;
this.selection.position.copyFrom(target.position);
});
}
}
