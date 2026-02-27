
// TODO 1: Създай константи и конфигурация
// (ползвам let за CELL_SIZE/GRID_* защото имаме slider за cell size)
let CELL_SIZE = 10;
let GRID_WIDTH = Math.floor(800 / CELL_SIZE);
let GRID_HEIGHT = Math.floor(600 / CELL_SIZE);
const DEFAULT_FPS = 10;

// TODO 2: Създай глобални променливи
let canvas;
let ctx;
let grid = [];
let isPlaying = false;
let generation = 0;
let animationId = null;
let lastFrameTime = 0;
let fps = DEFAULT_FPS;

// за drag рисуване (опционално)
let isMouseDown = false;

// TODO 3: Инициализация при зареждане на страницата
window.addEventListener('DOMContentLoaded', onDomLoaded);

function onDomLoaded() {
  // TODO 3.1: Извикай init функцията
  init();
}

function createEmptyGrid() {
  const newGrid = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    newGrid[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      newGrid[y][x] = false;
    }
  }
  return newGrid;
}

// TODO 4: Основна инициализираща функция
function init() {
  // TODO 4.1: Вземи canvas елемента от DOM
  canvas = document.getElementById('gameCanvas');

  if (canvas) {
    if (!canvas.width) canvas.width = 800;
    if (!canvas.height) canvas.height = 600;
  }

  // TODO 4.2: Вземи 2D контекста
  ctx = canvas.getContext('2d');

  // TODO 4.3: Инициализирай grid-а
  createGrid();

  // TODO 4.4: Добави event listeners
  setupEventListeners();

  // TODO 4.5: Първоначално рисуване
  drawGrid();

  // TODO 4.6: Обнови статистиките
  updateStatistics();

  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) pauseBtn.disabled = true;

  const speedSlider = document.getElementById('speedSlider');
  if (speedSlider) {
    speedSlider.value = DEFAULT_FPS;
    const speedValue = document.getElementById('speedValue');
    if (speedValue) speedValue.textContent = DEFAULT_FPS;
  }

  const cellSizeSlider = document.getElementById('cellSizeSlider');
  if (cellSizeSlider) {
    cellSizeSlider.value = CELL_SIZE;
    const cellSizeValue = document.getElementById('cellSizeValue');
    if (cellSizeValue) cellSizeValue.textContent = CELL_SIZE;
  }
}

// TODO 5: Създаване на grid
function createGrid() {
  // TODO 5.1: Инициализирай празен масив за grid
  grid = [];

  // TODO 5.2: Попълни grid с false стойности (мъртви клетки)
  for (let y = 0; y < GRID_HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      grid[y][x] = false;
    }
  }
}

// TODO 6: Рисуване на grid-а
function drawGrid() {
  // TODO 6.1: Изчисти целия canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // TODO 6.2: Нарисувай всички клетки
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y][x]) {
        // TODO 6.2.1: Нарисувай жива клетка
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(
          x * CELL_SIZE,
          y * CELL_SIZE,
          CELL_SIZE - 1,
          CELL_SIZE - 1
        );
      }
    }
  }

  // TODO 6.3: Нарисувай grid линиите (опционално)
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

// TODO 7: Изчисляване на живите съседи на клетка
function countNeighbors(x, y) {
  // TODO 7.1: Инициализирай counter
  let count = 0;

  // TODO 7.2: Провери всички 8 съседни клетки
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      // TODO 7.2.1: Пропусни централната клетка
      if (dx === 0 && dy === 0) continue;

      // TODO 7.2.2: Изчисли координатите на съседа
      const nx = x + dx;
      const ny = y + dy;

      // TODO 7.2.3: Провери дали съседът е в границите на grid-а
      if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
        // TODO 7.2.4: Ако съседът е жив, увеличи counter-а
        if (grid[ny][nx]) count++;
      }
    }
  }

  // TODO 7.3: Върни броя живи съседи
  return count;
}

// TODO 8: Следващо поколение (Conway's правила)
function nextGeneration() {
  // TODO 8.1: Създай нов grid за следващото поколение
  const newGrid = createEmptyGrid();

  // TODO 8.2: Приложи правилата на Conway за всяка клетка
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      // TODO 8.2.1: Изчисли броя живи съседи
      const neighbors = countNeighbors(x, y);

      // TODO 8.2.2: Приложи правилата
      if (grid[y][x] && (neighbors === 2 || neighbors === 3)) {
        newGrid[y][x] = true;
      } else if (!grid[y][x] && neighbors === 3) {
        newGrid[y][x] = true;
      } else {
        newGrid[y][x] = false;
      }
    }
  }

  // TODO 8.3: Замести стария grid с новия
  grid = newGrid;

  // TODO 8.4: Увеличи counter-а за поколения
  generation++;
}

