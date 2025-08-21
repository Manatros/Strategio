import { BaseScene } from './BaseScene';
import { SceneManager } from './SceneManager';
import { Graphics, Text } from 'pixi.js';
import { Button } from '../ui/Button';
import { MenuScene } from './MenuScene';

type Entry = { user: string; score: number };

export class LeaderboardScene extends BaseScene {
  private mgr: SceneManager;
  constructor(mgr: SceneManager) {
    super(mgr.application);
    this.mgr = mgr;
  }

  async onEnter() {
    const { screen } = this.app;
    this.root.addChild(new Graphics().rect(0,0,screen.width,screen.height).fill(0x0f1320));

    const title = new Text({ text: 'Leaderboard', style: { fill: 0xffffff, fontSize: 36, fontWeight: '700' }});
    title.anchor.set(0.5); title.position.set(screen.width/2, screen.height*0.15);
    this.root.addChild(title);

    const list = await this.loadLeaderboard();

    list.slice(0, 10).forEach((row, i) => {
      const y = screen.height*0.25 + i*34;
      const line = new Text({
        text: `${String(i+1).padStart(2,'0')}  ${row.user.padEnd(12,' ')}  —  ${row.score}`,
        style: { fill: 0xE6EDF7, fontFamily: 'ui-monospace, monospace', fontSize: 18 }
      });
      line.position.set(screen.width*0.28, y);
      this.root.addChild(line);
    });

    const back = new Button({ label: 'Back', onPress: () => this.mgr.start(new MenuScene(this.mgr)) });
    back.position.set(screen.width/2, screen.height*0.85);
    this.root.addChild(back);
  }

  private async loadLeaderboard(): Promise<Entry[]> {
    try {
      // Adjust to your backend route; fallback to mock data if unreachable
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('bad status');
      return await res.json() as Entry[];
    } catch {
      // mock
      return [
        { user: 'Jannik', score: 4210 },
        { user: 'Marc', score: 3990 },
        { user: 'Guest42', score: 3120 },
        { user: 'Zed', score: 2800 },
        { user: 'Lin', score: 2440 },
        { user: 'Kai', score: 2200 },
        { user: 'Mara', score: 2130 },
        { user: 'Nils', score: 2090 },
        { user: 'Ivy', score: 1980 },
        { user: 'Bo', score: 1900 },
      ];
    }
  }
}
