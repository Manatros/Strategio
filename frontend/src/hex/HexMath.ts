export const SQRT3 = Math.sqrt(3);


export function hexToPixel(q: number, r: number, size: number) {
const x = size * SQRT3 * (q + r / 2);
const y = size * 1.5 * r;
return { x, y };
}


export function cubeRound(x: number, y: number, z: number) {
let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
const xDiff = Math.abs(rx - x), yDiff = Math.abs(ry - y), zDiff = Math.abs(rz - z);
if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz; else if (yDiff > zDiff) ry = -rx - rz; else rz = -rx - ry;
return { x: rx, y: ry, z: rz };
}


// Pixel -> axial (for picking)
export function pixelToAxial(px: number, py: number, size: number) {
const q = (SQRT3 / 3 * px - 1 / 3 * py) / size;
const r = (2 / 3 * py) / size;
const cube = cubeRound(q, -q - r, r);
return { q: cube.x, r: cube.z };
}