// TODO 9: Game loop (главният цикъл)
function gameLoop(currentTime) {
  // TODO 9.1: Изчисли изминалото време от последния frame
  const deltaTime = currentTime - lastFrameTime;

  // TODO 9.2: Провери дали е време за нов frame (базирано на FPS)
  const frameDelay = 1000 / fps;

  // TODO 9.3: Ако е време за нов frame
  if (deltaTime >= frameDelay) {
    // TODO 9.3.1: Изчисли следващото поколение
    nextGeneration();

    // TODO 9.3.2: Нарисувай grid-а
    drawGrid();

    // TODO 9.3.3: Обнови статистиките
    updateStatistics();

    // TODO 9.3.4: Запази текущото време
    lastFrameTime = currentTime;
  }

  // TODO 9.4: Продължи animation loop-а ако играта е активна
  if (isPlaying) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

// TODO 10: Стартиране на играта
function play() {
  // TODO 10.1: Задай isPlaying на true
  if (isPlaying) return;
  isPlaying = true;

  // TODO 10.2: Инициализирай lastFrameTime
  lastFrameTime = performance.now();

  // TODO 10.3: Стартирай game loop
  animationId = requestAnimationFrame(gameLoop);

  // TODO 10.4: Обнови UI на бутоните
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  if (playBtn) playBtn.disabled = true;
  if (pauseBtn) pauseBtn.disabled = false;
}

// TODO 11: Пауза на играта
function pause() {
  // TODO 11.1: Задай isPlaying на false
  isPlaying = false;

  // TODO 11.2: Спри animation loop
  if (animationId) cancelAnimationFrame(animationId);

  // TODO 11.3: Обнови UI на бутоните
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  if (playBtn) playBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = true;
}

// TODO 12: Изчистване на grid-а
function clear() {
  // TODO 12.1: Спри играта ако е активна
  pause();

  // TODO 12.2: Създай нов празен grid
  createGrid();

  // TODO 12.3: Нулирай generation counter
  generation = 0;

  // TODO 12.4: Нарисувай празния grid
  drawGrid();

  // TODO 12.5: Обнови статистиките
  updateStatistics();
}

// TODO 13: Рандомно попълване на grid-а
function randomize() {
  // TODO 13.1: Попълни grid с random стойности (30% шанс)
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      grid[y][x] = Math.random() < 0.3;
    }
  }

  // TODO 13.2: Нулирай generation
  generation = 0;

  // TODO 13.3: Нарисувай grid-а
  drawGrid();

  // TODO 13.4: Обнови статистиките
  updateStatistics();
}

// TODO 14: Обработка на mouse click/drag
function handleCanvasClick(event) {
  // TODO 14.1: Вземи координатите на мишката спрямо canvas-а
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // TODO 14.2: Преобразувай координатите в grid индекси
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);

  // TODO 14.3: Провери дали координатите са валидни
  if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
    // TODO 14.4: Toggle статуса на клетката
    grid[gridY][gridX] = !grid[gridY][gridX];
  }

  // TODO 14.5: Нарисувай grid-а
  drawGrid();

  // TODO 14.6: Обнови статистиките
  updateStatistics();
}

function handleMouseDown(event) {
  isMouseDown = true;
  paintCell(event);
}

function handleMouseMove(event) {
  if (isMouseDown) paintCell(event);
}

function handleMouseUp() {
  isMouseDown = false;
}

function paintCell(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);

  if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
    grid[gridY][gridX] = true;
    drawGrid();
    updateStatistics();
  }
}

// TODO 15: Обновяване на статистиките
function updateStatistics() {
  // TODO 15.1: Изчисли броя живи клетки
  let liveCells = 0;
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (grid[y][x]) liveCells++;
    }
  }

  // TODO 15.2: Обнови UI елементите
  const liveCellsEl = document.getElementById('liveCells');
  const generationEl = document.getElementById('generation');
  const fpsEl = document.getElementById('fps');

  if (liveCellsEl) liveCellsEl.textContent = liveCells;
  if (generationEl) generationEl.textContent = generation;
  if (fpsEl) fpsEl.textContent = Number(fps).toFixed(1);
}

// TODO 16: Промяна на скоростта
function changeSpeed(value) {
  // TODO 16.1: Обнови fps променливата
  fps = parseInt(value);

  // TODO 16.2: Обнови UI display
  const speedValue = document.getElementById('speedValue');
  if (speedValue) speedValue.textContent = value;

  updateStatistics();
}

