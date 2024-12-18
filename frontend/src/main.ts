import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { ChooseCharacter } from './scenes/ChooseCharacter';

import { Game, Types } from "phaser";

const config: Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1024,
	height: 768,
	parent: 'game-container',
	//backgroundColor: '#028af8',
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { x: 0, y: 500 },
			debug: false,
		},
	},
	scene: [Boot, Preloader, MainMenu, ChooseCharacter, MainGame, GameOver],
}

document.addEventListener('DOMContentLoaded', () => {
	new Game(config);
});

export default config;
