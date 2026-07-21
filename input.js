class InputController {
    constructor() {
        this.dirX = 0;
        this.jumpRequested = false;
        
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isSwiping = false;

        // Клавиатура (для ПК / отладки)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.dirX = -1;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.dirX = 1;
            if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
                this.jumpRequested = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && this.dirX === -1) this.dirX = 0;
            if ((e.code === 'ArrowRight' || e.code === 'KeyD') && this.dirX === 1) this.dirX = 0;
        });

        // Сенсорное управление и свайпы для мобильных устройств
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
                this.isSwiping = true;
                
                // Верхняя часть экрана или быстрый тап — прыжок
                if (this.touchStartY < window.innerHeight * 0.4) {
                    this.jumpRequested = true;
                } else {
                    // Нижняя часть экрана: левая или правая сторона для бега
                    if (this.touchStartX < window.innerWidth * 0.5) {
                        this.dirX = -1;
                    } else {
                        this.dirX = 1;
                    }
                }
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!this.isSwiping || e.touches.length === 0) return;
            let currentX = e.touches[0].clientX;
            let currentY = e.touches[0].clientY;
            let diffY = currentY - this.touchStartY;

            // Свайп вверх для прыжка
            if (diffY < -35) {
                this.jumpRequested = true;
            }

            // Плавное следование за пальцем по горизонтали (лево/право)
            if (currentX < window.innerWidth * 0.4) {
                this.dirX = -1;
            } else if (currentX > window.innerWidth * 0.6) {
                this.dirX = 1;
            }
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            this.isSwiping = false;
            // При отпускании пальца останавливаем движение
            if (e.touches.length === 0) {
                this.dirX = 0;
            }
        });
    }

    getAxisX() {
        return this.dirX;
    }

    isJumpPressed() {
        let val = this.jumpRequested;
        this.jumpRequested = false; // сбрасываем триггер прыжка после считывания
        return val;
    }
}
