// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const TelegramService = {
    // Вызов вибрации
    vibrate(type = 'light') {
        if (tg.HapticFeedback) {
            if (type === 'error') tg.HapticFeedback.notificationOccurred('error');
            else tg.HapticFeedback.impactOccurred(type);
        }
    },
    // Получение имени игрока
    getUserName() {
        return tg.initDataUnsafe?.user?.first_name || 'Игрок';
    }
};
