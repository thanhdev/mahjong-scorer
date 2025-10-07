
import type { Game, GameRound } from './types';

export function calculateRoundScoreDelta(round: GameRound, playerNames: string[], basePoints: number): Record<string, number> {
  const scores: Record<string, number> = {};
  playerNames.forEach(name => {
    scores[name] = 0;
  });

  if (round.type === 'penalty') {
    const { penalizedPlayer, points } = round;
    const penaltyAmount = points;
    scores[penalizedPlayer] -= penaltyAmount * (playerNames.length - 1);
    playerNames.forEach(p => {
      if (p !== penalizedPlayer) {
        scores[p] += penaltyAmount;
      }
    });
  } else { // 'win'
    const { winner, feeder, points: extraPoints } = round;

    if (feeder) { // There is a feeder
      const feederLoss = basePoints + extraPoints;
      scores[feeder] -= feederLoss;
      scores[winner] += feederLoss;

      playerNames.forEach(loser => {
        if (loser !== winner && loser !== feeder) {
          scores[loser] -= basePoints;
          scores[winner] += basePoints;
        }
      });
    } else { // Self-draw (zimo)
      const lossPerPlayer = basePoints + extraPoints;
      playerNames.forEach(loser => {
        if (loser !== winner) {
          scores[loser] -= lossPerPlayer;
          scores[winner] += lossPerPlayer;
        }
      });
    }
  }

  return scores;
}


export function calculateScores(game: Game | undefined | null): Record<string, number> {
  const scores: Record<string, number> = {};
  if (!game) {
    return {};
  }
  
  game.playerNames.forEach(name => {
    scores[name] = 0;
  });

  game.rounds.forEach(round => {
    if (round.type === 'penalty') {
      const { penalizedPlayer, points } = round;
      const penaltyAmount = points;
      scores[penalizedPlayer] -= penaltyAmount * (game.playerNames.length - 1);
      game.playerNames.forEach(p => {
        if (p !== penalizedPlayer) {
          scores[p] += penaltyAmount;
        }
      });
      return;
    }

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

export function getWindsForRound(game: Game, roundIndex: number): Record<string, string> {
    const windLabels = ['East', 'South', 'West', 'North'];
    const initialDealer = game.playerNames[0];
    let dealerIndex = 0;

    if (game.rotateWinds) {
        let effectiveRound = 0;
        for (let i = 0; i < roundIndex; i++) {
            const round = game.rounds[i];
            if (round.type === 'win') {
                const currentDealerIndex = (dealerIndex + game.playerNames.length) % game.playerNames.length;
                const currentDealer = game.playerNames[currentDealerIndex];
                if (round.winner !== currentDealer) {
                    dealerIndex++;
                }
            } else {
                // Penalties don't affect wind rotation
            }
        }
    }
    
    const winds: Record<string, string> = {};
    for (let i = 0; i < game.playerNames.length; i++) {
        const playerIndex = (dealerIndex + i) % game.playerNames.length;
        const playerName = game.playerNames[playerIndex];
        winds[playerName] = windLabels[i];
    }
    return winds;
}
