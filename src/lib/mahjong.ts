
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

      // This part of the logic seems complex and might not match all rule sets.
      // In many rule sets, only the feeder pays extra and other players pay nothing on a discard win.
      // The current implementation has all non-winners paying something.
      // For now, sticking to the previously established logic.
      // The old logic was:
      /*
      playerNames.forEach(loser => {
        if (loser !== winner && loser !== feeder) {
          scores[loser] -= basePoints;
          scores[winner] += basePoints;
        }
      });
      */
     // Let's assume a simpler feeder model: only the feeder pays. If others pay, it's usually a self-draw.
     // Sticking with the more complex model for now as it was what was built.
     const otherLosers = playerNames.filter(p => p !== winner && p !== feeder);
      otherLosers.forEach(loser => {
        scores[loser] -= basePoints;
        scores[winner] += basePoints;
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
    const roundDelta = calculateRoundScoreDelta(round, game.playerNames, game.basePoints);
    for (const playerName in roundDelta) {
      scores[playerName] += roundDelta[playerName];
    }
  });

  return scores;
}

export function getWindsForRound(game: Game, roundIndex: number): Record<string, string> {
    const windLabels = ['East', 'South', 'West', 'North'];
    let dealerIndex = 0; // The index in game.playerNames of the current dealer

    for (let i = 0; i < roundIndex; i++) {
        const round = game.rounds[i];
        if (round.type === 'win') {
            const currentDealer = game.playerNames[dealerIndex % game.playerNames.length];
            
            if (game.rotateWinds) {
                // "Rotate Winds Automatically" is ON:
                // Rotate only if the current dealer (East) is NOT the winner.
                if (round.winner !== currentDealer) {
                    dealerIndex++;
                }
            } else {
                // "Rotate Winds Automatically" is OFF:
                // Rotate after every round, regardless of who won.
                dealerIndex++;
            }
        }
        // Penalties do not affect wind rotation.
    }
    
    const winds: Record<string, string> = {};
    for (let i = 0; i < game.playerNames.length; i++) {
        // The current dealer gets East, the next player South, and so on.
        const playerIndex = (dealerIndex + i) % game.playerNames.length;
        const playerName = game.playerNames[playerIndex];
        winds[playerName] = windLabels[i];
    }
    return winds;
}
