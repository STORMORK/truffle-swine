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

// --- ЗАГРУЗКА ВАШИХ СПРАЙТОВ ---
const imgPigSmall = new Image(); imgPigSmall.src = 'pig_small.png';
const imgPigBig = new Image();   imgPigBig.src = 'pig_big.png';
const imgTruffle = new Image();  imgTruffle.src = 'truffle.png';
const imgButcher = new Image();  imgButcher.src = 'butcher.png';
const imgAxe = new Image();      imgAxe.src = 'axe.png';

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
    width: 44, height: 44,
    vx: 0, vy: 0,
    isGrounded: false,
    facingRight: true,
    isPowerUp: false,
    animTimer: 0
};

const blockSize = 50;
let blocks = [];
let items = [];
let enemies = []; 
let axes = []; 
let particles = [];

function generateMarioWorld() {
    blocks = [];
    items = [];
    enemies = [];
    axes = [];
    particles = [];

    for (let i = 0; i < 250; i++) {
        if (![12, 13, 28, 29, 45, 46, 65, 66, 90, 91].includes(i)) {
            blocks.push({ x: i * blockSize, y: logicalHeight - blockSize * 2, w: blockSize, h: blockSize * 5, type: 'ground' });
        }
    }

    for (let i = 0; i < 4; i++) {
        blocks.push({ x: (6 + i) * blockSize, y: logicalHeight - blockSize * 6, w: blockSize, h: blockSize, type: i === 1 ? 'loot_box' : 'brick', active: true, bounce: 0 });
    }

    blocks.push({ x: 18 * blockSize, y: logicalHeight - blockSize * 4, w: blockSize * 1.5, h: blockSize * 2, type: 'pipe' });
    blocks.push({ x: 25 * blockSize, y: logicalHeight - blockSize * 5, w: blockSize * 1.5, h: blockSize * 3, type: 'pipe' });

    for (let col = 0; col < 5; col++) {
        for (let row = 0; row <= col; row++) {
            blocks.push({ x: (35 + col) * blockSize, y: logicalHeight - blockSize * (3 + row), w: blockSize, h: blockSize, type: 'brick', active: true, bounce: 0 });
        }
    }

    let enemySpawns = [15, 24, 38, 52, 70];
    for (let pos of enemySpawns) {
        enemies.push({
            x: pos * blockSize,
            y: logicalHeight - blockSize * 2 - 48,
            width: 44, height: 48,
            vx: -0.6,
            alive: true,
            throwTimer: 0,
            animTimer: Math.random() * 100
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
        pig.animTimer += Math.abs(pig.vx) * 0.2;
    } else {
        pig.vx *= FRICTION;
        pig.animTimer = 0;
    }

    if (pig.vx > MAX_SPEED) pig.vx = MAX_SPEED;
    if (pig.vx < -MAX_SPEED) pig.vx = -MAX_SPEED;
    if (Math.abs(pig.vx) < 0.2) pig.vx = 0;

    if (input.isJumpPressed() && pig.isGrounded) {
        pig.vy = JUMP_POWER;
        pig.isGrounded = false;
    }

    pig.vy += GRAVITY;

    pig.x += pig.vx;
    for (let b of blocks) {
        if (rectIntersect(pig, b)) {
            if (pig.vx > 0) { pig.x = b.x - pig.width; pig.vx = 0; }
            else if (pig.vx < 0) { pig.x = b.x + b.w; pig.vx = 0; }
        }
    }

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

    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        
        enemy.x += enemy.vx;
        enemy.throwTimer++;
        enemy.animTimer += 0.15;

        let distToPig = pig.x - enemy.x;
        if (enemy.throwTimer > 140 && Math.abs(distToPig) < 450) {
            enemy.throwTimer = 0;
            let axeDir = (distToPig > 0) ? 1 : -1;
            axes.push({
                x: enemy.x + (axeDir > 0 ? enemy.width : -28),
                y: enemy.y + 10,
                width: 28, height: 28,
                vx: axeDir * 6,
                vy: 0,
                rotation: 0
            });
        }

        if (rectIntersect(pig, enemy)) {
            if (pig.vy > 0 && pig.y + pig.height - pig.vy <= enemy.y + 12) {
                enemy.alive = false;
                pig.vy = -9;
            } else {
                if (pig.isPowerUp) {
                    pig.isPowerUp = false;
                    pig.width = 44; pig.height = 44;
                    pig.x -= 30;
                } else {
                    pig.x = 80; pig.y = 100;
                    pig.vx = 0; pig.vy = 0;
                }
            }
        }
    }

    for (let a = axes.length - 1; a >= 0; a--) {
        let ax = axes[a];
        ax.x += ax.vx;
        ax.rotation += 0.25;

        if (rectIntersect(pig, ax)) {
            if (pig.isPowerUp) {
                pig.isPowerUp = false;
                pig.width = 44; pig.height = 44;
            } else {
                pig.x = 80; pig.y = 100;
                pig.vx = 0; pig.vy = 0;
            }
            axes.splice(a, 1);
            continue;
        }

        if (ax.x < cameraX - 100 || ax.x > cameraX + logicalWidth + 100) {
            axes.splice(a, 1);
        }
    }

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
            pig.isPowerUp = true;
            pig.width = 58;  
            pig.height = 58;
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
        pig.width = 44; pig.height = 44;
        generateMarioWorld();
    }

    let targetCamX = pig.x - logicalWidth * 0.38;
    if (targetCamX < 0) targetCamX = 0;
    cameraX += (targetCamX - cameraX) * 0.15;
}

