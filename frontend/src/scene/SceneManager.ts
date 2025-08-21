import type { Application } from 'pixi.js';
import { BaseScene } from './BaseScene';

export class SceneManager {
  constructor(private app: Application) {}

  private current: BaseScene | null = null;

  async start(scene: BaseScene) {
    if (this.current) {
      await this.current.onExit();
      this.app.stage.removeChild(this.current.root);
    }
    this.current = scene;
    this.app.stage.addChild(scene.root);
    await scene.onEnter();
  }

  get application() {
    return this.app;
  }
}
