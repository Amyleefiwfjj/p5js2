const drawingSketch = (p) => {
  // HTML 요소 변수들
  let brushTypeBtn, penSliderElem, resultViewBtn, galleryBtn, homeBtn, blackBtn;
  let chooseColorBtn, eraseBtn;

  // 현재 저장된 랜덤 색상 (새로운 stroke는 이 값을 기억)
  let currentColor = '#000000';
  // 브러시 타입: 'stamp' 또는 'pencil'
  let brushType = 'stamp';

  // 결과보기 모드: false이면 검정(흑백)으로, true이면 stroke에 저장된 랜덤 색상으로 표시
  let useColorMode = false;

  // 저장된 stroke들을 보관하는 배열
  let strokes = [];
  let currentStroke = null;

  p.setup = function () {
    const canvasParent = document.getElementById('canvasArea');
    let cnv = p.createCanvas(900, 800);
    cnv.parent(canvasParent);

    // HTML 요소 참조
    brushTypeBtn = document.getElementById('brushTypeBtn');
    penSliderElem = document.getElementById('penSlider');
    resultViewBtn = document.getElementById('resultViewBtn');
    galleryBtn = document.getElementById('galleryBtn');
    homeBtn = document.getElementById('homeBtn');
    blackBtn = document.getElementById('blackBtn');
    chooseColorBtn = document.getElementById('chooseColorBtn');
    eraseBtn = document.getElementById('eraseBtn');

    // 브러시 타입 토글: 스탬프와 연필 모드 전환
    brushTypeBtn.addEventListener('click', () => {
      if (brushType === 'stamp') {
        brushType = 'pencil';
        brushTypeBtn.textContent = "연필";
      } else {
        brushType = 'stamp';
        brushTypeBtn.textContent = "스탬프";
      }
    });

    // 결과보기 버튼: useColorMode 토글 (true이면 각 stroke의 원래 색상, false이면 검정색)
    resultViewBtn.addEventListener('click', () => {
      useColorMode = !useColorMode;
      resultViewBtn.textContent = useColorMode ? "원래 색상" : "흑백";
    });

    // Erase 버튼: 모든 stroke 삭제 (캔버스를 초기화)
    eraseBtn.addEventListener('click', () => {
      strokes = [];
    });

    // 랜덤 색상 버튼: 클릭할 때마다 새 랜덤 색상을 currentColor에 저장
    chooseColorBtn.addEventListener('click', () => {
      currentColor = '#' + Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0');
    });
  };

  p.draw = function () {
    // 배경 흰색으로 지우기 (잔상 효과 없이 매 프레임 새로 그림)
    p.background(255);

    // 저장된 모든 stroke들을 그립니다.
    for (let s of strokes) {
      s.draw(p, useColorMode, penSliderElem.value);
    }
  };

  p.mousePressed = function () {
    // 캔버스 영역 내에서만 동작
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      // 새 stroke 생성 시, 그 순간의 currentColor를 stroke에 저장
      currentStroke = new Stroke(brushType, currentColor);
      // 첫 점 추가
      currentStroke.addPoint(p.mouseX, p.mouseY, brushType === 'stamp' ? p.random(10, 100) : null);
      strokes.push(currentStroke);
    }
  };

  p.mouseDragged = function () {
    if (currentStroke) {
      if (brushType === 'stamp') {
        currentStroke.addPoint(p.mouseX, p.mouseY, p.random(10, 100));
      } else if (brushType === 'pencil') {
        currentStroke.addPoint(p.mouseX, p.mouseY, null);
      }
    }
  };

  p.mouseReleased = function () {
    currentStroke = null;
  };

  // Stroke 클래스: 각 stroke(선 또는 스탬프)를 기록
  class Stroke {
    constructor(brushType, color) {
      this.brushType = brushType;
      this.color = color; // stroke 생성 시 저장된 랜덤 색상
      this.points = [];
    }
    addPoint(x, y, size) {
      this.points.push({ x, y, size });
    }
    draw(p, useColorMode, penWeight) {
      // useColorMode가 true이면 stroke의 저장 색상, 아니면 검정색으로 그림
      let col = useColorMode ? this.color : '#000000';
      if (this.brushType === 'pencil') {
        p.stroke(col);
        p.strokeWeight(penWeight);
        p.noFill();
        p.beginShape();
        for (let pt of this.points) {
          p.vertex(pt.x, pt.y);
        }
        p.endShape();
      } else if (this.brushType === 'stamp') {
        p.noStroke();
        p.fill(col);
        for (let pt of this.points) {
          p.ellipse(pt.x, pt.y, pt.size, pt.size);
        }
      }
    }
  }
};

new p5(drawingSketch, 'canvasArea');
