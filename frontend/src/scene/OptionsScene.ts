import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { Graphics, Text } from 'pixi.js';
import { Button } from '../ui/Button';
import { MenuScene } from './MenuScene';

export class OptionsScene extends BaseScene {
  private mgr: SceneManager;
  private volume = 0.5;
  private playerColor = 0xff4444; // default
  private colors: number[] = [
    0xff4444, 0x44ff44, 0x4444ff, 0xffff44,
    0xff44ff, 0x44ffff, 0xff8800, 0x8888ff,
    0x88ff88, 0xff8888, 0xcc44ff, 0x44ccff,
    0x88ffff, 0xffff88, 0xffffff, 0x999999
  ];

  constructor(mgr: SceneManager) {
    super(mgr.application);
    this.mgr = mgr;
  }

  async onEnter() {
    const { screen } = this.app;
    this.root.addChild(new Graphics().rect(0,0,screen.width,screen.height).fill(0x0f1320));

    const title = new Text({ text: 'Options', style: { fill: 0xffffff, fontSize: 36, fontWeight: '700' }});
    title.anchor.set(0.5); title.position.set(screen.width/2, screen.height*0.12);
    this.root.addChild(title);

    /** --- Volume Control --- **/
    const volLabel = new Text({ text: this.volText(), style: { fill: 0x9BB0E3, fontSize: 18 }});
    volLabel.anchor.set(0.5); volLabel.position.set(screen.width/2, screen.height*0.25);
    this.root.addChild(volLabel);
    (this as any)._volLabel = volLabel;

    const minus = new Button({ label: 'Volume -', onPress: () => this.setVol(this.volume - 0.1) });
    const plus  = new Button({ label: 'Volume +', onPress: () => this.setVol(this.volume + 0.1) });
    minus.position.set(screen.width/2 - 150, screen.height*0.3);
    plus.position.set(screen.width/2 + 150, screen.height*0.3);
    this.root.addChild(minus, plus);

    /** --- Player Color Grid --- **/
    const colorTitle = new Text({ text: 'Choose Player Color:', style: { fill: 0xffffff, fontSize: 22 }});
    colorTitle.anchor.set(0.5); colorTitle.position.set(screen.width/2, screen.height*0.42);
    this.root.addChild(colorTitle);

    const cols = 8; // 8x2 grid = 16 colors
    const size = 32;
    const spacing = 40;
    const startX = screen.width/2 - (cols-1)*spacing/2;
    const startY = screen.height*0.5;

    this.colors.forEach((c, i) => {
      const g = new Graphics()
        .rect(-size/2, -size/2, size, size)
        .fill(c)
        .stroke({ color: 0xffffff, width: 2 });
      g.position.set(startX + (i % cols) * spacing, startY + Math.floor(i/cols) * spacing);
      g.eventMode = 'static';
      g.cursor = 'pointer';
      g.on('pointertap', () => this.setColor(c, g));
      this.root.addChild(g);
      if (c === this.playerColor) {
        (this as any)._selected = g;
        g.alpha = 0.7; // mark selected
      }
    });

    /** --- Back button --- **/
    const back = new Button({ label: 'Back', onPress: () => this.mgr.start(new MenuScene(this.mgr)) });
    back.position.set(screen.width/2, screen.height*0.82);
    this.root.addChild(back);
  }

  private volText() { return `Master Volume: ${(this.volume*100)|0}%`; }
  private setVol(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    const label = (this as any)._volLabel as Text;
    label.text = this.volText();
    // TODO: hook into your audio system
  }

  private setColor(c: number, g: Graphics) {
    this.playerColor = c;
    const old = (this as any)._selected as Graphics;
    if (old) old.alpha = 1;
    g.alpha = 0.7;
    (this as any)._selected = g;
    // TODO: persist playerColor in global state / send to backend
  }
}
