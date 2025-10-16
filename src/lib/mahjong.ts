
import type { Game, GameEvent, SeatChange } from './types';

// Gets the 4 active players for a given round number (event index)
export function getActivePlayersForRound(game: Game, roundNumber: number): string[] {
    let playerNames = [...game.initialPlayerNames];

    const seatChangeEvents = game.events
        .filter(event => event.type === 'seatChange' && game.events.indexOf(event) < roundNumber) as SeatChange[];

    // Sort changes by their index in the events array to apply them in order
    seatChangeEvents.sort((a, b) => game.events.indexOf(a) - game.events.indexOf(b));

    seatChangeEvents.forEach(change => {
        // Find which player is currently in the seat to be changed
        const currentSeatHolder = playerNames[change.seatIndex];

        // Ensure the change is still valid (playerOut might have been replaced already)
        // This logic finds the *last* change for a specific seat before the target round
        // A more robust way is to just replace whatever is at the seatIndex
        if (currentSeatHolder === change.playerOut) {
            playerNames[change.seatIndex] = change.playerIn;
        } else {
             // This case handles if multiple changes happened for the same seat.
             // We find the last relevant change.
             let playerToReplace = game.initialPlayerNames[change.seatIndex];
             for(const prevChange of seatChangeEvents){
                if(prevChange.seatIndex === change.seatIndex && game.events.indexOf(prevChange) < game.events.indexOf(change)){
                    playerToReplace = prevChange.playerIn;
                }
             }
             if(playerToReplace === change.playerOut){
                playerNames[change.seatIndex] = change.playerIn;
             }
        }
    });
    
    // We need to rebuild the player list from the start for each round
    let players = [...game.initialPlayerNames];
    for (let i = 0; i < roundNumber; i++) {
        const event = game.events[i];
        if (event.type === 'seatChange') {
            players[event.seatIndex] = event.playerIn;
        }
    }

    return players;
}

// Get all players who have ever participated in the game
export function getAllPlayerNames(game: Game): string[] {
    const allNames = new Set<string>(game.initialPlayerNames);
    game.events.forEach(event => {
        if (event.type === 'seatChange') {
            allNames.add(event.playerIn);
        }
    });
    return Array.from(allNames);
}


export function calculateRoundScoreDelta(event: GameEvent, activePlayers: string[], basePoints: number): Record<string, number> {
  const scores: Record<string, number> = {};
  activePlayers.forEach(name => {
    scores[name] = 0;
  });

  if (event.type === 'penalty') {
    const { penalizedPlayer, points } = event;
    const penaltyAmount = points;
    if (scores.hasOwnProperty(penalizedPlayer)) {
      scores[penalizedPlayer] -= penaltyAmount * (activePlayers.length - 1);
    }
    activePlayers.forEach(p => {
      if (p !== penalizedPlayer) {
        scores[p] += penaltyAmount;
      }
    });
  } else if (event.type === 'win') {
    const { winner, feeder, points: extraPoints } = event;

    if (!activePlayers.includes(winner)) return {};

    if (feeder && activePlayers.includes(feeder)) { // There is a feeder
      const feederLoss = basePoints + extraPoints;
      scores[feeder] -= feederLoss;
      scores[winner] += feederLoss;

     const otherLosers = activePlayers.filter(p => p !== winner && p !== feeder);
      otherLosers.forEach(loser => {
        scores[loser] -= basePoints;
        scores[winner] += basePoints;
      });

    } else { // Self-draw (zimo)
      const lossPerPlayer = basePoints + extraPoints;
      activePlayers.forEach(loser => {
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
  if (!game) {
    return {};
  }
  
  const allPlayerNames = getAllPlayerNames(game);
  const scores: Record<string, number> = {};
  allPlayerNames.forEach(name => {
    scores[name] = 0;
  });

  game.events.forEach((event, index) => {
    if (event.type === 'win' || event.type === 'penalty') {
        const activePlayers = getActivePlayersForRound(game, index);
        const roundDelta = calculateRoundScoreDelta(event, activePlayers, game.basePoints);
        for (const playerName in roundDelta) {
            if (scores.hasOwnProperty(playerName)) {
                 scores[playerName] += roundDelta[playerName];
            } else {
                scores[playerName] = roundDelta[playerName];
            }
        }
    }
  });

  return scores;
}

export function getWindsForRound(game: Game, roundIndex: number): {winds: Record<string, string>, activePlayers: string[]} {
    const windLabels = ['East', 'South', 'West', 'North'];
    let dealerSeatIndex = 0; // The index in the initialPlayerNames array of the current dealer's seat

    const gameRounds = game.events.filter(e => e.type === 'win');
    let roundsProcessed = 0;

    for (let i = 0; i < roundIndex && i < game.events.length; i++) {
        const event = game.events[i];

        if (event.type === 'win') {
            const activePlayersForThisRound = getActivePlayersForRound(game, i);
            const currentDealer = activePlayersForThisRound[dealerSeatIndex % activePlayersForThisRound.length];
            
            if (game.rotateWinds) {
                // "Rotate Winds Automatically" is ON:
                // Rotate only if the current dealer (East) is NOT the winner.
                if (event.winner !== currentDealer) {
                    dealerSeatIndex++;
                }
            } else {
                // "Rotate Winds Automatically" is OFF:
                // Rotate after every round, regardless of who won.
                dealerSeatIndex++;
            }
            roundsProcessed++;
        }
    }
    
    const winds: Record<string, string> = {};
    const finalActivePlayers = getActivePlayersForRound(game, roundIndex);

    for (let i = 0; i < finalActivePlayers.length; i++) {
        // The current dealer gets East, the next player South, and so on.
        const seatIndex = (dealerSeatIndex + i) % finalActivePlayers.length;
        const playerName = finalActivePlayers[seatIndex];
        winds[playerName] = windLabels[i];
    }
    return { winds, activePlayers: finalActivePlayers};
}
