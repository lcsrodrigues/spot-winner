import { Resident } from "@/types/lottery";

export const mockResidents: Resident[] = [
  {
    id: '1',
    name: 'Maria Silva',
    apartment: '101',
    paymentStatus: 'current',
    monthsOverdue: 0,
    hasJustification: false,
  },
  {
    id: '2',
    name: 'João Santos',
    apartment: '102',
    paymentStatus: 'overdue',
    monthsOverdue: 2,
    hasJustification: false,
  },
  {
    id: '3',
    name: 'Ana Costa',
    apartment: '103',
    paymentStatus: 'current',
    monthsOverdue: 0,
    hasJustification: false,
  },
  {
    id: '4',
    name: 'Carlos Oliveira',
    apartment: '201',
    paymentStatus: 'delinquent',
    monthsOverdue: 5,
    hasJustification: false,
  },
  {
    id: '5',
    name: 'Lucia Pereira',
    apartment: '202',
    paymentStatus: 'current',
    monthsOverdue: 0,
    hasJustification: false,
  },
  {
    id: '6',
    name: 'Roberto Lima',
    apartment: '203',
    paymentStatus: 'overdue',
    monthsOverdue: 1,
    hasJustification: false,
  },
  {
    id: '7',
    name: 'Patricia Alves',
    apartment: '301',
    paymentStatus: 'delinquent',
    monthsOverdue: 4,
    hasJustification: true,
  },
  {
    id: '8',
    name: 'Fernando Dias',
    apartment: '302',
    paymentStatus: 'current',
    monthsOverdue: 0,
    hasJustification: false,
  },
];

export const mockParkingSpots = [
  // Vagas cobertas
  { id: 'c1', number: 'C01', type: 'covered' as const },
  { id: 'c2', number: 'C02', type: 'covered' as const },
  { id: 'c3', number: 'C03', type: 'covered' as const },
  { id: 'c4', number: 'C04', type: 'covered' as const },
  // Vagas descobertas
  { id: 'u1', number: 'D01', type: 'uncovered' as const },
  { id: 'u2', number: 'D02', type: 'uncovered' as const },
  { id: 'u3', number: 'D03', type: 'uncovered' as const },
  { id: 'u4', number: 'D04', type: 'uncovered' as const },
  { id: 'u5', number: 'D05', type: 'uncovered' as const },
];