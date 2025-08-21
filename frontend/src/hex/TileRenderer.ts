import * as PIXI from "pixi.js";
import type { Tile, TileType } from "./types";
import { hexToPixel } from "./HexMath";

const COLORS: Record<TileType, number> = {
  grass: 0x4aa64a,
  stone: 0x8a8a8a,
  water: 0x2e5aac,
  field: 0xd5b87a,
  snow: 0xeef3ff,
  forest: 0x1e4a23,
  bridge: 0x7a5538,
};

const OUTLINE = 0x000000;

function jitterColor(base: number, factor: number): number {
  const r = Math.min(255, Math.max(0, Math.floor(((base >> 16) & 0xff) * factor)));
  const g = Math.min(255, Math.max(0, Math.floor(((base >> 8) & 0xff) * factor)));
  const b = Math.min(255, Math.max(0, Math.floor((base & 0xff) * factor)));
  return (r << 16) | (g << 8) | b;
}

export class TileRenderer {
  constructor(private size: number) {}

  makeTileGfx(tile: Tile): PIXI.Graphics {
    const g = new PIXI.Graphics();
    g.eventMode = "static";
    g.cursor = "pointer";

    const { x, y } = hexToPixel(tile.q, tile.r, this.size);
    g.position.set(x, y);

    // Slight per‑tile brightness variance so neighbors pop a bit
    const hash = ((tile.q * 1315423911) ^ (tile.r * 2654435761)) >>> 0;
    const factor = 0.92 + (hash % 12) / 100; // 0.92 .. 1.03
    const baseColor = COLORS[tile.type];
    const color = jitterColor(baseColor, factor);

    this.drawHexPath(g);
    g.fill({ color, alpha: 1 });            // Pixi v8: fill() instead of beginFill/endFill
    g.stroke({ color: OUTLINE, width: 1.5, alpha: 0.65 });

    (g as any).__tile = tile;               // keep a reference for picking
    return g;
  }

  makeSelection(): PIXI.Graphics {
    const h = new PIXI.Graphics();
    this.drawHexPath(h);
    h.stroke({ color: 0xffffff, width: 3, alpha: 0.9 });
    h.visible = false;
    return h;
  }

  private drawHexPath(g: PIXI.Graphics) {
    const s = this.size;
    const deg = Math.PI / 180;
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (60 * i - 30) * deg; // pointy‑top
      const px = s * Math.cos(a);
      const py = s * Math.sin(a);
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
  }
}
