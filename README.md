

**Puzzle Grove** is a comprehensive web-based word puzzle platform that brings together multiple popular word games inspired by The New York Times and other renowned puzzle sources. This interactive application provides users with a diverse collection of brain-teasing word games, complete with user authentication, progress tracking, and a modern, responsive interface.

<img width="1844" height="892" alt="image" src="https://github.com/user-attachments/assets/37b08bd8-0b54-4914-a50e-0178ec7f5b0f" />



## 🎮 Featured Games

### Wordle
Classic 5-letter word guessing game where players have 6 attempts to guess the hidden word. Each guess provides color-coded feedback to guide players toward the solution.
- **Features**: Real-time feedback, statistics tracking, streak counter
- **Word Database**: Uses `wordle_words.txt` for authentic word lists
- **Responsive Design**: Optimized for all device sizes

### Connections
Group four items that share a common theme in this challenging categorization game.
- **Features**: Color-coded difficulty levels, hint system, progress tracking
- **Puzzle Data**: Uses `connections_words.json` for themed word groups
- **Gameplay**: Select four items and submit to see if they belong together

### Word Strands
Connect letters in a grid to discover themed words in any direction (horizontal, vertical, or diagonal).
- **Features**: Themed puzzles, letter-by-letter selection, hint system
- **Gameplay**: Inspired by NYT's Strands with progressive difficulty
- **Tracking**: Monitors discovered words and completion progress

### Anagrams
Unscramble letters to form words related to specific themes across five difficulty levels.
- **Features**: Themed word sets, progressive difficulty, hint system
- **Scoring**: Tracks score, streak, and completion time
- **Social**: Share results with friends

### Additional Games
- **Spelling Bee**: Create words using 7 given letters
- **Crossword**: Fill the grid with words using provided clues
- **Hangman**: Guess the word before running out of attempts
- **Synonyms**: Match words with their corresponding synonyms

## 🔐 User Features

### Authentication System
- **User Registration**: Create accounts with email validation
- **Secure Login**: Multiple authentication methods including demo account
- **Session Management**: Persistent login sessions with localStorage
- **Form Validation**: Real-time Bootstrap-powered form validation

### Progress Tracking
- **Streak Counter**: Track daily login streaks
- **Game Statistics**: Monitor wins, best scores, and achievements
- **Personal Dashboard**: View progress across all games
- **Achievement System**: Unlock rewards for consistent play

## 🛠️ Technical Implementation

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Bootstrap 5.3.2**: Responsive framework for consistent UI/UX
- **JavaScript (ES6+)**: Modern JavaScript with classes and modules
- **Font Awesome**: Icon library for enhanced visual elements

### Data Management
- **Local Storage API**: Persistent game state and user data
- **JSON Data Files**: Structured puzzle data and word lists
- **Fetch API**: Dynamic loading of external resources
- **Session Management**: Secure user authentication

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Bootstrap Grid**: Responsive layout system
- **Touch-Friendly**: Gesture support for mobile gameplay
- **Cross-Browser**: Compatible with all modern browsers

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Start playing immediately or create an account for progress tracking

### Demo Account
- **Username**: `devanshi`
- **Password**: `2005`

## 📱 Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎯 Game Mechanics

### Scoring System
- **Wordle**: Based on number of attempts (fewer = better)
- **Connections**: Group completion with difficulty multipliers
- **Anagrams**: Time-based scoring with bonus points
- **Crossword**: Clue difficulty and completion speed

### Difficulty Progression
- **Beginner**: Easy words and simple patterns
- **Intermediate**: Moderate complexity with themed content
- **Advanced**: Challenging puzzles requiring strategy
- **Expert**: Complex patterns and obscure vocabulary

## 🔧 Development

### File Structure
```
Puzzle-Grove-1/
├── index.html          # Main landing page
├── login.html          # User authentication
├── register.html       # Account creation
├── [game].html         # Individual game pages
├── [game].css          # Game-specific styles
├── [game].js           # Game logic and functionality
├── index.css           # Global styles
└── [data].json/txt     # Game data files
```

### Customization
- **Themes**: Modify CSS custom properties for color schemes
- **Games**: Add new games by following existing patterns
- **Data**: Update JSON files to add new puzzles and words
- **Styling**: Leverage Bootstrap classes for consistent design

## 📈 Future Enhancements
- **Multiplayer Support**: Real-time collaborative gameplay
- **Social Features**: Friend systems and leaderboards
- **Advanced Analytics**: Detailed progress insights
- **Mobile App**: Native mobile application
- **API Integration**: External word databases and puzzle sources

## 🤝 Contributing
This project welcomes contributions for new games, bug fixes, and feature enhancements. Please ensure all new games follow the established patterns and include proper documentation.

## 📄 License
This project is open source and available under the MIT License.

---

**Puzzle Grove** - Where words meet wonder, and every puzzle tells a story. 🧩✨
