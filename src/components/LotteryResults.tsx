import { LotteryResult } from "@/types/lottery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, Download } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface LotteryResultsProps {
  lotteryResults: LotteryResult[];
}

export function LotteryResults({ lotteryResults }: LotteryResultsProps) {
  const downloadResults = () => {
    if (!lotteryResults || lotteryResults.length === 0) {
      toast.error("Nenhum resultado para exportar");
      return;
    }

    const lastResult = lotteryResults[lotteryResults.length - 1];
    const exportData = lastResult.results.map(result => ({
      "Número da Vaga": result.number,
      "Localização": result.location,
      "Tipo de Vaga": result.type,
      "Apartamento Sorteado": result.assignedApartment,
      "Observações (Pré-seleção, Regra Oculta)": result.observations
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultado do Sorteio");
    
    const fileName = `resultado_sorteio_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success("Resultado exportado com sucesso!");
  };

  if (!lotteryResults || lotteryResults.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum sorteio realizado</h3>
          <p className="text-muted-foreground">
            Os resultados do sorteio aparecerão aqui após a realização.
          </p>
        </CardContent>
      </Card>
    );
  }

  const lastResult = lotteryResults[lotteryResults.length - 1];
  const assignedResults = lastResult.results.filter(r => r.assignedApartment);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="h-8 w-8 text-primary" />
            Resultado do Sorteio de Vagas
          </CardTitle>
          <div className="flex justify-center">
            <Button onClick={downloadResults} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Baixar Resultado (Excel)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground mb-6">
            Sorteio realizado em {lastResult.date.toLocaleDateString('pt-BR')} às {lastResult.date.toLocaleTimeString('pt-BR')}
          </div>
          
          <div className="grid gap-4">
            {assignedResults.map((result, index) => (
              <Card key={index} className="bg-card border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">#{result.number}</div>
                        <div className="text-xs text-muted-foreground">{result.location}</div>
                        <Badge variant={
                          result.type === 'ÚNICA' ? 'default' : 
                          result.type === 'DUPLA' ? 'secondary' : 'outline'
                        }>
                          {result.type}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">Apartamento {result.assignedApartment}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{result.observations}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Trophy className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {assignedResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma vaga foi sorteada neste resultado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}