import { useState, useCallback } from "react";
import { SudokuBoard } from "@/components/sudoku/SudokuBoard";
import { NumberPad } from "@/components/sudoku/NumberPad";
import { GameControls } from "@/components/sudoku/GameControls";
import { WinModal } from "@/components/sudoku/WinModal";
import {
  generatePuzzle,
  isValidPlacement,
  isBoardComplete,
  getHint,
  Difficulty,
  Cell,
  Board
} from "@/utils/sudoku";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

interface GameState {
  board: Cell[][];
  solution: Board;
  selectedCell: { row: number; col: number } | null;
  history: Cell[][][];
  historyIndex: number;
  isNoteMode: boolean;
  mistakes: number;
  hintsUsed: number;
  isComplete: boolean;
  difficulty: Difficulty;
}

const Index = () => {
  const { toast } = useToast();
  const [showWinModal, setShowWinModal] = useState(false);

  const initializeGame = useCallback((difficulty: Difficulty): GameState => {
    const { puzzle, solution } = generatePuzzle(difficulty);
    const board: Cell[][] = puzzle.map((row, rowIndex) =>
      row.map((value, colIndex) => ({
        value,
        isInitial: value !== null,
        notes: [],
        isError: false,
        isHighlighted: false
      }))
    );

    return {
      board,
      solution,
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

  const [gameState, setGameState] = useState<GameState>(() => initializeGame('easy'));

  const updateHighlighting = useCallback((board: Cell[][], selectedValue: number | null) => {
    return board.map(row =>
      row.map(cell => ({
        ...cell,
        isHighlighted: selectedValue !== null && cell.value === selectedValue && cell.value !== null
      }))
    );
  }, []);

  const handleCellSelect = (row: number, col: number) => {
    if (gameState.isComplete) return;

    setGameState(prev => {
      const selectedValue = prev.board[row][col].value;
      const newBoard = updateHighlighting(prev.board, selectedValue);

      return {
        ...prev,
        board: newBoard,
        selectedCell: { row, col }
      };
    });
  };

  const saveToHistory = (board: Cell[][]) => {
    setGameState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(board)));
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  };

  const handleNumberSelect = (num: number) => {
    if (!gameState.selectedCell || gameState.isComplete) return;

    const { row, col } = gameState.selectedCell;
    const cell = gameState.board[row][col];

    if (cell.isInitial) return;

    setGameState(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev.board)) as Cell[][];

      if (prev.isNoteMode) {
        // Toggle note
        const noteIndex = newBoard[row][col].notes.indexOf(num);
        if (noteIndex > -1) {
          newBoard[row][col].notes.splice(noteIndex, 1);
        } else {
          newBoard[row][col].notes.push(num);
          newBoard[row][col].notes.sort();
        }
      } else {
        // Place number
        newBoard[row][col].value = num;
        newBoard[row][col].notes = [];

        // Check if valid according to Sudoku rules
        const tempBoard = newBoard.map(r => r.map(c => c.value));
        const isValid = isValidPlacement(tempBoard, row, col, num);

        if (!isValid) {
          newBoard[row][col].isError = true;
          const newMistakes = prev.mistakes + 1;
          
          toast({
            title: "Oops!",
            description: "That breaks Sudoku rules! Try again!",
            variant: "destructive"
          });

          setTimeout(() => {
            setGameState(current => {
              const clearedBoard = JSON.parse(JSON.stringify(current.board)) as Cell[][];
              clearedBoard[row][col].isError = false;
              return { ...current, board: clearedBoard };
            });
          }, 500);

          saveToHistory(newBoard);
          return { ...prev, board: updateHighlighting(newBoard, num), mistakes: newMistakes };
        } else {
          newBoard[row][col].isError = false;
        }

        // Check if complete
        const plainBoard = newBoard.map(r => r.map(c => c.value));
        if (isBoardComplete(plainBoard, prev.solution)) {
          setShowWinModal(true);
          saveToHistory(newBoard);
          return { ...prev, board: newBoard, isComplete: true };
        }
      }

      saveToHistory(newBoard);
      return { ...prev, board: updateHighlighting(newBoard, num) };
    });
  };

  const handleErase = () => {
    if (!gameState.selectedCell || gameState.isComplete) return;

    const { row, col } = gameState.selectedCell;
    const cell = gameState.board[row][col];

    if (cell.isInitial) return;

    setGameState(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev.board)) as Cell[][];
      newBoard[row][col].value = null;
      newBoard[row][col].notes = [];
      newBoard[row][col].isError = false;

      saveToHistory(newBoard);
      return { ...prev, board: updateHighlighting(newBoard, null) };
    });
  };

  const handleUndo = () => {
    if (gameState.historyIndex <= 0) return;

    setGameState(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev.history[prev.historyIndex - 1])) as Cell[][];
      const selectedValue = prev.selectedCell
        ? newBoard[prev.selectedCell.row][prev.selectedCell.col].value
        : null;

      return {
        ...prev,
        board: updateHighlighting(newBoard, selectedValue),
        historyIndex: prev.historyIndex - 1
      };
    });
  };

  const handleRedo = () => {
    if (gameState.historyIndex >= gameState.history.length - 1) return;

    setGameState(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev.history[prev.historyIndex + 1])) as Cell[][];
      const selectedValue = prev.selectedCell
        ? newBoard[prev.selectedCell.row][prev.selectedCell.col].value
        : null;

      return {
        ...prev,
        board: updateHighlighting(newBoard, selectedValue),
        historyIndex: prev.historyIndex + 1
      };
    });
  };

  const handleHint = () => {
    if (gameState.isComplete) return;

    const plainBoard = gameState.board.map(row => row.map(cell => cell.value));
    const hint = getHint(plainBoard, gameState.solution);

    if (!hint) {
      toast({
        title: "No hints available",
        description: "The puzzle is already complete!",
      });
      return;
    }

    setGameState(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev.board)) as Cell[][];
      newBoard[hint.row][hint.col].value = hint.value;
      newBoard[hint.row][hint.col].notes = [];
      newBoard[hint.row][hint.col].isError = false;

      saveToHistory(newBoard);

      toast({
        title: "Hint Used! 💡",
        description: `Placed ${hint.value} at position (${hint.row + 1}, ${hint.col + 1})`,
      });

      return {
        ...prev,
        board: updateHighlighting(newBoard, hint.value),
        hintsUsed: prev.hintsUsed + 1
      };
    });
  };

  const handleNewGame = (difficulty: Difficulty) => {
    setGameState(initializeGame(difficulty));
    setShowWinModal(false);
    toast({
      title: "New Game Started! 🎮",
      description: `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Sudoku Fun
            </h1>
            <Sparkles className="w-8 h-8 text-secondary animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">Challenge your brain with colorful puzzles!</p>
        </div>

        {/* Game Board */}
        <SudokuBoard
          board={gameState.board}
          selectedCell={gameState.selectedCell}
          onCellSelect={handleCellSelect}
        />

        {/* Number Pad */}
        <NumberPad
          onNumberSelect={handleNumberSelect}
          onErase={handleErase}
          isNoteMode={gameState.isNoteMode}
          onToggleNoteMode={() =>
            setGameState(prev => ({ ...prev, isNoteMode: !prev.isNoteMode }))
          }
          disabled={gameState.isComplete || !gameState.selectedCell}
        />

        {/* Game Controls */}
        <GameControls
          onUndo={handleUndo}
          onRedo={handleRedo}
          onHint={handleHint}
          onNewGame={handleNewGame}
          mistakes={gameState.mistakes}
          hintsUsed={gameState.hintsUsed}
          canUndo={gameState.historyIndex > 0}
          canRedo={gameState.historyIndex < gameState.history.length - 1}
          currentDifficulty={gameState.difficulty}
        />

        {/* Win Modal */}
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