// TODO 17: Промяна на размера на клетките
function changeCellSize(value) {
  // TODO 17.1: Обнови CELL_SIZE променливата
  CELL_SIZE = parseInt(value);

  // TODO 17.2: Преизчисли GRID_WIDTH и GRID_HEIGHT
  GRID_WIDTH = Math.floor(canvas.width / CELL_SIZE);
  GRID_HEIGHT = Math.floor(canvas.height / CELL_SIZE);

  // TODO 17.3: Създай нов grid с новия размер
  createGrid();
  generation = 0;

  // TODO 17.4: Нарисувай grid-а
  drawGrid();

  // TODO 17.5: Обнови UI display
  const cellSizeValue = document.getElementById('cellSizeValue');
  if (cellSizeValue) cellSizeValue.textContent = value;

  updateStatistics();
}

// TODO 18: Зареждане на готови модели (patterns)
const PATTERNS = {
  glider: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1]
  ],
  blinker: [
    [1, 1, 1]
  ],
  toad: [
    [0, 1, 1, 1],
    [1, 1, 1, 0]
  ],
  beacon: [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 1, 1],
    [0, 0, 1, 1]
  ],
  pulsar: [
    [0,0,1,1,1,0,0,0,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [0,0,1,1,1,0,0,0,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,0,0,0,1,1,1,0,0],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,0,0,0,1,1,1,0,0]
  ],
  lwss: [
    [0,1,0,0,1],
    [1,0,0,0,0],
    [1,0,0,0,1],
    [1,1,1,1,0]
  ]
};

// TODO 19: Функция за поставяне на модел в центъра
function placePattern(patternName) {
  // TODO 19.1: Вземи модела от PATTERNS обекта
  const pattern = PATTERNS[patternName];

  // TODO 19.2: Провери дали модела съществува
  if (!pattern) return;

  // TODO 19.3: Изчисти grid-а
  clear();

  // TODO 19.4: Изчисли стартова позиция (центриран)
  const startX = Math.floor((GRID_WIDTH - pattern[0].length) / 2);
  const startY = Math.floor((GRID_HEIGHT - pattern.length) / 2);

  // TODO 19.5: Копирай модела в grid-а
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[y].length; x++) {
      if (pattern[y][x] === 1) {
        const gy = startY + y;
        const gx = startX + x;
        if (gy >= 0 && gy < GRID_HEIGHT && gx >= 0 && gx < GRID_WIDTH) {
          grid[gy][gx] = true;
        }
      }
    }
  }

  // TODO 19.6: Нарисувай grid-а
  drawGrid();

  // TODO 19.7: Обнови статистиките
  updateStatistics();
}

function onPatternButtonClick(event) {
  const btn = event.currentTarget;
  const pattern = btn.dataset.pattern;
  placePattern(pattern);
}

function onSpeedSliderInput(event) {
  changeSpeed(event.target.value);
}

function onCellSizeSliderInput(event) {
  changeCellSize(event.target.value);
}

// TODO 20: Setup на event listeners
function setupEventListeners() {
  // TODO 20.1: Play бутон
  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.addEventListener('click', play);

  // TODO 20.2: Pause бутон
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) pauseBtn.addEventListener('click', pause);

  // TODO 20.3: Clear бутон
  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) clearBtn.addEventListener('click', clear);

  // TODO 20.4: Random бутон
  const randomBtn = document.getElementById('randomBtn');
  if (randomBtn) randomBtn.addEventListener('click', randomize);

  // TODO 20.5: Speed slider
  const speedSlider = document.getElementById('speedSlider');
  if (speedSlider) speedSlider.addEventListener('input', onSpeedSliderInput);

  // TODO 20.6: Cell size slider
  const cellSizeSlider = document.getElementById('cellSizeSlider');
  if (cellSizeSlider) cellSizeSlider.addEventListener('input', onCellSizeSliderInput);

  // TODO 20.7: Canvas click
  if (canvas) canvas.addEventListener('click', handleCanvasClick);

  // TODO 20.8: Canvas mouse drag (опционално - за рисуване с дърпане)
  if (canvas) {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  // TODO 20.9: Pattern бутони
  const patternButtons = document.querySelectorAll('.pattern-btn');
  for (let i = 0; i < patternButtons.length; i++) {
    patternButtons[i].addEventListener('click', onPatternButtonClick);
  }
}

/* ========================================
   КРАЙ
   ======================================== */