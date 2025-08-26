import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LotteryResult {
  residentName: string;
  apartment: string;
  spotNumber: string;
  spotType: 'covered' | 'uncovered';
}

interface LotteryResultsProps {
  results: LotteryResult[];
  isVisible: boolean;
}

export function LotteryResults({ results, isVisible }: LotteryResultsProps) {
  if (!isVisible || results.length === 0) {
    return null;
  }

  const coveredResults = results.filter(r => r.spotType === 'covered');
  const uncoveredResults = results.filter(r => r.spotType === 'uncovered');

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-2xl font-bold text-foreground">Resultado do Sorteio</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vagas Cobertas */}
        <Card className="bg-success-light border-success/20">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              <span>🏠</span>
              Vagas Cobertas ({coveredResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {coveredResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{result.residentName}</p>
                  <p className="text-sm text-muted-foreground">Apto {result.apartment}</p>
                </div>
                <Badge variant="outline" className="bg-success text-success-foreground">
                  Vaga {result.spotNumber}
                </Badge>
              </div>
            ))}
            {coveredResults.length === 0 && (
              <p className="text-success/70 text-center py-4">Nenhuma vaga coberta sorteada</p>
            )}
          </CardContent>
        </Card>

        {/* Vagas Descobertas */}
        <Card className="bg-warning-light border-warning/20">
          <CardHeader>
            <CardTitle className="text-warning flex items-center gap-2">
              <span>🚗</span>
              Vagas Descobertas ({uncoveredResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {uncoveredResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                <div>
                  <p className="font-semibold text-foreground">{result.residentName}</p>
                  <p className="text-sm text-muted-foreground">Apto {result.apartment}</p>
                </div>
                <Badge variant="outline" className="bg-warning text-warning-foreground">
                  Vaga {result.spotNumber}
                </Badge>
              </div>
            ))}
            {uncoveredResults.length === 0 && (
              <p className="text-warning/70 text-center py-4">Nenhuma vaga descoberta sorteada</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}