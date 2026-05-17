// ── Images ──────────────────────────────────────────────────
const ICONS = [
  'images/i1.jpeg',
  'images/i2.jpeg',
  'images/i3.jpeg',
  'images/i4.jpeg',
  'images/i5.webp',
  'images/i6.jpeg',
  'images/i7.jpeg',
  'images/i8.jpeg',
  'images/i9.jpeg',
  'images/i10.jpeg',
  'images/i11.jpeg',
  'images/i12.jpeg'
];


// ── STATE ──────────────────────────────────────────────────
let state = {
  rows: 4, cols: 4, timeLimit: 60,
  totalPairs: 0, matchedPairs: 0,
  moves: 0, timeLeft: 0,
  timerInterval: null,
  firstCard: null, secondCard: null,
  isLocked: false, gameStarted: false
};

// ── DOM REFS ───────────────────────────────────────────────
const setupPanel    = document.getElementById('setup-panel');
const gameHud       = document.getElementById('game-hud');
const boardWrap     = document.getElementById('board-wrap');
const boardEl       = document.getElementById('board');
const overlay       = document.getElementById('overlay');
const errorMsg      = document.getElementById('error-msg');
const previewBanner = document.getElementById('preview-banner');

const hudTimer    = document.getElementById('hud-timer');
const hudPairs    = document.getElementById('hud-pairs');
const hudMoves    = document.getElementById('hud-moves');
const progressFill = document.getElementById('progress-fill');
const timerBlock   = document.getElementById('timer-block');

const cfgRows  = document.getElementById('cfg-rows');
const cfgCols  = document.getElementById('cfg-cols');
const cfgTime  = document.getElementById('cfg-time');

// ── SHUFFLE ────────────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── FORMAT TIME ────────────────────────────────────────────
function fmt(s) {
  const m   = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return m + ':' + sec;
}

// ── START GAME ─────────────────────────────────────────────
document.getElementById('btn-start').onclick = startGame;

function startGame() {
  const rows = parseInt(cfgRows.value);
  const cols = parseInt(cfgCols.value);
  const time = parseInt(cfgTime.value);

 // Validation
  if (isNaN(rows) || rows < 2 || rows > 8 ||
      isNaN(cols) || cols < 2 || cols > 8) {
    showError('Rows and columns must be between 2 and 8.');
    return;
  }
  if ((rows * cols) % 2 !== 0) {
    showError('Rows × Columns must be EVEN (need pairs!)');
    return;
  }
  if (isNaN(time) || time < 10) {
    showError('Time limit must be at least 10 seconds.');
    return;
  }
  const totalCards = rows * cols;
  const needed     = totalCards / 2;
  if (needed > ICONS.length) {
    showError(`Too many cards — max ${ICONS.length * 2} total cells.`);
    return;
  }
  clearError();

  state.rows         = rows;
  state.cols         = cols;
  state.timeLimit    = time;
  state.totalPairs   = needed;
  state.matchedPairs = 0;
  state.moves        = 0;
  state.firstCard    = null;
  state.secondCard   = null;
  state.isLocked     = true;
  state.gameStarted  = false;

  buildBoard(rows, cols, needed);
  showGame();
  runPreview(totalCards, () => {
    state.isLocked    = false;
    state.gameStarted = true;
    startTimer();
  });
}

// ── BUILD BOARD ────────────────────────────────────────────
function buildBoard(rows, cols, pairCount) {
  const selectedIcons = ICONS.slice(0, pairCount);
  const cardData      = [...selectedIcons, ...selectedIcons];
  shuffle(cardData);

  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  boardEl.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;

  cardData.forEach((icon, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.icon = icon;
    card.dataset.id   = index;

    const back = document.createElement('div');
    back.className = 'card-face card-back';

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    const img = document.createElement('img');
    img.src = icon;
    img.alt = 'Card';
    front.appendChild(img);

    card.appendChild(back);
    card.appendChild(front);
    boardEl.appendChild(card);
  });
}

// ── PREVIEW ────────────────────────────────────────────────
function runPreview(totalCards, onComplete) {
  const allCards = Array.from(boardEl.querySelectorAll('.card'));
  allCards.forEach(c => c.classList.add('flipped'));

  const duration = Math.max(3, Math.ceil(totalCards / 4));
  let countdown  = duration;

  const countdownEl = document.getElementById('preview-countdown');
  previewBanner.style.display = 'block';
  countdownEl.textContent = countdown;

  const countInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      countdownEl.textContent = countdown;
    } else {
      clearInterval(countInterval);
      previewBanner.style.display = 'none';
      allCards.forEach(c => c.classList.remove('flipped'));
      if (onComplete) onComplete();
    }
  }, 1000);
}

// ── END GAME ───────────────────────────────────────────────
function endGame(won) {
  stopTimer();
  state.isLocked = true;
  state.gameStarted = false;

  // Disable all remaining cards
  boardEl.querySelectorAll('.card').forEach(c => c.classList.add('disabled'));

  const icon = document.getElementById('ov-icon');
  const title = document.getElementById('ov-title');
  const stats = document.getElementById('ov-stats');

  if (won) {
    icon.textContent = '🏆';
    title.textContent = 'yaaaa You Win';
    title.className = 'overlay-title win';
    const timeUsed = state.timeLimit - state.timeLeft;
    stats.innerHTML =
      `All ${state.totalPairs} pairs matched!<br>` +
      `Time used: ${fmt(timeUsed)} &nbsp;|&nbsp; Moves: ${state.moves}<br>` +
      `Board: ${state.rows}×${state.cols}`;
  } else {
    icon.textContent = '💀';
    title.textContent = 'GAME OVER';
    title.className = 'overlay-title lose';
    stats.innerHTML =
      `Time's up! You matched ${state.matchedPairs} of ${state.totalPairs} pairs.<br>` +
      `Moves made: ${state.moves}<br>` +
      `Board: ${state.rows}×${state.cols}`;
  }

  overlay.classList.add('show');
}

// ── OVERLAY BUTTONS ────────────────────────────────────────
document.getElementById('btn-again').onclick = () => {
  overlay.classList.remove('show');
  startGame();
};

document.getElementById('btn-ov-setup').onclick = goSetup;
document.getElementById('btn-back').onclick = goSetup;

function goSetup() {
  stopTimer();
  overlay.classList.remove('show');
  showSetup();
}

// ── SHOW / HIDE ────────────────────────────────────────────
function showGame() {
  setupPanel.style.display = 'none';
  gameHud.style.display = 'flex';
  boardWrap.style.display = 'block';

  hudPairs.textContent = '0/' + state.totalPairs;
  hudMoves.textContent = '0';
  hudTimer.textContent = fmt(state.timeLimit);
  progressFill.style.width = '0%';
  timerBlock.classList.remove('danger');
}

function showSetup() {
  setupPanel.style.display = 'block';
  gameHud.style.display = 'none';
  boardWrap.style.display = 'none';
  previewBanner.style.display = 'none';
}

function showError(msg) {
  errorMsg.textContent = '⚠ ' + msg;
}

function clearError() {
  errorMsg.textContent = '';
}

// ── INIT ───────────────────────────────────────────────────
showSetup();

// ── TEAM PAGE ─────────────────────────────────────────────
const teamBtn = document.getElementById('team-btn');

const teamPage = document.getElementById('team-page');

const closeTeam = document.getElementById('close-team');

teamBtn.addEventListener('click', () => {

  teamPage.classList.add('show');
});

closeTeam.addEventListener('click', () => {

  teamPage.classList.remove('show');
});