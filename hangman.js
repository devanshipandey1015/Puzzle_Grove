// Hangman Game Implementation
class HangmanGame {
    constructor() {
        this.words = [
            // Easy words (3-5 letters)
            { word: 'CAT', category: 'Animals', hint: 'A furry pet that purrs' },
            { word: 'DOG', category: 'Animals', hint: 'Man\'s best friend' },
            { word: 'SUN', category: 'Nature', hint: 'Bright star in our solar system' },
            { word: 'MOON', category: 'Nature', hint: 'Earth\'s natural satellite' },
            { word: 'TREE', category: 'Nature', hint: 'Tall plant with leaves' },
            { word: 'BOOK', category: 'Objects', hint: 'You read this' },
            { word: 'CAR', category: 'Transport', hint: 'Vehicle with four wheels' },
            { word: 'FISH', category: 'Animals', hint: 'Swims in water' },
            { word: 'BIRD', category: 'Animals', hint: 'Has feathers and flies' },
            { word: 'HOUSE', category: 'Objects', hint: 'Where people live' },

            // Medium words (6-8 letters)
            { word: 'ELEPHANT', category: 'Animals', hint: 'Large mammal with a trunk' },
            { word: 'RAINBOW', category: 'Nature', hint: 'Colorful arc in the sky' },
            { word: 'COMPUTER', category: 'Technology', hint: 'Electronic device for processing data' },
            { word: 'GUITAR', category: 'Music', hint: 'Stringed musical instrument' },
            { word: 'KITCHEN', category: 'Home', hint: 'Room where you cook' },
            { word: 'GARDEN', category: 'Nature', hint: 'Place where plants grow' },
            { word: 'SCHOOL', category: 'Education', hint: 'Place where children learn' },
            { word: 'DOCTOR', category: 'Profession', hint: 'Medical professional' },
            { word: 'TEACHER', category: 'Profession', hint: 'Educates students' },
            { word: 'MOUNTAIN', category: 'Nature', hint: 'Very tall landform' },
            { word: 'LIBRARY', category: 'Education', hint: 'Place with many books' },
            { word: 'AIRPLANE', category: 'Transport', hint: 'Flying vehicle' },
            { word: 'HOSPITAL', category: 'Buildings', hint: 'Place for medical care' },
            { word: 'SANDWICH', category: 'Food', hint: 'Bread with filling between' },
            { word: 'BIRTHDAY', category: 'Celebration', hint: 'Annual personal celebration' },

            // Hard words (9+ letters)
            { word: 'BUTTERFLY', category: 'Animals', hint: 'Colorful insect with wings' },
            { word: 'CHOCOLATE', category: 'Food', hint: 'Sweet treat made from cocoa' },
            { word: 'ADVENTURE', category: 'Concepts', hint: 'Exciting and risky experience' },
            { word: 'TELEPHONE', category: 'Technology', hint: 'Device for long-distance communication' },
            { word: 'PHOTOGRAPH', category: 'Art', hint: 'Captured image or picture' },
            { word: 'BASKETBALL', category: 'Sports', hint: 'Game played with a ball and hoops' },
            { word: 'WONDERFUL', category: 'Adjectives', hint: 'Extremely good or amazing' },
            { word: 'SCIENTIST', category: 'Profession', hint: 'Person who studies science' },
            { word: 'DICTIONARY', category: 'Education', hint: 'Book that defines words' },
            { word: 'HELICOPTER', category: 'Transport', hint: 'Aircraft with rotating blades' },
            { word: 'RESTAURANT', category: 'Buildings', hint: 'Place where you eat meals' },
            { word: 'FRIENDSHIP', category: 'Concepts', hint: 'Bond between close companions' },
            { word: 'PLAYGROUND', category: 'Places', hint: 'Area where children play' },
            { word: 'IMAGINATION', category: 'Concepts', hint: 'Ability to create mental images' },
            { word: 'SUBMARINE', category: 'Transport', hint: 'Underwater vessel' }
        ];

        this.currentWord = null;
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxWrongGuesses = 6;
        this.gameWon = false;
        this.gameOver = false;
        this.hintsUsed = 0;
        this.difficulty = 'medium';
        this.showHints = true;
        this.darkTheme = false;
        this.soundEffects = true;

        // Game statistics
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            hintsUsed: 0
        };

