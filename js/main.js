class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.player = new Player(this.canvas);
        this.enemyManager = new EnemyManager(this.canvas);
        
        this.score = 0;
        this.state = 'MENU';

        this.initInput();
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initInput() {
        const handleInput = (e) => {
            if (this.state !== 'PLAYING') return;
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            this.player.setTarget(x, y);
        };

        this.canvas.addEventListener('mousemove', handleInput);
        this.canvas.addEventListener('touchstart', handleInput, {passive: false});
        this.canvas.addEventListener('touchmove', handleInput, {passive: false});
    }

    start() {
        this.score = 0;
        this.player.reset();
        this.enemyManager.reset();
        this.state = 'PLAYING';
        document.getElementById('ui-overlay').classList.add('hidden');
    }

    gameOver() {
        this.state = 'GAMEOVER';
        TelegramService.vibrate('error');
        
        document.getElementById('ui-title').innerText = "GAME OVER";
        document.getElementById('ui-score').innerText = `Ваш счет: ${this.score}`;
        document.getElementById('ui-btn').innerText = "СНОВА";
        document.getElementById('ui-overlay').classList.remove('hidden');
    }

    update() {
        if (this.state !== 'PLAYING') return;

        this.player.update();
        this.enemyManager.update(this.player);

        // Спавн врагов
        if (Math.random() < 0.03 + (this.score * 0.001)) {
            this.enemyManager.spawnEnemy(this.score);
        }

        // Проверка сбора монет
        this.enemyManager.coins.forEach((c, index) => {
            if (Math.hypot(this.player.x - c.x, this.player.y - c.y) < this.player.radius + c.radius) {
                this.score += 10;
                TelegramService.vibrate('light');
                this.enemyManager.coins.splice(index, 1);
                this.enemyManager.spawnCoin();
            }
        });

        // Столкновение с врагами
        this.enemyManager.enemies.forEach(e => {
            if (Math.hypot(this.player.x - e.x, this.player.y - e.y) < this.player.radius + e.radius) {
                this.gameOver();
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.player.draw(this.ctx);
        this.enemyManager.draw(this.ctx);

        if (this.state === 'PLAYING') {
            this.ctx.fillStyle = '#a9b1d6';
            this.ctx.font = 'bold 20px sans-serif';
            this.ctx.fillText(`Счет: ${this.score}`, 20, 40);
        }
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

// Запуск игры
window.game = new Game();
