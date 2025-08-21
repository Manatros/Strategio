export type TileType = "grass" | "stone" | "water" | "field" | "snow" | "forest" | "bridge";


export interface Axial { q: number; r: number; }
export interface Tile extends Axial { type: TileType; elevation: number; resource: number; }


export interface MapConfig {
radius: number; // hex radius
hexSize: number; // pixels
seed: number;
}
