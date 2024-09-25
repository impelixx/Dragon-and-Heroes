import { Scene } from 'phaser'
import axios from 'axios'

declare function showDialogue(): void
declare function hideDialogue(): void

export class Game extends Scene {
	camera: Phaser.Cameras.Scene2D.BaseCamera
	sky: Phaser.GameObjects.Image
	difficult: number = 1
	trees: Phaser.GameObjects.Image
	dialogueBox: Phaser.GameObjects.Graphics
	answerInput: Phaser.GameObjects.DOMElement
	answerText: Phaser.GameObjects.Text
	dialogueContainer: HTMLElement
	dialogueText: HTMLElement
	inputField: HTMLInputElement
	submitButton: HTMLButtonElement
	nearClouds: Phaser.GameObjects.Image
	farClouds: Phaser.GameObjects.Image
	mountains: Phaser.GameObjects.Image
	farMountain: Phaser.GameObjects.Image
	hero: Phaser.Physics.Arcade.Sprite
	keyA: Phaser.Input.Keyboard.Key
	keyD: Phaser.Input.Keyboard.Key
	keyT: Phaser.Input.Keyboard.Key
	shopKey: Phaser.Input.Keyboard.Key
	canMove: boolean = true
	keySpace: Phaser.Input.Keyboard.Key
	ground: Phaser.GameObjects.TileSprite
	groundPos: number
	inQuestion: boolean = false
	isJumping: boolean = false
	isAttacking: boolean = false
	hp: number = 100
	exp: number = 0
	dragonSpawned: boolean = false
	damage: number = 25
	isInBattle: boolean = false
	dragonHP: number = 50
	currentQuestionIndex: number = 0
	colors: string[] = ['red', 'green', 'black']

	hpText: Phaser.GameObjects.Text
	damageText: Phaser.GameObjects.Text
	expText: Phaser.GameObjects.Text

	dragonEncounterThreshold: number = 1000
	dragon: Phaser.Physics.Arcade.Sprite | undefined
	isDragonEncountered: boolean = false

	constructor() {
		super('Game')
		this.groundPos = 0
	}

	handleSubmit() {
		const userInput = this.inputField.value.trim() // Получаем значение из поля ввода
		if (userInput) {
			console.log(userInput)
			this.checkAnswer(userInput)
			this.inputField.value = ''
			hideDialogue()
		}
	}

