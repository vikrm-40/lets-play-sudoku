import { useState, useCallback, useEffect, useRef } from "react";
import { SudokuBoard } from "@/components/sudoku/SudokuBoard";
import { NumberPad } from "@/components/sudoku/NumberPad";
import { ActionControls } from "@/components/sudoku/ActionControls";
import { DifficultyControls } from "@/components/sudoku/DifficultyControls";
import { WinModal } from "@/components/sudoku/WinModal";
import {
  generatePuzzle,
  isBoardComplete,
  getHint,
  findConflicts,
  arePeers,
  Difficulty,
  Cell,
  Board
} from "@/utils/sudoku";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

interface GameState {
  board: Cell[][];
  solution: Board;
  initial: Board;
  selectedCell: { row: number; col: number } | null;
  history: Cell[][][];
  historyIndex: number;
  isNoteMode: boolean;
  mistakes: number;
  hintsUsed: number;
  isComplete: boolean;
  difficulty: Difficulty;
}

const STORAGE_KEY = "sudoku-fun-state-v2";

const buildCells = (puzzle: Board): Cell[][] =>
  puzzle.map(row =>
    row.map(value => ({
      value,
      isInitial: value !== null,
      notes: [],
      isError: false,
      isHighlighted: false,
      isPeer: false,
      isConflict: false
    }))
  );

