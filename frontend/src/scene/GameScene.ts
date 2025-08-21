import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { Graphics, Text } from 'pixi.js';
import { MenuScene } from './MenuScene';

export class GameScene extends BaseScene {
  private mgr: SceneManager;
  constructor(mgr: SceneManager) {
    super(mgr.application);
    this.mgr = mgr;
  }

  async onEnter() {
    const bg = new Graphics().rect(0, 0, this.app.screen.width, this.app.screen.height).fill(0x0f1320);
    this.root.addChild(bg);

    const t = new Text({ text: 'Game Scene (WIP)\nPress ESC for Menu', style: { fill: 0xffffff, fontSize: 24, align: 'center' } });
    t.anchor.set(0.5);
    t.position.set(this.app.screen.width/2, this.app.screen.height/2);
    this.root.addChild(t);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.mgr.start(new MenuScene(this.mgr));
    };
    window.addEventListener('keydown', onKey);
    (this as any)._onKey = onKey;
  }

  async onExit() {
    const onKey = (this as any)._onKey as ((e: KeyboardEvent) => void) | undefined;
    if (onKey) window.removeEventListener('keydown', onKey);
  }
}
