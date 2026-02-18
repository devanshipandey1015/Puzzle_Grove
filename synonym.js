// Synonym Match Game Implementation – logic only; UI layout/styling unchanged.

// In-code dataset: synonym pairs grouped by level. Each round uses N pairs (N = matches per round, e.g. 5).
const LEVELS = {
    1: [
        ['happy', 'joyful'],
        ['fast', 'quick'],
        ['big', 'large'],
        ['small', 'tiny'],
        ['smart', 'clever'],
        ['sad', 'unhappy'],
        ['angry', 'mad'],
        ['beautiful', 'pretty'],
        ['brave', 'courageous'],
        ['calm', 'peaceful']
    ],
    2: [
        ['difficult', 'hard'],
        ['easy', 'simple'],
        ['begin', 'start'],
        ['end', 'finish'],
        ['help', 'assist'],
        ['buy', 'purchase'],
        ['find', 'discover'],
        ['make', 'create'],
        ['say', 'tell'],
        ['think', 'consider'],
        ['want', 'desire'],
        ['use', 'utilize']
    ],
    3: [
        ['ancient', 'old'],
        ['correct', 'right'],
        ['dangerous', 'risky'],
        ['enormous', 'huge'],
        ['famous', 'well-known'],
        ['generous', 'kind'],
        ['important', 'significant'],
        ['intelligent', 'smart'],
        ['magnificent', 'splendid'],
        ['necessary', 'required'],
        ['ordinary', 'common'],
        ['powerful', 'strong']
    ],
    4: [
        ['abundant', 'plentiful'],
        ['benevolent', 'kind'],
        ['meticulous', 'careful'],
        ['eloquent', 'articulate'],
        ['serene', 'tranquil'],
        ['tenacious', 'persistent'],
        ['vibrant', 'lively'],
        ['weary', 'tired'],
        ['zealous', 'eager'],
        ['cautious', 'careful'],
        ['diligent', 'hardworking'],
        ['eager', 'enthusiastic']
    ],
    5: [
        ['ambiguous', 'unclear'],
        ['comprehensive', 'complete'],
        ['conspicuous', 'obvious'],
        ['exquisite', 'beautiful'],
        ['formidable', 'impressive'],
        ['gregarious', 'sociable'],
        ['incessant', 'constant'],
        ['juvenile', 'young'],
        ['lucrative', 'profitable'],
        ['notorious', 'famous'],
        ['obsolete', 'outdated'],
        ['pragmatic', 'practical']
    ]
};

// Default pairs per round (synced with "Matches Left" in UI).
const PAIRS_PER_ROUND = 5;

// Max level; beyond this we reuse level 5 pool.
const MAX_LEVEL = 5;

