// ===== 0. 사용할 글꼴 목록 =====
// group: 선택 목록에서 묶어서 보여줄 이름
// family: CSS에서 쓰는 글꼴 이름 (index.html의 Google Fonts, fonts.css의 눈누 폰트)
const FONTS = [
  { group: "눈누", name: "G마켓 산스", family: "GmarketSans", weight: 400 },
  { group: "눈누", name: "여기어때 잘난체", family: "Jalnan", weight: 400 },
  { group: "눈누", name: "카페24 써라운드", family: "Cafe24Ssurround", weight: 400 },
  { group: "눈누", name: "카페24 오스퀘어", family: "Cafe24Ohsquare", weight: 400 },
  { group: "눈누", name: "티몬 몬소리", family: "TmonMonsori", weight: 400 },
  { group: "눈누", name: "에스코어 드림", family: "S-CoreDream", weight: 400 },
  { group: "눈누", name: "넥슨 Lv1 고딕", family: "NexonLv1Gothic", weight: 400 },
  { group: "눈누", name: "SB 어그로", family: "SBAggro", weight: 400 },
  { group: "눈누", name: "배민 한나는 열한살", family: "BMHanna", weight: 400 },
  { group: "눈누", name: "원스토어 모바일 POP", family: "OneMobilePop", weight: 400 },
  { group: "눈누", name: "KCC 간판체", family: "KCCGanpan", weight: 400 },
  { group: "눈누", name: "강원교육모두", family: "GangwonEdu", weight: 400 },
  { group: "눈누", name: "엘리스 디지털배움", family: "EliceDigitalBaeum", weight: 400 },
  { group: "눈누", name: "도브메이요 고딕", family: "Dovemayo", weight: 400 },
  { group: "눈누", name: "마포 꽃섬", family: "MapoFlowerIsland", weight: 400 },
  { group: "눈누", name: "교보 손글씨", family: "KyoboHand", weight: 400 },

  { group: "Google Fonts", name: "본고딕 (Noto Sans KR)", family: "Noto Sans KR", weight: 700 },
  { group: "Google Fonts", name: "나눔고딕", family: "Nanum Gothic", weight: 800 },
  { group: "Google Fonts", name: "나눔명조", family: "Nanum Myeongjo", weight: 800 },
  { group: "Google Fonts", name: "검은고딕", family: "Black Han Sans", weight: 400 },
  { group: "Google Fonts", name: "도현체", family: "Do Hyeon", weight: 400 },
  { group: "Google Fonts", name: "주아체", family: "Jua", weight: 400 },
  { group: "Google Fonts", name: "나눔손글씨 펜", family: "Nanum Pen Script", weight: 400 },
  { group: "Google Fonts", name: "개구체", family: "Gaegu", weight: 700 },

  { group: "컴퓨터 기본", name: "맑은 고딕", family: "Malgun Gothic", weight: 700 },
];

// ===== 1. 화면의 요소들을 가져오기 =====
const $ = (id) => document.getElementById(id);

const fileInput = $("fileInput");
const captionInput = $("captionInput");
const fontInput = $("fontInput");
const sizeInput = $("sizeInput");
const colorInput = $("colorInput");
const positionInput = $("positionInput");
const angleInput = $("angleInput");
const outlineOn = $("outlineOn");
const outlineInput = $("outlineInput");
const outlineColorInput = $("outlineColorInput");
const bgOn = $("bgOn");
const bgColorInput = $("bgColorInput");
const bgAlphaInput = $("bgAlphaInput");
const bgHeightInput = $("bgHeightInput");
const lineHeightInput = $("lineHeightInput");
const alignInput = $("alignInput");
const formatInput = $("formatInput");
const qualityInput = $("qualityInput");
const qualityRow = $("qualityRow");
const scaleInput = $("scaleInput");
const saveInfo = $("saveInfo");
const canvas = $("canvas");
const placeholder = $("placeholder");
const saveButton = $("saveButton");

