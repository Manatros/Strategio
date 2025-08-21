export class RNG {
private seed: number;
constructor(seed = 123456789) { this.seed = seed >>> 0; }
next(): number { // xorshift32
let x = this.seed;
x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
this.seed = x >>> 0;
return (this.seed & 0xffffffff) / 0x100000000;
}
range(min: number, max: number): number { return min + (max - min) * this.next(); }
}
