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

  constructor(opts: ButtonOptions) {
    super();

    const w = opts.width ?? 280;
    const h = opts.height ?? 56;

    this.bg = new Graphics()
      .roundRect(-w/2, -h/2, w, h, 14)
      .fill({ color: 0x1c2333 })
      .stroke({ color: 0x2e3a55, width: 2 });
    this.addChild(this.bg);

    this.lbl = new Text({
      text: opts.label,
      style: {
        fill: 0xE6EDF7,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
        fontSize: 22,
        fontWeight: '600',
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
  }

  private hover(on: boolean) {
    this.bg.tint = on ? 0x29344c : 0xffffff;
  }

  private press(down: boolean) {
    this.scale.set(down ? 0.98 : 1);
    this.bg.tint = down ? 0x364869 : 0xffffff;
  }
}
