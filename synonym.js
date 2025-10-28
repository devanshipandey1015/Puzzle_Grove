// Synonym Match Game Implementation
class SynonymGame {
    constructor() {
        this.synonymSets = [
            // Easy level
            [
                { word: 'Happy', definition: 'Feeling joy or pleasure' },
                { word: 'Glad', definition: 'Pleased and satisfied' },
                { word: 'Joyful', definition: 'Full of happiness' }
            ],
            [
                { word: 'Big', definition: 'Large in size' },
                { word: 'Large', definition: 'Of great size or extent' },
                { word: 'Huge', definition: 'Extremely large' }
            ],
            [
                { word: 'Fast', definition: 'Moving at high speed' },
                { word: 'Quick', definition: 'Done with speed' },
                { word: 'Rapid', definition: 'Happening in a short time' }
            ],
            [
                { word: 'Smart', definition: 'Having intelligence' },
                { word: 'Clever', definition: 'Quick to understand' },
                { word: 'Bright', definition: 'Intelligent and quick-witted' }
            ],
            [
                { word: 'Small', definition: 'Little in size' },
                { word: 'Tiny', definition: 'Very small' },
                { word: 'Mini', definition: 'Miniature or compact' }
            ],

            // Medium level
            [
                { word: 'Beautiful', definition: 'Pleasing to look at' },
                { word: 'Gorgeous', definition: 'Very beautiful' },
                { word: 'Stunning', definition: 'Extremely impressive' }
            ],
            [
                { word: 'Difficult', definition: 'Hard to do or understand' },
                { word: 'Challenging', definition: 'Testing one\'s abilities' },
                { word: 'Tough', definition: 'Demanding effort' }
            ],
            [
                { word: 'Ancient', definition: 'Very old' },
                { word: 'Old', definition: 'Having lived for a long time' },
                { word: 'Antique', definition: 'From an earlier period' }
            ],
            [
                { word: 'Brave', definition: 'Ready to face danger' },
                { word: 'Courageous', definition: 'Not afraid of danger' },
                { word: 'Bold', definition: 'Confident and fearless' }
            ],
            [
                { word: 'Angry', definition: 'Feeling strong displeasure' },
                { word: 'Mad', definition: 'Very annoyed' },
                { word: 'Furious', definition: 'Extremely angry' }
            ],

            // Hard level
            [
                { word: 'Abundant', definition: 'Existing in large quantities' },
                { word: 'Plentiful', definition: 'Available in large amounts' },
                { word: 'Copious', definition: 'Large in quantity or number' }
            ],
            [
                { word: 'Benevolent', definition: 'Well-meaning and kindly' },
                { word: 'Generous', definition: 'Willing to give more than necessary' },
                { word: 'Charitable', definition: 'Showing kindness and concern' }
            ],
            [
                { word: 'Meticulous', definition: 'Showing careful attention to detail' },
                { word: 'Precise', definition: 'Exact and accurate' },
                { word: 'Thorough', definition: 'Complete and comprehensive' }
            ],
            [
                { word: 'Eloquent', definition: 'Fluent and persuasive in speaking' },
                { word: 'Articulate', definition: 'Able to express ideas clearly' },
                { word: 'Fluent', definition: 'Able to speak smoothly and easily' }
            ],
            [
                { word: 'Serene', definition: 'Calm and peaceful' },
                { word: 'Tranquil', definition: 'Free from disturbance' },
                { word: 'Peaceful', definition: 'Not involving conflict' }
            ],
            [
                { word: 'Magnificent', definition: 'Extremely beautiful and impressive' },
                { word: 'Splendid', definition: 'Excellent and impressive' },
                { word: 'Majestic', definition: 'Having impressive beauty or dignity' }
            ],
            [
                { word: 'Tenacious', definition: 'Holding firmly to something' },
                { word: 'Persistent', definition: 'Continuing firmly despite difficulties' },
                { word: 'Determined', definition: 'Having made a firm decision' }
            ]
        ];

        this.currentLevel = 1;
        this.score = 0;
        this.timeLeft = 60;
        this.gameTimer = null;
        this.currentSets = [];
        this.selectedCards = [];
        this.matchesFound = 0;
        this.totalMatches = 0;
        this.isPaused = false;
        this.isGameOver = false;
        
        // Settings
        this.difficulty = 'medium';
        this.gameMode = 'timed';
        this.showDefinitions = true;
        this.darkTheme = false;
        this.soundEffects = true;

        // Statistics
        this.stats = {
            bestScore: 0,
            totalMatches: 0,
            gamesPlayed: 0
        };

        this.init();
    }

