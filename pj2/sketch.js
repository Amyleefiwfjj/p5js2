function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255, 0, 0);
}

function draw() {
    if (mouseIsPressed) {
        let size = random(10, 100);
        ellipse(mouseX, mouseY, size, size);
    }
}
