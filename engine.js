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
    facingRight: true,
    isPowerUp: false // Становится больше, на двух ногах и в сомбреро при ловле трюфеля!
};

const blockSize = 50;
let blocks = [];
let items = [];
let enemies = []; // Злые мясники с топорами
let particles = [];

function generateMarioWorld() {
    blocks = [];
    items = [];
    enemies = [];
    particles = [];

    // Длинная карта мира Марио (250 блоков с точными ямами)
    for (let i = 0; i < 250; i++) {
        if (![12, 13, 28, 29, 45, 46, 65, 66, 90, 91].includes(i)) {
            blocks.push({ x: i * blockSize, y: logicalHeight - blockSize * 2, w: blockSize, h: blockSize * 5, type: 'ground' });
        }
    }

    // Блоки с вопросами и кирпичи
    for (let i = 0; i < 4; i++) {
        blocks.push({ x: (6 + i) * blockSize, y: logicalHeight - blockSize * 6, w: blockSize, h: blockSize, type: i === 1 ? 'loot_box' : 'brick', active: true, bounce: 0 });
    }

    // Трубы
    blocks.push({ x: 18 * blockSize, y: logicalHeight - blockSize * 4, w: blockSize * 1.5, h: blockSize * 2, type: 'pipe' });
    blocks.push({ x: 25 * blockSize, y: logicalHeight - blockSize * 5, w: blockSize * 1.5, h: blockSize * 3, type: 'pipe' });

    // Лестницы
    for (let col = 0; col < 5; col++) {
        for (let row = 0; row <= col; row++) {
            blocks.push({ x: (35 + col) * blockSize, y: logicalHeight - blockSize * (3 + row), w: blockSize, h: blockSize, type: 'brick', active: true, bounce: 0 });
        }
    }

    // Спавн врагов-мясников в белых халатах с топорами (идем навстречу)
    let enemySpawns = [15, 24, 38, 52, 70];
    for (let pos of enemySpawns) {
        enemies.push({
            x: pos * blockSize,
            y: logicalHeight - blockSize * 3 - 44,
            width: 40, height: 44,
            vx: -1.2, // Движутся навстречу
            alive: true,
            animTimer: 0
        });
    }
}
generateMarioWorld();

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

    // Горизонтальные коллизии игрока
    pig.x += pig.vx;
    for (let b of blocks) {
        if (rectIntersect(pig, b)) {
            if (pig.vx > 0) { pig.x = b.x - pig.width; pig.vx = 0; }
            else if (pig.vx < 0) { pig.x = b.x + b.w; pig.vx = 0; }
        }
    }

    // Вертикальные коллизии игрока
    pig.y += pig.vy;
    pig.isGrounded = false;

    for (let i = blocks.length - 1; i >= 0; i--) {
        let b = blocks[i];
        if (rectIntersect(pig, b)) {
            if (pig.vy > 0) {
                pig.y = b.y - pig.height;
                pig.vy = 0;
                pig.isGrounded = true;
            } else if (pig.vy < 0) {
                pig.y = b.y + b.h;
                pig.vy = 0;

                if (b.type === 'loot_box' && b.active) {
                    b.active = false;
                    b.bounce = 16;
                    // Детально прорисованный трюфель вылетает из блока
                    items.push({
                        x: b.x + blockSize / 2 - 16,
                        y: b.y - 35,
                        w: 32, h: 32,
                        vx: (Math.random() - 0.5) * 3,
                        vy: -7.5
                    });
                } 
                else if (b.type === 'brick') {
                    for (let p = 0; p < 4; p++) {
                        particles.push({
                            x: b.x + b.w / 2, y: b.y + b.h / 2,
                            vx: (Math.random() - 0.5) * 6,
                            vy: -4 - Math.random() * 4,
                            size: 10
                        });
                    }
                    blocks.splice(i, 1);
                }
            }
        }
    }

    // Логика врагов (Мясников с топорами)
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        enemy.animTimer += 0.15;
        enemy.x += enemy.vx;

        // Столкновение врага с игроком
        if (rectIntersect(pig, enemy)) {
            if (pig.vy > 0 && pig.y + pig.height - pig.vy <= enemy.y + 12) {
                // Прыжок сверху на мясника уничтожает его
                enemy.alive = false;
                pig.vy = -9; // Отскок
            } else {
                // Столкновение сбоку: урон / сброс прогресса
                pig.x = 80; pig.y = 100;
                pig.vx = 0; pig.vy = 0;
                pig.isPowerUp = false;
                pig.width = 46; pig.height = 42;
            }
        }
    }

    // Физика детальных трюфелей
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

        // Подбор трюфеля: Свинка становится больше, на 2 ногах и в сомбреро!
        if (rectIntersect(pig, it)) {
            scoreCoins++;
            document.getElementById('coinsText').innerText = scoreCoins;
            pig.isPowerUp = true;
            pig.width = 56;  // Увеличенный размер
            pig.height = 54;
            items.splice(i, 1);
        }
    }

    for (let p = particles.length - 1; p >= 0; p--) {
        let pt = particles[p];
        pt.vy += GRAVITY * 0.8;
        pt.x += pt.vx;
        pt.y += pt.vy;
        if (pt.y > logicalHeight) particles.splice(p, 1);
    }

    if (pig.y > logicalHeight + 120) {
        pig.x = 80; pig.y = 100;
        pig.vx = 0; pig.vy = 0;
        pig.isPowerUp = false;
        pig.width = 46; pig.height = 42;
        generateMarioWorld();
    }

    let targetCamX = pig.x - logicalWidth * 0.38;
    if (targetCamX < 0) targetCamX = 0;
    cameraX += (targetCamX - cameraX) * 0.15;
}

