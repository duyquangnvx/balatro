import { Scene } from "phaser";
import { AreaProps, CardArea } from "./card-area";
import { BoardManager } from "../../managers/board-manager";
import { PlayingCardDisplay } from "../playing-card-display";
/**
 * Area for displaying discarded cards
 */
export class DiscardArea extends CardArea<PlayingCardDisplay> {
    constructor(scene: Scene, config: AreaProps, boardManager: BoardManager) {
        super(scene, config, boardManager);
    }

}   