    async init() {
        this.loadSettings();
        await this.loadStats();
        this.setupEventListeners();
        this.startNewGame();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('synonymSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.difficulty = settings.difficulty || 'medium';
            this.gameMode = settings.gameMode || 'timed';
            this.showDefinitions = settings.showDefinitions !== undefined ? settings.showDefinitions : true;
            this.darkTheme = settings.darkTheme || false;
            this.soundEffects = settings.soundEffects !== undefined ? settings.soundEffects : true;
            
            // Apply settings to UI
            document.getElementById('difficultySelect').value = this.difficulty;
            document.getElementById('gameModeSelect').value = this.gameMode;
            document.getElementById('showDefinitionsToggle').checked = this.showDefinitions;
            document.getElementById('darkThemeToggle').checked = this.darkTheme;
            document.getElementById('soundToggle').checked = this.soundEffects;
            
            if (this.darkTheme) {
                document.body.classList.add('dark-theme');
            }
        }
    }

    saveSettings() {
        const settings = {
            difficulty: this.difficulty,
            gameMode: this.gameMode,
            showDefinitions: this.showDefinitions,
            darkTheme: this.darkTheme,
            soundEffects: this.soundEffects
        };
        localStorage.setItem('synonymSettings', JSON.stringify(settings));
    }

    async loadStats() {
        try {
            // Check if database manager is available
            if (typeof window.dbManager === 'undefined') {
                console.log('Database manager not available, using default stats');
                return;
            }
            
            // Get current user from session
            const currentUser = JSON.parse(localStorage.getItem('puzzleGroveUser'));
            if (currentUser && currentUser.username) {
                // Load stats from database
                const userStats = await window.dbManager.getUserStats(currentUser.username);
                if (userStats && userStats.gameStats && userStats.gameStats.synonym) {
                    const synonymStats = userStats.gameStats.synonym;
                    this.stats = {
                        gamesPlayed: synonymStats.gamesPlayed || 0,
                        gamesWon: synonymStats.gamesWon || 0,
                        currentStreak: synonymStats.currentStreak || 0,
                        maxStreak: synonymStats.maxStreak || 0
                    };
                }
            }
        } catch (error) {
            console.error('Error loading game state from database:', error);
            // Continue with default stats if database fails
        }
    }

    async saveStats() {
        try {
            // Check if database manager is available
            if (typeof window.dbManager === 'undefined') {
                console.log('Database manager not available, skipping save');
                return;
            }
            
            // Get current user from session
            const currentUser = JSON.parse(localStorage.getItem('puzzleGroveUser'));
            if (currentUser && currentUser.username) {
                // Save stats to database
                await window.dbManager.updateUserStats(currentUser.username, 'synonym', {
                    gamesPlayed: this.stats.gamesPlayed,
                    gamesWon: this.stats.gamesWon,
                    currentStreak: this.stats.currentStreak,
                    maxStreak: this.stats.maxStreak
                });
            }
        } catch (error) {
            console.error('Error saving game state to database:', error);
            // Continue without saving if database fails
        }
    }

