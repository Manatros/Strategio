import "./styles.css";
import * as PIXI from "pixi.js";
import { MapView } from "./hex/MapView";
import { enableCameraControls } from "./hex/Input";
import { attachHUD } from "./ui/DebugHUD";


(async function run() {
const mount = document.getElementById("app")!;
const view = new MapView({ radius: 22, hexSize: 28, seed: 20250821 }); // ~2.5k tiles
await view.initApp(mount);


enableCameraControls(view.app, view.container);
attachHUD(mount, view.app, view.container);


// handle resize centering a little
const onResize = () => {
// keep map roughly centered if not dragged yet
// (no-op for custom camera positions)
};
window.addEventListener("resize", onResize);
})();

(async function run() {
  const mount = document.getElementById("app")!;
  let seed = 20250821;

  let view = new MapView({ radius: 26, hexSize: 28, seed });
  await view.initApp(mount);
  enableCameraControls(view.app, view.container);
  attachHUD(mount, view.app, view.container);

  window.addEventListener("keydown", async (e) => {
    if (e.key.toLowerCase() === "r") {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      // re-create MapView with new seed
      view.app.stage.removeChild(view.container);
      view = new MapView({ radius: 26, hexSize: 28, seed });
      view.app.stage.addChild(view.container);
      view.renderTiles();
      view.enablePicking();
    }
  });
})();