// 캔버스에 그림을 그릴 때 쓰는 "붓" 같은 객체
const ctx = canvas.getContext("2d");

// 불러온 사진을 담아둘 변수 (처음엔 없음)
let photo = null;

// 드래그로 옮긴 자막 위치 (null이면 위/가운데/아래 선택을 따름)
let customPos = null;

// 마지막으로 그린 자막 상자의 위치·크기 (드래그할 때 자막을 눌렀는지 확인용)
let lastBox = null;

// 글꼴 선택 목록 채우기 (group별로 묶고, 각 항목을 그 글꼴로 보여줌)
const groups = {};
FONTS.forEach((font, i) => {
  if (!groups[font.group]) {
    groups[font.group] = document.createElement("optgroup");
    groups[font.group].label = font.group;
    fontInput.appendChild(groups[font.group]);
  }
  const option = document.createElement("option");
  option.value = i;
  option.textContent = font.name;
  option.style.fontFamily = `"${font.family}"`;
  groups[font.group].appendChild(option);
});

// ===== 2. 사진 선택하면 불러오기 =====
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return; // 선택 취소한 경우

  const reader = new FileReader();

  // 파일 읽기가 끝나면 실행
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      photo = img;

      // 캔버스 크기를 사진 원본 크기에 맞춤
      // 단, 휴대폰(특히 아이폰)은 너무 큰 캔버스를 못 만들어서 약 1600만 화소까지만 사용
      const MAX_PIXELS = 16000000;
      const shrink = Math.min(1, Math.sqrt(MAX_PIXELS / (img.width * img.height)));
      canvas.width = Math.floor(img.width * shrink);
      canvas.height = Math.floor(img.height * shrink);

      // 새 사진이면 자막 위치는 다시 처음 선택대로
      customPos = null;
      if (positionInput.value === "custom") positionInput.value = "bottom";

      // 안내 문구는 숨기고, 캔버스·확대 버튼·저장 버튼을 보이게
      placeholder.hidden = true;
      canvas.hidden = false;
      zoomBar.hidden = false;
      saveButton.disabled = false;
      resetZoom();

      render();
    };
    img.src = reader.result; // 읽은 사진 데이터를 이미지에 넣기
  };

  reader.readAsDataURL(file);
});

// 지금 선택된 글꼴로 캔버스용 font 문자열 만들기 (예: '700 80px "Jua"')
function getFontString() {
  const font = FONTS[fontInput.value];
  const fontSize = Math.round(canvas.height * (sizeInput.value / 100));
  return { css: `${font.weight} ${fontSize}px "${font.family}", sans-serif`, fontSize };
}

// ===== 3. 글꼴을 먼저 내려받은 뒤 그리기 =====
// 웹 폰트는 필요할 때 다운로드되므로, 다 받아진 다음에 그려야 글꼴이 제대로 나옴
function render() {
  if (!photo) return;
  const text = captionInput.value || "가";
  document.fonts.load(getFontString().css, text).finally(drawImage);
}

