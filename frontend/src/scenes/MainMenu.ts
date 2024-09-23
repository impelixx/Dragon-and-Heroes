import { Scene, GameObjects } from 'phaser'

export class MainMenu extends Scene {
	background: GameObjects.Image
	logo: GameObjects.Image
	title: GameObjects.Text
	startButton: GameObjects.Text
	characterButton: GameObjects.Text

	constructor() {
		super('MainMenu')
	}

	create() {
		this.background = this.add.image(512, 384, 'background').setOrigin(0.5)

		this.logo = this.add.image(512, 200, 'logo').setOrigin(0.5).setAlpha(0)
		this.tweens.add({
			targets: this.logo,
			alpha: 1,
			duration: 1000,
			ease: 'Power2',
			delay: 500,
		})

		this.title = this.add
			.text(512, 460, 'Main Menu', {
				fontFamily: 'Arial Black',
				fontSize: 38,
				color: '#ffffff',
				stroke: '#000000',
				strokeThickness: 8,
				align: 'center',
			})
			.setOrigin(0.5)
			.setAlpha(0)

		this.tweens.add({
			targets: this.title,
			alpha: 1,
			duration: 1000,
			ease: 'Power2',
			delay: 1000,
		})

		this.startButton = this.add
			.text(512, 550, 'Start Game', {
				fontFamily: 'Arial Black',
				fontSize: 24,
				color: '#ffcc00',
				stroke: '#000000',
				strokeThickness: 4,
				align: 'center',
			})
			.setOrigin(0.5)
			.setInteractive()

		this.startButton.on('pointerover', () => {
			this.startButton.setStyle({ fill: '#ffff00' })
		})

		this.startButton.on('pointerout', () => {
			this.startButton.setStyle({ fill: '#ffcc00' })
		})

		this.startButton.on('pointerdown', () => {
			this.startButton.setStyle({ fill: '#cccc00' })
			this.scene.start('Game')
		})

		// Добавление кнопки выбора персонажа
		this.characterButton = this.add
			.text(512, 600, 'Choose Character', {
				fontFamily: 'Arial Black',
				fontSize: 24,
				color: '#ffcc00',
				stroke: '#000000',
				strokeThickness: 4,
				align: 'center',
			})
			.setOrigin(0.5)
			.setInteractive()

		this.characterButton.on('pointerover', () => {
			this.characterButton.setStyle({ fill: '#ffff00' })
		})

		this.characterButton.on('pointerout', () => {
			this.characterButton.setStyle({ fill: '#ffcc00' })
		})

		this.characterButton.on('pointerdown', () => {
			this.characterButton.setStyle({ fill: '#cccc00' })
			this.scene.start('CharacterSelect') // Предполагается, что сцена выбора персонажа называется 'CharacterSelect'
		})

		// Добавление анимации для кнопок
		this.tweens.add({
			targets: this.startButton,
			y: 540,
			duration: 500,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut',
		})

		this.tweens.add({
			targets: this.characterButton,
			y: 590,
			duration: 500,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.inOut',
		})
	}
}
