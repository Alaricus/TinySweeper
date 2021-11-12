let frame = null, res = null, firstClick = true;
const brd = [], p = { x: -1, y: -1 }
const statuses = ['', '1', '2', '3', '4', '5', '6', '7', '8', '', '🚩', '🚩', '', '💣'];
const canvas = document.querySelector('canvas'), ctx = canvas.getContext('2d');

for (let i = 0; i < 10; i++) { brd.push(Array(10).fill(0)); }

const getMousep = e => {
  const canv = e.target.getBoundingClientRect();
  return { x: e.clientX - canv.left, y: e.clientY - canv.top };
};

canvas.addEventListener('mousemove', e => {
  const crd = getMousep(e);
  p.x = Math.floor(crd.x / 30);
  p.y = Math.floor(crd.y / 30);
});

canvas.addEventListener('click', () => {
  if (firstClick) { placeMines(p.y, p.x); firstClick = false; }
  if (brd[p.y][p.x] === 9) {
    brd.forEach((r, i) => {
      r.forEach((c, j) => {
        if (brd[i][j] === 9) { brd[i][j] = 13; }
      });
    });
    res = 'lost';
    return;
  }
  if (brd[p.y][p.x] === 0) {
    brd[p.y][p.x] = getWarningNumber(p.y, p.x);
    clearEmptySpace(p.y, p.x);
  }
  if (haveWon()) { res = 'won'; }
});

canvas.addEventListener('contextmenu', e => {
  e.preventDefault();
  if (firstClick) { return; }
  if (brd[p.y][p.x] === 0) { brd[p.y][p.x] = 10; if (haveWon()) { res = 'won'; } return; }
  if (brd[p.y][p.x] === 10) { brd[p.y][p.x] = 0; return; }
  if (brd[p.y][p.x] === 9) { brd[p.y][p.x] = 11; if (haveWon()) { res = 'won'; } return; }
  if (brd[p.y][p.x] === 11) { brd[p.y][p.x] = 9; return; }
});

const getValidNeighbors = (r, c) => [
  {r: r - 1, c: c - 1}, {r: r - 1, c: c}, {r: r - 1, c: c + 1}, {r: r, c: c - 1},
  {r: r, c: c + 1}, {r: r + 1, c: c - 1}, {r: r + 1, c: c}, {r: r + 1, c: c + 1},
].filter(item => item.r >= 0 && item.r < 10 && item.c >= 0 && item.c < 10);

const getWarningNumber = (row, col) => getValidNeighbors(row, col).reduce((acc, cur) =>
  (brd[cur.r][cur.c] === 9 || brd[cur.r][cur.c] === 11) ? acc += 1 : acc, 0);
  const clearEmptySpace = (row, col) => {
  getValidNeighbors(row, col).filter(n => brd[n.r][n.c] < 9).forEach(item => {
    if (getWarningNumber(item.r, item.c) === 0) {
      brd[item.r][item.c] = 12; clearEmptySpace(item.r, item.c);
    } else {
      brd[item.r][item.c] = getWarningNumber(item.r, item.c);
    }
  });
};

const haveWon = () => brd.reduce((acc, cur) => acc += cur.reduce((aZ, cZ) => cZ === 11 ? ++aZ : aZ, 0), 0) === 10
&& brd.reduce((acc, cur) => acc += cur.reduce((aZ, cZ) => cZ === 10 ? ++aZ : aZ, 0), 0) === 0;

const placeMines = (r, c) => {
  let minesPlaced = 0;
  const clickArea = getValidNeighbors(r, c);
  clickArea.push({ row: parseInt(r, 10), col: parseInt(c, 10) });
  while (minesPlaced < 10) {
    const row = Math.floor(Math.random() * 10), col = Math.floor(Math.random() * 10);
    if (!clickArea.some(spot => spot.row === row && spot.col === col) && brd[row][col] !== 9) {
      brd[row][col] = 9; minesPlaced += 1;
    }
  }
};

const draw = () => {
  ctx.font = '15px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#cccccc';
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  brd.forEach((r, i) => {
    r.forEach((c, j) => {
      ctx.fillStyle = (brd[i][j] !== 0 && brd[i][j] !== 9) ? 'white' : '#cccccc';
      if (res === 'lost' && (brd[i][j] === 11 || brd[i][j] === 13)) { ctx.fillStyle = '#b70000'; }
      if (res === 'won' && brd[i][j] === 11) { ctx.fillStyle = '#40b700'; }
      ctx.fillRect(j * 30 + 2, i * 30 + 2, 26, 26);
      ctx.strokeRect(j * 30 + 2, i * 30 + 2, 26, 26);
      ctx.fillStyle = 'black';
      ctx.fillText(statuses[brd[i][j]], j * 30 + 15, i * 30 + 17);
    });
  });
  if (res) { ctx.font = '50px Arial'; ctx.fillText(`you ${res}`, ctx.canvas.width / 2, ctx.canvas.height / 2); }
}

(main = () => {
  draw();
  if (!res) { frame = requestAnimationFrame(main); }
})();