// ===== 4. 핵심 함수: 사진 + 자막 그리기 =====
function drawImage() {
  if (!photo) return; // 사진이 없으면 아무것도 안 함

  // (1) 캔버스 지우고 사진 그리기 (캔버스 크기에 맞춰서)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);

  scheduleSaveInfo(); // 그림이 바뀌었으니 예상 용량도 다시 계산

  const text = captionInput.value;
  if (!text) {
    lastBox = null;
    return; // 자막이 비어 있으면 사진만
  }

  // (2) 글꼴 설정
  const { css, fontSize } = getFontString();
  ctx.font = css;
  ctx.textAlign = alignInput.value;
  ctx.textBaseline = "middle";

  // (3) 줄 나누기: Enter로 입력한 줄바꿈(\n) 기준
  const lines = text.split("\n");
  const lineH = fontSize * (lineHeightInput.value / 100); // 줄과 줄 사이 간격
  const maxLineW = Math.max(...lines.map((line) => ctx.measureText(line).width));

  // (4) 배경 상자 크기 계산 (가장 긴 줄 폭 + 여백, 높이는 줄 수 + "높이" 슬라이더 비율만큼)
  const padding = fontSize * 0.3;
  const boxW = maxLineW + padding * 2;
  const boxH = (lineH * (lines.length - 1) + fontSize * 1.2 + padding) * (bgHeightInput.value / 100);

  // (5) 자막의 중심 위치 정하기
  let x, y;
  if (customPos) {
    // 드래그로 옮긴 위치
    x = customPos.x;
    y = customPos.y;
  } else {
    x = canvas.width / 2; // 가로는 가운데
    const margin = fontSize * 0.5; // 위/아래 여백
    if (positionInput.value === "top") {
      y = margin + boxH / 2;
    } else if (positionInput.value === "middle") {
      y = canvas.height / 2;
    } else {
      y = canvas.height - margin - boxH / 2;
    }
  }

  const angle = (angleInput.value * Math.PI) / 180;
  lastBox = { x, y, w: boxW, h: boxH, angle };

  // (6) 자막 중심으로 이동한 뒤 기울이기 → 이후 그리는 건 모두 (0, 0) 기준
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // (7) 배경색
  if (bgOn.checked) {
    ctx.globalAlpha = bgAlphaInput.value / 100;
    ctx.fillStyle = bgColorInput.value;
    ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.globalAlpha = 1;
  }

  // (8) 정렬에 따라 글자를 쓸 가로 기준점: 왼쪽 끝 / 가운데 / 오른쪽 끝
  const lineX = { left: -maxLineW / 2, center: 0, right: maxLineW / 2 }[alignInput.value];
  // 첫 줄의 세로 위치 (여러 줄 전체가 가운데에 오도록)
  const firstY = -(lineH * (lines.length - 1)) / 2;

  // (9) 한 줄씩: 외곽선 → 그 위에 글자색 채우기
  // 외곽선을 모든 줄에 먼저 그려야, 줄 간격이 좁을 때 외곽선이 윗줄 글자를 덮지 않음
  if (outlineOn.checked) {
    ctx.lineWidth = fontSize * (outlineInput.value / 100);
    ctx.lineJoin = "round";
    ctx.strokeStyle = outlineColorInput.value;
    lines.forEach((line, i) => ctx.strokeText(line, lineX, firstY + i * lineH));
  }

  ctx.fillStyle = colorInput.value;
  lines.forEach((line, i) => ctx.fillText(line, lineX, firstY + i * lineH));

  ctx.restore(); // 이동·회전 되돌리기
}

// ===== 5. 자막 드래그로 옮기기 =====
// 화면에 보이는 캔버스는 축소되어 있으므로, 마우스 위치를 원본 사진 좌표로 바꿔야 함
function toCanvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * canvas.width) / rect.width,
    y: ((e.clientY - rect.top) * canvas.height) / rect.height,
  };
}

// 그 점이 자막 상자 안인지 확인 (기울어진 상자도 고려)
function isOnCaption(p) {
  if (!lastBox) return false;
  const dx = p.x - lastBox.x;
  const dy = p.y - lastBox.y;
  // 상자의 기울기만큼 반대로 돌려서, 똑바른 상자 기준으로 비교
  const cos = Math.cos(-lastBox.angle);
  const sin = Math.sin(-lastBox.angle);
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;
  return Math.abs(lx) <= lastBox.w / 2 && Math.abs(ly) <= lastBox.h / 2;
}

// ===== 5-2. 사진 확대/축소 =====
// 캔버스를 CSS transform으로 키우고 옮김 (저장되는 이미지에는 영향 없음)
const preview = $("preview");
const zoomBar = $("zoomBar");
const zoomValue = $("zoomValue");
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
let zoom = 1; // 확대 배율
let panX = 0; // 확대한 사진을 옮긴 거리 (화면 픽셀)
let panY = 0;

