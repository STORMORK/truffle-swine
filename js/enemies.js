class EnemyManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.enemies = [];
        this.coins = [];
    }

    reset() {
        this.enemies = [];
        this.coins = [];
        this.spawnCoin();
    }

    spawnCoin() {
        this.coins.push({
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: Math.random() * (this.canvas.height - 60) + 30,
            radius: 8
        });
    }

    spawnEnemy(score) {
        const size = Math.random() * 10 + 10;
        const x = Math.random() < 0.5 ? -size : this.canvas.width + size;
        const y = Math.random() * this.canvas.height;
        const speed = (Math.random() * 2 + 1.5) * (1 + score * 0.02);

        this.enemies.push({ x, y, radius: size, speed });
    }

    update(player) {
        // Движение врагов
        this.enemies.forEach(e => {
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;
        });
    }

    draw(ctx) {
        // Рисуем монеты
        ctx.fillStyle = '#e0af68';
        this.coins.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Рисуем врагов
        ctx.fillStyle = '#f7768e';
        this.enemies.forEach(e => {
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}
