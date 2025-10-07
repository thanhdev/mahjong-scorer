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

export type GameRound = Round | PenaltyRound;

export type Game = {
  id: string;
  name: string;
  playerNames: [string, string, string, string];
  basePoints: number;
  rotateWinds: boolean;
  rounds: GameRound[];
  createdAt: string; // ISO date string
};
