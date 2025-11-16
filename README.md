# Mahjong Scorer

This is a web application designed to help you keep score during Mahjong games. Built with Next.js, React, and Tailwind CSS, it offers a user-friendly interface to track complex scoring scenarios, making game management seamless and easy.

All game data is stored locally in your browser, so you can pick up where you left off at any time.

## Key Features

- **Game Management**: Create, view, and delete multiple Mahjong games. Player names and settings from the last game are conveniently pre-filled.
- **Live Score Tracking**: Player scores are displayed in a familiar table layout and updated in real-time after each round.
- **Flexible Round Recording**: Easily record wins, whether from a specific feeder or a self-draw (Zimo), and input the hand's point value.
- **Advanced Game Actions**:
    - **Penalties**: Apply penalties to players for rule infractions, with scores adjusted automatically.
    - **Seat Changes**: Swap players in and out of the game without losing track of anyone's score history.
- **Automated Wind Rotation**: Player winds (East, South, West, North) rotate automatically. A game setting allows the dealer's seat (East) to be maintained if they win a round.
- **Detailed History**:
    - **Round History**: A log of every win, penalty, and seat change.
    - **Score Progression Table**: A detailed, round-by-round breakdown of score changes for every player who has participated.
- **Export to Image**: Download a snapshot of the final score progression table as a PNG image to easily share game results.
