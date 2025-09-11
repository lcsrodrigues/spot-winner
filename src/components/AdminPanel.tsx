import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExcelUpload } from "./ExcelUpload";
import { VagasExcelUpload } from "./VagasExcelUpload";
import { StatsCards } from "./StatsCards";
import { ResidentCard } from "./ResidentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Users, Car, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Resident, ParkingSpot } from "@/types/lottery";

interface AdminPanelProps {
  residents: Resident[];
  parkingSpots: ParkingSpot[];
  onResidentsAdded: (residents: Resident[]) => void;
  onVagasConfigured: (vagas: ParkingSpot[]) => void;
  onPerformLottery: () => void;
}

export function AdminPanel({ 
  residents, 
  parkingSpots, 
  onResidentsAdded, 
  onVagasConfigured,
  onPerformLottery 
}: AdminPanelProps) {
  const [doubleSpotApartments, setDoubleSpotApartments] = useState<string>("");

  const handleDoubleSpotConfig = () => {
    const apartments = doubleSpotApartments.split(',').map(apt => apt.trim()).filter(Boolean);
    
    const updatedResidents = residents.map(resident => ({
      ...resident,
      hasDoubleSpot: apartments.includes(resident.apartment)
    }));
    
    onResidentsAdded(updatedResidents);
    toast.success(`Configuração de vaga dupla atualizada para ${apartments.length} apartamentos`);
  };

  const getEligibleResidents = (type: 'covered' | 'uncovered') => {
    return residents.filter(r => {
      const isPaid = r.paymentStatus === 'current';
      const hasJustification = r.paymentStatus === 'overdue' && r.hasJustification;
      const isEligible = isPaid || hasJustification;
      
      if (type === 'covered') {
        return isEligible && (isPaid || (hasJustification && r.monthsOverdue <= 2));
      }
      return isEligible;
    });
  };

  const eligibleForCovered = getEligibleResidents('covered');
  const eligibleForUncovered = getEligibleResidents('uncovered');
  const totalDoubleSpotResidents = residents.filter(r => r.hasDoubleSpot).length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Painel Administrativo - Sorteio de Vagas
          </h1>
          <p className="text-muted-foreground">
            Configurações e gerenciamento do sistema de sorteio
          </p>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="residents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Moradores
            </TabsTrigger>
            <TabsTrigger value="parking" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vagas
            </TabsTrigger>
            <TabsTrigger value="double-spots" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Vaga Dupla
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <StatsCards residents={residents} />
              
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Realizar Sorteio</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-success-light p-4 rounded-lg">
                      <p className="font-semibold text-success">Elegíveis para Cobertas</p>
                      <p className="text-2xl font-bold text-success">{eligibleForCovered.length}</p>
                    </div>
                    <div className="bg-warning-light p-4 rounded-lg">
                      <p className="font-semibold text-warning">Elegíveis para Descobertas</p>
                      <p className="text-2xl font-bold text-warning">{eligibleForUncovered.length}</p>
                    </div>
                    <div className="bg-accent-light p-4 rounded-lg">
                      <p className="font-semibold text-accent">Com Vaga Dupla</p>
                      <p className="text-2xl font-bold text-accent">{totalDoubleSpotResidents}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={onPerformLottery}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-3"
                  >
                    🎲 Realizar Sorteio
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="residents">
            <div className="space-y-6">
              <ExcelUpload onResidentsAdded={onResidentsAdded} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Moradores ({residents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {residents.map((resident) => (
                      <ResidentCard key={resident.id} resident={resident} />
                    ))}
                  </div>
                  {residents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum morador cadastrado. Faça o upload de um arquivo Excel para começar.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

<TabsContent value="parking">
  <VagasExcelUpload onVagasConfigured={onVagasConfigured} />
  
  <Card>
    <CardHeader>
      <CardTitle>Vagas Configuradas ({parkingSpots.length})</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {parkingSpots.map((vaga) => (
          <div key={vaga.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div className="flex gap-4">
              <span className="font-medium">#{vaga.number}</span>
              <span className="text-muted-foreground">{vaga.location}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                vaga.type === 'ÚNICA' ? 'bg-primary/10 text-primary' :
                vaga.type === 'DUPLA' ? 'bg-warning/10 text-warning' :
                'bg-accent/10 text-accent'
              }`}>
                {vaga.type}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {vaga.isPreSelected && <span className="text-warning">Pré-selecionada</span>}
              {vaga.hasHiddenRule && <span className="text-danger">Não sorteia</span>}
              {!vaga.isPreSelected && !vaga.hasHiddenRule && 
                <span className="text-success">Disponível ({vaga.eligibleApartments.length} aptos)</span>
              }
            </div>
          </div>
        ))}
      </div>
      {parkingSpots.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma vaga configurada. Faça o upload do arquivo de configuração.
        </p>
      )}
    </CardContent>
  </Card>
</TabsContent>

          <TabsContent value="double-spots">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Configuração de Vaga Dupla
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="double-spots">
                    Apartamentos com Direito a Vaga Dupla
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Digite os números dos apartamentos separados por vírgula (ex: 101, 102, 201)
                  </p>
                  <Input
                    id="double-spots"
                    value={doubleSpotApartments}
                    onChange={(e) => setDoubleSpotApartments(e.target.value)}
                    placeholder="101, 102, 201, 301..."
                  />
                </div>
                
                <Button onClick={handleDoubleSpotConfig} className="w-full">
                  Salvar Configuração de Vaga Dupla
                </Button>

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Apartamentos com Vaga Dupla Ativa:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {residents
                      .filter(r => r.hasDoubleSpot)
                      .map(resident => (
                        <div key={resident.id} className="bg-accent-light p-2 rounded text-center text-sm">
                          Apto {resident.apartment}
                        </div>
                      ))}
                  </div>
                  {totalDoubleSpotResidents === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Nenhum apartamento configurado para vaga dupla
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}