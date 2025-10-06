import type { Game } from './types';

export function calculateScores(game: Game | undefined | null): Record<string, number> {
  const scores: Record<string, number> = {};
  if (!game) {
    return {};
  }
  
  game.playerNames.forEach(name => {
    scores[name] = 0;
  });

  game.rounds.forEach(round => {
    const winner = round.winner;
    const feeder = round.feeder;
    const extraPoints = round.points;
    const basePoints = game.basePoints;

    if (feeder) {
      // There is a feeder
      const otherLosers = game.playerNames.filter(p => p !== winner && p !== feeder);
      
      let winnerGain = 0;

      // Feeder's loss
      const feederLoss = basePoints + extraPoints;
      scores[feeder] -= feederLoss;
      winnerGain += feederLoss;

      // Other losers' loss
      otherLosers.forEach(loser => {
        scores[loser] -= basePoints;
        winnerGain += basePoints;
      });

      // Winner's gain
      scores[winner] += winnerGain;
      
    } else {
      // Self-draw (zimo)
      const losers = game.playerNames.filter(p => p !== winner);
      
      let winnerGain = 0;
      const lossPerPlayer = basePoints + extraPoints;
      
      // All losers' loss
      losers.forEach(loser => {
        scores[loser] -= lossPerPlayer;
        winnerGain += lossPerPlayer;
      });
      
      // Winner's gain
      scores[winner] += winnerGain;
    }
  });

  return scores;
}
