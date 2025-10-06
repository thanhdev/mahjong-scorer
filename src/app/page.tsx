import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import GameList from './game-list';

export default function Home() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-headline">Mahjong Games</h1>
        <Button asChild>
          <Link href="/new-game">
            <PlusCircle className="mr-2 h-4 w-4" /> New Game
          </Link>
        </Button>
      </div>
      <GameList />
    </div>
  );
}
