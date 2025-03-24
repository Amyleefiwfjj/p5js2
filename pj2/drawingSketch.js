const drawingSketch = (p) => {
    let userCanvas;
    let invertBrushBtn;
    let brushTypeBtn;
    let penSliderElem;
    let resultViewBtn;
    let galleryBtn;
    let colorPickerElem;
    
    // New: Erase & Undo buttons
    let eraseBtn;
    let undoBtn;
  
    let useInvertedBrush = false;
    let finalInvert = false;
    let brushType = 'stamp'; // 'stamp' or 'pencil'
    let currentColor = '#000000'; // default color
  
    // For storing "undo" states
    let history = [];
  
    let droplets = [];
    let prevX, prevY;
  
    p.setup = function() {
      // Attach the p5 canvas to #canvasArea
      const canvasParent = document.getElementById('canvasArea');
      let cnv = p.createCanvas(1300, 800);
      cnv.parent(canvasParent);
  
      // Offscreen buffer for user drawing
      userCanvas = p.createGraphics(1300, 800);
      userCanvas.background(220);
  
      // Grab references to existing HTML elements
      invertBrushBtn  = document.getElementById('invertBrushBtn');
      brushTypeBtn    = document.getElementById('brushTypeBtn');
      penSliderElem   = document.getElementById('penSlider');
      resultViewBtn   = document.getElementById('resultViewBtn');
      galleryBtn      = document.getElementById('galleryBtn');
      colorPickerElem = document.getElementById('colorPickerInput');
  
      // NEW: Erase & Undo buttons
      eraseBtn        = document.getElementById('eraseBtn');
      undoBtn         = document.getElementById('undoBtn');
  
      // Set up event listeners
      invertBrushBtn.addEventListener('click', () => {
        useInvertedBrush = !useInvertedBrush;
        invertBrushBtn.textContent = useInvertedBrush ? "ON" : "OFF";
      });
  
      brushTypeBtn.addEventListener('click', () => {
        if (brushType === 'stamp') {
          brushType = 'pencil';
          brushTypeBtn.textContent = "연필";
        } else {
          brushType = 'stamp';
          brushTypeBtn.textContent = "스탬프";
        }
      });
  
      resultViewBtn.addEventListener('click', () => {
        userCanvas.filter(p.INVERT);
        finalInvert = !finalInvert;
        resultViewBtn.textContent = finalInvert ? "ON" : "OFF";
      });
  
      galleryBtn.addEventListener('click', () => {
        alert("갤러리에 전시하기 버튼이 눌렸습니다!");
      });
  
      // Erase button
      eraseBtn.addEventListener('click', () => {
        pushHistory(); // save current state before clearing
        userCanvas.background(220);
      });
  
      // Undo button
      undoBtn.addEventListener('click', () => {
        popHistory();
      });
  
      // Initialize Spectrum color picker
      $(colorPickerElem).spectrum({
        color: "#000000",
        showInput: true,
        preferredFormat: "hex",
        showPalette: true,
        palette: [
          ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"],
          ["#FFFFFF", "#FFA500", "#800080", "#00FFFF", "#FFC0CB"]
        ],
        change: function(color) {
          currentColor = color.toHexString();
        }
      });
  
      p.noiseDetail(4, 0.6);
    };
  
    // Save current userCanvas state to history
    function pushHistory() {
      // get() returns a p5.Image snapshot
      let snapshot = userCanvas.get();
      history.push(snapshot);
    }
  
    // Restore the most recent userCanvas state from history
    function popHistory() {
      if (history.length > 0) {
        let prev = history.pop();
        userCanvas.image(prev, 0, 0);
      } else {
        console.log("No more history to undo!");
      }
    }
  
    p.draw = function() {
      // Slightly transparent background
      p.background(255, 255, 255, 10);
  
      // If you prefer reading color each frame:
      let picked = $("#colorPickerInput").spectrum("get");
      if (picked) {
        currentColor = picked.toHexString();
      }
  
      // Determine brush color based on inversion
      let brushColor = useInvertedBrush ? invertColor(currentColor) : currentColor;
  
      // Draw userCanvas onto main canvas
      p.image(userCanvas, 0, 0);
  
      // If stamp mode and mouse is pressed, stamp an ellipse
      if (p.mouseIsPressed && brushType === 'stamp') {
        userCanvas.fill(brushColor);
        userCanvas.noStroke();
        let size = p.random(10, 100);
        userCanvas.ellipse(p.mouseX, p.mouseY, size, size);
      }
  
      // Update droplets if in stamp mode
      if (brushType === 'stamp') {
        for (let i = droplets.length - 1; i >= 0; i--) {
          droplets[i].spread();
          droplets[i].show();
          if (droplets[i].finished()) {
            droplets.splice(i, 1);
          }
        }
      }
    };
  
    // For pencil mode, store mouse coords
    p.mousePressed = function() {
      // Before we start drawing a new stroke, push current state to history
      pushHistory();
  
      if (brushType === 'pencil') {
        prevX = p.mouseX;
        prevY = p.mouseY;
      }
    };
  
    // On drag, either add droplets (stamp) or draw lines (pencil)
    p.mouseDragged = function() {
      let brushColor = useInvertedBrush ? invertColor(currentColor) : currentColor;
      if (brushType === 'stamp') {
        for (let i = 0; i < 5; i++) {
          droplets.push(new Droplet(p.mouseX, p.mouseY, brushColor));
        }
      } else if (brushType === 'pencil') {
        userCanvas.stroke(brushColor);
        userCanvas.strokeWeight(penSliderElem.value);
        userCanvas.line(prevX, prevY, p.mouseX, p.mouseY);
        prevX = p.mouseX;
        prevY = p.mouseY;
      }
    };
  
    // Helper: invert a hex color
    function invertColor(hex) {
      if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
      }
      if (hex.length === 3) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      }
      let r = 255 - parseInt(hex.substring(0, 2), 16);
      let g = 255 - parseInt(hex.substring(2, 4), 16);
      let b = 255 - parseInt(hex.substring(4, 6), 16);
      let inverted = '#' + [r, g, b].map(c => {
        let val = c.toString(16);
        return val.length === 1 ? '0' + val : val;
      }).join('');
      return inverted;
    }
  
    // Same droplet logic
    class Droplet {
      constructor(x, y, baseHex) {
        this.x = x;
        this.y = y;
        this.noiseOffsetX = p.random(1000);
        this.noiseOffsetY = p.random(1000);
        this.size = p.random(3, 10);
        this.alpha = 180;
        this.expansion = p.random(0.5, 1.0);
  
        let baseColor = p.color(baseHex);
        let rr = p.red(baseColor);
        let gg = p.green(baseColor);
        let bb = p.blue(baseColor);
        this.color = [
          rr + p.random(-20, 20),
          gg + p.random(-20, 20),
          bb + p.random(-20, 20),
          this.alpha
        ];
        this.shape = this.createFluidShape();
      }
      spread() {
        let nX = p.noise(this.noiseOffsetX)*2 - 1;
        let nY = p.noise(this.noiseOffsetY)*2 - 1;
        this.x += nX * this.expansion * 2;
        this.y += nY * this.expansion * 2;
        this.noiseOffsetX += 0.05;
        this.noiseOffsetY += 0.05;
        this.size += this.expansion;
        this.alpha -= 3;
        this.shape = this.createFluidShape();
      }
      finished() {
        return this.alpha <= 0;
      }
      createFluidShape() {
        let points = [];
        let numPoints = p.floor(p.random(10, 20));
        let noiseFactor = p.random(0.1, 0.3);
        for (let i = 0; i < numPoints; i++) {
          let angle = p.map(i, 0, numPoints, 0, p.TWO_PI);
          let radius = this.size*(0.7 + p.noise(i*noiseFactor + p.frameCount*0.01)*0.5);
          let xx = p.cos(angle)*radius;
          let yy = p.sin(angle)*radius;
          points.push([xx, yy]);
        }
        return points;
      }
      show() {
        p.noStroke();
        p.fill(this.color[0], this.color[1], this.color[2], this.color[3]);
        p.beginShape();
        for (let v of this.shape) {
          p.curveVertex(this.x + v[0], this.y + v[1]);
        }
        p.endShape(p.CLOSE);
      }
    }
  };
  
  // Attach the sketch to #canvasArea
  new p5(drawingSketch, 'canvasArea');
  