function renderGame() {
    let grad = ctx.createLinearGradient(0, 0, 0, logicalHeight);
    grad.addColorStop(0, '#5c94fc');
    grad.addColorStop(1, '#98d8f8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    ctx.save();
    ctx.translate(-cameraX, 0);

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

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(100 + i * 280, 80 + (i % 2) * 40, 40, 0, Math.PI * 2);
        ctx.arc(140 + i * 280, 80 + (i % 2) * 40, 55, 0, Math.PI * 2);
        ctx.fill();
    }

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

    for (let it of items) {
        if (imgTruffle.complete && imgTruffle.naturalWidth !== 0) {
            ctx.drawImage(imgTruffle, it.x, it.y, it.w, it.h);
        } else {
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(it.x + 16, it.y + 16, 14, 0, Math.PI * 2); ctx.fill();
        }
    }

    ctx.fillStyle = '#b84010';
    for (let pt of particles) {
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    }

    // Рендер анимированных Мясников
    for (let enemy of enemies) {
        if (!enemy.alive) continue;
        ctx.save();
        
        // Анимация покачивания при ходьбе
        let butcherBounce = Math.sin(enemy.animTimer) * 3;
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height + butcherBounce);
        
        if (imgButcher.complete && imgButcher.naturalWidth !== 0) {
            ctx.drawImage(imgButcher, -enemy.width / 2, -enemy.height, enemy.width, enemy.height);
        } else {
            ctx.fillStyle = '#fff'; ctx.fillRect(-15, -40, 30, 40);
        }
        ctx.restore();
    }

    for (let ax of axes) {
        ctx.save();
        ctx.translate(ax.x + ax.width / 2, ax.y + ax.height / 2);
        ctx.rotate(ax.rotation);
        if (imgAxe.complete && imgAxe.naturalWidth !== 0) {
            ctx.drawImage(imgAxe, -ax.width / 2, -ax.height / 2, ax.width, ax.height);
        } else {
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(-10, -10, 20, 20);
        }
        ctx.restore();
    }

    // Рендер анимированной Свинки
    ctx.save();
    
    // Анимация прыжка и бега (пружинение)
    let pigBounce = 0;
    if (pig.isGrounded && Math.abs(pig.vx) > 0.5) {
        pigBounce = Math.sin(pig.animTimer) * 4;
    }
    
    ctx.translate(pig.x + pig.width / 2, pig.y + pig.height + pigBounce);
    if (!pig.facingRight) ctx.scale(-1, 1);

    if (pig.isPowerUp) {
        if (imgPigBig.complete && imgPigBig.naturalWidth !== 0) {
            ctx.drawImage(imgPigBig, -pig.width / 2, -pig.height, pig.width, pig.height);
        } else {
            ctx.fillStyle = '#ff9ff3'; ctx.fillRect(-22, -58, 44, 58);
        }
    } else {
        if (imgPigSmall.complete && imgPigSmall.naturalWidth !== 0) {
            ctx.drawImage(imgPigSmall, -pig.width / 2, -pig.height, pig.width, pig.height);
        } else {
            ctx.fillStyle = '#ff9ff3'; ctx.fillRect(-20, -44, 40, 44);
        }
    }

    ctx.restore();
    ctx.restore();

    // --- КОМПАКТНЫЙ ИНДИКАТОР МЕТРАЖА НИЖЕ СИСТЕМНОЙ ЗОНЫ ТЕЛЕФОНА ---
    let totalMapWidthPixels = 250 * blockSize;
    let currentMeters = Math.min(200, Math.floor((pig.x / totalMapWidthPixels) * 200));

    ctx.save();
    // Сдвинули ниже по Y (на 60px от верха экрана) и уменьшили размер
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.roundRect(logicalWidth - 90, 55, 75, 26, 6);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(currentMeters + "м / 200м", logicalWidth - 20, 68);
    ctx.restore();
}

function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

gameLoop();
