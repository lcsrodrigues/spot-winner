import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Resident } from "@/types/lottery";

interface StatsCardsProps {
  residents: Resident[];
}

export function StatsCards({ residents }: StatsCardsProps) {
  const currentCount = residents.filter(r => r.paymentStatus === 'current').length;
  const overdueCount = residents.filter(r => r.paymentStatus === 'overdue').length;
  const delinquentCount = residents.filter(r => r.paymentStatus === 'delinquent').length;
  const noPrivilegeCount = residents.filter(r => 
    r.paymentStatus === 'delinquent' && r.monthsOverdue > 3 && !r.hasJustification
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-success-light border-success/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-success text-sm font-medium">
            Pagamentos em Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{currentCount}</div>
          <p className="text-xs text-success/70">Elegíveis para vagas cobertas</p>
        </CardContent>
      </Card>

      <Card className="bg-warning-light border-warning/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-warning text-sm font-medium">
            Devendo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">{overdueCount}</div>
          <p className="text-xs text-warning/70">Elegíveis para vagas descobertas</p>
        </CardContent>
      </Card>

      <Card className="bg-danger-light border-danger/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-danger text-sm font-medium">
            Inadimplentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-danger">{delinquentCount}</div>
          <p className="text-xs text-danger/70">Acima de 3 meses</p>
        </CardContent>
      </Card>

      <Card className="bg-muted border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-sm font-medium">
            Sem Privilégio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">{noPrivilegeCount}</div>
          <p className="text-xs text-muted-foreground">Sem justificativa</p>
        </CardContent>
      </Card>
    </div>
  );
}