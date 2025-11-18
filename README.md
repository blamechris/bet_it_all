# Bet It All - Discord Bot

A feature-rich Discord bot with a leveling system, credit economy, and multiplayer blackjack!

## Features

### 💰 Credit System
- Earn credits through daily rewards
- Transfer credits between users
- Admins can give credits to users
- Starting balance: 1000 credits

### 📊 Leveling System
- Gain XP by chatting in the server (15 XP per message with 60s cooldown)
- Level up to earn bonus credits (100 credits × level)
- Higher levels give better daily rewards (+50 credits per level)
- Track your progress with `/balance`

### 🎰 Multiplayer Blackjack
- Start a game with `/blackjack <bet>`
- Multiple players can join with the same bet
- Classic blackjack rules:
  - Get closer to 21 than the dealer without busting
  - Blackjack pays 2.5x your bet
  - Regular wins pay 2x your bet
- Earn XP for playing (50 XP + 25 bonus for wins)

### 🔇 Credit-Based Mutes
- Mute other users by spending credits
- 1000 credits = 1 minute mute
- Max 60 minutes per mute
- Great for fun server interactions!

### 📈 Leaderboards
- View top players by credits, level, or wins
- Compete with other server members

## Setup

### Prerequisites
- Node.js v16 or higher
- MongoDB database
- Discord Bot Token

### Installation

1. Clone the repository:
```bash
git clone https://github.com/blamechris/bet_it_all.git
cd bet_it_all
```

2. Install dependencies:
```bash
npm install
```

3. Create a `config.json` file in the root directory:
```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN_HERE",
  "mongoUri": "YOUR_MONGODB_CONNECTION_STRING_HERE"
}
```

4. Invite the bot to your server with these permissions:
   - Send Messages
   - Embed Links
   - Read Message History
   - Use Slash Commands
   - Moderate Members (for mute feature)

5. Start the bot:
```bash
node index.js
```

## Commands

### Credit Commands
- `/balance [user]` - Check credits and level
- `/daily` - Claim daily credits (500 + level bonus)
- `/transfer <user> <amount>` - Transfer credits to another user
- `/give <user> <amount>` - Give credits (Admin only)

### Game Commands
- `/blackjack <bet>` - Start a multiplayer blackjack game
  - Click "Join Game" to join
  - Host clicks "Start Game" to begin
  - Use Hit/Stand buttons during your turn

### Info Commands
- `/leaderboard [type]` - View server leaderboards
  - Types: `credits`, `level`, `wins`
- `/help` - Show all commands

### Mute Commands
- `/mute <user> <minutes>` - Mute a user with credits
  - Cost: 1000 credits per minute
  - Max: 60 minutes

## Configuration

You can customize server settings in the database (Guild model):

```javascript
settings: {
  dailyCredits: 500,           // Base daily credit amount
  xpPerMessage: 15,            // XP gained per message
  xpCooldown: 60,              // Seconds between XP gains
  minBet: 10,                  // Minimum blackjack bet
  maxBet: 10000,               // Maximum blackjack bet
  muteCreditsPerMinute: 1000   // Credits per minute of mute
}
```

## Database Models

### User
- Credits, Level, XP
- Game statistics (wins, losses, games played)
- Daily claim tracking
- Message cooldown tracking

### Guild
- Server settings
- Configurable economy parameters

### BlackjackGame
- Active game state
- Player hands and bets
- Dealer hand
- Deck management

## Technology Stack

- **discord.js** v14 - Discord API wrapper
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Node.js** - Runtime

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.

---

**Have fun and gamble responsibly! 🎲**
