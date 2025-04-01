import { Scene } from "phaser";
import DropShadowPipelinePlugin from "phaser3-rex-plugins/plugins/dropshadowpipeline-plugin";

export function applyShadow(gameObject: Phaser.GameObjects.GameObject, config?: DropShadowPipelinePlugin.IConfig) {
    const pipelineInstance = gameObject.scene.plugins.get('rexDropShadowPipeline') as DropShadowPipelinePlugin;
    pipelineInstance.add(gameObject, config);
}

export function removeShadow(gameObject: Phaser.GameObjects.GameObject) {
    const pipelineInstance =  gameObject.scene.plugins.get('rexDropShadowPipeline') as DropShadowPipelinePlugin;
    pipelineInstance.remove(gameObject);
}

