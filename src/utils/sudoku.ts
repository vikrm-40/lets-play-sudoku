// Sudoku game logic and generation

export type CellValue = number | null;
export type Board = CellValue[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Cell {
  value: CellValue;
  isInitial: boolean;
  notes: number[];
  isError: boolean;
  isHighlighted: boolean;
}

// Generate a valid completed Sudoku board
function generateCompleteBoard(): Board {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
  fillBoard(board);
  return board;
}

// Fill board with valid Sudoku solution
function fillBoard(board: Board): boolean {
  const emptyCell = findEmptyCell(board);
  if (!emptyCell) return true;

  const [row, col] = emptyCell;
  const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  for (const num of numbers) {
    if (isValidPlacement(board, row, col, num)) {
      board[row][col] = num;
      if (fillBoard(board)) return true;
      board[row][col] = null;
    }
  }

  return false;
}

// Find first empty cell
function findEmptyCell(board: Board): [number, number] | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) return [row, col];
    }
  }
  return null;
}

// Check if placement is valid
export function isValidPlacement(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
}

// Shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Remove cells based on difficulty
function removeNumbers(board: Board, difficulty: Difficulty): Board {
  const puzzle = board.map(row => [...row]);
  const cellsToRemove = {
    easy: 35,
    medium: 45,
    hard: 55
  };

  let removed = 0;
  const attempts = cellsToRemove[difficulty];

  while (removed < attempts) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      removed++;
    }
  }

  return puzzle;
}

// Generate a new Sudoku puzzle
export function generatePuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = generateCompleteBoard();
  const puzzle = removeNumbers(solution, difficulty);
  return { puzzle, solution };
}

// Check if board is complete and correct
export function isBoardComplete(board: Board, solution: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== solution[row][col]) return false;
    }
  }
  return true;
}

// Get hint - reveal one cell
export function getHint(board: Board, solution: Board): { row: number; col: number; value: number } | null {
  const emptyCells: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        emptyCells.push([row, col]);
      }
    }
  }

  if (emptyCells.length === 0) return null;

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  return { row, col, value: solution[row][col]! };
}
