import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface LotteryResult {
  residentName: string;
  apartment: string;
  spotNumber: string;
  spotType: 'covered' | 'uncovered';
}

interface PublicLotteryProps {
  onPerformLottery: () => void;
  lotteryResults: LotteryResult[];
  isResultsVisible: boolean;
}

export function PublicLottery({ onPerformLottery, lotteryResults, isResultsVisible }: PublicLotteryProps) {
  const downloadResults = () => {
    const workbook = XLSX.utils.book_new();
    
    const data = lotteryResults.map(result => ({
      'Morador': result.residentName,
      'Apartamento': result.apartment,
      'Número da Vaga': result.spotNumber,
      'Tipo de Vaga': result.spotType === 'covered' ? 'Coberta' : 'Descoberta',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultado do Sorteio");
    
    const fileName = `resultado-sorteio-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const coveredResults = lotteryResults.filter(r => r.spotType === 'covered');
  const uncoveredResults = lotteryResults.filter(r => r.spotType === 'uncovered');

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

        {isResultsVisible && lotteryResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-foreground">🏆 Resultado do Sorteio</h2>
              <Button 
                onClick={downloadResults}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <Download className="h-5 w-5" />
                Baixar Resultado
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vagas Cobertas */}
              <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/30">
                <CardHeader>
                  <CardTitle className="text-success flex items-center gap-2 text-2xl">
                    <span>🏠</span>
                    Vagas Cobertas ({coveredResults.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coveredResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/80 p-4 rounded-lg shadow-sm border border-success/20">
                      <div>
                        <p className="font-bold text-lg text-foreground">{result.residentName}</p>
                        <p className="text-muted-foreground">Apartamento {result.apartment}</p>
                      </div>
                      <Badge className="bg-success text-success-foreground text-lg px-4 py-2">
                        Vaga {result.spotNumber}
                      </Badge>
                    </div>
                  ))}
                  {coveredResults.length === 0 && (
                    <p className="text-success/70 text-center py-8 text-lg">Nenhuma vaga coberta sorteada</p>
                  )}
                </CardContent>
              </Card>

              {/* Vagas Descobertas */}
              <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/30">
                <CardHeader>
                  <CardTitle className="text-warning flex items-center gap-2 text-2xl">
                    <span>🚗</span>
                    Vagas Descobertas ({uncoveredResults.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {uncoveredResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/80 p-4 rounded-lg shadow-sm border border-warning/20">
                      <div>
                        <p className="font-bold text-lg text-foreground">{result.residentName}</p>
                        <p className="text-muted-foreground">Apartamento {result.apartment}</p>
                      </div>
                      <Badge className="bg-warning text-warning-foreground text-lg px-4 py-2">
                        Vaga {result.spotNumber}
                      </Badge>
                    </div>
                  ))}
                  {uncoveredResults.length === 0 && (
                    <p className="text-warning/70 text-center py-8 text-lg">Nenhuma vaga descoberta sorteada</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button 
                onClick={onPerformLottery}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                🔄 Realizar Novo Sorteio
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}