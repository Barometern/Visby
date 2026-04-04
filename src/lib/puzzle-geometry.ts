export const COLS = 5;
export const ROWS = 3;
export const TOTAL = COLS * ROWS;
export const PIECE_SIZE = 100;

const TAB_DEPTH = 18;
const TAB_WIDTH = 18;
const SHOULDER = 24;

function horizontalConnector(row: number, col: number): 1 | -1 {
  return (row + col) % 2 === 0 ? 1 : -1;
}

function verticalConnector(row: number, col: number): 1 | -1 {
  return (row + col) % 2 === 0 ? -1 : 1;
}

export function getPieceEdges(col: number, row: number) {
  const top = row === 0 ? 0 : -verticalConnector(row - 1, col);
  const right = col === COLS - 1 ? 0 : horizontalConnector(row, col);
  const bottom = row === ROWS - 1 ? 0 : verticalConnector(row, col);
  const left = col === 0 ? 0 : -horizontalConnector(row, col - 1);

  return { top, right, bottom, left };
}

export function piecePath(col: number, row: number): string {
  const { top, right, bottom, left } = getPieceEdges(col, row);
  const x0 = col * PIECE_SIZE;
  const x1 = x0 + PIECE_SIZE;
  const y0 = row * PIECE_SIZE;
  const y1 = y0 + PIECE_SIZE;
  const cx = x0 + PIECE_SIZE / 2;
  const cy = y0 + PIECE_SIZE / 2;

  let d = `M ${x0} ${y0}`;

  if (top === 0) {
    d += ` L ${x1} ${y0}`;
  } else {
    const tipY = y0 - top * TAB_DEPTH;
    d += ` L ${x0 + SHOULDER} ${y0}`;
    d += ` C ${cx - TAB_WIDTH} ${y0} ${cx - TAB_WIDTH} ${tipY} ${cx} ${tipY}`;
    d += ` C ${cx + TAB_WIDTH} ${tipY} ${cx + TAB_WIDTH} ${y0} ${x1 - SHOULDER} ${y0}`;
    d += ` L ${x1} ${y0}`;
  }

  if (right === 0) {
    d += ` L ${x1} ${y1}`;
  } else {
    const tipX = x1 + right * TAB_DEPTH;
    d += ` L ${x1} ${y0 + SHOULDER}`;
    d += ` C ${x1} ${cy - TAB_WIDTH} ${tipX} ${cy - TAB_WIDTH} ${tipX} ${cy}`;
    d += ` C ${tipX} ${cy + TAB_WIDTH} ${x1} ${cy + TAB_WIDTH} ${x1} ${y1 - SHOULDER}`;
    d += ` L ${x1} ${y1}`;
  }

  if (bottom === 0) {
    d += ` L ${x0} ${y1}`;
  } else {
    const tipY = y1 + bottom * TAB_DEPTH;
    d += ` L ${x1 - SHOULDER} ${y1}`;
    d += ` C ${cx + TAB_WIDTH} ${y1} ${cx + TAB_WIDTH} ${tipY} ${cx} ${tipY}`;
    d += ` C ${cx - TAB_WIDTH} ${tipY} ${cx - TAB_WIDTH} ${y1} ${x0 + SHOULDER} ${y1}`;
    d += ` L ${x0} ${y1}`;
  }

  if (left === 0) {
    d += ` L ${x0} ${y0}`;
  } else {
    const tipX = x0 - left * TAB_DEPTH;
    d += ` L ${x0} ${y1 - SHOULDER}`;
    d += ` C ${x0} ${cy + TAB_WIDTH} ${tipX} ${cy + TAB_WIDTH} ${tipX} ${cy}`;
    d += ` C ${tipX} ${cy - TAB_WIDTH} ${x0} ${cy - TAB_WIDTH} ${x0} ${y0 + SHOULDER}`;
    d += ` L ${x0} ${y0}`;
  }

  return `${d} Z`;
}