    setupEventListeners() {
        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeBtns = document.querySelectorAll('.close');

        settingsBtn.addEventListener('click', () => this.openModal('settingsModal'));
        
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal').id);
            });
        });

        // Settings controls
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.saveSettings();
        });

        document.getElementById('gameModeSelect').addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.saveSettings();
            this.updateTimeForMode();
        });

        document.getElementById('showDefinitionsToggle').addEventListener('change', (e) => {
            this.showDefinitions = e.target.checked;
            this.saveSettings();
            this.updateWordCardsDefinitions();
        });

        document.getElementById('darkThemeToggle').addEventListener('change', (e) => {
            this.darkTheme = e.target.checked;
            this.saveSettings();
            document.body.classList.toggle('dark-theme', this.darkTheme);
        });

        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.soundEffects = e.target.checked;
            this.saveSettings();
        });

        // Game controls
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.openModal('hintModal'));
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('skipBtn').addEventListener('click', () => this.skipLevel());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());

        // Modal controls
        document.getElementById('showMatchBtn').addEventListener('click', () => this.showHint());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartLevel());
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.closeModal('levelCompleteModal');
            this.nextLevel();
        });
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.closeModal('gameOverModal');
            this.startNewGame();
        });

        // Share buttons
        document.getElementById('shareScoreBtn').addEventListener('click', () => this.shareScore());
        document.getElementById('shareResultBtn').addEventListener('click', () => this.shareResult());

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    startNewGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.stats.gamesPlayed++;
        await this.saveStats();
        
        this.updateTimeForMode();
        this.setupLevel();
        this.closeModal('gameOverModal');
        this.updateUI();
        this.startTimer();
        
        this.showMessage('Game started! Find matching synonyms!', 'success');
    }

    setupLevel() {
        // Select synonym sets based on difficulty and level
        let availableSets = this.getSetsForDifficulty();
        
        // Select 5 random sets for this level (3 words each = 15 words total, need 2 matches per set)
        this.currentSets = this.shuffleArray(availableSets).slice(0, 5);
        this.totalMatches = this.currentSets.length;
        this.matchesFound = 0;
        this.selectedCards = [];
        
        this.generateWordCards();
        this.updateUI();
    }

    getSetsForDifficulty() {
        let sets = [...this.synonymSets];
        
        switch (this.difficulty) {
            case 'easy':
                return sets.slice(0, 5);
            case 'medium':
                return sets.slice(0, 10);
            case 'hard':
                return sets;
        }
        
        return sets;
    }

    generateWordCards() {
        const wordsGrid = document.getElementById('wordsGrid');
        wordsGrid.innerHTML = '';
        
        // Create array of all words from current sets
        let allWords = [];
        this.currentSets.forEach((set, setIndex) => {
            set.forEach((wordObj, wordIndex) => {
                allWords.push({
                    ...wordObj,
                    setIndex: setIndex,
                    wordIndex: wordIndex
                });
            });
        });
        
        // Shuffle the words
        allWords = this.shuffleArray(allWords);
        
        // Create word cards
        allWords.forEach((wordObj, index) => {
            const card = document.createElement('div');
            card.className = 'word-card';
            card.dataset.setIndex = wordObj.setIndex;
            card.dataset.wordIndex = wordObj.wordIndex;
            card.dataset.index = index;
            
            if (this.showDefinitions) {
                card.classList.add('show-definition');
            }
            
            card.innerHTML = `
                <div class="word-text">${wordObj.word}</div>
                <div class="word-definition">${wordObj.definition}</div>
                <div class="match-indicator">✓</div>
            `;
            
            card.addEventListener('click', () => this.selectCard(card));
            wordsGrid.appendChild(card);
        });
    }

    selectCard(card) {
        if (this.isPaused || this.isGameOver || card.classList.contains('matched')) {
            return;
        }
        
        if (card.classList.contains('selected')) {
            // Deselect card
            card.classList.remove('selected');
            this.selectedCards = this.selectedCards.filter(c => c !== card);
            return;
        }
        
        // Select card
        card.classList.add('selected');
        this.selectedCards.push(card);
        
        this.playSound('select');
        
        // Check if we have 3 cards selected (full set)
        if (this.selectedCards.length === 3) {
            this.checkMatch();
        }
    }

    checkMatch() {
        const setIndexes = this.selectedCards.map(card => parseInt(card.dataset.setIndex));
        const isMatch = setIndexes.every(index => index === setIndexes[0]);
        
        if (isMatch) {
            // It's a match!
            this.selectedCards.forEach(card => {
                card.classList.remove('selected');
                card.classList.add('matched', 'match-animation');
            });
            
            this.matchesFound++;
            this.score += this.calculateMatchScore();
            this.playSound('match');
            
            this.selectedCards = [];
            this.updateUI();
            
            // Check if level is complete
            if (this.matchesFound >= this.totalMatches) {
                this.completeLevel();
            }
        } else {
            // Not a match
            this.playSound('wrong');
            this.showMessage('Not a match! Try again.', 'error');
            
            // Deselect after a brief moment
            setTimeout(() => {
                this.selectedCards.forEach(card => {
                    card.classList.remove('selected');
                });
                this.selectedCards = [];
            }, 1000);
        }
    }

    calculateMatchScore() {
        let baseScore = 100;
        let levelMultiplier = this.currentLevel;
        let timeBonus = Math.max(0, this.timeLeft * 2);
        
        if (this.difficulty === 'hard') baseScore += 50;
        if (this.difficulty === 'easy') baseScore -= 25;
        
        return Math.round(baseScore * levelMultiplier + timeBonus);
    }

    completeLevel() {
        this.stopTimer();
        
        const levelScore = this.score;
        const timeBonus = Math.max(0, this.timeLeft * 5);
        this.score += timeBonus;
        
        this.playSound('levelComplete');
        
        // Update level complete modal
        document.getElementById('completionMessage').textContent = 
            this.currentLevel === 1 ? 'Great start!' : 
            this.currentLevel < 5 ? 'Excellent work!' : 
            'Amazing job!';
        document.getElementById('completionDetails').textContent = 
            `You completed Level ${this.currentLevel}!`;
        document.getElementById('timeBonus').textContent = `+${timeBonus}`;
        document.getElementById('levelScore').textContent = levelScore;
        document.getElementById('totalScore').textContent = this.score;
        
        this.openModal('levelCompleteModal');
    }

    nextLevel() {
        this.currentLevel++;
        this.updateTimeForMode();
        this.setupLevel();
        this.startTimer();
        
        this.showMessage(`Level ${this.currentLevel} started!`, 'info');
    }

    skipLevel() {
        if (confirm('Skip this level? You won\'t get points for remaining matches.')) {
            this.score = Math.max(0, this.score - 200); // Penalty for skipping
            this.nextLevel();
        }
    }

    restartLevel() {
        this.closeModal('pauseModal');
        this.setupLevel();
        this.updateTimeForMode();
        this.startTimer();
    }

    showHint() {
        if (this.score < 50) {
            this.showMessage('Not enough points for hint! (Need 50 points)', 'error');
            return;
        }
        
        this.score -= 50;
        
        // Find an unmatched set and highlight it briefly
        const unmatchedSets = this.currentSets.map((set, index) => {
            const setCards = document.querySelectorAll(`[data-set-index="${index}"]`);
            const isMatched = Array.from(setCards).every(card => card.classList.contains('matched'));
            return isMatched ? null : index;
        }).filter(index => index !== null);
        
        if (unmatchedSets.length > 0) {
            const hintSetIndex = unmatchedSets[Math.floor(Math.random() * unmatchedSets.length)];
            const hintCards = document.querySelectorAll(`[data-set-index="${hintSetIndex}"]`);
            
            hintCards.forEach(card => {
                card.classList.add('hint-match');
            });
            
            setTimeout(() => {
                hintCards.forEach(card => {
                    card.classList.remove('hint-match');
                });
            }, 3000);
            
            this.playSound('hint');
            this.showMessage('These words are synonyms!', 'info');
        }
        
        this.closeModal('hintModal');
        this.updateUI();
    }

    updateTimeForMode() {
        switch (this.gameMode) {
            case 'timed':
                this.timeLeft = 60;
                break;
            case 'relaxed':
                this.timeLeft = 999;
                break;
            case 'challenge':
                this.timeLeft = 30;
                break;
        }
    }

    startTimer() {
        if (this.gameMode === 'relaxed') return;
        
        this.gameTimer = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.timeLeft--;
                this.updateUI();
                
                if (this.timeLeft <= 10 && this.timeLeft > 0) {
                    document.getElementById('timeLeft').classList.add('timer-warning');
                    this.playSound('warning');
                }
                
                if (this.timeLeft <= 0) {
                    this.gameOver();
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('pauseLevel').textContent = this.currentLevel;
            document.getElementById('pauseScore').textContent = this.score;
            document.getElementById('pauseMatches').textContent = this.totalMatches - this.matchesFound;
            this.openModal('pauseModal');
            document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            this.closeModal('pauseModal');
            document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.stopTimer();
        
        // Update statistics
        this.stats.totalMatches += this.matchesFound;
        if (this.score > this.stats.bestScore) {
            this.stats.bestScore = this.score;
        }
        await this.saveStats();
        
        // Update game over modal
        document.getElementById('gameOverTitle').textContent = this.timeLeft <= 0 ? 'Time\'s Up!' : 'Game Over';
        document.getElementById('gameOverMessage').textContent = 
            this.timeLeft <= 0 ? 'Time ran out!' : 'Game ended';
        document.getElementById('finalLevel').textContent = this.currentLevel;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('totalMatches').textContent = this.matchesFound;
        document.getElementById('bestScore').textContent = this.stats.bestScore;
        
        this.playSound('gameOver');
        this.openModal('gameOverModal');
    }

    updateWordCardsDefinitions() {
        const cards = document.querySelectorAll('.word-card');
        cards.forEach(card => {
            card.classList.toggle('show-definition', this.showDefinitions);
        });
    }

    updateUI() {
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('timeLeft').textContent = this.gameMode === 'relaxed' ? '∞' : this.timeLeft;
        document.getElementById('matchesLeft').textContent = this.totalMatches - this.matchesFound;
        
        // Update game info
        document.getElementById('gameInfo').textContent = 
            `Level ${this.currentLevel} • ${this.totalMatches - this.matchesFound} matches left`;
        
        // Update progress bar
        const progress = (this.matchesFound / this.totalMatches) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = 
            `${this.matchesFound} / ${this.totalMatches} matches`;
        
        // Update hint modal
        document.getElementById('hintMatches').textContent = this.totalMatches - this.matchesFound;
        
        // Show next level button if level is complete
        if (this.matchesFound >= this.totalMatches) {
            document.getElementById('nextLevelBtn').style.display = 'block';
        } else {
            document.getElementById('nextLevelBtn').style.display = 'none';
        }
    }

    shareScore() {
        const shareText = `Synonym Match - Puzzle Grove\nLevel: ${this.currentLevel}\nScore: ${this.score}\n\nPlay at: ${window.location.origin}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Synonym Match - Puzzle Grove',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showMessage('Score shared to clipboard!', 'success');
            });
        }
    }

    shareResult() {
        const shareText = `Synonym Match - Puzzle Grove\nFinal Level: ${this.currentLevel}\nFinal Score: ${this.score}\nTotal Matches: ${this.matchesFound}\n\nPlay at: ${window.location.origin}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Synonym Match - Puzzle Grove',
                text: shareText
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showMessage('Result shared to clipboard!', 'success');
            });
        }
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    playSound(type) {
        if (!this.soundEffects) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch (type) {
                case 'select':
                    oscillator.frequency.value = 300;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    break;
                case 'match':
                    oscillator.frequency.value = 600;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    break;
                case 'wrong':
                    oscillator.frequency.value = 200;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    break;
                case 'levelComplete':
                    oscillator.frequency.value = 800;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                    break;
                case 'gameOver':
                    oscillator.frequency.value = 150;
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
                    break;
                case 'hint':
                    oscillator.frequency.value = 400;
                    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    break;
                case 'warning':
                    oscillator.frequency.value = 250;
                    gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    break;
            }
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + (type === 'gameOver' ? 1.5 : type === 'levelComplete' ? 1 : 0.5));
        } catch (error) {
            console.log('Audio not supported');
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
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SynonymGame();
});