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

const GRAVITY = 0.62;
const FRICTION = 0.78;
const JUMP_POWER = -14.2; 
const ACCELERATION = 1.6;  
const MAX_SPEED = 7.5;     

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

const blockSize = 50;
let blocks = [];
let items = [];
let particles = []; // Осколки при разбивании блоков

function generateMarioMap() {
    blocks = [];
    items = [];
    particles = [];

    // Большая карта в стиле Mario (длиной в 250 блоков с ямами и ступенями)
    for (let i = 0; i < 250; i++) {
        // Создаем ямы в определенных местах
        if (![12, 13, 28, 29, 45, 46, 65, 66, 90, 91].includes(i)) {
            blocks.push({ x: i * blockSize, y: logicalHeight - blockSize * 2, w: blockSize, h: blockSize * 5, type: 'ground' });
        }
    }

    // Добавляем ряды кирпичей и блоков с вопросами (как в Mario 1-1)
    // Первая группа блоков
    for (let i = 0; i < 4; i++) {
        blocks.push({ x: (6 + i) * blockSize, y: logicalHeight - blockSize * 6, w: blockSize, h: blockSize, type: i === 1 ? 'loot_box' : 'brick', active: true, bounce: 0 });
    }

    // Трубы / Препятствия
    blocks.push({ x: 18 * blockSize, y: logicalHeight - blockSize * 4, w: blockSize * 1.5, h: blockSize * 2, type: 'pipe' });
    blocks.push({ x: 25 * blockSize, y: logicalHeight - blockSize * 5, w: blockSize * 1.5, h: blockSize * 3, type: 'pipe' });

    // Большая лестница из кирпичей
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row <= col; row++) {
            blocks.push({ x: (35 + col) * blockSize, y: logicalHeight - blockSize * (3 + row), w: blockSize, h: blockSize, type: 'brick', active: true, bounce: 0 });
        }
    }

    // Секция с кучей вопросов и кирпичей
    let secX = 45;
    for (let i = 0; i < 8; i++) {
        let type = (i === 2 || i === 5) ? 'loot_box' : 'brick';
        blocks.push({ x: (secX + i) * blockSize, y: logicalHeight - blockSize * 6, w: blockSize, h: blockSize, type: type, active: true, bounce: 0 });
    }
}
generateMarioMap();

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

    for (let i = blocks.length - 1; i >= 0; i--) {
        let b = blocks[i];
        if (rectIntersect(pig, b)) {
            if (pig.vy > 0) { // Приземление сверху
                pig.y = b.y - pig.height;
                pig.vy = 0;
                pig.isGrounded = true;
            } else if (pig.vy < 0) { // Удар снизу головой в блок
                pig.y = b.y + b.h;
                pig.vy = 0;

                if (b.type === 'loot_box' && b.active) {
                    b.active = false;
                    b.bounce = 16;
                    // Спавн трюфеля из блока с вопросом
                    items.push({
                        x: b.x + blockSize / 2 - 15,
                        y: b.y - 35,
                        w: 30, h: 30,
                        vx: (Math.random() - 0.5) * 3,
                        vy: -7.5
                    });
                } 
                else if (b.type === 'brick') {
                    // РАЗБИВАЕМ ОБЫЧНЫЙ КИРПИЧ! Создаем осколки и удаляем блок из массива
                    for (let p = 0; p < 4; p++) {
                        particles.push({
                            x: b.x + b.w / 2,
                            y: b.y + b.h / 2,
                            vx: (Math.random() - 0.5) * 6,
                            vy: -4 - Math.random() * 4,
                            size: 10
                        });
                    }
                    blocks.splice(i, 1); // Блок полностью исчезает
                }
            }
        }
    }

    // Обновление осколков разбитых кирпичей
    for (let p = particles.length - 1; p >= 0; p--) {
        let pt = particles[p];
        pt.vy += GRAVITY * 0.8;
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.y > logicalHeight) particles.splice(p, 1);
    }

    // Физика трюфелей
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

    // Рестарт при падении в яму
    if (pig.y > logicalHeight + 120) {
        pig.x = 80; pig.y = 100;
        pig.vx = 0; pig.vy = 0;
        generateMarioMap();
    }

    let targetCamX = pig.x - logicalWidth * 0.38;
    if (targetCamX < 0) targetCamX = 0;
    cameraX += (targetCamX - cameraX) * 0.15;
}

