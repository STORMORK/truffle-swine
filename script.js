// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран
tg.ready();

// Игровое состояние
let gameState = {
    meat: 150,
    bones: 20,
    attractions: [
        качели("Качели из лиан", 10, 5, 1),
        качели("Горка из костей", 50, 15, 0)
    ]
};

function качели(name, cost, income, count) {
    return { name, cost, income, count };
}

// Элементы на странице
const meatElement = document.getElementById('meat-count');
const bonesElement = document.getElementById('bones-count');
const gridElement = document.getElementById('attractions-grid');

// Отрисовка игры
function updateUI() {
    meatElement.innerText = gameState.meat;
    bonesElement.innerText = gameState.bones;
    
    gridElement.innerHTML = '';
    gameState.attractions.forEach((attr, index) => {
        gridElement.innerHTML += `
            <div class="attraction-card" onclick="upgradeAttraction(${index})">
                <div style="font-size: 24px;">🛖</div>
                <div style="font-size: 13px; font-weight: bold; margin-top: 4px;">${attr.name}</div>
                <div style="font-size: 11px; color: #a89f91; margin-top: 2px;">Уровень: ${attr.count}</div>
                <div style="font-size: 11px; color: #fbbf24; margin-top: 2px;">+${attr.income * attr.count}/сек</div>
            </div>
        `;
    });
}

// Клик / Покупка улучшения
function upgradeAttraction(index) {
    let attr = gameState.attractions[index];
    if (gameState.meat >= attr.cost) {
        gameState.meat -= attr.cost;
        attr.count += 1;
        attr.cost = Math.floor(attr.cost * 1.3); // Удорожание
        
        // Вибрация в Telegram при успешном действии
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('medium');
        }
        
        updateUI();
    } else {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
    }
}

// Сбор ресурсов (кнопка внизу)
function collectIncome() {
    let totalIncome = gameState.attractions.reduce((sum, attr) => sum + (attr.income * attr.count), 1);
    gameState.meat += totalIncome;
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    updateUI();
}

// Пассивный доход каждую секунду
setInterval(() => {
    let passiveSum = gameState.attractions.reduce((sum, attr) => sum + (attr.income * attr.count), 0);
    gameState.meat += passiveSum;
    updateUI();
}, 1000);

// Первичный запуск
updateUI();
