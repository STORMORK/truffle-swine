class InputController {
    constructor() {
        this.keys = {};
        this.touchLeft = false;
        this.touchRight = false;
        this.touchJump = false;

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Простая поддержка базового сенсорного управления по зонам экрана (если нет экранных кнопок)
        window.addEventListener('touchstart', (e) => {
            for (let touch of e.touches) {
                let x = touch.clientX;
                if (x < window.innerWidth * 0.3) {
                    this.touchLeft = true;
                } else if (x < window.innerWidth * 0.6) {
                    this.touchJump = true;
                } else {
                    this.touchRight = true;
                }
            }
        });

        window.addEventListener('touchend', (e) => {
            this.touchLeft = false;
            this.touchRight = false;
            this.touchJump = false;
            for (let touch of e.touches) {
                let x = touch.clientX;
                if (x < window.innerWidth * 0.3) this.touchLeft = true;
                else if (x < window.innerWidth * 0.6) this.touchJump = true;
                else this.touchRight = true;
            }
        });
    }

    getAxisX() {
        let axis = 0;
        if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.touchLeft) axis -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.touchRight) axis += 1;
        return axis;
    }

    isJumpPressed() {
        let jump = this.keys['Space'] || this.keys['ArrowUp'] || this.keys['KeyW'] || this.touchJump;
        // Сбрасываем разовое нажатие для тача, чтобы свинья не летела бесконечно
        if (this.touchJump) {
            this.touchJump = false;
            return true;
        }
        return jump;
    }
}
