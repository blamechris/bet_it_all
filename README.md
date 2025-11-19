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

### 🐔 Chicken - The Ultimate Nerve Game
- **High-stakes challenge game** where players test their nerves
- Challenge another user with `/chicken @user <bet>`
- Both players' bets are deducted immediately
- One player must respond with `/chicken @opponent` or lose!
- **The catch**: If they say ANYTHING else, they lose and get muted!
- Each round doubles the mute duration:
  - Round 1: 5 minutes
  - Round 2: 10 minutes
  - Round 3: 20 minutes
  - Round 4: 40 minutes
  - Round 5: 80 minutes
  - Maximum: 1 day (1440 minutes)
- Winner takes the entire pot!
- The most intense betting game in the server!

### 🔇 Credit-Based Mutes & Loans
- **Mute others**: Spend credits to mute other users (1000 credits = 1 minute)
- **Take loans**: Get instant credits in exchange for being muted yourself!
  - Borrow up to 5000 credits (configurable)
  - Same rate: 1000 credits = 1 minute mute
  - 24-hour cooldown between loans
  - Perfect for when you need credits fast!
- Great for fun server interactions!

### 📈 Leaderboards
- View top players by credits, level, or wins
- Compete with other server members

### 🎬 Animated GIF Responses
- Random funny gambling-themed GIFs during games
- Dynamic GIFs based on game outcomes:
  - Chicken challenges and escalations
  - Blackjack wins, losses, and blackjacks
  - Celebration and fail animations
- Powered by Tenor API (optional feature)

## Setup

### Prerequisites
- Node.js v16 or higher
- MongoDB database
- Discord Bot Token
- Tenor API Key (optional, for GIF support)

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

3. Get a Tenor API key (optional, for GIF support):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Tenor API v2" (search for it in the API Library)
   - Create credentials (API Key)
   - Copy your API key

4. Create a `config.json` file in the root directory:
```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN_HERE",
  "mongoUri": "YOUR_MONGODB_CONNECTION_STRING_HERE",
  "tenorApiKey": "YOUR_TENOR_API_KEY_HERE"
}
```

**Note:** The `tenorApiKey` is optional. If not provided, the bot will work without GIFs.

5. Invite the bot to your server with these permissions:
   - Send Messages
   - Embed Links
   - Read Message History
   - Use Slash Commands
   - Moderate Members (for mute feature)

6. Start the bot:
```bash
node index.js
```

## Commands

### Credit Commands
- `/balance [user]` - Check credits and level
- `/daily` - Claim daily credits (500 + level bonus)
- `/transfer <user> <amount>` - Transfer credits to another user
- `/give <user> <amount>` - Give credits (Admin only)
- `/loan <amount>` - Borrow credits in exchange for being muted

### Game Commands
- `/blackjack <bet>` - Start a multiplayer blackjack game
  - Click "Join Game" to join
  - Host clicks "Start Game" to begin
  - Use Hit/Stand buttons during your turn
- `/chicken <user> <bet>` - Challenge someone to a game of chicken
  - Both players bet the same amount (deducted immediately)
  - Respond with `/chicken @opponent` to escalate
  - Say anything else and you lose + get muted!
  - Mute duration doubles each round (5m → 10m → 20m → 40m → max 1 day)

### Info Commands
- `/leaderboard [type]` - View server leaderboards
  - Types: `credits`, `level`, `wins`
- `/help` - Show all commands

### Mute & Loan Commands
- `/mute <user> <minutes>` - Mute a user with credits
  - Cost: 1000 credits per minute
  - Max: 60 minutes
- `/loan <amount>` - Borrow credits in exchange for being muted
  - Rate: 1000 credits = 1 minute mute
  - Max: 5000 credits (default)
  - Cooldown: 24 hours

## Configuration

You can customize server settings in the database (Guild model):

```javascript
settings: {
  dailyCredits: 500,           // Base daily credit amount
  xpPerMessage: 15,            // XP gained per message
  xpCooldown: 60,              // Seconds between XP gains
  minBet: 10,                  // Minimum blackjack bet
  maxBet: 10000,               // Maximum blackjack bet
  muteCreditsPerMinute: 1000,  // Credits per minute of mute
  maxLoan: 5000,               // Maximum loan amount
  loanCooldown: 24             // Hours between loans
}
```

## Database Models

### User
- Credits, Level, XP
- Game statistics (wins, losses, games played)
- Loan statistics (total loans, total amount borrowed)
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

### ChickenGame
- Active chicken challenges
- Player bets and pot
- Current round and mute duration
- Turn tracking

## Technology Stack

- **discord.js** v14 - Discord API wrapper
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Axios** - HTTP client for Tenor API
- **Tenor API** - GIF integration (optional)
- **Node.js** - Runtime

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.

---

**Have fun and gamble responsibly! 🎲**
