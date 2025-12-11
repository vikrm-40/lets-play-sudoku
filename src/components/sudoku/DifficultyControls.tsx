import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Difficulty } from "@/utils/sudoku";

interface DifficultyControlsProps {
  onNewGame: (difficulty: Difficulty) => void;
  currentDifficulty: Difficulty;
}

export const DifficultyControls = ({
  onNewGame,
  currentDifficulty
}: DifficultyControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
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
  );
};
