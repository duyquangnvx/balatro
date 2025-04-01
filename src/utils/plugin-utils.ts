import { Scene } from "phaser";

export function getPlugin<T>(scene: Scene, key: string): T {
    return scene.plugins.get(key) as T;
}

