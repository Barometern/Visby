export const COLS = 5;
export const ROWS = 2;
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

export const PIECE_PATHS: string[] = Array.from({ length: TOTAL }, (_, i) =>
  piecePath(i % COLS, Math.floor(i / COLS)),
);

export type PuzzleConfig = {
  cols: number;
  rows: number;
  total: number;
  pieceW: number;
  pieceH: number;
  piecePaths: string[];
};

function getPieceEdgesParametric(col: number, row: number, cols: number, rows: number) {
  const top = row === 0 ? 0 : -verticalConnector(row - 1, col);
  const right = col === cols - 1 ? 0 : horizontalConnector(row, col);
  const bottom = row === rows - 1 ? 0 : verticalConnector(row, col);
  const left = col === 0 ? 0 : -horizontalConnector(row, col - 1);
  return { top, right, bottom, left };
}

function piecePathParametric(
  col: number, row: number,
  cols: number, rows: number,
  pieceW: number, pieceH: number,
): string {
  const { top, right, bottom, left } = getPieceEdgesParametric(col, row, cols, rows);
  const x0 = col * pieceW;
  const x1 = x0 + pieceW;
  const y0 = row * pieceH;
  const y1 = y0 + pieceH;
  const cx = x0 + pieceW / 2;
  const cy = y0 + pieceH / 2;

  // Scale tab constants proportionally to piece dimensions
  const tabDepthH = TAB_DEPTH * (pieceH / 100);
  const tabDepthW = TAB_DEPTH * (pieceW / 100);
  const tabWidthW = TAB_WIDTH * (pieceW / 100);
  const tabWidthH = TAB_WIDTH * (pieceH / 100);
  const shoulderW = SHOULDER * (pieceW / 100);
  const shoulderH = SHOULDER * (pieceH / 100);

  let d = `M ${x0} ${y0}`;

  if (top === 0) {
    d += ` L ${x1} ${y0}`;
  } else {
    const tipY = y0 - top * tabDepthH;
    d += ` L ${x0 + shoulderW} ${y0}`;
    d += ` C ${cx - tabWidthW} ${y0} ${cx - tabWidthW} ${tipY} ${cx} ${tipY}`;
    d += ` C ${cx + tabWidthW} ${tipY} ${cx + tabWidthW} ${y0} ${x1 - shoulderW} ${y0}`;
    d += ` L ${x1} ${y0}`;
  }

  if (right === 0) {
    d += ` L ${x1} ${y1}`;
  } else {
    const tipX = x1 + right * tabDepthW;
    d += ` L ${x1} ${y0 + shoulderH}`;
    d += ` C ${x1} ${cy - tabWidthH} ${tipX} ${cy - tabWidthH} ${tipX} ${cy}`;
    d += ` C ${tipX} ${cy + tabWidthH} ${x1} ${cy + tabWidthH} ${x1} ${y1 - shoulderH}`;
    d += ` L ${x1} ${y1}`;
  }

  if (bottom === 0) {
    d += ` L ${x0} ${y1}`;
  } else {
    const tipY = y1 + bottom * tabDepthH;
    d += ` L ${x1 - shoulderW} ${y1}`;
    d += ` C ${cx + tabWidthW} ${y1} ${cx + tabWidthW} ${tipY} ${cx} ${tipY}`;
    d += ` C ${cx - tabWidthW} ${tipY} ${cx - tabWidthW} ${y1} ${x0 + shoulderW} ${y1}`;
    d += ` L ${x0} ${y1}`;
  }

  if (left === 0) {
    d += ` L ${x0} ${y0}`;
  } else {
    const tipX = x0 - left * tabDepthW;
    d += ` L ${x0} ${y1 - shoulderH}`;
    d += ` C ${x0} ${cy + tabWidthH} ${tipX} ${cy + tabWidthH} ${tipX} ${cy}`;
    d += ` C ${tipX} ${cy - tabWidthH} ${x0} ${cy - tabWidthH} ${x0} ${y0 + shoulderH}`;
    d += ` L ${x0} ${y0}`;
  }

  return `${d} Z`;
}

const puzzleConfigCache: Partial<Record<10 | 15, PuzzleConfig>> = {};

export function getPuzzleConfig(total: 10 | 15): PuzzleConfig {
  if (puzzleConfigCache[total]) return puzzleConfigCache[total]!;
  const cols = 5;
  const rows = total / cols;
  // Both configs fill the same 500×300 canvas so they appear identical in size
  const pieceW = 500 / cols;    // 100 for both
  const pieceH = 300 / rows;    // 150 for 10-piece, 100 for 15-piece
  const piecePaths = Array.from({ length: total }, (_, i) =>
    piecePathParametric(i % cols, Math.floor(i / cols), cols, rows, pieceW, pieceH),
  );
  puzzleConfigCache[total] = { cols, rows, total, pieceW, pieceH, piecePaths };
  return puzzleConfigCache[total]!;
}