function applyZoom() {
  if (zoom <= MIN_ZOOM) {
    zoom = MIN_ZOOM; // 원래 크기로 돌아오면 위치도 가운데로
    panX = 0;
    panY = 0;
  }
  canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  zoomValue.textContent = `${Math.round(zoom * 100)}%`;
}

// 화면의 한 점(sx, sy)을 기준으로 확대 → 손가락/마우스 아래 있던 부분이 그 자리에 그대로 있음
function zoomAt(newZoom, sx, sy) {
  newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
  const rect = preview.getBoundingClientRect();
  const cx = rect.left + rect.width / 2; // 사진은 미리보기 영역 가운데에 있음
  const cy = rect.top + rect.height / 2;
  // 그 점이 (확대 전) 사진 중심에서 얼마나 떨어져 있는지
  const qx = (sx - cx - panX) / zoom;
  const qy = (sy - cy - panY) / zoom;
  zoom = newZoom;
  panX = sx - cx - zoom * qx;
  panY = sy - cy - zoom * qy;
  applyZoom();
}

function zoomAtCenter(newZoom) {
  const rect = preview.getBoundingClientRect();
  zoomAt(newZoom, rect.left + rect.width / 2, rect.top + rect.height / 2);
}

function resetZoom() {
  zoom = MIN_ZOOM;
  applyZoom();
}

$("zoomIn").addEventListener("click", () => zoomAtCenter(zoom * 1.5));
$("zoomOut").addEventListener("click", () => zoomAtCenter(zoom / 1.5));
$("zoomReset").addEventListener("click", resetZoom);

// 컴퓨터: 마우스 휠로 확대/축소
preview.addEventListener(
  "wheel",
  (e) => {
    if (!photo) return;
    e.preventDefault(); // 페이지가 스크롤되지 않게
    zoomAt(e.deltaY < 0 ? zoom * 1.15 : zoom / 1.15, e.clientX, e.clientY);
  },
  { passive: false }
);

// ===== 5-3. 손가락/마우스 조작 =====
// 한 손가락: 자막 위면 자막 이동, 아니면 (확대 중일 때) 사진 이동
// 두 손가락: 확대/축소
// 빠르게 두 번 탭: 2.5배 확대 ↔ 원래대로
const pointers = new Map(); // 지금 화면에 닿아 있는 손가락(또는 마우스)들
let mode = null; // "caption" | "pan" | "pinch" | null
let start = null; // 조작을 시작할 때의 정보
let tapStart = null;
let lastTap = null;

function pinchInfo() {
  const [a, b] = [...pointers.values()];
  return {
    dist: Math.hypot(a.x - b.x, a.y - b.y), // 두 손가락 사이 거리
    midX: (a.x + b.x) / 2, // 두 손가락의 가운데
    midY: (a.y + b.y) / 2,
  };
}

function startPan(x, y) {
  mode = "pan";
  start = { x, y, panX, panY };
}

preview.addEventListener("pointerdown", (e) => {
  if (!photo || e.target.closest(".zoom-bar")) return;
  preview.setPointerCapture(e.pointerId); // 영역 밖으로 나가도 계속 따라오게
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 2) {
    mode = "pinch"; // 두 번째 손가락이 닿으면 자막 이동은 멈추고 확대 모드로
    start = pinchInfo();
    tapStart = null;
    return;
  }
  if (pointers.size > 2) return;

  tapStart = { x: e.clientX, y: e.clientY, time: Date.now() };
  const p = toCanvasPoint(e);
  if (isOnCaption(p)) {
    mode = "caption";
    start = { offX: lastBox.x - p.x, offY: lastBox.y - p.y };
    preview.style.cursor = "grabbing";
  } else if (zoom > MIN_ZOOM) {
    startPan(e.clientX, e.clientY);
    preview.style.cursor = "grabbing";
  } else {
    mode = null;
  }
});

