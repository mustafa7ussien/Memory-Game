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