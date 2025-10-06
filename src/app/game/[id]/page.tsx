import GameView from './game-view';

type GamePageProps = {
    params: {
        id: string;
    };
};

export default function GamePage({ params }: GamePageProps) {
  return <GameView gameId={params.id} />;
}
