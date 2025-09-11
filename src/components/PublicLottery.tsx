import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryResults } from "./LotteryResults";
import { LotteryResult } from "@/types/lottery";

interface PublicLotteryProps {
  onPerformLottery: () => void;
  lotteryResults: LotteryResult[];
  isResultsVisible: boolean;
}

export function PublicLottery({ onPerformLottery, lotteryResults, isResultsVisible }: PublicLotteryProps) {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            🎲 Sorteio de Vagas
          </h1>
          <p className="text-xl text-muted-foreground">
            Resultado do sorteio de vagas de garagem
          </p>
        </header>

        {!isResultsVisible && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 mb-8">
            <CardContent className="text-center py-12">
              <div className="space-y-6">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-foreground">Pronto para o Sorteio!</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Clique no botão abaixo para realizar o sorteio das vagas de garagem
                </p>
                <Button 
                  onClick={onPerformLottery}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold px-12 py-4 text-lg"
                >
                  🎲 Iniciar Sorteio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isResultsVisible && (
          <LotteryResults lotteryResults={lotteryResults} />
        )}
      </div>
    </div>
  );
}