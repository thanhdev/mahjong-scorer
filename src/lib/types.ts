
export type Round = {
  id: string;
  type: 'win';
  winner: string; // player name
  points: number;
  feeder?: string; // player name, undefined for self-draw
};

export type PenaltyRound = {
  id: string;
  type: 'penalty';
  penalizedPlayer: string;
  points: number; // The base penalty points value
}

export type SeatChange = {
  id: string;
  type: 'seatChange';
  playerOut: string;
  playerIn: string;
  seatIndex: number; // The index (0-3) of the seat being changed
}

export type GameEvent = Round | PenaltyRound | SeatChange;

export type Game = {
  id: string;
  name: string;
  initialPlayerNames: [string, string, string, string];
  basePoints: number;
  rotateWinds: boolean;
  events: GameEvent[];
  createdAt: string; // ISO date string
  // Deprecated, replaced by events
  rounds?: GameEvent[];
};