	preload() {
		this.initHero()
		this.load.image('sky', 'assets/background/sky.png')
		this.load.image('greenDragon', 'assets/dragons/green.png')
		this.load.image('blackDragon', 'assets/dragons/black.png')
		this.load.image('redDragon', 'assets/dragons/red.png')
		this.load.image('far-clouds', 'assets/background/far-clouds.png')
		this.load.image('near-clouds', 'assets/background/near-clouds.png')
		this.load.image('far-mountain', 'assets/background/far-mountains.png')
		this.load.image('mountains', 'assets/background/mountains.png')
		this.load.image('trees', 'assets/background/trees.png')
		this.load.image('ground', 'assets/groundd.png')
		this.load.spritesheet('heroRun', 'assets/Run.png', {
			frameWidth: 128,
			frameHeight: 126,
		})
		this.load.spritesheet('heroIdle', 'assets/Idle.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
		this.load.spritesheet('heroJump', 'assets/Jump.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
		this.load.spritesheet('heroAttack1', 'assets/Attack_1.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
		this.load.spritesheet('heroAttack2', 'assets/Attack_2.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
		this.load.spritesheet('heroAttack3', 'assets/Attack_3.png', {
			frameWidth: 128,
			frameHeight: 128,
		})
		this.load.image('dragon', 'assets/dragon.png')
	}

	create() {
		this.sky = this.add.image(512, 384, 'sky').setScale(4)
		this.farClouds = this.add.image(512, 384, 'far-clouds').setScale(8)
		this.nearClouds = this.add.image(512, 384, 'near-clouds').setScale(8)
		this.farMountain = this.add.image(512, 384, 'far-mountain').setScale(8)
		this.mountains = this.add.image(512, 384, 'mountains').setScale(4)
		this.trees = this.add.image(512, 384, 'trees').setScale(4)
		this.hero = this.physics.add.sprite(100, 500, 'heroIdle')
		this.hero.setOrigin(0.5)
		this.hero.setBounce(0.2)
		this.hero.setCollideWorldBounds(true)
		this.hero.setScale(2.5)
		this.createAnimations()

		this.ground = this.add.tileSprite(512, 700, 2048, 350, 'ground')
		this.physics.add.existing(this.ground, true)
		this.physics.add.collider(this.hero, this.ground)
		const groundBody = this.ground.body as Phaser.Physics.Arcade.StaticBody
		groundBody.setSize(1024, 0).setOffset(0, 180)
		this.dialogueContainer = document.getElementById('dialogue-container')!
		this.inputField = document.getElementById('input-field') as HTMLInputElement
		this.submitButton = document.getElementById(
			'submit-button'
		) as HTMLButtonElement
		if (this.submitButton) {
			this.submitButton.addEventListener('click', () => this.handleSubmit())
		} else {
			console.error('Кнопка отправки не найдена')
		}

		this.submitButton.addEventListener('click', () => this.handleSubmit())

		this.dialogueContainer.style.display = 'none'

		if (this.input.keyboard != null) {
			this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
			this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
			this.keySpace = this.input.keyboard.addKey(
				Phaser.Input.Keyboard.KeyCodes.SPACE
			)
			this.keyT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T)
			this.shopKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)
		}

		this.createHUD()
		this.getCharacterStat()
	}

	async initHero() {
		try {
			await axios.get('http://localhost:3000/init')
		} catch (error) {
			console.log(error)
		}
	}

	createHUD() {
		this.hpText = this.add.text(10, 10, `HP: ${this.hp}`, {
			fontSize: '20px',
			color: '#ff0000',
		})
		this.damageText = this.add.text(10, 40, `Damage: ${this.damage}`, {
			fontSize: '20px',
			color: '#ffffff',
		})
		this.expText = this.add.text(10, 70, `EXP: ${this.exp}`, {
			fontSize: '20px',
			color: '#ffff00',
		})
	}

	createAnimations() {
		this.anims.create({
			key: 'run',
			frames: this.anims.generateFrameNumbers('heroRun', { start: 0, end: 10 }),
			frameRate: 10,
			repeat: -1,
		})
		this.anims.create({
			key: 'idle',
			frames: this.anims.generateFrameNumbers('heroIdle', { start: 0, end: 8 }),
			frameRate: 10,
			repeat: -1,
		})
		this.anims.create({
			key: 'jumpMid',
			frames: this.anims.generateFrameNumbers('heroJump', { start: 4, end: 7 }),
			frameRate: 10,
			repeat: 0,
		})
		this.anims.create({
			key: 'jumpStart',
			frames: this.anims.generateFrameNumbers('heroJump', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: 0,
		})
		this.anims.create({
			key: 'jumpEnd',
			frames: this.anims.generateFrameNumbers('heroJump', {
				start: 8,
				end: 10,
			}),
			frameRate: 10,
			repeat: 0,
		})
		this.anims.create({
			key: 'attack1',
			frames: this.anims.generateFrameNumbers('heroAttack1', {
				start: 0,
				end: 3,
			}),
			frameRate: 5,
			repeat: 0,
		})
		this.anims.create({
			key: 'attack2',
			frames: this.anims.generateFrameNumbers('heroAttack2', {
				start: 0,
				end: 3,
			}),
			frameRate: 5,
			repeat: 0,
		})
		this.anims.create({
			key: 'attack3',
			frames: this.anims.generateFrameNumbers('heroAttack3', {
				start: 0,
				end: 3,
			}),
			frameRate: 5,
			repeat: 0,
		})
	}

	update() {
		this.updateUI()
		const isOnGround = this.hero.body?.blocked.down
		// if (this.exp % 1000 == 0 && this.exp != 0) {

		// 	this.exp += 5
		// }

		if (this.keyT.isDown) {
			this.MakeDialogue('penis')
		}

		if (this.keyD.isDown && !this.isAttacking && this.canMove && isOnGround) {
			this.hero.anims.play('run', true)
			this.hero.flipX = false
			this.ground.tilePositionX += 5
			this.groundPos += 5
			this.exp += 1
			this.dragonEncounterThreshold -= 5
			console.log(this.dragonEncounterThreshold)
			this.dragon?.setPosition(this.dragon.x - 5, this.dragon.y)
			if (this.dragonEncounterThreshold == 0 && !this.dragonSpawned) {
				console.log('spawned dragon')
				this.spawnDragon()
			}
		} else if (
			this.keyA.isDown &&
			!this.isAttacking &&
			this.canMove &&
			isOnGround
		) {
			this.hero.anims.play('run', true)
			this.hero.flipX = true
			this.ground.tilePositionX -= 5
			this.groundPos -= 5
			this.exp -= 5
			this.dragonEncounterThreshold += 5
		} else if (!this.isAttacking && !this.isJumping) {
			this.hero.anims.play('idle', true)
		}

		if (
			this.keySpace.isDown &&
			isOnGround &&
			!this.isJumping &&
			!this.isAttacking &&
			this.canMove
		) {
			if (
				!this.hero.anims.isPlaying ||
				!(this.hero.anims.currentAnim?.key !== 'idle')
			) {
				this.isJumping = true
				this.hero.setVelocityY(-250)
				this.hero.anims.play('idle', true)
				this.hero.anims.play('jumpStart', true)
				this.hero.once('animationcomplete', () => {
					this.hero.anims.play('jumpMid', true)
					this.ground.tilePositionX =
						this.ground.tilePositionX + (this.hero.flipX ? -150 : 150)
					this.hero.once('animationcomplete', () => {
						this.hero.anims.play('jumpEnd', true)
						this.isJumping = false
					})
				})
			}
		}

		if (this.input.activePointer.isDown && isOnGround && !this.isAttacking) {
			this.startAttack()
		}

		if (this.isAttacking && !this.hero.anims.isPlaying) {
			this.isAttacking = false
		}
	}

	startAttack() {
		const attackType = Phaser.Math.Between(1, 3)
		if (
			!this.hero.anims.isPlaying ||
			this.hero?.anims?.currentAnim?.key !== `attack${attackType}`
		) {
			this.hero.anims.play(`attack${attackType}`, true)
			this.isAttacking = true
		}
	}

	updateUI() {
		this.hpText.setText(`HP: ${this.hp}`)
		this.damageText.setText(`Damage: ${this.damage}`)
		this.expText.setText(`Score: ${this.exp}`)
	}

	async spawnDragon() {
		let color: string = 'Зеленый'
		try {
			const response = await axios.get(`http://localhost:3000/get_name`)
			console.log(response.data)
			color = response.data.name
			console.log(color)
		} catch (error) {
			console.error(error)
		}
		let spriteColor: string
		if (color == 'Красный') {
			spriteColor = 'red'
		} else if (color == 'Черный') {
			spriteColor = 'black'
		} else {
			spriteColor = 'green'
		}
		console.log(spriteColor)
		this.dragonSpawned = true
		this.dragon = this.physics.add.sprite(
			1024 + 500,
			300,
			`${spriteColor}Dragon`
		)
		this.dragon.setScale(0.5)
		this.dragon.setCollideWorldBounds(true)
		this.dragon.setDepth(1)
		this.ground.setDepth(4)

		this.physics.add.collider(
			this.hero,
			this.dragon,
			this.handleDragonCollision,
			undefined,
			this
		)

		this.tweens.add({
			targets: this.dragon,
			x: this.cameras.main.width,
			duration: 100,
			alpha: { from: 0, to: 1 },
			ease: 'Power1',
			onComplete: () => {
				console.log('Дракон появился на экране!')
			},
		})
	}

	handleDragonCollision() {
		this.hero.anims.play('idle', true)
		//this.MakeDialogue('Дракон напал на вас')
		this.canMove = false
		this.startBattle()
	}

	startBattle() {
		this.isInBattle = true
		this.currentQuestionIndex = 0
		this.askQuestion()
	}

	endBattle() {
		this.isInBattle = false
		this.canMove = true

		this.dialogueContainer.style.display = 'none'
		this.inputField.style.display = 'none'
		this.submitButton.style.display = 'none'
		this.dragonEncounterThreshold = 1000

		const victoryMessage = document.createElement('div')
		victoryMessage.innerText = 'Ты победил дракона!'
		victoryMessage.style.position = 'fixed'
		victoryMessage.style.top = '50%'
		victoryMessage.style.left = '50%'
		victoryMessage.style.transform = 'translate(-50%, -50%)'
		victoryMessage.style.backgroundColor = 'rgba(0, 255, 0, 0.8)'
		victoryMessage.style.color = 'black'
		victoryMessage.style.padding = '20px'
		victoryMessage.style.borderRadius = '8px'
		victoryMessage.style.zIndex = '1000'
		document.body.appendChild(victoryMessage)
		this.damage += 25
		this.difficult += 1

		hideDialogue()
		this.dragon?.destroy()
		this.dragonSpawned = false
		console.log(this.canMove)
		this.canMove = true
		this.hero.anims.stop()
		this.dragonHP = 50

		setTimeout(() => {
			document.body.removeChild(victoryMessage)
		}, 1000)
	}

	async askQuestion() {
		let question: string = ''
		if (!this.inQuestion) {
			const response = await axios.get(
				`http://localhost:3000/get_task?difficulty=${this.difficult}`
			)
			question = response.data.question
			console.log('Response from server:', response.data)
			console.log(question)
			//const dialogueText = document.getElementById('dialogue-text') as HTMLElement
			this.MakeDialogue(question!)
		}
		this.inQuestion = true
	}

	MakeDialogue(text: string) {
		const dialogueText = document.getElementById('dialogue-text') as HTMLElement
		dialogueText.innerText = text

		this.dialogueContainer.style.position = 'fixed'
		this.dialogueContainer.style.top = '50%'
		this.dialogueContainer.style.left = '50%'
		this.dialogueContainer.style.transform = 'translate(-50%, -50%)'
		this.dialogueContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'
		this.dialogueContainer.style.color = 'white'
		this.dialogueContainer.style.padding = '20px'
		this.dialogueContainer.style.borderRadius = '8px'
		this.dialogueContainer.style.display = 'block'

		this.inputField.style.marginTop = '10px'
		this.inputField.style.padding = '5px'
		this.inputField.style.width = '100%'
		this.inputField.style.display = 'block'
		this.inputField.focus()

		this.submitButton.style.marginTop = '10px'
		this.submitButton.style.padding = '5px 10px'
		this.submitButton.style.backgroundColor = '#4caf50'
		this.submitButton.style.color = 'white'
		this.submitButton.style.border = 'none'
		this.submitButton.style.borderRadius = '4px'
		this.submitButton.style.cursor = 'pointer'
		this.submitButton.style.display = 'block'

		this.submitButton.onmouseover = () => {
			this.submitButton.style.backgroundColor = '#45a049'
		}
		this.submitButton.onmouseout = () => {
			this.submitButton.style.backgroundColor = '#4caf50'
		}
		showDialogue()
	}

	async checkKilledDragon() {
		try {
			const response = await axios.get('http://localhost:3000/kill_dragon')
			if (response.data.result == 'success') {
				this.endBattle()
			} else {
				console.log('continue battle')
			}
		} catch (error) {
			console.error(error)
		}
	}

	async checkAnswer(answer: string) {
		try {
			const response = await axios.get(
				`http://localhost:3000/check_answer?answer=${answer}`
			)
			const isCorrect = response.data.correct
			this.dragonHP = response.data.enemy_health

			console.log(response.data)
			console.log(isCorrect)

			if (response.data.result != 'wrong') {
				this.checkKilledDragon()
				if (this.dragonHP <= 0) {
					this.MakeDialogue('Ты убил дракона!')
					this.endBattle()
					this.getCharacterStat()
					this.updateUI()
				} else {
					console.log(this.dragonHP)
				}
			} else {
				try {
					const hpResp = await axios.get('http://localhost:3000/get_health')
					console.log("def", hpResp.data)
					this.hp = hpResp.data.health
					this.getCharacterStat()
					this.updateUI()
					console.log(this.hp)
				} catch (error) {
					console.error(error)
				}
			}
		} catch (error) {
			console.error(error)
		}

		this.inQuestion = false
	}
	async getCharacterStat() {
		try {
			const response = await axios.get('http://localhost:3000/get_stat')
			console.log(response.data)
			this.hp = response.data.health
			this.damage = response.data.damage
			console.log(this.hp)
			console.log(this.damage)
			if (this.hp <= 0) {
				hideDialogue()
				this.scene.start('GameOver')
			}
		} catch (error) {
			console.error(error)
		}
	}
}
