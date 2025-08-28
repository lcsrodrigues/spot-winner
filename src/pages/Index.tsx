import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPanel } from "@/components/AdminPanel";
import { PublicLottery } from "@/components/PublicLottery";
import { Settings, Users } from "lucide-react";
import { toast } from "sonner";
import { Resident, ParkingSpot } from "@/types/lottery";

interface LotteryResult {
  residentName: string;
  apartment: string;
  spotNumber: string;
  spotType: 'covered' | 'uncovered';
}

const Index = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [lotteryResults, setLotteryResults] = useState<LotteryResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleResidentsAdded = (newResidents: Resident[]) => {
    setResidents(newResidents);
  };

  const handleSpotsConfigured = (spots: ParkingSpot[]) => {
    setParkingSpots(spots);
  };

  const getEligibleResidents = (type: 'covered' | 'uncovered') => {
    const baseEligible = residents.filter(r => {
      const isPaid = r.paymentStatus === 'current';
      const hasJustification = r.paymentStatus === 'overdue' && r.hasJustification;
      const isEligible = isPaid || hasJustification;
      
      if (type === 'covered') {
        return isEligible && (isPaid || (hasJustification && r.monthsOverdue <= 2));
      }
      return isEligible;
    });

    // Expandir lista para incluir moradores com vaga dupla
    const expandedList: Resident[] = [];
    baseEligible.forEach(resident => {
      expandedList.push(resident);
      if (resident.hasDoubleSpot) {
        expandedList.push({ ...resident, id: `${resident.id}_double` });
      }
    });

    return expandedList;
  };

  const performLottery = () => {
    const coveredSpots = parkingSpots.filter(s => s.type === 'covered');
    const uncoveredSpots = parkingSpots.filter(s => s.type === 'uncovered');
    
    const eligibleForCovered = getEligibleResidents('covered');
    const eligibleForUncovered = getEligibleResidents('uncovered');
    
    const newResults: Array<{
      residentName: string;
      apartment: string;
      spotNumber: string;
      spotType: 'covered' | 'uncovered';
    }> = [];
    
    // Sortear vagas cobertas
    const shuffledCoveredResidents = [...eligibleForCovered].sort(() => Math.random() - 0.5);
    const availableCoveredSpots = [...coveredSpots];
    
    for (let i = 0; i < Math.min(shuffledCoveredResidents.length, availableCoveredSpots.length); i++) {
      const resident = shuffledCoveredResidents[i];
      const spot = availableCoveredSpots[i];
      
      // Se for uma entrada de vaga dupla, mostrar como tal
      const displayName = resident.id.includes('_double') 
        ? `${resident.name} (2ª vaga)`
        : resident.name;
      
      newResults.push({
        residentName: displayName,
        apartment: resident.apartment,
        spotNumber: spot.number,
        spotType: 'covered'
      });
    }
    
    // Sortear vagas descobertas
    const shuffledUncoveredResidents = [...eligibleForUncovered].sort(() => Math.random() - 0.5);
    const availableUncoveredSpots = [...uncoveredSpots];
    
    for (let i = 0; i < Math.min(shuffledUncoveredResidents.length, availableUncoveredSpots.length); i++) {
      const resident = shuffledUncoveredResidents[i];
      const spot = availableUncoveredSpots[i];
      
      // Se for uma entrada de vaga dupla, mostrar como tal
      const displayName = resident.id.includes('_double') 
        ? `${resident.name} (2ª vaga)`
        : resident.name;
      
      newResults.push({
        residentName: displayName,
        apartment: resident.apartment,
        spotNumber: spot.number,
        spotType: 'uncovered'
      });
    }
    
    setLotteryResults(newResults);
    setShowResults(true);
    
    toast.success("Sorteio realizado com sucesso!", {
      description: `${newResults.length} vagas foram sorteadas.`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="public" className="w-full">
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
              <TabsTrigger value="public" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Área Pública
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Administração
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="public" className="mt-0">
          <PublicLottery 
            onPerformLottery={performLottery}
            lotteryResults={lotteryResults}
            isResultsVisible={showResults}
          />
        </TabsContent>

        <TabsContent value="admin" className="mt-0">
          <AdminPanel 
            residents={residents}
            parkingSpots={parkingSpots}
            onResidentsAdded={handleResidentsAdded}
            onSpotsConfigured={handleSpotsConfigured}
            onPerformLottery={performLottery}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;