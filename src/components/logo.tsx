export default function Logo() {
  return (
    <div className="flex items-center gap-2 font-semibold text-lg font-headline">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-primary"
      >
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M8 6h8" />
        <path d="M8 12h8" />
        <path d="M8 18h8" />
      </svg>
      Mahjong Scorer
    </div>
  );
}
