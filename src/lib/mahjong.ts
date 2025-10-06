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

    if (feeder && feeder !== 'self-draw') {
      // There is a feeder
      const otherLosers = game.playerNames.filter(p => p !== winner && p !== feeder);
      
      let winnerGain = 0;

      // Feeder's loss
      scores[feeder] -= (basePoints + extraPoints);
      winnerGain += (basePoints + extraPoints);

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
      
      // All losers' loss
      losers.forEach(loser => {
        scores[loser] -= basePoints;
        winnerGain += basePoints;
      });
      
      // Winner's gain
      scores[winner] += winnerGain;
    }
  });

  return scores;
}