const Index = () => {
  const { toast } = useToast();
  const [showWinModal, setShowWinModal] = useState(false);

  const initializeGame = useCallback((difficulty: Difficulty): GameState => {
    const { puzzle, solution } = generatePuzzle(difficulty);
    const board = buildCells(puzzle);
    return {
      board,
      solution,
      initial: puzzle.map(r => [...r]),
      selectedCell: null,
      history: [JSON.parse(JSON.stringify(board))],
      historyIndex: 0,
      isNoteMode: false,
      mistakes: 0,
      hintsUsed: 0,
      isComplete: false,
      difficulty
    };
  }, []);

  const [gameState, setGameState] = useState<GameState>(() => {
    // Try restore
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        if (parsed.board && parsed.solution && parsed.initial) return parsed;
      }
    } catch { /* ignore */ }
    return initializeGame('easy');
  });

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch { /* ignore */ }
  }, [gameState]);

  // Recompute peer/conflict/highlight visuals from board + selection.
  const decorateBoard = useCallback(
    (board: Cell[][], selected: { row: number; col: number } | null): Cell[][] => {
      const plain: Board = board.map(r => r.map(c => c.value));
      const selectedValue = selected ? board[selected.row][selected.col].value : null;

      // Compute conflict positions for ALL filled cells (mutual conflicts).
      const conflictSet = new Set<string>();
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (plain[r][c] === null) continue;
          const conflicts = findConflicts(plain, r, c);
          if (conflicts.length > 0) {
            conflictSet.add(`${r},${c}`);
            for (const [cr, cc] of conflicts) conflictSet.add(`${cr},${cc}`);
          }
        }
      }

      return board.map((row, r) =>
        row.map((cell, c) => ({
          ...cell,
          isPeer: !!selected && arePeers(selected.row, selected.col, r, c),
          isHighlighted:
            selectedValue !== null && cell.value === selectedValue && cell.value !== null,
          isConflict: conflictSet.has(`${r},${c}`)
        }))
      );
    },
    []
  );

  const pushHistory = (state: GameState, newBoard: Cell[][]): GameState => {
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newBoard)));
    return { ...state, board: newBoard, history: newHistory, historyIndex: newHistory.length - 1 };
  };

  const handleCellSelect = (row: number, col: number) => {
    if (gameState.isComplete) return;
    setGameState(prev => ({
      ...prev,
      selectedCell: { row, col },
      board: decorateBoard(prev.board, { row, col })
    }));
  };

  const handleNumberSelect = useCallback((num: number) => {
    setGameState(prev => {
      if (!prev.selectedCell || prev.isComplete) return prev;
      const { row, col } = prev.selectedCell;
      const cell = prev.board[row][col];
      if (cell.isInitial) return prev;

      const newBoard = JSON.parse(JSON.stringify(prev.board)) as Cell[][];

      if (prev.isNoteMode) {
        const idx = newBoard[row][col].notes.indexOf(num);
        if (idx > -1) newBoard[row][col].notes.splice(idx, 1);
        else {
          newBoard[row][col].notes.push(num);
          newBoard[row][col].notes.sort();
        }
        const decorated = decorateBoard(newBoard, prev.selectedCell);
        return pushHistory(prev, decorated);
      }

      // Place number
      newBoard[row][col].value = num;
      newBoard[row][col].notes = [];

      const correct = prev.solution[row][col] === num;
      let mistakes = prev.mistakes;
      if (!correct) {
        mistakes += 1;
        newBoard[row][col].isError = true;
        toast({
          title: "Not quite!",
          description: "That number doesn't match the solution.",
          variant: "destructive"
        });
        setTimeout(() => {
          setGameState(curr => {
            const cleared = JSON.parse(JSON.stringify(curr.board)) as Cell[][];
            if (cleared[row]?.[col]) cleared[row][col].isError = false;
            return { ...curr, board: cleared };
          });
        }, 600);
      }

      const decorated = decorateBoard(newBoard, prev.selectedCell);
      const next = pushHistory({ ...prev, mistakes }, decorated);

      const plain: Board = decorated.map(r => r.map(c => c.value));
      if (isBoardComplete(plain, prev.solution)) {
        setShowWinModal(true);
        return { ...next, isComplete: true };
      }
      return next;
    });
  }, [decorateBoard, toast]);

  const handleErase = useCallback(() => {
    setGameState(prev => {
      if (!prev.selectedCell || prev.isComplete) return prev;
      const { row, col } = prev.selectedCell;
      if (prev.board[row][col].isInitial) return prev;
      const newBoard = JSON.parse(JSON.stringify(prev.board)) as Cell[][];
      newBoard[row][col].value = null;
      newBoard[row][col].notes = [];
      newBoard[row][col].isError = false;
      const decorated = decorateBoard(newBoard, prev.selectedCell);
      return pushHistory(prev, decorated);
    });
  }, [decorateBoard]);

  const handleUndo = () => {
    setGameState(prev => {
      if (prev.historyIndex <= 0) return prev;
      const restored = JSON.parse(JSON.stringify(prev.history[prev.historyIndex - 1])) as Cell[][];
      return {
        ...prev,
        board: decorateBoard(restored, prev.selectedCell),
        historyIndex: prev.historyIndex - 1,
        isComplete: false
      };
    });
  };

  const handleRedo = () => {
    setGameState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const restored = JSON.parse(JSON.stringify(prev.history[prev.historyIndex + 1])) as Cell[][];
      return {
        ...prev,
        board: decorateBoard(restored, prev.selectedCell),
        historyIndex: prev.historyIndex + 1
      };
    });
  };

  const handleHint = () => {
    if (gameState.isComplete) return;
    const plain: Board = gameState.board.map(r => r.map(c => c.value));
    const hint = getHint(plain, gameState.solution);
    if (!hint) {
      toast({ title: "No hints available", description: "The puzzle is already complete!" });
      return;
    }
    setGameState(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev.board)) as Cell[][];
      newBoard[hint.row][hint.col].value = hint.value;
      newBoard[hint.row][hint.col].notes = [];
      newBoard[hint.row][hint.col].isError = false;
      const decorated = decorateBoard(newBoard, { row: hint.row, col: hint.col });
      const next = pushHistory(
        { ...prev, hintsUsed: prev.hintsUsed + 1, selectedCell: { row: hint.row, col: hint.col } },
        decorated
      );
      toast({ title: "Hint 💡", description: hint.reason });
      const p2: Board = decorated.map(r => r.map(c => c.value));
      if (isBoardComplete(p2, prev.solution)) {
        setShowWinModal(true);
        return { ...next, isComplete: true };
      }
      return next;
    });
  };

  const handleNewGame = (difficulty: Difficulty) => {
    setGameState(initializeGame(difficulty));
    setShowWinModal(false);
    toast({
      title: "New Game! 🎮",
      description: `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
    });
  };

  const handleReset = () => {
    setGameState(prev => {
      const board = buildCells(prev.initial);
      return {
        ...prev,
        board: decorateBoard(board, null),
        selectedCell: null,
        history: [JSON.parse(JSON.stringify(board))],
        historyIndex: 0,
        mistakes: 0,
        hintsUsed: 0,
        isComplete: false
      };
    });
    setShowWinModal(false);
    toast({ title: "Puzzle reset", description: "Back to the starting position." });
  };

  // Keyboard support
  const handleNumberSelectRef = useRef(handleNumberSelect);
  const handleEraseRef = useRef(handleErase);
  handleNumberSelectRef.current = handleNumberSelect;
  handleEraseRef.current = handleErase;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameState.isComplete) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key >= "1" && e.key <= "9") {
        handleNumberSelectRef.current(parseInt(e.key, 10));
        e.preventDefault();
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        handleEraseRef.current();
        e.preventDefault();
        return;
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        setGameState(prev => {
          const cur = prev.selectedCell ?? { row: 0, col: 0 };
          let { row, col } = cur;
          if (e.key === "ArrowUp") row = Math.max(0, row - 1);
          if (e.key === "ArrowDown") row = Math.min(8, row + 1);
          if (e.key === "ArrowLeft") col = Math.max(0, col - 1);
          if (e.key === "ArrowRight") col = Math.min(8, col + 1);
          return {
            ...prev,
            selectedCell: { row, col },
            board: decorateBoard(prev.board, { row, col })
          };
        });
      }
      if (e.key === "n" || e.key === "N") {
        setGameState(prev => ({ ...prev, isNoteMode: !prev.isNoteMode }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decorateBoard, gameState.isComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Sudoku Fun
            </h1>
            <Sparkles className="w-8 h-8 text-secondary animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">
            Tap a cell · type 1–9 · arrows to move · N for notes
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-6">
          <SudokuBoard
            board={gameState.board}
            selectedCell={gameState.selectedCell}
            onCellSelect={handleCellSelect}
          />

          <div className="lg:pt-4 space-y-4">
            <NumberPad
              onNumberSelect={handleNumberSelect}
              onErase={handleErase}
              isNoteMode={gameState.isNoteMode}
              onToggleNoteMode={() =>
                setGameState(prev => ({ ...prev, isNoteMode: !prev.isNoteMode }))
              }
              disabled={gameState.isComplete || !gameState.selectedCell}
            />
            <ActionControls
              onUndo={handleUndo}
              onRedo={handleRedo}
              onHint={handleHint}
              mistakes={gameState.mistakes}
              hintsUsed={gameState.hintsUsed}
              canUndo={gameState.historyIndex > 0}
              canRedo={gameState.historyIndex < gameState.history.length - 1}
            />
          </div>
        </div>

        <DifficultyControls
          onNewGame={handleNewGame}
          onReset={handleReset}
          currentDifficulty={gameState.difficulty}
        />

        <WinModal
          isOpen={showWinModal}
          onClose={() => setShowWinModal(false)}
          mistakes={gameState.mistakes}
          hintsUsed={gameState.hintsUsed}
          difficulty={gameState.difficulty}
          onNewGame={handleNewGame}
        />
      </div>
    </div>
  );
};

export default Index;
