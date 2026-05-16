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