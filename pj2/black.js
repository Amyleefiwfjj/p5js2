const drawingSketch = (p) => {
    let userCanvas;
    let invertBrushBtn;
    let brushTypeBtn;
    let penSliderElem;
    let resultViewBtn;   // now toggles grayscale
    let galleryBtn;
    let colorPickerElem;
    let homeBtn;
    let eraseBtn;

    // Brush logic
    let useInvertedBrush = false; // invert color per stroke
    let useGrayscale = true;      // new: show only grayscale by default
    let brushType = 'stamp';      // 'stamp' or 'pencil'
    let currentColor = '#000000'; // from color picker

    // Undo history
    let history = [];

    // Droplets + pencil coords
    let droplets = [];
    let prevX, prevY;

    p.setup = function() {
      // Attach p5 canvas
      const canvasParent = document.getElementById('canvasArea');
      let cnv = p.createCanvas(1300, 800);
      cnv.parent(canvasParent);

      // Offscreen buffer
      userCanvas = p.createGraphics(1300, 800);
      userCanvas.background(220);

      // DOM references
      invertBrushBtn  = document.getElementById('invertBrushBtn');
      brushTypeBtn    = document.getElementById('brushTypeBtn');
      penSliderElem   = document.getElementById('penSlider');
      resultViewBtn   = document.getElementById('resultViewBtn');
      galleryBtn      = document.getElementById('galleryBtn');
      colorPickerElem = document.getElementById('colorPickerInput');
      homeBtn         = document.getElementById('homeBtn');
      eraseBtn        = document.getElementById('eraseBtn');

      // Invert brush toggle
      invertBrushBtn.addEventListener('click', () => {
        useInvertedBrush = !useInvertedBrush;
        invertBrushBtn.textContent = useInvertedBrush ? "ON" : "OFF";
      });

      // Brush type toggle
      brushTypeBtn.addEventListener('click', () => {
        if (brushType === 'stamp') {
          brushType = 'pencil';
          brushTypeBtn.textContent = "연필";
        } else {
          brushType = 'stamp';
          brushTypeBtn.textContent = "스탬프";
        }
      });

      // Result view: toggle grayscale mode
      resultViewBtn.addEventListener('click', () => {
        useGrayscale = !useGrayscale;
        resultViewBtn.textContent = useGrayscale ? "ON" : "OFF";
      });

      // Erase button
      eraseBtn.addEventListener('click', () => {
        pushHistory();
        userCanvas.background(220);
      });

      // Initialize color picker
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

    // Save current userCanvas state
    function pushHistory() {
      let snapshot = userCanvas.get();
      history.push(snapshot);
    }

    // Undo logic (if you want it)
    function popHistory() {
      if (history.length > 0) {
        let prev = history.pop();
        userCanvas.image(prev, 0, 0);
      } else {
        console.log("No more history to undo!");
      }
    }

    p.draw = function() {
      // Solid background so strokes appear immediately
      p.background(255);

      // Grab color from color picker each frame
      let picked = $("#colorPickerInput").spectrum("get");
      if (picked) {
        currentColor = picked.toHexString();
      }

      // 1) Possibly invert color
      let brushColor = useInvertedBrush ? invertColor(currentColor) : currentColor;

      // 2) Possibly convert to grayscale if useGrayscale is true
      if (useGrayscale) {
        brushColor = colorToGray(brushColor);
      }

      // Draw userCanvas
      p.image(userCanvas, 0, 0);

      // If stamp mode, stamp an ellipse on mouse press
      if (p.mouseIsPressed && brushType === 'stamp') {
        userCanvas.fill(brushColor);
        userCanvas.noStroke();
        let size = p.random(10, 100);
        userCanvas.ellipse(p.mouseX, p.mouseY, size, size);
      }

      // Update droplets in stamp mode
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

    p.mousePressed = function() {
      pushHistory();
      if (brushType === 'pencil') {
        prevX = p.mouseX;
        prevY = p.mouseY;
      }
    };

    p.mouseDragged = function() {
      // 1) Possibly invert
      let brushColor = useInvertedBrush ? invertColor(currentColor) : currentColor;
      // 2) Possibly grayscale
      if (useGrayscale) {
        brushColor = colorToGray(brushColor);
      }

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

    // Converts a hex color to grayscale by averaging r,g,b
    function colorToGray(hex) {
      // Remove '#'
      if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
      }
      // Expand shorthand
      if (hex.length === 3) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      }
      // Parse
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);
      // Average
      let avg = Math.floor((r + g + b) / 3);
      // Convert to hex
      let c = avg.toString(16);
      if (c.length < 2) c = '0' + c;
      return '#' + c + c + c;
    }

    // Invert a hex color
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

    // Droplet class (unchanged)
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
  
new p5(drawingSketch, 'canvasArea');
