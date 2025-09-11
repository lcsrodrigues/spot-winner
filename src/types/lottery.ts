export type PaymentStatus = 'current' | 'overdue' | 'delinquent';

export type SpotType = 'covered' | 'uncovered';
export type ParkingSection = 'g1' | 'g2' | 'terreo';
export type VagaType = 'ÚNICA' | 'DUPLA' | 'VISITANTE';

export interface Resident {
  id: string;
  name: string;
  apartment: string;
  paymentStatus: PaymentStatus;
  monthsOverdue: number;
  hasJustification: boolean;
  hasDoubleSpot?: boolean;
}

export interface ParkingSpot {
  id: string;
  number: string;
  location: string; // Localização (TÉRREO, G1, G2, etc)
  type: VagaType; // Tipo da vaga (ÚNICA, DUPLA, VISITANTE)
  isPreSelected: boolean; // Se está pré-selecionada
  hasHiddenRule: boolean; // Se tem regra oculta (não sorteia)
  eligibleApartments: string[]; // Lista de apartamentos elegíveis
  assignedTo?: string;
  observations?: string; // Observações para o resultado
}

export interface LotteryResult {
  id: string;
  date: Date;
  results: Array<{
    number: string;
    location: string;
    type: VagaType;
    assignedApartment: string;
    observations: string;
  }>;
}