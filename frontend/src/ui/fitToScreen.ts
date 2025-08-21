import type { Application, DisplayObject } from 'pixi.js';

/**
 * Keeps a container centered and allows you to lay out elements using app.screen.
 * Call again when layout changes if you need to recenter dynamic elements.
 */
export function fitToScreen(app: Application, container?: DisplayObject) {
  const layout = () => {
    if (container) {
      // Center the container
      (container as any).position?.set?.(app.screen.width / 2, app.screen.height / 2);
    }
    // Expand root hitArea for interactions
    app.stage.hitArea = app.screen;
  };

  layout();
  window.addEventListener('resize', layout);
}
