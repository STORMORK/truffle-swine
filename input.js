// Модуль обработки сенсорного и клавиатурного управления с высокой скоростью реакции
class InputController {
    constructor() {
        this.isTouching = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.jumpTriggered = false;

        window.addEventListener('touchstart', (e) => {
            this.isTouching = true;
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            this.currentX = this.startX;
            this.currentY = this.startY;
            this.jumpTriggered = false;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!this.isTouching) return;
            this.currentX = e.touches[0].clientX;
            this.currentY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.isTouching = false;
            this.currentX = this.startX;
            this.jumpTriggered = false;
        });

        // Дополнительно поддержка клавиатуры для тестов на ПК
        this.keys = {};
        window.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    }

    getAxisX() {
        if (this.isTouching) {
            let diff = this.currentX - this.startX;
            if (Math.abs(diff) > 10) {
                return diff > 0 ? 1 : -1;
            }
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) return 1;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) return -1;
        return 0;
    }

    isJumpPressed() {
        if (this.isTouching) {
            let diffY = this.currentY - this.startY;
            if (diffY < -25 && !this.jumpTriggered) {
                this.jumpTriggered = true;
                return true;
            }
        }
        if (this.keys['ArrowUp'] || this.keys['Space'] || this.keys['KeyW']) {
            this.keys['ArrowUp'] = false; // сброс единичного нажатия
            this.keys['Space'] = false;
            this.keys['KeyW'] = false;
            return true;
        }
        return false;
    }
}
