import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";
import { ParkingSpot } from "@/types/lottery";

interface ParkingConfigProps {
  onSpotsConfigured: (spots: ParkingSpot[]) => void;
  currentSpots: ParkingSpot[];
}

export function ParkingConfig({ onSpotsConfigured, currentSpots }: ParkingConfigProps) {
  const [coveredCount, setCoveredCount] = useState(
    currentSpots.filter(s => s.type === 'covered').length
  );
  const [uncoveredCount, setUncoveredCount] = useState(
    currentSpots.filter(s => s.type === 'uncovered').length
  );

  const generateSpots = () => {
    const spots: ParkingSpot[] = [];
    
    // Gerar vagas cobertas
    for (let i = 1; i <= coveredCount; i++) {
      spots.push({
        id: `c${i}`,
        number: `C${i.toString().padStart(2, '0')}`,
        type: 'covered'
      });
    }
    
    // Gerar vagas descobertas
    for (let i = 1; i <= uncoveredCount; i++) {
      spots.push({
        id: `u${i}`,
        number: `D${i.toString().padStart(2, '0')}`,
        type: 'uncovered'
      });
    }
    
    onSpotsConfigured(spots);
    toast.success("Configuração de vagas atualizada!", {
      description: `${coveredCount} vagas cobertas e ${uncoveredCount} vagas descobertas configuradas.`
    });
  };

  return (
    <Card className="mb-8 bg-gradient-to-r from-accent/5 to-accent-glow/10 border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Settings className="h-6 w-6 text-accent" />
          Configuração de Vagas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="covered">Vagas Cobertas</Label>
            <Input
              id="covered"
              type="number"
              min="0"
              value={coveredCount}
              onChange={(e) => setCoveredCount(Number(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uncovered">Vagas Descobertas</Label>
            <Input
              id="uncovered"
              type="number"
              min="0"
              value={uncoveredCount}
              onChange={(e) => setUncoveredCount(Number(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={generateSpots}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar Configuração
            </Button>
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          Total: {coveredCount + uncoveredCount} vagas disponíveis
        </div>
      </CardContent>
    </Card>
  );
}