import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { Container, Graphics, Text } from 'pixi.js';
import { Button } from '../ui/Button';
import { GameScene } from './GameScene';
import { OptionsScene } from './OptionsScene';
import { LeaderboardScene } from './LeaderboardScene';

export class MenuScene extends BaseScene {
  private mgr: SceneManager;

  // scene elements
  private bg!: Graphics;
  private vignette!: Graphics;
  private title!: Text;
  private subtitle!: Text;
  private col!: Container;
  private playBtn!: Button;
  private optionsBtn!: Button;
  private leaderboardBtn!: Button;
  private footer!: Text;

  constructor(mgr: SceneManager) {
    super(mgr.application);
    this.mgr = mgr;
  }

  async onEnter() {
    const { stage } = this.app;

    // Background
    this.bg = new Graphics();
    this.vignette = new Graphics();
    this.root.addChild(this.bg, this.vignette);

    // Title
    this.title = new Text({
      text: 'STRATEGIO',
      style: {
        fill: 0xE6EDF7,
        letterSpacing: 2,
        fontWeight: '800',
        fontSize: 64, // will be overridden by layout()
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
        dropShadow: true,
        dropShadowDistance: 1,
        dropShadowColor: 0x000000,
        dropShadowBlur: 4,
      },
    });
    this.title.anchor.set(0.5, 1);
    this.root.addChild(this.title);

    // Button column
    this.col = new Container();
    this.root.addChild(this.col);

    // Buttons
    this.playBtn = new Button({
      label: 'Play',
      onPress: () => this.mgr.start(new GameScene(this.mgr)),
    });
    this.optionsBtn = new Button({
      label: 'Options',
      onPress: () => this.mgr.start(new OptionsScene(this.mgr)),
    });
    this.leaderboardBtn = new Button({
      label: 'Leaderboard',
      onPress: () => this.mgr.start(new LeaderboardScene(this.mgr)),
    });
    this.col.addChild(this.playBtn, this.optionsBtn, this.leaderboardBtn);

    // Subtitle and footer
    this.subtitle = new Text({
      text: 'Casual, drop-in / drop-out RTS',
      style: { fill: 0x9BB0E3, fontSize: 16, fontWeight: '500' },
    });
    this.subtitle.anchor.set(0.5, 0);
    this.root.addChild(this.subtitle);

    this.footer = new Text({
      text: 'v0.0.1 • Pixi v8',
      style: { fill: 0x5E6A8E, fontSize: 12 },
    });
    this.footer.anchor.set(1, 1);
    this.root.addChild(this.footer);

    // Keyboard shortcuts
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') this.playBtn.emit('pointerup'); // “Play” on Enter
      if (e.key === 'Escape') this.optionsBtn.emit('pointerup'); // Quick to Options
    };
    window.addEventListener('keydown', onKey);
    (this as any)._onKey = onKey;

    // Initial layout + responsive
    const layout = () => this.layout();
    layout();
    window.addEventListener('resize', layout);
    (this as any)._onResize = layout;

    // Stage interaction region
    this.root.eventMode = 'static';
    this.root.hitArea = this.app.screen;
    stage.eventMode = 'static';
    stage.hitArea = this.app.screen;
  }

  private layout() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    // Use a safe area & a base scalar (no double scaling with CSS)
    const safeMargin = Math.round(Math.min(w, h) * 0.04);
    const safeW = w - safeMargin * 2;
    const safeH = h - safeMargin * 2;
    const base = Math.min(safeW, safeH);

    // Background fill
    this.bg.clear()
      .rect(0, 0, w, h)
      .fill(0x0b0e14);

    // Soft vignette that never distorts content
    this.vignette.clear()
      .rect(0, 0, w, h)
      .fill({ color: 0x000000, alpha: 0.0 });
    // border fade
    const b = Math.max(24, Math.floor(base * 0.06));
    this.vignette.lineStyle({ color: 0x000000, width: b, alpha: 0.12 })
      .rect(b/2, b/2, w - b, h - b)
      .stroke();

    // Title size & position
    const titleSize = clamp(Math.floor(base * 0.12), 40, 96);
    (this.title.style as any).fontSize = titleSize;
    this.title.position.set(w / 2, safeMargin + titleSize * 1.2);

    // Buttons (proportional)
    const btnW = clamp(Math.floor(safeW * 0.38), 220, 520);
    const btnH = clamp(Math.floor(base * 0.08), 44, 86);
    const spacing = Math.max(10, Math.floor(btnH * 0.35));

    this.playBtn.setSize(btnW, btnH);
    this.optionsBtn.setSize(btnW, btnH);
    this.leaderboardBtn.setSize(btnW, btnH);

    // vertical stack centered below title
    this.playBtn.position.set(0, 0);
    this.optionsBtn.position.set(0, (btnH + spacing));
    this.leaderboardBtn.position.set(0, (btnH + spacing) * 2);

    this.col.pivot.set(this.col.width / 2, this.col.height / 2);
    this.col.position.set(w / 2, Math.min(h * 0.58, this.title.position.y + titleSize * 0.8 + this.col.height / 2 + spacing));

    // Subtitle
    const subSize = clamp(Math.floor(base * 0.022), 12, 20);
    (this.subtitle.style as any).fontSize = subSize;
    this.subtitle.position.set(w / 2, this.col.position.y + this.col.height / 2 + spacing * 1.1);

    // Footer (bottom-right safe corner)
    (this.footer.style as any).fontSize = clamp(Math.floor(base * 0.016), 10, 14);
    this.footer.position.set(w - safeMargin, h - safeMargin);

    // Keep interactions correct
    this.root.hitArea = this.app.screen;
  }

  async onExit() {
    const onResize = (this as any)._onResize as (() => void) | undefined;
    if (onResize) window.removeEventListener('resize', onResize);
    const onKey = (this as any)._onKey as ((e: KeyboardEvent) => void) | undefined;
    if (onKey) window.removeEventListener('keydown', onKey);
  }
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
