import Phaser from 'phaser'

export class ChooseCharacter extends Phaser.Scene {
	private characters: Phaser.GameObjects.Sprite[] = []
	private selectedCharacter: Phaser.GameObjects.Sprite | null = null

	constructor() {
		super({ key: 'CharacterSelectionScene' })
	}

	preload() {
		this.load.spritesheet('character1', 'assets/firstHero/idle.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
		this.load.spritesheet('character2', 'assets/secondHero/idle.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
		this.load.spritesheet('character3', 'assets/thirdHero/idle.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
	}

	create() {
		this.anims.create({
			key: 'idle',
			frames: this.anims.generateFrameNumbers('character1', {
				start: 0,
				end: 9,
			}),
			frameRate: 10,
			repeat: -1,
		})

		this.anims.create({
			key: 'hover',
			frames: this.anims.generateFrameNumbers('character2', {
				start: 0,
				end: 9,
			}),
			frameRate: 10,
			repeat: -1,
		})

		const characterNames = ['character1', 'character2', 'character3']

		characterNames.forEach((name, index) => {
			const x = 100 + index * 200 
			const characterSprite = this.add.sprite(x, 300, name).setInteractive()
			characterSprite.play('idle')

			characterSprite.on('pointerover', () => {
				characterSprite.play('hover')
			})

			characterSprite.on('pointerout', () => {
				characterSprite.play('idle')
			})

			characterSprite.on('pointerdown', () => {
				this.selectCharacter(characterSprite)
			})

			this.characters.push(characterSprite)
		})
	}

	selectCharacter(character: Phaser.GameObjects.Sprite) {
		if (this.selectedCharacter) {
			this.selectedCharacter.setAlpha(1) // Сбрасываем прозрачность предыдущего выбора
			this.selectedCharacter.play('idle') // Возвращаемся к анимации стояния
		}

		this.selectedCharacter = character
		this.selectedCharacter.setAlpha(0.5) // Уменьшаем прозрачность выбранного персонажа

		console.log(`Выбран персонаж: ${character.texture.key}`)
	}

	update() {
	}
}

