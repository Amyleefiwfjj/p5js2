let dino;
let obstacles = [];
let score = 0;
let gameOver = false;
let gravity = 0.8;

function setup() {
    createCanvas(800, 400);
    dino = new Dino();
    // 초기 장애물 생성 (추가로 draw()에서 주기적으로 생성)
    obstacles.push(new Obstacle());
}

function draw() {
    background(220);

    if (!gameOver) {
        // 점수 업데이트 (시간에 따라 증가)
        score += 0.05;

        // 공룡 업데이트 및 그리기
        dino.update();
        dino.show();

        // 일정 프레임마다 장애물 생성 (여기서는 90프레임마다)
        if (frameCount % 90 === 0) {
            obstacles.push(new Obstacle());
        }

        // 모든 장애물 업데이트, 그리기 및 충돌 검사
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].update();
            obstacles[i].show();

            if (obstacles[i].hits(dino)) {
                gameOver = true;
            }

            // 장애물이 화면 밖으로 나가면 배열에서 제거
            if (obstacles[i].offscreen()) {
                obstacles.splice(i, 1);
            }
        }

        // 점수 표시
        fill(0);
        textSize(24);
        text("Score: " + floor(score), 10, 30);
    } else {
        // 게임 오버 상태 표시
        textSize(48);
        fill(0);
        text("Game Over", width / 2 - 120, height / 2);
        textSize(24);
        text("Press 'R' to restart", width / 2 - 100, height / 2 + 40);
    }
}

function keyPressed() {
    // 점프: 스페이스바나 위쪽 화살표를 누르면 공룡이 점프
    if (key === ' ' || keyCode === UP_ARROW) {
        dino.jump();
    }
    // 게임 오버 시 'R'키를 누르면 재시작
    if (gameOver && (key === 'r' || key === 'R')) {
        restartGame();
    }
}

function restartGame() {
    gameOver = false;
    score = 0;
    obstacles = [];
    dino = new Dino();
}

// 공룡 클래스
class Dino {
    constructor() {
        this.r = 50; // 공룡의 크기 (정사각형)
        this.x = 50;
        this.y = height - this.r;
        this.vy = 0;
        this.jumpForce = 15;
    }

    jump() {
        // 공룡이 땅에 있을 때만 점프 가능
        if (this.y === height - this.r) {
            this.vy = -this.jumpForce;
        }
    }

    update() {
        this.y += this.vy;
        this.vy += gravity;
        // 공룡이 땅 아래로 내려가지 않도록 제한
        if (this.y > height - this.r) {
            this.y = height - this.r;
            this.vy = 0;
        }
    }

    show() {
        fill(50, 205, 50);
        rect(this.x, this.y, this.r, this.r);
    }
}

// 장애물 클래스
class Obstacle {
    constructor() {
        this.w = random(20, 40);
        this.h = random(40, 80);
        this.x = width;
        this.y = height - this.h;
        this.speed = 6;
    }

    update() {
        this.x -= this.speed;
    }

    show() {
        fill(255, 0, 0);
        rect(this.x, this.y, this.w, this.h);
    }

    offscreen() {
        return this.x < -this.w;
    }

    hits(dino) {
        // 간단한 사각형 충돌 감지 (충돌 시 true 반환)
        return (dino.x < this.x + this.w &&
            dino.x + dino.r > this.x &&
            dino.y < this.y + this.h &&
            dino.y + dino.r > this.y);
    }
}
