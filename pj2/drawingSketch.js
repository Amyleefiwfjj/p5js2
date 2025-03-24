// drawingSketch.js
const drawingSketch = (p) => {
    let userCanvas;
    p.setup = function() {
      p.createCanvas(400, 300);
      userCanvas = p.createGraphics(400, 300);
      userCanvas.background(220);
    };
    p.draw = function() {
      p.background(200);
      // Display userCanvas in this sketch for drawing
      p.image(userCanvas, 0, 0);
      if (p.mouseIsPressed) {
        userCanvas.fill(0);
        userCanvas.noStroke();
        userCanvas.ellipse(p.mouseX, p.mouseY, 10, 10);
      }
    };
    // You can add a function to "save" the drawing and communicate it to the gallerySketch if needed.
  };
  
  new p5(drawingSketch, 'drawingContainer');
  