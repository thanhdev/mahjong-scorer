import Link from "next/link";
import Logo from "./logo";

export default function Header() {
    return (
        <header className="px-4 lg:px-6 h-14 flex items-center border-b shrink-0">
            <Link href="/" className="flex items-center justify-center" prefetch={false}>
                <Logo />
                <span className="sr-only">Mahjong Scorer</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">
                {/* Future nav links can go here */}
            </nav>
        </header>
    );
}
