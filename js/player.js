class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.reset();
    }

    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.targetX = this.x;
        this.targetY = this.y;
        this.radius = 16;
        this.speed = 0.15;
        this.shield = false;
    }

    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    update() {
        this.x += (this.targetX - this.x) * this.speed;
        this.y += (this.targetY - this.y) * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = '#7aa2f7';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.shield) {
            ctx.strokeStyle = '#bb9af7';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 6, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}
