import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPanel } from "@/components/AdminPanel";
import { PublicLottery } from "@/components/PublicLottery";
import { Settings, Users } from "lucide-react";
import { toast } from "sonner";
import { Resident, ParkingSpot, LotteryResult } from "@/types/lottery";

const Index = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [lotteryResults, setLotteryResults] = useState<LotteryResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleResidentsAdded = (newResidents: Resident[]) => {
    setResidents(newResidents);
  };

  const handleVagasConfigured = (vagas: ParkingSpot[]) => {
    setParkingSpots(vagas);
  };

  const performLottery = () => {
    // Filtrar apenas vagas válidas para sorteio
    const vagasDisponiveis = parkingSpots.filter(vaga => 
      !vaga.isPreSelected && !vaga.hasHiddenRule
    );
    
    const results: LotteryResult['results'] = [];
    
    // Processar cada vaga disponível
    vagasDisponiveis.forEach(vaga => {
      // Encontrar apartamentos elegíveis que ainda têm moradores cadastrados
      const apartamentosElegiveis = vaga.eligibleApartments.filter(apt =>
        residents.some(resident => resident.apartment === apt)
      );
      
      if (apartamentosElegiveis.length > 0) {
        // Sortear um apartamento aleatório entre os elegíveis
        const apartamentoSorteado = apartamentosElegiveis[
          Math.floor(Math.random() * apartamentosElegiveis.length)
        ];
        
        results.push({
          number: vaga.number,
          location: vaga.location,
          type: vaga.type,
          assignedApartment: apartamentoSorteado,
          observations: "Apto elegível sorteado"
        });
      }
    });
    
    // Adicionar vagas pré-selecionadas e com regra oculta nos resultados
    parkingSpots.forEach(vaga => {
      if (vaga.isPreSelected || vaga.hasHiddenRule) {
        results.push({
          number: vaga.number,
          location: vaga.location,
          type: vaga.type,
          assignedApartment: vaga.isPreSelected ? 
            (vaga.eligibleApartments[0] || "") : "",
          observations: vaga.isPreSelected ? 
            "Pré-selecionada - não sorteada" : "Não sorteia"
        });
      }
    });
    
    // Ordenar resultados por número da vaga
    results.sort((a, b) => {
      const numA = parseInt(a.number) || 0;
      const numB = parseInt(b.number) || 0;
      return numA - numB;
    });
    
    setLotteryResults([{
      id: `lottery-${Date.now()}`,
      date: new Date(),
      results
    }]);
    setShowResults(true);
    toast.success(`Sorteio realizado! ${results.filter(r => r.assignedApartment).length} vagas atribuídas.`);
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
              onVagasConfigured={handleVagasConfigured}
              onPerformLottery={performLottery}
            />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;