preview.addEventListener("pointermove", (e) => {
  if (!photo) return;

  // 아무것도 누르지 않은 상태: 마우스 모양만 바꿔줌
  if (!pointers.has(e.pointerId)) {
    const onCaption = isOnCaption(toCanvasPoint(e));
    preview.style.cursor = onCaption ? "grab" : zoom > MIN_ZOOM ? "move" : "default";
    return;
  }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (mode === "pinch" && pointers.size === 2) {
    const now = pinchInfo();
    // 손가락 가운데가 움직인 만큼 사진도 이동 → 벌어진 비율만큼 확대
    panX += now.midX - start.midX;
    panY += now.midY - start.midY;
    zoomAt(zoom * (now.dist / start.dist), now.midX, now.midY);
    start = now;
  } else if (mode === "caption") {
    const p = toCanvasPoint(e);
    customPos = { x: p.x + start.offX, y: p.y + start.offY };
    positionInput.value = "custom"; // 위치 메뉴에 "직접 옮김" 표시
    drawImage(); // 글꼴은 이미 받아져 있으니 바로 그리기
  } else if (mode === "pan") {
    panX = start.panX + (e.clientX - start.x);
    panY = start.panY + (e.clientY - start.y);
    applyZoom();
  }
});

function endPointer(e) {
  if (!pointers.has(e.pointerId)) return;
  pointers.delete(e.pointerId);

  // 두 번 탭 확인 (거의 안 움직이고 짧게 눌렀다 뗀 경우만 "탭"으로 침)
  if (tapStart && e.type === "pointerup") {
    const moved = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y);
    const isTap = moved < 10 && Date.now() - tapStart.time < 300;
    if (isTap && lastTap && Date.now() - lastTap.time < 350 &&
        Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
      if (zoom > MIN_ZOOM) resetZoom();
      else zoomAt(2.5, e.clientX, e.clientY);
      lastTap = null;
    } else {
      lastTap = isTap ? { x: e.clientX, y: e.clientY, time: Date.now() } : null;
    }
  }
  tapStart = null;

  if (pointers.size === 1 && mode === "pinch") {
    // 두 손가락 중 하나만 떼면 남은 손가락으로 계속 사진 이동
    const [rest] = pointers.values();
    startPan(rest.x, rest.y);
  } else if (pointers.size === 0) {
    mode = null;
    preview.style.cursor = "default";
  }
}
preview.addEventListener("pointerup", endPointer);
preview.addEventListener("pointercancel", endPointer);

// 위치 메뉴에서 위/가운데/아래를 고르면 드래그 위치는 취소
positionInput.addEventListener("change", () => {
  customPos = null;
});

// ===== 5-4. 휴대폰 메뉴 탭 =====
// 탭을 누르면 그 메뉴만 열고, 열려 있는 탭을 다시 누르면 닫아서 사진을 크게 봄
// (넓은 화면에서는 탭이 안 보이고 모든 메뉴가 한 번에 보임)
const tabButtons = document.querySelectorAll(".tabs button");
const panel = document.querySelector(".panel");

tabButtons.forEach((tab) => {
  tab.addEventListener("click", () => {
    const wasOpen = tab.classList.contains("active");
    tabButtons.forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".group").forEach((g) => g.classList.remove("active"));
    if (!wasOpen) {
      tab.classList.add("active");
      $(tab.dataset.tab).classList.add("active");
    }
    panel.classList.toggle("closed", wasOpen);
  });
});

// ===== 6. 옵션이 바뀔 때마다 다시 그리기 =====
// 슬라이더 옆 숫자도 같이 갱신
const sliderLabels = [
  [sizeInput, $("sizeValue")],
  [angleInput, $("angleValue")],
  [outlineInput, $("outlineValue")],
  [bgAlphaInput, $("bgAlphaValue")],
  [bgHeightInput, $("bgHeightValue")],
  [lineHeightInput, $("lineHeightValue")],
];
sliderLabels.forEach(([slider, label]) => {
  slider.addEventListener("input", () => {
    label.textContent = slider.value;
  });
});

