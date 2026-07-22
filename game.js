// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let meat = 100;
let incomePerSec = 0;
let parkScene; // Ссылка на игровую сцену

class ParkScene extends Phaser.Scene {
    constructor() {
        super('ParkScene');
    }

    preload() {
        // Создаем простые геометрические текстуры процедурно, чтобы не качать внешние картинки
        let graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // 1. Трава (земля парка)
        graphics.fillStyle(0x3b5323);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('grass', 32, 32);

        // 2. Пещерный человек (маленький кружочек с дубиной)
        graphics.clear();
        graphics.fillStyle(0xd2b48c);
        graphics.fillCircle(12, 12, 10);
        graphics.generateTexture('caveman', 24, 24);

        // 3. Аттракцион / Хижина (каменный домик)
        graphics.clear();
        graphics.fillStyle(0x8b5a2b);
        graphics.fillRect(0, 0, 48, 48);
        graphics.fillStyle(0x5c4033);
        graphics.fillRect(12, 24, 24, 24); // дверь
        graphics.generateTexture('hut', 48, 48);
    }

    create() {
        parkScene = this;
        let width = this.scale.width;
        let height = this.scale.height;

        // Заполняем фон тайлами травы
        for (let x = 0; x <= width; x += 32) {
            for (let y = 0; y <= height; y += 32) {
                this.add.image(x, y, 'grass').setOrigin(0, 0);
            }
        }

        // Текст заголовка парка
        this.add.text(width / 2, 40, '🪨 ПЕРВОБЫТНЫЙ ПАРК 🪨', {
            fontSize: '18px',
            color: '#f3e9dc',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Группа пещерных людей (посетителей)
        this.visitors = this.add.group();
        for (let i = 0; i < 4; i++) {
            this.spawnVisitor(Phaser.Math.Between(50, width - 50), Phaser.Math.Between(150, height - 150));
        }

        // Группа построек
        this.buildings = this.add.group();
        
        // Ставим стартовый аттракцион в центре
        this.addBuilding(width / 2, height / 2);
    }

    spawnVisitor(x, y) {
        let visitor = this.add.sprite(x, y, 'caveman');
        this.visitors.add(visitor);

        // Задаем случайное движение посетителям (вид сверху)
        this.tweens.add({
            targets: visitor,
            x: () => Phaser.Math.Between(50, this.scale.width - 50),
            y: () => Phaser.Math.Between(150, this.scale.height - 150),
            duration: 4000,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
            onRepeat: () => {
                if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
            }
        });
    }

    addBuilding(x, y) {
        let hut = this.add.sprite(x, y, 'hut');
        this.buildings.add(hut);
        
        // Добавляем эффект появления
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

// Конфигурация Phaser
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#2d381e',
    scene: ParkScene
};

const game = new Phaser.Game(config);

// Функция постройки по кнопке
function buildAttraction() {
    if (meat >= 50) {
        meat -= 50;
        document.getElementById('meat-val').innerText = meat;

        // Спавним хижину в случайной точке экрана парка
        let rx = Phaser.Math.Between(60, window.innerWidth - 60);
        let ry = Phaser.Math.Between(180, window.innerHeight - 100);
        parkScene.addBuilding(rx, ry);

        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    } else {
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
}

// Таймер пассивного дохода от построек сверху
setInterval(() => {
    meat += incomePerSec;
    document.getElementById('meat-val').innerText = meat;
}, 1000);
