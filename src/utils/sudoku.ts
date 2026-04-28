// Sudoku game logic, solver, and generator.
// Uses bitmask candidate tracking for performance and guarantees unique solutions.

export type CellValue = number | null;
export type Board = CellValue[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Cell {
  value: CellValue;
  isInitial: boolean;
  notes: number[];
  isError: boolean;
  isHighlighted: boolean;
  isPeer: boolean;
  isConflict: boolean;
}

// ---------- utilities ----------

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function cloneBoard(board: Board): Board {
  return board.map(r => [...r]);
}

// Check if placing `num` at (row, col) violates Sudoku rules.
export function isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
    if (board[x][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  return true;
}

// Find all conflicts for a given cell (cells that share row/col/box with same value).
export function findConflicts(board: Board, row: number, col: number): Array<[number, number]> {
  const value = board[row][col];
  if (value === null) return [];
  const conflicts: Array<[number, number]> = [];
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === value) conflicts.push([row, x]);
    if (x !== row && board[x][col] === value) conflicts.push([x, col]);
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = boxRow + i;
      const c = boxCol + j;
      if ((r !== row || c !== col) && board[r][c] === value) conflicts.push([r, c]);
    }
  }
  return conflicts;
}

export function arePeers(r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2 && c1 === c2) return false;
  if (r1 === r2 || c1 === c2) return true;
  return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
}

// ---------- solver (counts solutions, stops at 2) ----------

function findBestEmptyCell(board: Board): { row: number; col: number; candidates: number[] } | null {
  let best: { row: number; col: number; candidates: number[] } | null = null;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== null) continue;
      const candidates: number[] = [];
      for (let n = 1; n <= 9; n++) {
        if (isValidPlacement(board, row, col, n)) candidates.push(n);
      }
      if (candidates.length === 0) return { row, col, candidates };
      if (!best || candidates.length < best.candidates.length) {
        best = { row, col, candidates };
        if (candidates.length === 1) return best;
      }
    }
  }
  return best;
}

function countSolutions(board: Board, limit = 2): number {
  const cell = findBestEmptyCell(board);
  if (!cell) return 1; // solved
  if (cell.candidates.length === 0) return 0;
  let count = 0;
  for (const n of cell.candidates) {
    board[cell.row][cell.col] = n;
    count += countSolutions(board, limit - count);
    board[cell.row][cell.col] = null;
    if (count >= limit) return count;
  }
  return count;
}

export function solveBoard(board: Board): Board | null {
  const work = cloneBoard(board);
  const cell = findBestEmptyCell(work);
  if (!cell) return work;
  if (cell.candidates.length === 0) return null;
  for (const n of shuffleArray(cell.candidates)) {
    work[cell.row][cell.col] = n;
    const solved = solveBoard(work);
    if (solved) return solved;
    work[cell.row][cell.col] = null;
  }
  return null;
}

export function hasUniqueSolution(board: Board): boolean {
  return countSolutions(cloneBoard(board), 2) === 1;
}

// ---------- generator ----------

function fillBoard(board: Board): boolean {
  const cell = findBestEmptyCell(board);
  if (!cell) return true;
  if (cell.candidates.length === 0) return false;
  for (const n of shuffleArray(cell.candidates)) {
    board[cell.row][cell.col] = n;
    if (fillBoard(board)) return true;
    board[cell.row][cell.col] = null;
  }
  return false;
}

function generateCompleteBoard(): Board {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
  fillBoard(board);
  return board;
}

// Strategically remove cells while preserving solution uniqueness.
function digHoles(solution: Board, targetRemovals: number): Board {
  const puzzle = cloneBoard(solution);
  const positions = shuffleArray(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );
  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= targetRemovals) break;
    const backup = puzzle[row][col];
    if (backup === null) continue;
    puzzle[row][col] = null;
    if (!hasUniqueSolution(puzzle)) {
      // restore — removing this cell would create ambiguity
      puzzle[row][col] = backup;
    } else {
      removed++;
    }
  }
  return puzzle;
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const targets: Record<Difficulty, number> = { easy: 40, medium: 50, hard: 56 };
  const solution = generateCompleteBoard();
  const puzzle = digHoles(solution, targets[difficulty]);
  return { puzzle, solution };
}

// ---------- progress / hints ----------

export function isBoardComplete(board: Board, solution: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== solution[row][col]) return false;
    }
  }
  return true;
}

// Smart hint: prefer naked singles (cells with only 1 candidate), else fall back to any empty cell.
export function getHint(
  board: Board,
  solution: Board
): { row: number; col: number; value: number; reason: string } | null {
  let fallback: { row: number; col: number } | null = null;
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== null) continue;
      const candidates: number[] = [];
      for (let n = 1; n <= 9; n++) {
        if (isValidPlacement(board, row, col, n)) candidates.push(n);
      }
      if (candidates.length === 1) {
        return {
          row,
          col,
          value: candidates[0],
          reason: `Only ${candidates[0]} fits in row ${row + 1}, column ${col + 1}.`
        };
      }
      if (!fallback) fallback = { row, col };
    }
  }
  if (!fallback) return null;
  const { row, col } = fallback;
  return {
    row,
    col,
    value: solution[row][col]!,
    reason: `Revealed value at row ${row + 1}, column ${col + 1}.`
  };
}