// 스위치가 꺼지면 해당 묶음을 흐리게 표시
function updateToggles() {
  outlineOn.closest(".group").classList.toggle("off", !outlineOn.checked);
  bgOn.closest(".group").classList.toggle("off", !bgOn.checked);
}
updateToggles();
outlineOn.addEventListener("change", updateToggles);
bgOn.addEventListener("change", updateToggles);

// 모든 입력 요소에 "바뀌면 다시 그리기" 연결
[
  captionInput, fontInput, sizeInput, colorInput, positionInput, angleInput,
  lineHeightInput, alignInput,
  outlineOn, outlineInput, outlineColorInput,
  bgOn, bgColorInput, bgAlphaInput, bgHeightInput,
].forEach((el) => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

// ===== 7. 저장 설정 (형식 · 품질 · 크기) =====
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// 일부 브라우저(예전 사파리 등)는 WebP로 저장을 못 하므로 확인해서 막아두기
if (!canvas.toDataURL("image/webp").startsWith("data:image/webp")) {
  const webp = formatInput.querySelector('option[value="image/webp"]');
  webp.disabled = true;
  webp.textContent += " - 이 브라우저는 지원 안 함";
}

// PNG는 품질 설정이 없으므로 품질 줄을 흐리게
function updateQualityRow() {
  qualityRow.classList.toggle("disabled", formatInput.value === "image/png");
}
updateQualityRow();

// 저장할 이미지 만들기: 크기를 줄이는 경우 새 캔버스에 줄여서 다시 그림
function makeBlob() {
  const scale = Number(scaleInput.value);
  let source = canvas;
  if (scale < 1) {
    source = document.createElement("canvas");
    source.width = Math.round(canvas.width * scale);
    source.height = Math.round(canvas.height * scale);
    const sctx = source.getContext("2d");
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(canvas, 0, 0, source.width, source.height);
  }
  // toBlob: 캔버스 → 이미지 파일 데이터 (품질은 0~1 사이 숫자)
  return new Promise((resolve) => {
    source.toBlob(
      (blob) => resolve({ blob, width: source.width, height: source.height }),
      formatInput.value,
      qualityInput.value / 100
    );
  });
}

// 바이트 수를 KB/MB로 보기 좋게
function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

// 예상 용량 표시 (드래그 중에 계속 계산하면 느려지므로 멈춘 뒤 0.4초 후에 한 번만)
let saveInfoTimer = null;
function scheduleSaveInfo() {
  clearTimeout(saveInfoTimer);
  saveInfoTimer = setTimeout(async () => {
    if (!photo) return;
    const { blob, width, height } = await makeBlob();
    saveInfo.textContent = `${width} × ${height} · 예상 용량 약 ${formatBytes(blob.size)}`;
  }, 400);
}

qualityInput.addEventListener("input", () => {
  $("qualityValue").textContent = qualityInput.value;
});
[formatInput, qualityInput, scaleInput].forEach((el) => {
  el.addEventListener("input", scheduleSaveInfo);
  el.addEventListener("change", scheduleSaveInfo);
});
formatInput.addEventListener("change", updateQualityRow);

// ===== 8. 이미지 저장 =====
saveButton.addEventListener("click", async () => {
  const { blob } = await makeBlob();
  const fileName = `자막사진.${EXTENSIONS[formatInput.value]}`;

  // 휴대폰에서 공유 기능을 쓸 수 있으면 공유 창 띄우기 → "이미지 저장"으로 사진첩에 바로 저장 가능
  // (https 주소로 열었을 때만 동작, 컴퓨터에서 파일을 직접 열면 아래 다운로드 방식으로)
  const file = new File([blob], fileName, { type: blob.type });
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (isTouch && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err.name === "AbortError") return; // 사용자가 공유 창을 닫은 경우
      // 다른 오류면 아래 다운로드 방식으로 계속
    }
  }

  // 일반 다운로드
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); // 잠시 후 메모리 정리
});
