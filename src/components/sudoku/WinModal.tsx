import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Lightbulb, Target, Sparkles } from "lucide-react";
import { Difficulty } from "@/utils/sudoku";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: number;
  hintsUsed: number;
  difficulty: Difficulty;
  onNewGame: (difficulty: Difficulty) => void;
}

export const WinModal = ({
  isOpen,
  onClose,
  mistakes,
  hintsUsed,
  difficulty,
  onNewGame
}: WinModalProps) => {

  useEffect(() => {
    if (isOpen) {
      // Celebration confetti!
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#20B2AA', '#FF6B9D', '#FFD93D']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#20B2AA', '#FF6B9D', '#FFD93D']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-2 bg-gradient-to-br from-background to-primary/5">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Trophy className="w-20 h-20 text-warning animate-bounce-in" />
              <Sparkles className="w-8 h-8 text-accent absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Amazing! You Did It! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-lg pt-2">
            You completed the <span className={`font-bold ${getDifficultyColor(difficulty)}`}>{difficulty}</span> puzzle!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-card rounded-2xl border border-border">
              <Target className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-muted-foreground">Mistakes</p>
              <p className="text-lg font-bold text-foreground">{mistakes}</p>
            </div>
            <div className="text-center p-4 bg-card rounded-2xl border border-border">
              <Lightbulb className="w-6 h-6 mx-auto mb-2 text-warning" />
              <p className="text-sm text-muted-foreground">Hints</p>
              <p className="text-lg font-bold text-foreground">{hintsUsed}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={() => {
                onNewGame(difficulty);
                onClose();
              }}
              size="lg"
              className="w-full rounded-full text-lg shadow-[var(--shadow-playful)] hover:shadow-lg transform hover:scale-105 transition-all bg-gradient-to-r from-primary to-primary/80"
            >
              Play Again ({difficulty})
            </Button>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).filter(d => d !== difficulty).map((diff) => (
                <Button
                  key={diff}
                  onClick={() => {
                    onNewGame(diff);
                    onClose();
                  }}
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-full capitalize"
                >
                  Try {diff}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
