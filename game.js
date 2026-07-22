let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let meat = 100;
let incomePerSec = 0;
let parkScene;

class ParkScene extends Phaser.Scene {
    constructor() {
        super('ParkScene');
    }

    preload() {
        // Загружаем твои картинки из корня
        this.load.image('grass', 'grass_1.png');
        this.load.image('hut', 'hut_stone_1.png');
        
        // Кадры анимации человечка
        this.load.image('caveman_1', 'caveman_walk_1.png');
        this.load.image('caveman_2', 'caveman_walk_2.png');
        this.load.image('caveman_3', 'caveman_walk_3.png');
        this.load.image('caveman_4', 'caveman_walk_4.png');
    }

    create() {
        parkScene = this;
        let width = this.scale.width;
        let height = this.scale.height;

        // Заполняем поле тайлами травы
        for (let x = 0; x <= width; x += 32) {
            for (let y = 0; y <= height; y += 32) {
                this.add.image(x, y, 'grass').setOrigin(0, 0);
            }
        }

        // Создаем анимацию бега человечка
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'caveman_1' },
                { key: 'caveman_2' },
                { key: 'caveman_3' },
                { key: 'caveman_4' }
            ],
            frameRate: 6,
            repeat: -1
        });

        // Спавним гуляющих пещерных людей
        this.visitors = this.add.group();
        for (let i = 0; i < 4; i++) {
            let vx = Phaser.Math.Between(50, width - 50);
            let vy = Phaser.Math.Between(150, height - 150);
            let visitor = this.add.sprite(vx, vy, 'caveman_1');
            visitor.play('walk');
            this.visitors.add(visitor);

            this.tweens.add({
                targets: visitor,
                x: () => Phaser.Math.Between(50, this.scale.width - 50),
                y: () => Phaser.Math.Between(150, this.scale.height - 150),
                duration: 5000,
                ease: 'Linear'
            });
        }

        // Ставим стартовую хижину
        this.addBuilding(width / 2, height / 2);
    }

    addBuilding(x, y) {
        let hut = this.add.sprite(x, y, 'hut');
        hut.setScale(0);
        
        this.tweens.add({
            targets: hut,
            scale: 1,
            duration: 300,
            ease: 'Back.out'
        });

        incomePerSec += 5;
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#3b5323',
    scene: ParkScene
};

const game = new Phaser.Game(config);

function buildAttraction() {
    if (meat >= 50) {
        meat -= 50;
        document.getElementById('meat-val').innerText = meat;

        let rx = Phaser.Math.Between(50, window.innerWidth - 50);
        let ry = Phaser.Math.Between(150, window.innerHeight - 100);
        parkScene.addBuilding(rx, ry);

        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    } else {
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
}

setInterval(() => {
    meat += incomePerSec;
    document.getElementById('meat-val').innerText = meat;
}, 1000);
