let droplets = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    noiseDetail(4, 0.6);
}

function draw() {
    background(255, 1.2);
    
    for (let i = droplets.length - 1; i >= 0; i--) {
        droplets[i].spread();
        droplets[i].show();
        if (droplets[i].finished()) {
            droplets.splice(i, 1);
        }
    }
}

function mouseDragged() {
    for (let i = 0; i < 5; i++) {
        droplets.push(new Droplet(mouseX, mouseY));
    }
}

class Droplet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.noiseOffsetX = random(1000);
        this.noiseOffsetY = random(1000);
        this.size = random(3, 10); // 크기를 줄임
        this.alpha = 180;
        this.expansion = random(0.1, 0.5); // 확산 속도 조절
        this.color = [random(50, 150), random(50, 100), random(150, 255), this.alpha];
        this.shape = this.createFluidShape();
    }

    spread() {
        let nX = noise(this.noiseOffsetX) * 2 - 1;
        let nY = noise(this.noiseOffsetY) * 2 - 1;
        this.x += nX * this.expansion;
        this.y += nY * this.expansion;
        this.noiseOffsetX += 0.02;
        this.noiseOffsetY += 0.02;
        this.size += this.expansion * 0.5;
        this.alpha -= 1.5;
        this.shape = this.createFluidShape();
    }

    finished() {
        return this.alpha <= 0;
    }

    createFluidShape() {
        let points = [];
        let numPoints = floor(random(10, 20));
        let noiseFactor = random(0.1, 0.3);
        for (let i = 0; i < numPoints; i++) {
            let angle = map(i, 0, numPoints, 0, TWO_PI);
            let radius = this.size * (0.7 + noise(i * noiseFactor + frameCount * 0.01) * 0.5);
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            points.push([x, y]);
        }
        return points;
    }

    show() {
        noStroke();
        fill(this.color[0], this.color[1], this.color[2], this.alpha);
        beginShape();
        for (let v of this.shape) {
            curveVertex(this.x + v[0], this.y + v[1]);
        }
        endShape(CLOSE);
    }
}
