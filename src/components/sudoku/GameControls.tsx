import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Lightbulb, RotateCcw, Play, Pause, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Difficulty } from "@/utils/sudoku";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onNewGame: (difficulty: Difficulty) => void;
  onPause: () => void;
  mistakes: number;
  hintsUsed: number;
  canUndo: boolean;
  canRedo: boolean;
  isPaused: boolean;
  currentDifficulty: Difficulty;
}

export const GameControls = ({
  onUndo,
  onRedo,
  onHint,
  onNewGame,
  onPause,
  mistakes,
  hintsUsed,
  canUndo,
  canRedo,
  isPaused,
  currentDifficulty
}: GameControlsProps) => {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Badge variant="outline" className="px-4 py-2 text-sm rounded-full border-2">
          <Trophy className="w-4 h-4 mr-2 text-accent" />
          Mistakes: <span className={cn(
            "ml-1 font-bold",
            mistakes > 3 && "text-destructive"
          )}>{mistakes}</span>
        </Badge>
        <Badge variant="outline" className="px-4 py-2 text-sm rounded-full border-2">
          <Lightbulb className="w-4 h-4 mr-2 text-warning" />
          Hints: <span className="ml-1 font-bold">{hintsUsed}</span>
        </Badge>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="outline"
          size="lg"
          className="rounded-full shadow-[var(--shadow-card)] hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all"
        >
          <Undo2 className="w-5 h-5 mr-2" />
          Undo
        </Button>
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="outline"
          size="lg"
          className="rounded-full shadow-[var(--shadow-card)] hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all"
        >
          <Redo2 className="w-5 h-5 mr-2" />
          Redo
        </Button>
        <Button
          onClick={onHint}
          variant="outline"
          size="lg"
          className="rounded-full shadow-[var(--shadow-card)] hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30"
        >
          <Lightbulb className="w-5 h-5 mr-2 text-warning" />
          Hint
        </Button>
        <Button
          onClick={onPause}
          variant="outline"
          size="lg"
          className="rounded-full shadow-[var(--shadow-card)] hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all"
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </Button>
      </div>

      {/* New game buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
        <Button
          onClick={() => onNewGame('easy')}
          variant={currentDifficulty === 'easy' ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
        >
          Easy
        </Button>
        <Button
          onClick={() => onNewGame('medium')}
          variant={currentDifficulty === 'medium' ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
        >
          Medium
        </Button>
        <Button
          onClick={() => onNewGame('hard')}
          variant={currentDifficulty === 'hard' ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
        >
          Hard
        </Button>
        <Button
          onClick={() => onNewGame(currentDifficulty)}
          variant="ghost"
          size="sm"
          className="rounded-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Game
        </Button>
      </div>
    </div>
  );
};
