const drawingSketch = (p) => {
    let userCanvas;
    let invertBrushButton;      // 브러시 색상 반전 토글 버튼
    let useInvertedBrush = false; // 반전 모드 여부 (false이면 기본 색, true이면 반전 색)
    let currentColor = '#000000'; // 기본 브러시 색상
    let droplets = [];
  
    p.setup = function() {
      p.createCanvas(1300, 800);
      userCanvas = p.createGraphics(1300, 800);
      userCanvas.background(220);
  
      // "반전 색상으로 그리기" 버튼 생성
      invertBrushButton = p.createButton('반전 색상으로 그리기: OFF');
      invertBrushButton.position(10, 870);
      invertBrushButton.mousePressed(() => {
        useInvertedBrush = !useInvertedBrush;
        invertBrushButton.html(
          useInvertedBrush ? '반전 색상으로 그리기: ON' : '반전 색상으로 그리기: OFF'
        );
      });
      p.noiseDetail(4, 0.6);
    };
  
    // 헥스 문자열을 받아서 반전 색상을 계산하는 함수
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
  
      // 반전 모드가 켜졌다면, 선택된 색상의 반전 값을 브러시 색상으로 사용
      let brushColor = useInvertedBrush ? invertColor(currentColor) : currentColor;
  
      // 서브 캔버스(userCanvas)를 메인 캔버스에 표시
      p.image(userCanvas, 0, 0);
  
      // 마우스 드래그로 그림 그리기 (brush strokes)
      if (p.mouseIsPressed) {
        userCanvas.fill(brushColor);
        userCanvas.noStroke();
        drawBrush();
      }
  
      updateAndDrawDroplets();
    };
  
    // 브러시 그리기 함수 (userCanvas에 원 형태로 stamp)
    function drawBrush() {
      let size = p.random(10, 100);
      userCanvas.ellipse(p.mouseX, p.mouseY, size, size);
    }
  
    // 드롭렛들을 업데이트하고 그리는 함수
    function updateAndDrawDroplets() {
      for (let i = droplets.length - 1; i >= 0; i--) {
        droplets[i].spread();
        droplets[i].show();
        if (droplets[i].finished()) {
          droplets.splice(i, 1);
        }
      }
    }
  
    // 마우스 드래그 시 새로운 드롭렛 생성 (p.mouseDragged 사용)
    p.mouseDragged = function() {
      // Compute effective brush color for droplets
      let effectiveColor = useInvertedBrush ? invertColor(currentColor) : currentColor;
      for (let i = 0; i < 5; i++) {
        droplets.push(new Droplet(p.mouseX, p.mouseY, effectiveColor));
      }
    }
  
    // Modified Droplet class accepting a base color parameter.
    class Droplet {
      constructor(x, y, baseHex) {
        this.x = x;
        this.y = y;
        this.noiseOffsetX = p.random(1000);
        this.noiseOffsetY = p.random(1000);
        this.size = p.random(3, 10);      // 드롭렛 기본 크기
        this.alpha = 180;                 // 초기 투명도
        this.expansion = p.random(0.5, 1.0); // 확산 속도 (더 빠름)
        // Use the passed effective color
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
  