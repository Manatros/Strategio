import type { MapConfig, Tile, TileType } from "./types";
import { ValueNoise2D } from "../core/valueNoise";

function chooseType(e: number, m: number): TileType {
  // e ∈ [-1..1] after masking, m ∈ [-1..1]
  if (e < -0.25) return "water";
  if (e > 0.72) return m < -0.15 ? "stone" : "snow";
  if (m > 0.35) return "forest";
  if (m < -0.25) return "stone";
  return Math.random() < 0.25 ? "field" : "grass";
}

export function generateMap(cfg: MapConfig) {
  const tiles: Map<string, Tile> = new Map();
  const elev = new ValueNoise2D(cfg.seed, 256, 256);
  const moist = new ValueNoise2D(cfg.seed ^ 0x9e3779b9, 256, 256);

  // helper for radial falloff (islandy continents)
  const maxR = cfg.radius;
  const islandFalloff = (q: number, r: number) => {
    const d = (Math.abs(q) + Math.abs(r) + Math.abs(-q - r)) / 2; // hex distance
    const t = d / maxR;                  // 0 center … 1 edge
    // push edges down; tweak 1.4 for more land, 1.7 for more water
    return 1.0 - Math.pow(t, 1.4);
  };

  for (let q = -cfg.radius; q <= cfg.radius; q++) {
    for (let r = -cfg.radius; r <= cfg.radius; r++) {
      if (Math.abs(q + r) > cfg.radius) continue;

      // smoother, larger features
      const eBase = elev.sample(q, r, 0.045, 4, 0.55); // [-1..1]
      const mask  = islandFalloff(q, r);               // [0..1]
      const e = eBase * 0.75 + (mask * 2 - 1) * 0.65;  // combine & center-bias

      const m = moist.sample(q + 100, r - 50, 0.07, 4, 0.55);
      const type = chooseType(e, m);

      const resource =
        type === "forest" || type === "field" || type === "stone" || type === "water"
          ? Math.floor(30 + (e + 1) * 35)
          : 0;

      tiles.set(`${q},${r}`, { q, r, type, elevation: e, resource });
    }
  }
  return tiles;
}