function renderGame() {
    // Классический фон Марио (голубое небо + холмы на заднем плане)
    let grad = ctx.createLinearGradient(0, 0, 0, logicalHeight);
    grad.addColorStop(0, '#5c94fc');
    grad.addColorStop(1, '#98d8f8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    ctx.save();
    ctx.translate(-cameraX, 0);

    // Задний фон (холмы и кусты в стиле Марио)
    ctx.fillStyle = '#00a800';
    for (let i = 0; i < 15; i++) {
        let hx = i * 600 - (cameraX * 0.2) % 600;
        ctx.beginPath();
        ctx.arc(hx + 100, logicalHeight - blockSize * 2, 80, Math.PI, 0, false);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx + 350, logicalHeight - blockSize * 2, 120, Math.PI, 0, false);
        ctx.fill();
    }

    // Облака
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 280, 80 + (i % 2) * 40, 40, 0, Math.PI * 2);
        ctx.arc(140 + i * 280, 80 + (i % 2) * 40, 55, 0, Math.PI * 2);
        ctx.fill();
    }

    // Рендер блоков
    for (let b of blocks) {
        if (b.x + b.w < cameraX || b.x > cameraX + logicalWidth) continue;

        let drawY = b.y;
        if (b.bounce && b.bounce > 0) {
            drawY -= Math.sin((b.bounce / 16) * Math.PI) * 12;
            b.bounce--;
        }

        if (b.type === 'ground') {
            ctx.fillStyle = '#c84c0c';
            ctx.fillRect(b.x, drawY, b.w, b.h + 50);
            ctx.fillStyle = '#fcbc3c';
            ctx.fillRect(b.x, drawY, b.w, 10);
        } 
        else if (b.type === 'brick') {
            ctx.fillStyle = '#b84010';
            ctx.fillRect(b.x, drawY, b.w, b.h);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, drawY, b.w, b.h);
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
            ctx.fillStyle = '#00a800';
            ctx.fillRect(b.x, drawY, b.w, b.h);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, drawY, b.w, b.h);
            ctx.fillStyle = '#00e800';
            ctx.fillRect(b.x + 4, drawY + 4, b.w - 8, 10);
        }
    }

    // Детально прорисованные трюфели (золотые с прожилками и текстурой гриба/ореха)
    for (let it of items) {
        ctx.save();
        ctx.translate(it.x + 16, it.y + 16);
        
        let tg = ctx.createRadialGradient(-2, -2, 2, 0, 0, 16);
        tg.addColorStop(0, '#fff200');
        tg.addColorStop(0.5, '#f1c40f');
        tg.addColorStop(1, '#d35400');
        
        ctx.fillStyle = tg;
        ctx.shadowColor = '#f1c40f';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 2, 14, 0, Math.PI * 2);
        ctx.fill();

        // Текстура бугристого трюфеля
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-3, -2, 4, 0, Math.PI * 2);
        ctx.arc(4, 3, 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    // Осколки кирпичей
    ctx.fillStyle = '#b84010';
    for (let pt of particles) {
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    }

    // Рендер злых врагов — Мясников в белых халатах с топорами
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height);

        let walkLegs = Math.sin(enemy.animTimer * 12) * 6;

        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Белый халат мясника
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14, -34, 28, 24);
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(-14, -34, 28, 24);

        // Голова и злая рожица
        ctx.fillStyle = '#f5cd79';
        ctx.beginPath();
        ctx.arc(0, -38, 11, 0, Math.PI * 2);
        ctx.fill();

        // Злые глаза
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(-6, -41, 3, 3);
        ctx.fillRect(3, -41, 3, 3);

        // Топор в руке
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(12, -32, 4, 16); // Рукоятка
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(14, -35); ctx.lineTo(24, -38); ctx.lineTo(24, -28); ctx.fill(); // Лезвие топорика

        // Ноги
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-10 + walkLegs, -10, 6, 10);
        ctx.fillRect(4 - walkLegs, -10, 6, 10);

        ctx.restore();
    }

    // Рендер Свинки (увеличенной, на двух ногах и в сомбреро, если пойман трюфель)
    ctx.save();
    ctx.translate(pig.x + pig.width / 2, pig.y + pig.height);
    if (!pig.facingRight) ctx.scale(-1, 1);

    let walk = (pig.isGrounded && Math.abs(pig.vx) > 0.4) ? Math.sin(time * 16) * 10 : 0;
    let breath = Math.sin(time * 3.5) * 1.5;

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, pig.isPowerUp ? 24 : 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (pig.isPowerUp) {
        // --- СВИНИНА НА ДВУХ НОГАХ (БОЛЬШАЯ) ---
        ctx.fillStyle = '#ff9ff3';
        ctx.beginPath();
        ctx.ellipse(0, -30 + breath, 24, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Пятачок
        ctx.fillStyle = '#ff7979';
        ctx.beginPath();
        ctx.ellipse(19, -28 + breath, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(20, -30 + breath, 2, 2);
        ctx.fillRect(20, -26 + breath, 2, 2);

        // Глаз
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(10, -36 + breath, 3, 0, Math.PI * 2);
        ctx.fill();

        // Сомбреро (мексиканская шляпа)
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.ellipse(0, -52 + breath, 32, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d35400';
        ctx.stroke();
        // Тулья сомбреро
        ctx.beginPath();
        ctx.roundRect(-14, -68 + breath, 28, 18, [6, 6, 0, 0]);
        ctx.fill();
        ctx.stroke();
        // Узор на сомбреро
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-14, -58 + breath, 28, 4);

        // Две вертикальные ноги (антропоморфные)
        ctx.fillStyle = '#f368e0';
        ctx.beginPath();
        ctx.roundRect(-10 + walk, -14, 8, 14, 3);
        ctx.roundRect(2 - walk, -14, 8, 14, 3);
        ctx.fill();

    } else {
        // --- ОБЫЧНАЯ СВИНКА ---
        ctx.fillStyle = '#ff9ff3';
        ctx.beginPath();
        ctx.ellipse(0, -22 + breath, 23, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.stroke();

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
    }

    ctx.restore();
    ctx.restore();
}

function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

gameLoop();
