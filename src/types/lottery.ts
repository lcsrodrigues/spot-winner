export type PaymentStatus = 'current' | 'overdue' | 'delinquent';

export type SpotType = 'covered' | 'uncovered';

export interface Resident {
  id: string;
  name: string;
  apartment: string;
  paymentStatus: PaymentStatus;
  monthsOverdue: number;
  hasJustification: boolean;
}

export interface ParkingSpot {
  id: string;
  number: string;
  type: SpotType;
  assignedTo?: string;
}

export interface LotteryResult {
  id: string;
  date: Date;
  results: Array<{
    residentId: string;
    spotId: string;
  }>;
}