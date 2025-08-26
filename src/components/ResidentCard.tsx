import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Resident } from "@/types/lottery";

interface ResidentCardProps {
  resident: Resident;
}

const getStatusBadge = (resident: Resident) => {
  if (resident.paymentStatus === 'current') {
    return (
      <Badge className="bg-success text-success-foreground">
        Em dia
      </Badge>
    );
  }
  
  if (resident.paymentStatus === 'overdue') {
    return (
      <Badge className="bg-warning text-warning-foreground">
        Devendo ({resident.monthsOverdue} {resident.monthsOverdue === 1 ? 'mês' : 'meses'})
      </Badge>
    );
  }
  
  return (
    <Badge className="bg-danger text-danger-foreground">
      Inadimplente ({resident.monthsOverdue} {resident.monthsOverdue === 1 ? 'mês' : 'meses'})
    </Badge>
  );
};

const getSpotEligibility = (resident: Resident) => {
  if (resident.paymentStatus === 'current') {
    return 'Vaga Coberta';
  }
  
  if (resident.paymentStatus === 'overdue') {
    return 'Vaga Descoberta';
  }
  
  if (resident.monthsOverdue > 3 && !resident.hasJustification) {
    return 'Sem Privilégio';
  }
  
  return 'Vaga Descoberta';
};

export function ResidentCard({ resident }: ResidentCardProps) {
  const eligibility = getSpotEligibility(resident);
  
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{resident.name}</CardTitle>
          {getStatusBadge(resident)}
        </div>
        <p className="text-sm text-muted-foreground">Apartamento {resident.apartment}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Elegível para:</span>
          <span 
            className={`text-sm font-semibold ${
              eligibility === 'Vaga Coberta' 
                ? 'text-success' 
                : eligibility === 'Sem Privilégio'
                ? 'text-danger'
                : 'text-warning'
            }`}
          >
            {eligibility}
          </span>
        </div>
        {resident.hasJustification && resident.paymentStatus === 'delinquent' && (
          <p className="text-xs text-muted-foreground mt-2">
            ✓ Possui justificativa
          </p>
        )}
      </CardContent>
    </Card>
  );
}