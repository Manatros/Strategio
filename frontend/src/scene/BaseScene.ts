// src/scene/BaseScene.ts
import type { Application } from 'pixi.js';
import { Container } from 'pixi.js';

export abstract class BaseScene {
  protected app: Application;
  /** The root container you add to the stage */
  public root: Container;

  constructor(app: Application) {
    this.app = app;
    this.root = new Container();
  }

  /** Called once when the scene becomes active */
  abstract onEnter(): void | Promise<void>;
  /** Called once when the scene is removed */
  onExit(): void | Promise<void> {}
}
