let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let meat = 150;
let incomePerSec = 5;
let parkScene;

class ParkScene extends Phaser.Scene {
    constructor() {
        super('ParkScene');
    }

    preload() {
        this.load.image('grass', 'grass_1.png');
        this.load.image('path', 'path_corner.png');
        this.load.image('hut', 'hut_stone_1.png');
        this.load.image('pen', 'dino_rex.png');
        this.load.image('fence', 'fence_horizontal.png');

        this.load.image('caveman_1', 'caveman_walk_1.png');
        this.load.image('caveman_2', 'caveman_walk_2.png');
        this.load.image('caveman_3', 'caveman_walk_3.png');
        this.load.image('caveman_4', 'caveman_walk_4.png');
    }

    create() {
        parkScene = this;
        let width = this.scale.width;
        let height = this.scale.height;

        // 1. Рисуем фон из травы с нормальным шагом сетки (тайлы 32х32)
        for (let x = 0; x <= width + 32; x += 32) {
            for (let y = 0; y <= height + 32; y += 32) {
                this.add.image(x, y, 'grass').setOrigin(0, 0);
            }
        }

        // 2. Создаем дорожки по периметру (как в оригинале)
        for (let x = 64; x < width - 64; x += 32) {
            this.add.image(x, 150, 'path').setOrigin(0, 0);
            this.add.image(x, height - 200, 'path').setOrigin(0, 0);
        }

        // 3. Анимация человечков (уменьшенный размер, чтобы не были гигантами)
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

        // Спавним посетителей парка
        this.visitors = this.add.group();
        for (let i = 0; i < 3; i++) {
            let visitor = this.add.sprite(100 + i * 50, 220, 'caveman_1');
            visitor.setScale(0.7); // Аккуратный размер под тайлы
            visitor.play('walk');
            this.visitors.add(visitor);

            this.tweens.add({
                targets: visitor,
                x: width - 100,
                duration: 6000,
                yoyo: true,
                repeat: -1,
                flipX: { getAt: (target, key, value) => target.x < width - 100 }
            });
        }

        // 4. Расставляем стартовые объекты парка (хижины и загоны)
        this.add.image(width / 2 - 60, height / 2 - 50, 'hut').setScale(0.9);
        this.add.image(width / 2 + 60, height / 2 - 50, 'pen').setScale(0.9);
    }

    addBuilding(x, y) {
        let items = ['hut', 'pen'];
        let randomItem = Phaser.Math.RND.pick(items);
        
        let building = this.add.sprite(x, y, randomItem);
        building.setScale(0);
        
        this.tweens.add({
            targets: building,
            scale: 0.9,
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
    backgroundColor: '#2e421c',
    scene: ParkScene
};

const game = new Phaser.Game(config);

function buildAttraction() {
    if (meat >= 50) {
        meat -= 50;
        document.getElementById('meat-val').innerText = meat;

        let rx = Phaser.Math.Between(80, window.innerWidth - 80);
        let ry = Phaser.Math.Between(200, window.innerHeight - 150);
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
