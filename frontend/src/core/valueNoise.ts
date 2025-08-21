import { RNG } from "./rng";


export class ValueNoise2D {
private grid: number[][] = [];
private w: number; private h: number;
constructor(private seed = 1337, w = 256, h = 256) {
const r = new RNG(seed);
this.w = w; this.h = h;
this.grid = Array.from({ length: h }, () => Array.from({ length: w }, () => r.next()));
}
private lerp(a: number, b: number, t: number) { return a + (b - a) * (t * t * (3 - 2 * t)); }
sample(x: number, y: number, freq = 0.05, octaves = 3, falloff = 0.5): number {
let amp = 1, f = freq, sum = 0, norm = 0;
for (let o = 0; o < octaves; o++) {
sum += amp * this.raw(x * f, y * f);
norm += amp; amp *= falloff; f *= 2;
}
return sum / norm * 2 - 1; // [-1..1]
}
private raw(x: number, y: number): number {
const xi = Math.floor(x), yi = Math.floor(y);
const tx = x - xi, ty = y - yi;
const x0 = ((xi % this.w) + this.w) % this.w;
const y0 = ((yi % this.h) + this.h) % this.h;
const x1 = (x0 + 1) % this.w; const y1 = (y0 + 1) % this.h;
const g00 = this.grid[y0][x0], g10 = this.grid[y0][x1];
const g01 = this.grid[y1][x0], g11 = this.grid[y1][x1];
const a = this.lerp(g00, g10, tx); const b = this.lerp(g01, g11, tx);
return this.lerp(a, b, ty);
}
}
