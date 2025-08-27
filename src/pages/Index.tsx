import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResidentCard } from "@/components/ResidentCard";
import { StatsCards } from "@/components/StatsCards";
import { LotteryResults } from "@/components/LotteryResults";
import { ExcelUpload } from "@/components/ExcelUpload";
import { mockResidents, mockParkingSpots } from "@/data/mockData";
import { toast } from "sonner";
import { Shuffle, Users, ParkingCircle } from "lucide-react";
import { Resident } from "@/types/lottery";

interface LotteryResult {
  residentName: string;
  apartment: string;
  spotNumber: string;
  spotType: 'covered' | 'uncovered';
}

const Index = () => {
  const [residents, setResidents] = useState(mockResidents);
  const [lotteryResults, setLotteryResults] = useState<LotteryResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleResidentsAdded = (newResidents: Resident[]) => {
    setResidents(prev => [...prev, ...newResidents]);
  };

  const getEligibleResidents = (type: 'covered' | 'uncovered') => {
    if (type === 'covered') {
      return residents.filter(r => r.paymentStatus === 'current');
    } else {
      return residents.filter(r => {
        if (r.paymentStatus === 'current') return true;
        if (r.paymentStatus === 'overdue') return true;
        if (r.paymentStatus === 'delinquent' && r.monthsOverdue <= 3) return true;
        if (r.paymentStatus === 'delinquent' && r.monthsOverdue > 3 && r.hasJustification) return true;
        return false;
      });
    }
  };

  const performLottery = () => {
    setIsDrawing(true);
    
    // Simular delay do sorteio
    setTimeout(() => {
      const results: LotteryResult[] = [];
      
      // Sortear vagas cobertas
      const eligibleForCovered = getEligibleResidents('covered');
      const coveredSpots = mockParkingSpots.filter(s => s.type === 'covered');
      const shuffledCoveredResidents = [...eligibleForCovered].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < Math.min(coveredSpots.length, shuffledCoveredResidents.length); i++) {
        results.push({
          residentName: shuffledCoveredResidents[i].name,
          apartment: shuffledCoveredResidents[i].apartment,
          spotNumber: coveredSpots[i].number,
          spotType: 'covered'
        });
      }

      // Sortear vagas descobertas
      const eligibleForUncovered = getEligibleResidents('uncovered').filter(
        r => !results.some(result => result.residentName === r.name)
      );
      const uncoveredSpots = mockParkingSpots.filter(s => s.type === 'uncovered');
      const shuffledUncoveredResidents = [...eligibleForUncovered].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < Math.min(uncoveredSpots.length, shuffledUncoveredResidents.length); i++) {
        results.push({
          residentName: shuffledUncoveredResidents[i].name,
          apartment: shuffledUncoveredResidents[i].apartment,
          spotNumber: uncoveredSpots[i].number,
          spotType: 'uncovered'
        });
      }

      setLotteryResults(results);
      setShowResults(true);
      setIsDrawing(false);
      
      toast.success("Sorteio realizado com sucesso!", {
        description: `${results.length} vagas foram sorteadas entre os moradores elegíveis.`
      });
    }, 2000);
  };

  const eligibleForCovered = getEligibleResidents('covered').length;
  const eligibleForUncovered = getEligibleResidents('uncovered').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <ParkingCircle className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Sistema de Sorteio de Vagas</h1>
              <p className="text-primary-foreground/80">Condomínio Residencial</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <StatsCards residents={residents} />

        {/* Excel Upload */}
        <ExcelUpload onResidentsAdded={handleResidentsAdded} />

        {/* Lottery Action */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary-glow/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shuffle className="h-6 w-6 text-primary" />
              Realizar Sorteio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{eligibleForCovered}</p>
                <p className="text-sm text-muted-foreground">Elegíveis para vagas cobertas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{eligibleForUncovered}</p>
                <p className="text-sm text-muted-foreground">Elegíveis para vagas descobertas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{mockParkingSpots.length}</p>
                <p className="text-sm text-muted-foreground">Total de vagas disponíveis</p>
              </div>
            </div>
            
            <Button 
              onClick={performLottery}
              disabled={isDrawing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
            >
              {isDrawing ? (
                <>
                  <Shuffle className="mr-2 h-5 w-5 animate-spin" />
                  Realizando Sorteio...
                </>
              ) : (
                <>
                  <Shuffle className="mr-2 h-5 w-5" />
                  Iniciar Sorteio de Vagas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Lottery Results */}
        <LotteryResults results={lotteryResults} isVisible={showResults} />

        {/* Residents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Moradores Cadastrados ({residents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {residents.map((resident) => (
                <ResidentCard key={resident.id} resident={resident} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;