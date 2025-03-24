let bgImg;
let rollerImg;
let rollerY;       // 롤러 시작 위치
let targetY;       // 롤러 최종 위치
let speed = 5.5;   // 롤러 이동 속도
let paintBtn;
let goGalleryBtn;
let paintColor;

function preload() {
  bgImg = loadImage('assets/canvas.png');
  rollerImg = loadImage('assets/roller.png');
}

function setup() {
  // 전체 화면에 맞는 캔버스 생성
  createCanvas(windowWidth, windowHeight);

  paintColor = color(164, 120, 100);

  // 화면 비율로 롤러 위치 설정
  rollerY = -0.2 * height;   // 화면 높이의 -20% 위치(위쪽 밖)
  targetY = 0.5 * height;    // 화면 높이의 50% 위치

  // 버튼 생성
  paintBtn = createButton('그림 그리러 가기');
  paintBtn.hide();
  paintBtn.mousePressed(() => {
    window.location.href = 'drawing.html';
  });

  goGalleryBtn = createButton('갤러리 입장');
  goGalleryBtn.hide();
  goGalleryBtn.mousePressed(() => {
    window.location.href = 'gallery.html';
  });
}

function draw() {
  // 배경
  image(bgImg, 0, 0, width, height);

  // 롤러가 targetY까지 내려오기
  if (rollerY < targetY) {
    rollerY += speed;
  }

  // 페인트 (단순 직사각형)
  noStroke();
  fill(paintColor);
  rect(width / 2 - 100, 0, 200, rollerY + 100);

  // 롤러 이미지
  image(rollerImg, width / 2 - rollerImg.width / 2, rollerY);

  // 롤러가 내려온 후 버튼 보이기
  if (rollerY >= targetY) {
    // "그림 그리러 가기" 버튼
    paintBtn.show();
    paintBtn.position(width / 2 - 70, rollerY - 180);

    // "갤러리 입장" 버튼
    goGalleryBtn.show();
    goGalleryBtn.position(width / 2 - 70, rollerY - 50);
  } else {
    paintBtn.hide();
    goGalleryBtn.hide();
  }
}

// 창 크기가 바뀔 때 자동으로 캔버스 사이즈 재조정
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

}