        this.hangmanParts = ['head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

        this.init();
    }

    async init() {
        this.loadSettings();
        await this.loadStats();
        this.setupEventListeners();
        this.createAlphabetGrid();
        this.startNewGame();
        this.updateStatsDisplay();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('hangmanSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.difficulty = settings.difficulty || 'medium';
                this.showHints = settings.showHints !== undefined ? settings.showHints : true;
                this.darkTheme = settings.darkTheme || false;
                this.soundEffects = settings.soundEffects !== undefined ? settings.soundEffects : true;
                if (this.darkTheme) {
                    document.body.classList.add('dark-theme');
                }
            } catch (e) {
                // use defaults if parse fails
            }
        }
    }

    saveSettings() {
        const settings = {
            difficulty: this.difficulty,
            showHints: this.showHints,
            darkTheme: this.darkTheme,
            soundEffects: this.soundEffects
        };
        localStorage.setItem('hangmanSettings', JSON.stringify(settings));
    }

    async loadStats() {
        try {
            // Check if database manager is available
            if (typeof window.dbManager === 'undefined') {
                return;
            }
            
            let currentUser = null;
            try {
                const raw = localStorage.getItem('puzzleGroveUser');
                currentUser = raw ? JSON.parse(raw) : null;
            } catch (e) { /* ignore */ }
            if (currentUser && currentUser.username) {
                // Load stats from database
                const userStats = await window.dbManager.getUserStats(currentUser.username);
                if (userStats && userStats.gameStats && userStats.gameStats.hangman) {
                    const hangmanStats = userStats.gameStats.hangman;
                    this.stats = {
                        gamesPlayed: hangmanStats.gamesPlayed || 0,
                        gamesWon: hangmanStats.gamesWon || 0,
                        currentStreak: hangmanStats.currentStreak || 0,
                        maxStreak: hangmanStats.maxStreak || 0,
                        hintsUsed: hangmanStats.hintsUsed != null ? hangmanStats.hintsUsed : 0
                    };
                }
            }
        } catch (error) {
            // Continue with default stats if database fails
        }
    }

    async saveStats() {
        try {
            // Check if database manager is available
            if (typeof window.dbManager === 'undefined') {
                return;
            }
            
            let currentUser = null;
            try {
                const raw = localStorage.getItem('puzzleGroveUser');
                currentUser = raw ? JSON.parse(raw) : null;
            } catch (e) { /* ignore */ }
            if (currentUser && currentUser.username) {
                // Save stats to database
                await window.dbManager.updateUserStats(currentUser.username, 'hangman', {
                    gamesPlayed: this.stats.gamesPlayed,
                    gamesWon: this.stats.gamesWon,
                    currentStreak: this.stats.currentStreak,
                    maxStreak: this.stats.maxStreak
                });
            }
        } catch (error) {
            // Continue without saving if database fails
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal && modal.id) this.closeModal(modal.id);
            });
        });

        const on = (id, event, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(event, fn);
        };
        on('newGameBtn', 'click', () => this.startNewGame());
        on('hintBtn', 'click', () => this.openModal('hintModal'));
        on('giveUpBtn', 'click', () => this.giveUp());
        on('playAgainBtn', 'click', () => this.startNewGame());
        on('playAgainModalBtn', 'click', () => {
            this.closeModal('gameOverModal');
            this.startNewGame();
        });
        on('revealLetterBtn', 'click', () => this.revealRandomLetter());
        on('shareResultBtn', 'click', () => this.shareResult());

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) this.closeModal(e.target.id);
        });
    }

    createAlphabetGrid() {
        const alphabetGrid = document.getElementById('alphabetGrid');
        if (!alphabetGrid) return;
        alphabetGrid.innerHTML = '';
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < alphabet.length; i++) {
            const letter = alphabet[i];
            const button = document.createElement('button');
            button.className = 'letter-button';
            button.type = 'button';
            button.textContent = letter;
            button.addEventListener('click', () => this.guessLetter(letter));
            alphabetGrid.appendChild(button);
        }
    }

    startNewGame() {
        this.currentWord = this.selectRandomWord();
        if (!this.currentWord || !this.currentWord.word) {
            this.currentWord = { word: 'HANGMAN', category: 'Default', hint: 'The name of this game' };
        }
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.hintsUsed = 0;

        this.createWordDisplay();
        this.resetAlphabetGrid();
        this.resetHangman();
        this.updateLivesDisplay();
        this.updateGameInfo();
        this.closeModal('gameOverModal');

        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) playAgainBtn.style.display = 'none';

        this.showMessage('New game started! Good luck!', 'success');
    }

    selectRandomWord() {
        let filteredWords = this.words && this.words.length ? this.words : [];
        const defaultWord = { word: 'HANGMAN', category: 'Default', hint: 'The name of this game' };

        switch (this.difficulty) {
            case 'easy':
                filteredWords = this.words.filter(w => w && w.word && w.word.length <= 5);
                break;
            case 'medium':
                filteredWords = this.words.filter(w => w && w.word && w.word.length >= 6 && w.word.length <= 8);
                break;
            case 'hard':
                filteredWords = this.words.filter(w => w && w.word && w.word.length >= 9);
                break;
        }
        if (!filteredWords.length) filteredWords = this.words || [];
        if (!filteredWords.length) return defaultWord;

        return filteredWords[Math.floor(Math.random() * filteredWords.length)];
    }

    createWordDisplay() {
        const wordDisplay = document.getElementById('wordDisplay');
        if (!wordDisplay || !this.currentWord || !this.currentWord.word) return;
        wordDisplay.innerHTML = '';
        const word = String(this.currentWord.word).toUpperCase();
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            const letterBlank = document.createElement('div');
            letterBlank.className = 'letter-blank';
            letterBlank.dataset.letter = letter;
            wordDisplay.appendChild(letterBlank);
        }
    }

    updateGameInfo() {
        if (!this.currentWord) return;
        const gameInfo = document.getElementById('gameInfo');
        const categoryDisplay = document.getElementById('categoryDisplay');
        if (gameInfo) gameInfo.textContent = `Category: ${this.currentWord.category || 'General'}`;
        if (categoryDisplay) categoryDisplay.textContent = this.currentWord.category || 'General';
        const hintCategory = document.getElementById('hintCategory');
        const hintLength = document.getElementById('hintLength');
        const hintDefinition = document.getElementById('hintDefinition');
        if (hintCategory) hintCategory.textContent = this.currentWord.category || 'General';
        if (hintLength) hintLength.textContent = `${(this.currentWord.word || '').length} letters`;
        if (hintDefinition) hintDefinition.textContent = this.currentWord.hint || '—';
    }

    resetAlphabetGrid() {
        const buttons = document.querySelectorAll('.letter-button');
        buttons.forEach(button => {
            button.className = 'letter-button';
        });
    }

    resetHangman() {
        (this.hangmanParts || []).forEach(part => {
            const el = document.getElementById(part);
            if (el) el.style.display = 'none';
        });
    }

    updateLivesDisplay() {
        const hearts = document.querySelectorAll('.lives-display .fas.fa-heart');
        hearts.forEach((heart, index) => {
            if (index < this.wrongGuesses) {
                heart.classList.add('lost');
            } else {
                heart.classList.remove('lost');
            }
        });
    }

    guessLetter(letter) {
        if (!this.currentWord || !this.currentWord.word) return;
        if (this.gameOver || this.guessedLetters.includes(letter)) return;

        this.guessedLetters.push(letter);
        const buttons = document.querySelectorAll('.letter-button');
        const button = [...buttons].find(btn => btn && btn.textContent === letter);
        const word = String(this.currentWord.word).toUpperCase();

        if (word.includes(letter)) {
            // Correct guess
            if (button) button.classList.add('correct');
            this.revealLetter(letter);
            this.playSound('correct');

            if (this.checkWin()) {
                this.winGame();
            }
        } else {
            if (button) button.classList.add('incorrect');
            this.wrongGuesses++;
            this.drawHangmanPart();
            this.updateLivesDisplay();
            this.playSound('incorrect');
            
            if (this.wrongGuesses >= this.maxWrongGuesses) {
                this.loseGame();
            }
        }
    }

    revealLetter(letter) {
        const letterBlanks = document.querySelectorAll('.letter-blank');
        letterBlanks.forEach(blank => {
            if (blank.dataset.letter === letter) {
                blank.textContent = letter;
                blank.classList.add('revealed');
            }
        });
    }

    drawHangmanPart() {
        if (this.wrongGuesses <= this.hangmanParts.length) {
            const part = document.getElementById(this.hangmanParts[this.wrongGuesses - 1]);
            part.style.display = 'block';
            part.classList.add('hangman-part-appear');
        }
    }

    checkWin() {
        if (!this.currentWord || !this.currentWord.word) return false;
        const word = String(this.currentWord.word).toUpperCase();
        return word.split('').every(letter => this.guessedLetters.includes(letter));
    }

    async winGame() {
        this.gameWon = true;
        this.gameOver = true;
        this.stats.gamesPlayed++;
        this.stats.gamesWon++;
        this.stats.currentStreak++;
        await this.saveStats();
        this.updateStatsDisplay();
        this.playSound('win');
        this.showMessage('Congratulations! You won!', 'success');
        setTimeout(() => this.showGameOverModal(true), 1500);
    }

    async loseGame() {
        this.gameOver = true;
        this.stats.gamesPlayed++;
        this.stats.currentStreak = 0;
        await this.saveStats();
        this.updateStatsDisplay();
        if (this.currentWord && this.currentWord.word) {
            const word = String(this.currentWord.word).toUpperCase();
            word.split('').forEach(letter => {
                if (!this.guessedLetters.includes(letter)) this.revealLetter(letter);
            });
        }
        this.playSound('lose');
        this.showMessage('Game over! Better luck next time!', 'error');
        setTimeout(() => this.showGameOverModal(false), 1500);
    }

    giveUp() {
        if (this.gameOver) return;
        
        if (confirm('Are you sure you want to give up?')) {
            this.loseGame();
        }
    }

    async revealRandomLetter() {
        if (this.gameOver || !this.currentWord || !this.currentWord.word) return;
        const word = String(this.currentWord.word).toUpperCase();
        const unguessedLetters = word.split('').filter(letter => !this.guessedLetters.includes(letter));
        if (unguessedLetters.length === 0) return;

        const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
        this.guessedLetters.push(randomLetter);
        this.hintsUsed++;
        this.stats.hintsUsed = (this.stats.hintsUsed || 0) + 1;
        await this.saveStats();
        this.updateStatsDisplay();
        
        // Mark as hint-revealed
        const letterBlanks = document.querySelectorAll('.letter-blank');
        letterBlanks.forEach(blank => {
            if (blank.dataset.letter === randomLetter) {
                blank.textContent = randomLetter;
                blank.classList.add('hint-revealed');
            }
        });
        
        // Update alphabet button
        const button = [...document.querySelectorAll('.letter-button')].find(btn => btn.textContent === randomLetter);
        if (button) {
            button.classList.add('correct');
        }
        
        this.closeModal('hintModal');
        this.playSound('hint');
        this.showMessage(`Revealed letter: ${randomLetter}`, 'info');
        
        if (this.checkWin()) {
            this.winGame();
        }
    }

    showGameOverModal(won) {
        const title = document.getElementById('gameOverTitle');
        const result = document.getElementById('gameResult');
        const correctWord = document.getElementById('correctWord');
        const wordDefinition = document.getElementById('wordDefinition');
        const finalGamesPlayed = document.getElementById('finalGamesPlayed');
        const finalWinRate = document.getElementById('finalWinRate');
        const finalStreak = document.getElementById('finalStreak');
        if (title) title.textContent = won ? 'Congratulations!' : 'Game Over';
        if (result) {
            result.textContent = won ? 'You guessed the word!' : 'Better luck next time!';
            result.className = `game-result ${won ? 'win' : 'lose'}`;
        }
        if (correctWord) correctWord.textContent = (this.currentWord && this.currentWord.word) ? this.currentWord.word : '—';
        if (wordDefinition) wordDefinition.textContent = (this.currentWord && this.currentWord.hint) ? this.currentWord.hint : '—';
        if (finalGamesPlayed) finalGamesPlayed.textContent = this.stats.gamesPlayed;
        if (finalWinRate) {
            const rate = this.stats.gamesPlayed > 0 ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) : 0;
            finalWinRate.textContent = `${rate}%`;
        }
        if (finalStreak) finalStreak.textContent = this.stats.currentStreak;
        this.openModal('gameOverModal');
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) playAgainBtn.style.display = 'block';
    }

    shareResult() {
        if (!this.currentWord) return;
        const won = this.gameWon;
        const word = this.currentWord.word || '—';
        const category = this.currentWord.category || '—';
        const wrongGuesses = this.wrongGuesses;
        const hintsUsed = this.hintsUsed;
        
        const result = won ? 'WON' : 'LOST';
        const livesLeft = this.maxWrongGuesses - wrongGuesses;
        
        let shareText = `Hangman - Puzzle Grove\n`;
        shareText += `${result}: ${word} (${category})\n`;
        shareText += `Lives left: ${livesLeft}/${this.maxWrongGuesses}\n`;
        
        if (hintsUsed > 0) {
            shareText += `Hints used: ${hintsUsed}\n`;
        }
        
        shareText += `\nPlay at: ${window.location.origin}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Hangman - Puzzle Grove',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showMessage('Result copied to clipboard!', 'success');
            });
        }
    }

    updateStatsDisplay() {
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val != null ? val : 0;
        };
        set('gamesWon', this.stats.gamesWon);
        set('gamesPlayed', this.stats.gamesPlayed);
        set('currentStreak', this.stats.currentStreak);
        set('hintsUsed', this.stats.hintsUsed != null ? this.stats.hintsUsed : this.hintsUsed);
    }

    handleKeyPress(event) {
        if (this.gameOver) return;
        
        const key = event.key.toUpperCase();
        if (key >= 'A' && key <= 'Z') {
            event.preventDefault();
            this.guessLetter(key);
        }
    }

    playSound(type) {
        if (!this.soundEffects) return;
        
        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch (type) {
                case 'correct':
                    oscillator.frequency.value = 800;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    break;
                case 'incorrect':
                    oscillator.frequency.value = 200;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    break;
                case 'win':
                    oscillator.frequency.value = 600;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                    break;
                case 'lose':
                    oscillator.frequency.value = 150;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
                    break;
                case 'hint':
                    oscillator.frequency.value = 400;
                    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    break;
            }
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + (type === 'lose' ? 2 : type === 'win' ? 1 : 0.5));
        } catch (error) {
            // Audio not supported
        }
    }

    showMessage(message, type = 'info') {
        const messageDisplay = document.getElementById('messageDisplay');
        messageDisplay.textContent = message;
        messageDisplay.className = `message-display ${type} show`;
        
        setTimeout(() => {
            messageDisplay.classList.remove('show');
        }, 3000);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('show'), 10);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        }
    }
}

function initHangman() {
    const grid = document.getElementById('alphabetGrid');
    const wordDisplay = document.getElementById('wordDisplay');
    if (!grid || !wordDisplay) return;
    window.hangmanGame = new HangmanGame();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHangman);
} else {
    initHangman();
}