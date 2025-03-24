const drawingSketch = (p) => {
    let userCanvas;
    let invertBrushButton;      // 브러시 색상 반전 토글 버튼
    let brushTypeButton;        // 브러시 종류 전환 버튼 (스탬프 vs 연필)
    let penSlider;              // 연필 브러시 굵기 조절 슬라이더
    let useInvertedBrush = false; // 반전 모드 여부 (false이면 기본 색, true이면 반전 색)
    let brushType = 'stamp';      // 'stamp' 또는 'pencil'
    let currentColor = '#000000'; // 기본 브러시 색상
    let droplets = [];
    let prevX, prevY;           // 연필 브러시를 위한 이전 마우스 좌표
    
    p.setup = function() {
      p.createCanvas(1300, 800);
      userCanvas = p.createGraphics(1300, 800);
      userCanvas.background(220);
      
      // 반전 색상 토글 버튼 (브러시 색상 전용)
      invertBrushButton = p.createButton('반전 색상으로 그리기: OFF');
      invertBrushButton.position(10, 870);
      invertBrushButton.mousePressed(() => {
        useInvertedBrush = !useInvertedBrush;
        invertBrushButton.html(
          useInvertedBrush ? '반전 색상으로 그리기: ON' : '반전 색상으로 그리기: OFF'
        );
      });
      
      // 브러시 종류 전환 버튼
      brushTypeButton = p.createButton('스탬프 브러쉬');
      brushTypeButton.position(250, 870);
      brushTypeButton.mousePressed(() => {
        if (brushType === 'stamp') {
          brushType = 'pencil';
          brushTypeButton.html('연필 브러쉬');
        } else {
          brushType = 'stamp';
          brushTypeButton.html('스탬프 브러쉬');
        }
      });
      
      // 연필 브러쉬 굵기 조절 슬라이더 (최소 1, 최대 20, 초기값 2)
      penSlider = p.createSlider(1, 20, 2);
      penSlider.position(450, 870);
      
      p.noiseDetail(4, 0.6);
    };
    
    // 헥스 문자열을 받아 반전 색상을 계산하는 함수
    function invertColor(hex) {
      if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
      }
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      let r = 255 - parseInt(hex.substring(0, 2), 16);
      let g = 255 - parseInt(hex.substring(2, 4), 16);
      let b = 255 - parseInt(hex.substring(4, 6), 16);
      let inverted = '#' + [r, g, b].map(c => {
        let hexVal = c.toString(16);
        return hexVal.length === 1 ? '0' + hexVal : hexVal;
      }).join('');
      return inverted;
    }
    
    p.draw = function() {
      // 메인 캔버스 배경 (잔상 효과)
      p.background(255, 255, 255, 10);
      
      // Spectrum 색상 선택기에서 현재 선택된 색상을 읽어옴
      if (window.jQuery && $("#colorPickerInput").spectrum("get")) {
        currentColor = $("#colorPickerInput").spectrum("get").toHexString();
      }
      
      // 브러시 색상 결정: 반전 모드에 따라 효과 색상 선택
      let brushColor = useInvertedBrush ? invertColor(currentColor) : currentColor;
      
      // userCanvas를 메인 캔버스에 표시
      p.image(userCanvas, 0, 0);
      
      // 마우스 드래그 시 각 브러시 방식에 따라 그리기
      if (p.mouseIsPressed) {
        if (brushType === 'stamp') {
          userCanvas.fill(brushColor);
          userCanvas.noStroke();
          drawStampBrush();
        }
      }
      
      updateAndDrawDroplets();
    };
    
    // 스탬프 브러시: 무작위 크기의 원으로 찍기
    function drawStampBrush() {
      let size = p.random(10, 100);
      userCanvas.ellipse(p.mouseX, p.mouseY, size, size);
    }
    
    // 드롭렛 업데이트 및 그리기 함수 (스탬프 브러시 모드에서만 사용)
    function updateAndDrawDroplets() {
      if (brushType === 'stamp') {
        for (let i = droplets.length - 1; i >= 0; i--) {
          droplets[i].spread();
          droplets[i].show();
          if (droplets[i].finished()) {
            droplets.splice(i, 1);
          }
        }
      }
    }
    
    // p.mousePressed: for pencil mode, initialize previous mouse position
    p.mousePressed = function() {
      if (brushType === 'pencil') {
        prevX = p.mouseX;
        prevY = p.mouseY;
      }
    };
    
    // p.mouseDragged: Different behavior for stamp and pencil brushes.
    p.mouseDragged = function() {
      let effectiveColor = useInvertedBrush ? invertColor(currentColor) : currentColor;
      if (brushType === 'stamp') {
        for (let i = 0; i < 5; i++) {
          droplets.push(new Droplet(p.mouseX, p.mouseY, effectiveColor));
        }
      } else if (brushType === 'pencil') {
        userCanvas.stroke(effectiveColor);
        userCanvas.strokeWeight(penSlider.value());
        userCanvas.line(prevX, prevY, p.mouseX, p.mouseY);
        prevX = p.mouseX;
        prevY = p.mouseY;
      }
    };
    
    // Modified Droplet class accepting a base color parameter.
    class Droplet {
      constructor(x, y, baseHex) {
        this.x = x;
        this.y = y;
        this.noiseOffsetX = p.random(1000);
        this.noiseOffsetY = p.random(1000);
        this.size = p.random(3, 10);      // Droplet base size
        this.alpha = 180;                 // Initial alpha
        this.expansion = p.random(0.5, 1.0); // Faster expansion speed
        // Use the provided effective color as base
        let baseColor = p.color(baseHex);
        let r = p.red(baseColor);
        let g = p.green(baseColor);
        let b = p.blue(baseColor);
        this.color = [
          r + p.random(-20, 20),
          g + p.random(-20, 20),
          b + p.random(-20, 20),
          this.alpha
        ];
        this.shape = this.createFluidShape();
      }
      
      spread() {
        let nX = p.noise(this.noiseOffsetX) * 2 - 1;
        let nY = p.noise(this.noiseOffsetY) * 2 - 1;
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
          let radius = this.size * (0.7 + p.noise(i * noiseFactor + p.frameCount * 0.01) * 0.5);
          let x = p.cos(angle) * radius;
          let y = p.sin(angle) * radius;
          points.push([x, y]);
        }
        return points;
      }
      
      show() {
        p.noStroke();
        p.fill(this.color[0], this.color[1], this.color[2], this.alpha);
        p.beginShape();
        for (let v of this.shape) {
          p.curveVertex(this.x + v[0], this.y + v[1]);
        }
        p.endShape(p.CLOSE);
      }
    }
  };
  
  new p5(drawingSketch, 'drawingContainer');
  
  $(document).ready(function() {
    $("#colorPickerInput").spectrum({
      color: "#000000",
      showInput: true,
      preferredFormat: "hex",
      showPalette: true,
      palette: [
        ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"],
        ["#FFFFFF", "#FFA500", "#800080", "#00FFFF", "#FFC0CB"]
      ]
    });
  });
  