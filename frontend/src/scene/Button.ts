// src/ui/Button.ts
import { Container, Graphics, Text } from 'pixi.js';

export type ButtonOptions = {
  label: string;
  width?: number;
  height?: number;
  onPress?: () => void;
};

export class Button extends Container {
  private bg: Graphics;
  private lbl: Text;
  private _w: number;
  private _h: number;

  constructor(opts: ButtonOptions) {
    super();
    this._w = opts.width ?? 280;
    this._h = opts.height ?? 56;

    this.bg = new Graphics();
    this.addChild(this.bg);

    this.lbl = new Text({
      text: opts.label,
      style: {
        fill: 0xE6EDF7,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
        fontSize: 22,
        fontWeight: '700',
        align: 'center',
      },
    });
    this.lbl.anchor.set(0.5);
    this.addChild(this.lbl);

    this.eventMode = 'static';
    this.cursor = 'pointer';

    this.on('pointerover', () => this.hover(true));
    this.on('pointerout', () => this.hover(false));
    this.on('pointerdown', () => this.press(true));
    this.on('pointerup', () => { this.press(false); opts.onPress?.(); });
    this.on('pointerupoutside', () => this.press(false));

    this.redraw();
  }

  setSize(w: number, h: number) {
    this._w = w;
    this._h = h;
    this.redraw();
  }

  private redraw() {
    const w = this._w, h = this._h;
    this.bg.clear()
      .roundRect(-w / 2, -h / 2, w, h, Math.min(16, h * 0.28))
      .fill({ color: 0x1c2333 })
      .stroke({ color: 0x2e3a55, width: Math.max(2, h * 0.05) });
    (this.lbl.style as any).fontSize = clamp(Math.floor(h * 0.42), 14, 28);
    this.lbl.position.set(0, 0);
  }

  private hover(on: boolean) {
    this.bg.tint = on ? 0x29344c : 0xffffff;
  }
  private press(down: boolean) {
    this.scale.set(down ? 0.98 : 1);
    this.bg.tint = down ? 0x364869 : 0xffffff;
  }
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
