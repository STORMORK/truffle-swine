const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const input = new InputController();

let logicalWidth, logicalHeight;
function resize() {
    logicalWidth = window.innerWidth;
    logicalHeight = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    ctx.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

// Скорректированная динамичная и отзывчивая физика (быстрый темп)
const GRAVITY = 0.62;
const FRICTION = 0.78;
const JUMP_POWER = -14.2; 
const ACCELERATION = 1.6;  
const MAX_SPEED = 7.5;     // Отличная высокая скорость

let scoreCoins = 0;
let time = 0;
let cameraX = 0;

let pig = {
    x: 80, y: 150,
    width: 46, height: 42,
    vx: 0, vy: 0,
    isGrounded: false,
    facingRight: true
};

const blockSize = 52;
let blocks = [];
let items = [];

function generateMap() {
    blocks = [];
    items = [];
    // Создаем прочную землю с динамическими ямами
    for (let i = 0; i < 200; i++) {
        if (![6, 7, 20, 21, 35, 36, 50, 51].includes(i)) {
            blocks.push({ x: i * blockSize, y: logicalHeight - blockSize * 2.2, w: blockSize, h: blockSize * 5, type: 'ground' });
        }
    }
    // Платформы и активные ящики с вопросами
    blocks.push({ x: 320, y: logicalHeight - blockSize * 5.2, w: blockSize * 4, h: blockSize, type: 'brick' });
    blocks.push({ x: 380, y: logicalHeight - blockSize * 5.2, w: blockSize, h: blockSize, type: 'loot_box', active: true, bounce: 0 });

    blocks.push({ x: 750, y: logicalHeight - blockSize * 6.0, w: blockSize, h: blockSize, type: 'loot_box', active: true, bounce: 0 });
    blocks.push({ x: 1100, y: logicalHeight - blockSize * 4.8, w: blockSize * 4, h: blockSize, type: 'brick' });
    blocks.push({ x: 1200, y: logicalHeight - blockSize * 4.8, w: blockSize, h: blockSize, type: 'loot_box', active: true, bounce: 0 });
}
generateMap();

function rectIntersect(a, b) {
    return a.x < b.x + b.w && a.x + a.width > b.x && a.y < b.y + b.h && a.y + a.height > b.y;
}

function updateGame() {
    time += 0.1;

    let moveDir = input.getAxisX();
    if (moveDir !== 0) {
        pig.vx += moveDir * ACCELERATION;
        pig.facingRight = (moveDir > 0);
    } else {
        pig.vx *= FRICTION;
    }

    if (pig.vx > MAX_SPEED) pig.vx = MAX_SPEED;
    if (pig.vx < -MAX_SPEED) pig.vx = -MAX_SPEED;
    if (Math.abs(pig.vx) < 0.2) pig.vx = 0;

    if (input.isJumpPressed() && pig.isGrounded) {
        pig.vy = JUMP_POWER;
        pig.isGrounded = false;
    }

    pig.vy += GRAVITY;

    // Горизонтальные коллизии
    pig.x += pig.vx;
    for (let b of blocks) {
        if (rectIntersect(pig, b)) {
            if (pig.vx > 0) { pig.x = b.x - pig.width; pig.vx = 0; }
            else if (pig.vx < 0) { pig.x = b.x + b.w; pig.vx = 0; }
        }
    }

    // Вертикальные коллизии
    pig.y += pig.vy;
    pig.isGrounded = false;

    for (let b of blocks) {
        if (rectIntersect(pig, b)) {
            if (pig.vy > 0) { // Приземление
                pig.y = b.y - pig.height;
                pig.vy = 0;
                pig.isGrounded = true;
            } else if (pig.vy < 0) { // Удар снизу головой в блок
                pig.y = b.y + b.h;
                pig.vy = 0;

                if (b.type === 'loot_box' && b.active) {
                    b.active = false;
                    b.bounce = 16; // Анимация подброса блока

                    // Мгновенный и четкий спавн трюфеля
                    items.push({
                        x: b.x + blockSize / 2 - 15,
                        y: b.y - 35,
                        w: 30, h: 30,
                        vx: (Math.random() - 0.5) * 3,
                        vy: -7.5
                    });
                }
            }
        }
    }

    // Физика вылетающих трюфелей
    for (let i = items.length - 1; i >= 0; i--) {
        let it = items[i];
        it.vy += GRAVITY;
        it.x += it.vx;
        it.y += it.vy;

        for (let b of blocks) {
            if (rectIntersect(it, b) && it.vy > 0) {
                it.y = b.y - it.h;
                it.vy = 0;
                it.vx = 0;
            }
        }

        if (rectIntersect(pig, it)) {
            scoreCoins++;
            document.getElementById('coinsText').innerText = scoreCoins;
            items.splice(i, 1);
        }
    }

    // Сброс при падении в пропасть
    if (pig.y > logicalHeight + 120) {
        pig.x = 80; pig.y = 100;
        pig.vx = 0; pig.vy = 0;
        generateMap();
    }

    // Плавное следование камеры
    let targetCamX = pig.x - logicalWidth * 0.38;
    if (targetCamX < 0) targetCamX = 0;
    cameraX += (targetCamX - cameraX) * 0.15;
}

function renderGame() {
    // Небо с градиентом
    let grad = ctx.createLinearGradient(0, 0, 0, logicalHeight);
    grad.addColorStop(0, '#1e3799');
    grad.addColorStop(1, '#4a69bd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Параллакс облаков
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(80 + i * 300 + cameraX * 0.5, 90 + (i % 3) * 35, 50, 0, Math.PI * 2);
        ctx.arc(130 + i * 300 + cameraX * 0.5, 90 + (i % 3) * 35, 70, 0, Math.PI * 2);
        ctx.fill();
    }

    // Отрисовка мира и блоков
    for (let b of blocks) {
        if (b.x + b.w < cameraX || b.x > cameraX + logicalWidth) continue;

        let drawY = b.y;
        if (b.bounce > 0) {
            drawY -= Math.sin((b.bounce / 16) * Math.PI) * 12;
            b.bounce--;
        }

        if (b.type === 'ground') {
            let g = ctx.createLinearGradient(0, drawY, 0, drawY + b.h);
            g.addColorStop(0, '#00b894');
            g.addColorStop(0.08, '#55efc4');
            g.addColorStop(1, '#2d3436');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.roundRect(b.x, drawY, b.w, b.h + 40, 8);
            ctx.fill();
        } else if (b.type === 'brick') {
            ctx.fillStyle = '#d63031';
            ctx.beginPath();
            ctx.roundRect(b.x, drawY, b.w, b.h, 6);
            ctx.fill();
            ctx.strokeStyle = '#b71540';
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, drawY, b.w, b.h);
        } else if (b.type === 'loot_box') {
            ctx.fillStyle = b.active ? '#fdcb6e' : '#636e72';
            ctx.beginPath();
            ctx.roundRect(b.x, drawY, b.w, b.h, 6);
            ctx.fill();
            ctx.strokeStyle = b.active ? '#e17055' : '#2d3436';
            ctx.lineWidth = 3;
            ctx.strokeRect(b.x + 4, drawY + 4, b.w - 8, b.h - 8);

            if (b.active) {
                ctx.fillStyle = '#d63031';
                ctx.font = 'bold 26px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', b.x + b.w / 2, drawY + b.h / 2 + 2);
            }
        }
    }

    // Отрисовка золотых трюфелей
    for (let it of items) {
        ctx.save();
        ctx.translate(it.x + 15, it.y + 15);
        let tg = ctx.createRadialGradient(0, 0, 2, 0, 0, 15);
        tg.addColorStop(0, '#fff200');
        tg.addColorStop(1, '#e67e22');
        ctx.fillStyle = tg;
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Рендер HD Свинки
    ctx.save();
    ctx.translate(pig.x + pig.width / 2, pig.y + pig.height);
    if (!pig.facingRight) ctx.scale(-1, 1);

    let walk = (pig.isGrounded && Math.abs(pig.vx) > 0.4) ? Math.sin(time * 16) * 10 : 0;
    let breath = Math.sin(time * 3.5) * 1.5;

    // Тень под персонажем
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Тело свинки
    ctx.fillStyle = '#ff9ff3';
    ctx.beginPath();
    ctx.ellipse(0, -22 + breath, 23, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Ушки
    ctx.fillStyle = '#f368e0';
    ctx.beginPath();
    ctx.moveTo(-10, -34 + breath);
    ctx.lineTo(-19, -43 + breath);
    ctx.lineTo(-8, -30 + breath);
    ctx.fill();

    // Пятачок
    ctx.fillStyle = '#ff7979';
    ctx.beginPath();
    ctx.ellipse(19, -21 + breath, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b53471';
    ctx.fillRect(20, -23 + breath, 2, 2);
    ctx.fillRect(20, -20 + breath, 2, 2);

    // Глаз
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(11, -27 + breath, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(12, -28 + breath, 1, 0, Math.PI * 2);
    ctx.fill();

    // Ножки
    ctx.fillStyle = '#f368e0';
    ctx.beginPath();
    ctx.roundRect(-11 + walk, -8, 7, 10, 3);
    ctx.roundRect(4 - walk, -8, 7, 10, 3);
    ctx.fill();

    ctx.restore();
    ctx.restore();
}

function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

gameLoop();