class SynonymGame {
    constructor() {
        this.currentLevel = 1;
        this.score = 0;
        this.timeLeft = 60;
        this.gameTimer = null;
        this.pairsThisRound = [];       // array of [word, synonym]
        this.selectedLeft = null;
        this.selectedRight = null;
        this.matchesFound = 0;
        this.totalMatches = PAIRS_PER_ROUND;
        this.isPaused = false;
        this.isGameOver = false;
        this.isProcessing = false;      // blocks input during wrong feedback
        this.hintsUsed = 0;

        this.difficulty = 'medium';
        this.gameMode = 'timed';
        this.showDefinitions = true;
        this.darkTheme = false;
        this.soundEffects = true;

        this.stats = {
            bestScore: 0,
            totalMatches: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0
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
        try {
            const savedSettings = localStorage.getItem('synonymSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.difficulty = settings.difficulty || 'medium';
                this.gameMode = settings.gameMode || 'timed';
                this.showDefinitions = settings.showDefinitions !== false;
                this.darkTheme = settings.darkTheme || false;
                this.soundEffects = settings.soundEffects !== false;
            }
        } catch (e) {}
        const difficultySelect = document.getElementById('difficultySelect');
        const gameModeSelect = document.getElementById('gameModeSelect');
        const showDef = document.getElementById('showDefinitionsToggle');
        const darkThemeToggle = document.getElementById('darkThemeToggle');
        const soundToggle = document.getElementById('soundToggle');
        if (difficultySelect) difficultySelect.value = this.difficulty;
        if (gameModeSelect) gameModeSelect.value = this.gameMode;
        if (showDef) showDef.checked = this.showDefinitions;
        if (darkThemeToggle) darkThemeToggle.checked = this.darkTheme;
        if (soundToggle) soundToggle.checked = this.soundEffects;
        if (this.darkTheme) document.body.classList.add('dark-theme');
    }

    saveSettings() {
        const settings = {
            difficulty: this.difficulty,
            gameMode: this.gameMode,
            showDefinitions: this.showDefinitions,
            darkTheme: this.darkTheme,
            soundEffects: this.soundEffects
        };
        try { localStorage.setItem('synonymSettings', JSON.stringify(settings)); } catch (e) {}
    }

    async loadStats() {
        try {
            if (typeof window.dbManager === 'undefined') return;
            let currentUser = null;
            try {
                const u = localStorage.getItem('puzzleGroveUser');
                if (u) currentUser = JSON.parse(u);
            } catch (e) {}
            if (currentUser && currentUser.username) {
                const userStats = await window.dbManager.getUserStats(currentUser.username);
                if (userStats && userStats.gameStats && userStats.gameStats.synonym) {
                    const s = userStats.gameStats.synonym;
                    this.stats.gamesPlayed = s.gamesPlayed || 0;
                    this.stats.gamesWon = s.gamesWon || 0;
                    this.stats.currentStreak = s.currentStreak || 0;
                    this.stats.maxStreak = s.maxStreak || 0;
                }
            }
        } catch (e) {}
    }

    async saveStats() {
        try {
            if (typeof window.dbManager === 'undefined') return;
            let currentUser = null;
            try {
                const u = localStorage.getItem('puzzleGroveUser');
                if (u) currentUser = JSON.parse(u);
            } catch (e) {}
            if (currentUser && currentUser.username) {
                await window.dbManager.updateUserStats(currentUser.username, 'synonym', {
                    gamesPlayed: this.stats.gamesPlayed,
                    gamesWon: this.stats.gamesWon,
                    currentStreak: this.stats.currentStreak,
                    maxStreak: this.stats.maxStreak
                });
            }
        } catch (e) {}
    }

    setupEventListeners() {
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeBtns = document.querySelectorAll('.close');
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openModal('settingsModal'));
        closeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });

        const difficultySelect = document.getElementById('difficultySelect');
        const gameModeSelect = document.getElementById('gameModeSelect');
        const showDef = document.getElementById('showDefinitionsToggle');
        const darkThemeToggle = document.getElementById('darkThemeToggle');
        const soundToggle = document.getElementById('soundToggle');
        if (difficultySelect) difficultySelect.addEventListener('change', (e) => { this.difficulty = e.target.value; this.saveSettings(); });
        if (gameModeSelect) gameModeSelect.addEventListener('change', (e) => { this.gameMode = e.target.value; this.saveSettings(); this.updateTimeForMode(); });
        if (showDef) showDef.addEventListener('change', (e) => { this.showDefinitions = e.target.checked; this.saveSettings(); this.updateWordCardsDefinitions(); });
        if (darkThemeToggle) darkThemeToggle.addEventListener('change', (e) => { this.darkTheme = e.target.checked; this.saveSettings(); document.body.classList.toggle('dark-theme', this.darkTheme); });
        if (soundToggle) soundToggle.addEventListener('change', (e) => { this.soundEffects = e.target.checked; this.saveSettings(); });

        const newGameBtn = document.getElementById('newGameBtn');
        const hintBtn = document.getElementById('hintBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const skipBtn = document.getElementById('skipBtn');
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        if (newGameBtn) newGameBtn.addEventListener('click', () => this.resetCurrentLevel());
        if (hintBtn) hintBtn.addEventListener('click', () => this.openModal('hintModal'));
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
        if (skipBtn) skipBtn.addEventListener('click', () => this.skipLevel());
        if (nextLevelBtn) nextLevelBtn.addEventListener('click', () => this.nextLevel());

        const showMatchBtn = document.getElementById('showMatchBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const restartBtn = document.getElementById('restartBtn');
        const continueBtn = document.getElementById('continueBtn');
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (showMatchBtn) showMatchBtn.addEventListener('click', () => this.showHint());
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());
        if (restartBtn) restartBtn.addEventListener('click', () => { this.closeModal('pauseModal'); this.resetCurrentLevel(); });
        if (continueBtn) continueBtn.addEventListener('click', () => { this.closeModal('levelCompleteModal'); this.nextLevel(); });
        if (playAgainBtn) playAgainBtn.addEventListener('click', () => { this.closeModal('gameOverModal'); this.startNewGame(); });

        const shareScoreBtn = document.getElementById('shareScoreBtn');
        const shareResultBtn = document.getElementById('shareResultBtn');
        if (shareScoreBtn) shareScoreBtn.addEventListener('click', () => this.shareScore());
        if (shareResultBtn) shareResultBtn.addEventListener('click', () => this.shareResult());

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) this.closeModal(e.target.id);
        });
    }

    // Start fresh game from level 1.
    async startNewGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.isProcessing = false;
        this.stats.gamesPlayed = (this.stats.gamesPlayed || 0) + 1;
        await this.saveStats();
        this.updateTimeForMode();
        this.setupLevel();
        this.closeModal('gameOverModal');
        this.closeModal('levelCompleteModal');
        this.updateUI();
        this.startTimer();
        this.showMessage('Game started! Match words with their synonyms.', 'success');
    }

    // Restart current level with new random set (Reset icon).
    resetCurrentLevel() {
        if (this.isGameOver) {
            this.startNewGame();
            return;
        }
        this.stopTimer();
        this.isProcessing = false;
        this.selectedLeft = null;
        this.selectedRight = null;
        this.setupLevel();
        this.updateTimeForMode();
        this.startTimer();
        this.updateUI();
        this.showMessage('Level restarted with new words.', 'info');
    }

    getPoolForLevel() {
        const level = Math.min(this.currentLevel, MAX_LEVEL);
        const pool = LEVELS[level] || LEVELS[1];
        return Array.isArray(pool) ? [...pool] : [];
    }

    setupLevel() {
        const pool = this.getPoolForLevel();
        const n = Math.min(PAIRS_PER_ROUND, pool.length);
        const shuffled = this.shuffleArray(pool);
        this.pairsThisRound = shuffled.slice(0, n);
        this.totalMatches = this.pairsThisRound.length;
        this.matchesFound = 0;
        this.selectedLeft = null;
        this.selectedRight = null;
        this.generateWordCards();
        this.updateUI();
    }

    generateWordCards() {
        const wordsGrid = document.getElementById('wordsGrid');
        if (!wordsGrid) return;
        wordsGrid.innerHTML = '';

        const leftWords = this.pairsThisRound.map((p, i) => ({ word: p[0], pairIndex: i }));
        const rightWords = this.pairsThisRound.map((p, i) => ({ word: p[1], pairIndex: i }));
        const rightShuffled = this.shuffleArray(rightWords);

        for (let i = 0; i < leftWords.length; i++) {
            wordsGrid.appendChild(this.createCard(leftWords[i].word, leftWords[i].pairIndex, 'left'));
            wordsGrid.appendChild(this.createCard(rightShuffled[i].word, rightShuffled[i].pairIndex, 'right'));
        }
    }

    createCard(word, pairIndex, side) {
        const card = document.createElement('div');
        card.className = 'word-card';
        if (this.showDefinitions) card.classList.add('show-definition');
        card.dataset.pairIndex = String(pairIndex);
        card.dataset.side = side;
        card.innerHTML = `
            <div class="word-text">${word}</div>
            <div class="word-definition"></div>
            <div class="match-indicator">✓</div>
        `;
        card.addEventListener('click', () => this.selectCard(card));
        return card;
    }

    selectCard(card) {
        if (this.isPaused || this.isGameOver || this.isProcessing) return;
        if (card.classList.contains('matched')) return;

        const side = card.dataset.side;
        if (side === 'left') {
            if (this.selectedLeft === card) {
                card.classList.remove('selected');
                this.selectedLeft = null;
            } else {
                if (this.selectedLeft) this.selectedLeft.classList.remove('selected');
                this.selectedLeft = card;
                card.classList.add('selected');
            }
            if (this.selectedRight) {
                this.selectedRight.classList.remove('selected');
                this.selectedRight = null;
            }
        } else {
            if (this.selectedRight === card) {
                card.classList.remove('selected');
                this.selectedRight = null;
            } else {
                if (this.selectedRight) this.selectedRight.classList.remove('selected');
                this.selectedRight = card;
                card.classList.add('selected');
            }
        }

        if (this.selectedLeft && this.selectedRight) {
            this.checkMatch();
        }
    }

    checkMatch() {
        const leftIndex = parseInt(this.selectedLeft.dataset.pairIndex, 10);
        const rightIndex = parseInt(this.selectedRight.dataset.pairIndex, 10);
        if (leftIndex === rightIndex) {
            this.selectedLeft.classList.remove('selected');
            this.selectedRight.classList.remove('selected');
            this.selectedLeft.classList.add('matched', 'match-animation');
            this.selectedRight.classList.add('matched', 'match-animation');
            this.matchesFound++;
            const baseScore = 100;
            const levelMult = this.currentLevel;
            const timeBonus = this.gameMode === 'relaxed' ? 0 : Math.max(0, this.timeLeft * 2);
            this.score += Math.round(baseScore * levelMult + timeBonus);
            this.selectedLeft = null;
            this.selectedRight = null;
            this.playSound('match');
            this.updateUI();
            if (this.matchesFound >= this.totalMatches) {
                this.completeLevel();
            }
        } else {
            this.isProcessing = true;
            this.playSound('wrong');
            this.showMessage('Not a match! Try again.', 'error');
            this.selectedLeft.classList.add('wrong');
            this.selectedRight.classList.add('wrong');
            setTimeout(() => {
                this.selectedLeft.classList.remove('selected', 'wrong');
                this.selectedRight.classList.remove('selected', 'wrong');
                this.selectedLeft = null;
                this.selectedRight = null;
                this.isProcessing = false;
            }, 600);
        }
    }

    completeLevel() {
        this.stopTimer();
        this.stats.gamesWon = (this.stats.gamesWon || 0) + 1;
        this.stats.currentStreak = (this.stats.currentStreak || 0) + 1;
        if (this.stats.currentStreak > (this.stats.maxStreak || 0)) this.stats.maxStreak = this.stats.currentStreak;
        const timeBonus = this.gameMode === 'relaxed' ? 0 : Math.max(0, this.timeLeft * 5);
        this.score += timeBonus;
        this.playSound('levelComplete');

        const completionMessage = document.getElementById('completionMessage');
        const completionDetails = document.getElementById('completionDetails');
        const timeBonusEl = document.getElementById('timeBonus');
        const levelScoreEl = document.getElementById('levelScore');
        const totalScoreEl = document.getElementById('totalScore');
        if (completionMessage) completionMessage.textContent = this.currentLevel === 1 ? 'Great start!' : this.currentLevel < 5 ? 'Excellent work!' : 'Amazing job!';
        if (completionDetails) completionDetails.textContent = `You completed Level ${this.currentLevel}!`;
        if (timeBonusEl) timeBonusEl.textContent = `+${timeBonus}`;
        if (levelScoreEl) levelScoreEl.textContent = this.score - timeBonus;
        if (totalScoreEl) totalScoreEl.textContent = this.score;

        this.openModal('levelCompleteModal');
    }

    nextLevel() {
        this.currentLevel++;
        this.updateTimeForMode();
        this.setupLevel();
        this.startTimer();
        this.updateUI();
        this.showMessage(`Level ${this.currentLevel} started!`, 'info');
    }

    skipLevel() {
        if (confirm('Skip this level? You won\'t get points for remaining matches.')) {
            this.score = Math.max(0, this.score - 200);
            this.nextLevel();
        }
    }

    showHint() {
        const wordsGrid = document.getElementById('wordsGrid');
        if (!wordsGrid) { this.closeModal('hintModal'); return; }
        const leftCards = wordsGrid.querySelectorAll('.word-card[data-side="left"]:not(.matched)');
        const rightCards = wordsGrid.querySelectorAll('.word-card[data-side="right"]:not(.matched)');
        if (leftCards.length === 0 || rightCards.length === 0) { this.closeModal('hintModal'); return; }

        const pairIndex = parseInt(leftCards[0].dataset.pairIndex, 10);
        const rightMatch = wordsGrid.querySelector(`.word-card[data-side="right"][data-pair-index="${pairIndex}"]:not(.matched)`);
        if (!rightMatch) { this.closeModal('hintModal'); return; }

        this.hintsUsed++;
        leftCards[0].classList.add('hint-match');
        rightMatch.classList.add('hint-match');
        setTimeout(() => {
            leftCards[0].classList.remove('hint-match');
            rightMatch.classList.remove('hint-match');
        }, 3000);
        this.playSound('hint');
        this.showMessage('One correct pair highlighted!', 'info');
        this.closeModal('hintModal');
    }

    updateTimeForMode() {
        if (this.gameMode === 'relaxed') {
            this.timeLeft = 999;
        } else if (this.gameMode === 'challenge') {
            this.timeLeft = Math.max(30, 60 - (this.currentLevel - 1) * 5);
        } else {
            this.timeLeft = Math.max(30, 60 - (this.currentLevel - 1) * 3);
        }
    }

    startTimer() {
        if (this.gameMode === 'relaxed') return;
        this.gameTimer = setInterval(() => {
            if (this.isPaused || this.isGameOver) return;
            this.timeLeft--;
            this.updateUI();
            const timeEl = document.getElementById('timeLeft');
            if (timeEl) {
                if (this.timeLeft <= 10 && this.timeLeft > 0) timeEl.classList.add('timer-warning');
                else timeEl.classList.remove('timer-warning');
            }
            if (this.timeLeft <= 0) this.gameOver();
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
        const pauseLevel = document.getElementById('pauseLevel');
        const pauseScore = document.getElementById('pauseScore');
        const pauseMatches = document.getElementById('pauseMatches');
        const pauseBtn = document.getElementById('pauseBtn');
        if (this.isPaused) {
            if (pauseLevel) pauseLevel.textContent = this.currentLevel;
            if (pauseScore) pauseScore.textContent = this.score;
            if (pauseMatches) pauseMatches.textContent = this.totalMatches - this.matchesFound;
            this.openModal('pauseModal');
            if (pauseBtn) pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            this.closeModal('pauseModal');
            if (pauseBtn) pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
    }

    async gameOver() {
        this.isGameOver = true;
        this.stopTimer();
        this.stats.currentStreak = 0;
        this.stats.totalMatches = (this.stats.totalMatches || 0) + this.matchesFound;
        if (this.score > (this.stats.bestScore || 0)) this.stats.bestScore = this.score;
        await this.saveStats();

        const gameOverTitle = document.getElementById('gameOverTitle');
        const gameOverMessage = document.getElementById('gameOverMessage');
        const finalLevel = document.getElementById('finalLevel');
        const finalScore = document.getElementById('finalScore');
        const totalMatches = document.getElementById('totalMatches');
        const bestScore = document.getElementById('bestScore');
        if (gameOverTitle) gameOverTitle.textContent = this.timeLeft <= 0 ? "Time's Up!" : 'Game Over';
        if (gameOverMessage) gameOverMessage.textContent = this.timeLeft <= 0 ? "Time ran out!" : 'Game ended';
        if (finalLevel) finalLevel.textContent = this.currentLevel;
        if (finalScore) finalScore.textContent = this.score;
        if (totalMatches) totalMatches.textContent = this.matchesFound;
        if (bestScore) bestScore.textContent = this.stats.bestScore || 0;

        this.playSound('gameOver');
        this.openModal('gameOverModal');
    }

    updateWordCardsDefinitions() {
        document.querySelectorAll('.word-card').forEach(card => {
            card.classList.toggle('show-definition', this.showDefinitions);
        });
    }

    updateUI() {
        const currentLevelEl = document.getElementById('currentLevel');
        const currentScoreEl = document.getElementById('currentScore');
        const timeLeftEl = document.getElementById('timeLeft');
        const matchesLeftEl = document.getElementById('matchesLeft');
        const gameInfo = document.getElementById('gameInfo');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const hintMatches = document.getElementById('hintMatches');
        const nextLevelBtn = document.getElementById('nextLevelBtn');

        if (currentLevelEl) currentLevelEl.textContent = this.currentLevel;
        if (currentScoreEl) currentScoreEl.textContent = this.score;
        if (timeLeftEl) timeLeftEl.textContent = this.gameMode === 'relaxed' ? '∞' : this.timeLeft;
        const left = this.totalMatches - this.matchesFound;
        if (matchesLeftEl) matchesLeftEl.textContent = left;
        if (gameInfo) gameInfo.textContent = `Level ${this.currentLevel} • ${left} match${left !== 1 ? 'es' : ''} left`;
        const progress = this.totalMatches > 0 ? (this.matchesFound / this.totalMatches) * 100 : 0;
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${this.matchesFound} / ${this.totalMatches} matches`;
        if (hintMatches) hintMatches.textContent = left;
        if (nextLevelBtn) nextLevelBtn.style.display = (this.matchesFound >= this.totalMatches) ? 'inline-flex' : 'none';
    }

    shareScore() {
        const shareText = `Synonym Match - Puzzle Grove\nLevel: ${this.currentLevel}\nScore: ${this.score}\n\nPlay at: ${window.location.origin}`;
        if (navigator.share) {
            navigator.share({ title: 'Synonym Match - Puzzle Grove', text: shareText });
        } else {
            navigator.clipboard.writeText(shareText).then(() => this.showMessage('Score copied to clipboard!', 'success'));
        }
    }

    shareResult() {
        const shareText = `Synonym Match - Puzzle Grove\nFinal Level: ${this.currentLevel}\nFinal Score: ${this.score}\nTotal Matches: ${this.matchesFound}\n\nPlay at: ${window.location.origin}`;
        if (navigator.share) {
            navigator.share({ title: 'Synonym Match - Puzzle Grove', text: shareText });
        } else {
            navigator.clipboard.writeText(shareText).then(() => this.showMessage('Result copied to clipboard!', 'success'));
        }
    }

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    playSound(type) {
        if (!this.soundEffects) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            if (type === 'match') osc.frequency.value = 600;
            else if (type === 'wrong') osc.frequency.value = 200;
            else if (type === 'levelComplete') osc.frequency.value = 800;
            else if (type === 'gameOver') osc.frequency.value = 150;
            else if (type === 'hint') osc.frequency.value = 400;
            else if (type === 'warning') osc.frequency.value = 250;
            else osc.frequency.value = 300;
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {}
    }

    showMessage(message, type) {
        const el = document.getElementById('messageDisplay');
        if (!el) return;
        el.textContent = message;
        el.className = `message-display ${type || 'info'} show`;
        setTimeout(() => el.classList.remove('show'), 3000);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.style.display = 'block';
        requestAnimationFrame(() => modal.classList.add('show'));
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('show');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SynonymGame();
});
