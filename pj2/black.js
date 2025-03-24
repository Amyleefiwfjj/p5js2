const drawingSketch = (p) => {
  let userCanvas;
  let brushTypeBtn;
  let penSliderElem;
  let resultViewBtn;
  let galleryBtn;
  let homeBtn;
  let blackBtn;
  let invertBrushBtn;       // 사용하지 않음
  let chooseColorBtn;       // 랜덤 색상 저장 버튼

  // New: Erase & Undo buttons
  let eraseBtn;

  // 현재 저장된 랜덤 색상 (이 값이 결과보기 시 적용됨)
  let currentColor = '#000000';

  // 브러시 타입: 'stamp' 또는 'pencil'
  let brushType = 'stamp';

  // 이전 상태 저장용
  let history = [];
  let droplets = [];
  let prevX, prevY;

  p.setup = function () {
    // 캔버스를 #canvasArea에 붙임
    const canvasParent = document.getElementById('canvasArea');
    let cnv = p.createCanvas(900, 800);
    cnv.parent(canvasParent);

    // 사용자 그리기를 위한 오프스크린 버퍼 생성
    userCanvas = p.createGraphics(1300, 800);
    userCanvas.background(220);

    // HTML 요소 참조
    brushTypeBtn = document.getElementById('brushTypeBtn');
    penSliderElem = document.getElementById('penSlider');
    resultViewBtn = document.getElementById('resultViewBtn');
    galleryBtn = document.getElementById('galleryBtn');
    homeBtn = document.getElementById('homeBtn');
    invertBrushBtn = document.getElementById('invertBrushBtn');
    chooseColorBtn = document.getElementById('chooseColorBtn');
    eraseBtn = document.getElementById('eraseBtn');
    blackBtn = document.getElementById('blackBtn');

    // 브러시 타입 토글 (스탬프 / 연필)
    brushTypeBtn.addEventListener('click', () => {
      if (brushType === 'stamp') {
        brushType = 'pencil';
        brushTypeBtn.textContent = "연필";
      } else {
        brushType = 'stamp';
        brushTypeBtn.textContent = "스탬프";
      }
    });

    // 결과보기 버튼: 검정색으로 그려진 userCanvas의 검정 부분을 현재 저장된 랜덤 색상으로 변경
    resultViewBtn.addEventListener('click', () => {
      applyRandomColor();
      resultViewBtn.textContent = "원래 색상";
    });

    // 지우기 버튼: 현재 상태 저장 후 캔버스 클리어
    eraseBtn.addEventListener('click', () => {
      pushHistory();
      userCanvas.background(220);
    });

    // 랜덤 색상 저장 버튼: 클릭 시 currentColor에 랜덤 색상 저장
    chooseColorBtn.addEventListener('click', () => {
      currentColor = '#' + Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    });

    p.noiseDetail(4, 0.6);
  };

  // userCanvas의 현재 상태를 히스토리에 저장
  function pushHistory() {
    let snapshot = userCanvas.get();
    history.push(snapshot);
  }

  // userCanvas의 픽셀들을 검사하여, 검정(혹은 어두운 색)에 해당하는 부분을 currentColor로 변경
  function applyRandomColor() {
    userCanvas.loadPixels();
    let col = p.color(currentColor);
    let rNew = p.red(col);
    let gNew = p.green(col);
    let bNew = p.blue(col);
    // 임계값: 픽셀이 검정에 가까운지 판단 (조절 가능)
    const threshold = 50;
    for (let i = 0; i < userCanvas.pixels.length; i += 4) {
      let r = userCanvas.pixels[i];
      let g = userCanvas.pixels[i + 1];
      let b = userCanvas.pixels[i + 2];
      // 만약 해당 픽셀이 어둡다면(검정에 가까우면)
      if (r < threshold && g < threshold && b < threshold) {
        userCanvas.pixels[i] = rNew;
        userCanvas.pixels[i + 1] = gNew;
        userCanvas.pixels[i + 2] = bNew;
        // 알파 값은 그대로 유지
      }
    }
    userCanvas.updatePixels();
  }

  p.draw = function () {
    // 매 프레임마다 배경을 덮어 이전 잔상을 약간 남김
    p.background(255, 255, 255, 10);

    // 실제 그리기 색상은 무조건 검정(흑백)으로 고정
    let brushColor = '#000000';

    // offscreen userCanvas를 메인 캔버스에 출력
    p.image(userCanvas, 0, 0);

    // stamp 모드: 마우스 누름 시 원 찍기
    if (p.mouseIsPressed && brushType === 'stamp') {
      userCanvas.fill(brushColor);
      userCanvas.noStroke();
      let size = p.random(10, 100);
      userCanvas.ellipse(p.mouseX, p.mouseY, size, size);
    }

    // stamp 모드: droplet 효과 업데이트 및 출력
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

  p.mousePressed = function () {
    pushHistory();
    if (brushType === 'pencil') {
      prevX = p.mouseX;
      prevY = p.mouseY;
    }
  };

  p.mouseDragged = function () {
    let brushColor = '#000000'; // 항상 검정 사용
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

  // Droplet 클래스 (스탬프 효과용)
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
      this.color = [rr, gg, bb, this.alpha];
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
        let xx = p.cos(angle) * radius;
        let yy = p.sin(angle) * radius;
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