function renderGame() {
    let grad = ctx.createLinearGradient(0, 0, 0, logicalHeight);
    grad.addColorStop(0, '#5c94fc'); // Классическое голубое небо Марио
    grad.addColorStop(1, '#98d8f8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Облака
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 280 + cameraX * 0.4, 80 + (i % 2) * 40, 40, 0, Math.PI * 2);
        ctx.arc(140 + i * 280 + cameraX * 0.4, 80 + (i % 2) * 40, 55, 0, Math.PI * 2);
        ctx.fill();
    }

    // Рендер блоков мира
    for (let b of blocks) {
        if (b.x + b.w < cameraX || b.x > cameraX + logicalWidth) continue;

        let drawY = b.y;
        if (b.bounce && b.bounce > 0) {
            drawY -= Math.sin((b.bounce / 16) * Math.PI) * 12;
            b.bounce--;
        }

        if (b.type === 'ground') {
            ctx.fillStyle = '#c84c0c'; // Земля в стиле Mario
            ctx.fillRect(b.x, drawY, b.w, b.h + 50);
            ctx.fillStyle = '#fcbc3c'; // Травяная шапка сверху
            ctx.fillRect(b.x, drawY, b.w, 10);
        } 
        else if (b.type === 'brick') {
            // Классический кирпичный блок Марио (можно разбивать!)
            ctx.fillStyle = '#b84010';
            ctx.fillRect(b.x, drawY, b.w, b.h);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, drawY, b.w, b.h);
            // Узор кирпича
            ctx.beginPath();
            ctx.moveTo(b.x, drawY + b.h/2); ctx.lineTo(b.x + b.w, drawY + b.h/2);
            ctx.moveTo(b.x + b.w/2, drawY); ctx.lineTo(b.x + b.w/2, drawY + b.h/2);
            ctx.stroke();
        } 
        else if (b.type === 'loot_box') {
            ctx.fillStyle = b.active ? '#fcbc3c' : '#7f8c8d';
            ctx.fillRect(b.x, drawY, b.w, b.h);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, drawY, b.w, b.h);

            if (b.active) {
                ctx.fillStyle = '#b84010';
                ctx.font = 'bold 28px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', b.x + b.w / 2, drawY + b.h / 2 + 2);
            }
        }
        else if (b.type === 'pipe') {
            ctx.fillStyle = '#00a800'; // Зеленая труба
            ctx.fillRect(b.x, drawY, b.w, b.h);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, drawY, b.w, b.h);
        }
    }

    // Рендер осколков разбитых кирпичей
    ctx.fillStyle = '#b84010';
    for (let pt of particles) {
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    }

    // Трюфели
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

    // Свинка
    ctx.save();
    ctx.translate(pig.x + pig.width / 2, pig.y + pig.height);
    if (!pig.facingRight) ctx.scale(-1, 1);

    let walk = (pig.isGrounded && Math.abs(pig.vx) > 0.4) ? Math.sin(time * 16) * 10 : 0;
    let breath = Math.sin(time * 3.5) * 1.5;

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff9ff3';
    ctx.beginPath();
    ctx.ellipse(0, -22 + breath, 23, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000';
    ctx.stroke();

    ctx.fillStyle = '#f368e0';
    ctx.beginPath();
    ctx.moveTo(-10, -34 + breath);
    ctx.lineTo(-19, -43 + breath);
    ctx.lineTo(-8, -30 + breath);
    ctx.fill();

    ctx.fillStyle = '#ff7979';
    ctx.beginPath();
    ctx.ellipse(19, -21 + breath, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillRect(20, -23 + breath, 2, 2);
    ctx.fillRect(20, -20 + breath, 2, 2);

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(11, -27 + breath, 3, 0, Math.PI * 2);
    ctx.fill();

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
