// Wordle Game Logic
document.addEventListener('DOMContentLoaded', async function() {
    // Game variables
    let currentRow = 0;
    let currentTile = 0;
    let gameOver = false;
    let hardMode = false;
    let targetWord = "";
    let guessedWords = [];

    // Game statistics
    let gameStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guesses: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0}
    };

    // Store for words loaded from file
    let WORDS = [];
    
    // Function to load words from the wordle_words.txt file
    async function loadWordsFromFile() {
        try {
            const response = await fetch('wordle_words.txt');
            if (!response.ok) {
                throw new Error(`Failed to load words: ${response.status}`);
            }
            
            const text = await response.text();
            // Filter only 5-letter words and convert to uppercase
            WORDS = text.split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length === 5);
                
            console.log(`Loaded ${WORDS.length} 5-letter words`);
            
            // If no words were loaded or the file was empty, use a fallback
            if (WORDS.length === 0) {
                WORDS = ["APPLE", "BEACH", "CHART", "DREAM", "EAGLE"];
                console.warn("No valid 5-letter words found in file. Using fallback words.");
            }
            
            // Initialize the game after words are loaded
            await initGame();
        } catch (error) {
            console.error("Error loading words file:", error);
            // Fallback to some default words
            WORDS = ["APPLE", "BEACH", "CHART", "DREAM", "EAGLE"];
            console.warn("Using fallback words due to error.");
            await initGame();
        }
    }

    // Element references
    const gameBoard = document.querySelector('.game-board');
    const keyboard = document.querySelector('.keyboard');
    const messageContainer = document.getElementById('message-container');
    
    // Modal elements
    const helpModal = document.getElementById('helpModal');
    const statsModal = document.getElementById('statsModal');
    const settingsModal = document.getElementById('settingsModal');
    const gameEndModal = document.getElementById('gameEndModal');
    const helpBtn = document.getElementById('helpBtn');
    const statsBtn = document.getElementById('statsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const darkThemeToggle = document.getElementById('darkThemeToggle');
    const highContrastToggle = document.getElementById('highContrastToggle');
    const hardModeToggle = document.getElementById('hardModeToggle');
    const closeButtons = document.querySelectorAll('.close');
    const shareButton = document.getElementById('shareButton');
    const gameEndShareButton = document.getElementById('gameEndShareButton');
    const playAgainButton = document.getElementById('playAgainButton');

    // Load game state and stats from database
    async function loadGameState() {
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
                if (userStats && userStats.gameStats && userStats.gameStats.wordle) {
                    const wordleStats = userStats.gameStats.wordle;
                    gameStats = {
                        gamesPlayed: wordleStats.gamesPlayed || 0,
                        gamesWon: wordleStats.gamesWon || 0,
                        currentStreak: wordleStats.currentStreak || 0,
                        maxStreak: wordleStats.maxStreak || 0,
                        guesses: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0}
                    };
                }
            }
        } catch (error) {
            console.error('Error loading game state from database:', error);
            // Continue with default stats if database fails
        }
        
        // Load settings from localStorage (these are user preferences, not game stats)
        const darkMode = localStorage.getItem('wordleDarkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-theme');
            darkThemeToggle.checked = true;
        }
        
        const highContrast = localStorage.getItem('wordleHighContrast') === 'true';
        if (highContrast) {
            document.body.classList.add('high-contrast');
            highContrastToggle.checked = true;
        }
        
        hardMode = localStorage.getItem('wordleHardMode') === 'true';
        hardModeToggle.checked = hardMode;
        
        updateStatsDisplay();
    }

    // Save game state and stats to database
    async function saveGameState() {
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
                await window.dbManager.updateUserStats(currentUser.username, 'wordle', {
                    gamesPlayed: gameStats.gamesPlayed,
                    gamesWon: gameStats.gamesWon,
                    currentStreak: gameStats.currentStreak,
                    maxStreak: gameStats.maxStreak
                });
            }
        } catch (error) {
            console.error('Error saving game state to database:', error);
            // Continue without saving if database fails
        }
        
        // Save settings to localStorage (these are user preferences, not game stats)
        localStorage.setItem('wordleDarkMode', document.body.classList.contains('dark-theme'));
        localStorage.setItem('wordleHighContrast', document.body.classList.contains('high-contrast'));
        localStorage.setItem('wordleHardMode', hardMode);
    }

    // Update the statistics display
    function updateStatsDisplay() {
        document.getElementById('gamesPlayed').textContent = gameStats.gamesPlayed;
        
        // Calculate win percentage
        const winPercentage = gameStats.gamesPlayed > 0 ? 
            Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100) : 0;
        document.getElementById('winPercentage').textContent = winPercentage;
        
        document.getElementById('currentStreak').textContent = gameStats.currentStreak;
        document.getElementById('maxStreak').textContent = gameStats.maxStreak;
        
        // Update guess distribution
        const distributionContainer = document.getElementById('guessDistribution');
        distributionContainer.innerHTML = '';
        
        // Find the max value for scaling
        let maxGuesses = 1;  // Default to 1 to avoid division by zero
        for (let i = 1; i <= 6; i++) {
            if (gameStats.guesses[i] > maxGuesses) {
                maxGuesses = gameStats.guesses[i];
            }
        }
        
        // Create the distribution bars
        for (let i = 1; i <= 6; i++) {
            const guessCount = gameStats.guesses[i];
            const percentage = maxGuesses > 0 ? (guessCount / maxGuesses) * 100 : 0;
            
            const row = document.createElement('div');
            row.className = 'guess-row';
            
            const guessNumber = document.createElement('div');
            guessNumber.className = 'guess-number';
            guessNumber.textContent = i;
            
            const guessBar = document.createElement('div');
            guessBar.className = 'guess-bar';
            if (guessCount > 0) {
                guessBar.classList.add('win');
            }
            guessBar.style.width = `${Math.max(10, percentage)}%`;
            guessBar.textContent = guessCount;
            
            row.appendChild(guessNumber);
            row.appendChild(guessBar);
            distributionContainer.appendChild(row);
        }
    }

    // Choose a random target word
    function selectRandomWord() {
        // Make sure we have words loaded
        if (WORDS.length === 0) {
            console.error("No words loaded. Cannot select a random word.");
            return "ERROR";
        }
        
        // Get list of previously used words from local storage
        const usedWords = JSON.parse(localStorage.getItem('wordleUsedWords')) || [];
        
        // Filter out previously used words
        let availableWords = WORDS.filter(word => !usedWords.includes(word));
        
        // If all words have been used, reset the list
        if (availableWords.length === 0) {
            availableWords = [...WORDS];
            localStorage.setItem('wordleUsedWords', JSON.stringify([]));
        }
        
        // Select a random word
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        const word = availableWords[randomIndex];
        
        // Add to used words list
        usedWords.push(word);
        localStorage.setItem('wordleUsedWords', JSON.stringify(usedWords));
        
        return word;
    }

    // Initialize the game
    async function initGame() {
        await loadGameState();
        
        // Only select a word if WORDS array has been populated
        if (WORDS.length > 0) {
            targetWord = selectRandomWord();
            console.log("Target word:", targetWord); // For debugging
            currentRow = 0;
            currentTile = 0;
            gameOver = false;
            guessedWords = [];
            
            // Reset the board
            const tiles = document.querySelectorAll('.tile');
            tiles.forEach(tile => {
                tile.textContent = '';
                tile.setAttribute('data-state', 'empty');
                tile.classList.remove('pop', 'flip');
            });
            
            // Reset the keyboard
            const keys = document.querySelectorAll('.key');
            keys.forEach(key => {
                key.removeAttribute('data-state');
            });
            
            // Set up event listeners
            setupEventListeners();
        } else {
            console.error("Words not loaded yet. Cannot initialize game.");
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Keyboard clicks
        keyboard.addEventListener('click', handleKeyboardClick);
        
        // Physical keyboard input
        document.addEventListener('keydown', handleKeyPress);
        
        // Modal button clicks
        helpBtn.addEventListener('click', () => showModal(helpModal));
        statsBtn.addEventListener('click', () => showModal(statsModal));
        settingsBtn.addEventListener('click', () => showModal(settingsModal));
        
        // Close buttons
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                hideModal(modal);
            });
        });
        
        // Toggle switches
        darkThemeToggle.addEventListener('change', function() {
            document.body.classList.toggle('dark-theme', this.checked);
            saveGameState();
        });
        
        highContrastToggle.addEventListener('change', function() {
            document.body.classList.toggle('high-contrast', this.checked);
            saveGameState();
        });
        
        hardModeToggle.addEventListener('change', function() {
            hardMode = this.checked;
            saveGameState();
        });
        
        // Share buttons
        shareButton.addEventListener('click', shareResults);
        gameEndShareButton.addEventListener('click', shareResults);
        
        // Play again button
        playAgainButton.addEventListener('click', async function() {
            hideModal(gameEndModal);
            await initGame();
        });
        
        // Click outside modal to close
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal') && event.target.classList.contains('show')) {
                hideModal(event.target);
            }
        });
    }

    // Handle keyboard clicks
    function handleKeyboardClick(e) {
        if (gameOver) return;
        
        const target = e.target;
        if (!target.classList.contains('key')) return;
        
        const key = target.getAttribute('data-key');
        handleKeyInput(key);
    }

    // Handle physical keyboard presses
    function handleKeyPress(e) {
        if (gameOver) return;
        
        // Check if a modal is open
        const activeModal = document.querySelector('.modal.show');
        if (activeModal) return;
        
        const key = e.key.toLowerCase();
        
        if (key === 'enter') {
            handleKeyInput('enter');
        } else if (key === 'backspace' || key === 'delete') {
            handleKeyInput('backspace');
        } else if (/^[a-z]$/.test(key)) {
            handleKeyInput(key);
        }
    }

    // Process key input
    function handleKeyInput(key) {
        if (key === 'enter') {
            submitGuess();
        } else if (key === 'backspace') {
            deleteLetter();
        } else if (/^[a-z]$/.test(key) && currentTile < 5) {
            addLetter(key);
        }
    }

    // Add a letter to the current row
    function addLetter(letter) {
        if (currentTile < 5) {
            const row = gameBoard.children[currentRow];
            const tile = row.children[currentTile];
            tile.textContent = letter.toUpperCase();
            tile.setAttribute('data-state', 'tbd');
            tile.classList.add('pop');
            setTimeout(() => {
                tile.classList.remove('pop');
            }, 100);
            currentTile++;
        }
    }

    // Delete the last letter
    function deleteLetter() {
        if (currentTile > 0) {
            currentTile--;
            const row = gameBoard.children[currentRow];
            const tile = row.children[currentTile];
            tile.textContent = '';
            tile.setAttribute('data-state', 'empty');
        }
    }

    // Submit the current guess
    function submitGuess() {
        if (currentTile !== 5) {
            showMessage("Not enough letters");
            shakeRow();
            return;
        }
        
        const row = gameBoard.children[currentRow];
        let guess = '';
        for (let i = 0; i < 5; i++) {
            guess += row.children[i].textContent;
        }
        
        // Validate if it's a word from our list
        if (!WORDS.includes(guess)) {
            showMessage("Not in word list");
            shakeRow();
            return;
        }

        // Check hard mode constraints
        if (hardMode && currentRow > 0) {
            const prevRow = gameBoard.children[currentRow - 1];
            let validGuess = true;
            let errorMessage = "";
            
            for (let i = 0; i < 5; i++) {
                const prevState = prevRow.children[i].getAttribute('data-state');
                const prevLetter = prevRow.children[i].textContent;
                
                if (prevState === 'correct' && row.children[i].textContent !== prevLetter) {
                    validGuess = false;
                    errorMessage = `${prevLetter} must be in position ${i + 1}`;
                    break;
                }
                
                if (prevState === 'present' && !guess.includes(prevLetter)) {
                    validGuess = false;
                    errorMessage = `Guess must contain ${prevLetter}`;
                    break;
                }
            }
            
            if (!validGuess) {
                showMessage(errorMessage);
                shakeRow();
                return;
            }
        }
        
        guessedWords.push(guess);
        
        // Evaluate the guess
        evaluateGuess(guess);
        
        currentRow++;
        currentTile = 0;
        
        // Check if game is over
        if (guess === targetWord) {
            gameOver = true;
            updateStats(true, currentRow);
            setTimeout(() => {
                showGameEndModal(true);
            }, 1500);
        } else if (currentRow >= 6) {
            gameOver = true;
            updateStats(false);
            setTimeout(() => {
                showGameEndModal(false);
            }, 1500);
        }
    }

    // Evaluate the guess against the target word
    function evaluateGuess(guess) {
        const row = gameBoard.children[currentRow];
        const letterCounts = {};
        
        // Count letters in target word
        for (let i = 0; i < 5; i++) {
            const letter = targetWord[i];
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }
        
        // First pass: Find correct positions
        const states = Array(5).fill('absent');
        for (let i = 0; i < 5; i++) {
            const guessLetter = guess[i];
            if (guessLetter === targetWord[i]) {
                states[i] = 'correct';
                letterCounts[guessLetter]--;
            }
        }
        
        // Second pass: Find present letters
        for (let i = 0; i < 5; i++) {
            if (states[i] !== 'correct') {
                const guessLetter = guess[i];
                if (letterCounts[guessLetter] && letterCounts[guessLetter] > 0) {
                    states[i] = 'present';
                    letterCounts[guessLetter]--;
                }
            }
        }
        
        // Animate the tiles
        for (let i = 0; i < 5; i++) {
            const tile = row.children[i];
            const state = states[i];
            const letter = guess[i];
            
            // Update keyboard
            updateKeyboard(letter, state);
            
            // Delay for flip animation
            setTimeout(() => {
                tile.classList.add('flip');
                
                setTimeout(() => {
                    tile.setAttribute('data-state', state);
                    tile.classList.remove('flip');
                }, 250);
            }, i * 250);
        }
    }

    // Update the keyboard with the state of each letter
    function updateKeyboard(letter, state) {
        const key = document.querySelector(`.key[data-key="${letter.toLowerCase()}"]`);
        if (!key) return;
        
        const currentState = key.getAttribute('data-state');
        
        // Only update if new state is better
        if (state === 'correct' || (state === 'present' && currentState !== 'correct')) {
            key.setAttribute('data-state', state);
        } else if (!currentState && state === 'absent') {
            key.setAttribute('data-state', 'absent');
        }
    }

    // Show message to the user
    function showMessage(text) {
        const message = document.createElement('div');
        message.className = 'message';
        message.textContent = text;
        messageContainer.innerHTML = '';
        messageContainer.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            message.classList.add('hide');
            setTimeout(() => {
                messageContainer.innerHTML = '';
            }, 300);
        }, 2000);
    }

    // Shake the row for invalid input
    function shakeRow() {
        const row = gameBoard.children[currentRow];
        row.classList.add('shake');
        setTimeout(() => {
            row.classList.remove('shake');
        }, 500);
    }

    // Update game statistics
    function updateStats(won, rowNum) {
        gameStats.gamesPlayed++;
        
        if (won) {
            gameStats.gamesWon++;
            gameStats.currentStreak++;
            gameStats.guesses[rowNum]++;
            
            if (gameStats.currentStreak > gameStats.maxStreak) {
                gameStats.maxStreak = gameStats.currentStreak;
            }
        } else {
            gameStats.currentStreak = 0;
            gameStats.guesses.fail++;
        }
        
        saveGameState();
        updateStatsDisplay();
    }

    // Show end game modal
    function showGameEndModal(won) {
        const title = document.getElementById('gameEndTitle');
        const message = document.getElementById('gameEndMessage');
        const wordReveal = document.getElementById('revealWord');
        
        title.textContent = won ? "Success!" : "Game Over";
        message.textContent = won ? 
            `You found the word in ${currentRow} ${currentRow === 1 ? 'try' : 'tries'}!` : 
            "Better luck next time!";
        wordReveal.textContent = targetWord;
        
        showModal(gameEndModal);
    }

    // Share results
    function shareResults() {
        if (!guessedWords.length) return;
        
        let resultText = `Puzzle Grove Wordle: ${gameOver && guessedWords.includes(targetWord) ? currentRow : 'X'}/6\n\n`;
        
        // Generate the emoji grid
        for (let i = 0; i < guessedWords.length; i++) {
            const guess = guessedWords[i];
            
            for (let j = 0; j < 5; j++) {
                const letter = guess[j];
                let emoji = '⬜'; // Default: absent
                
                if (letter === targetWord[j]) {
                    emoji = '🟩'; // Correct
                } else if (targetWord.includes(letter)) {
                    emoji = '🟨'; // Present
                }
                
                resultText += emoji;
            }
            
            resultText += '\n';
        }
        
        resultText += '\npuzzlegrove.com';
        
        // Try to use the Clipboard API
        if (navigator.clipboard) {
            navigator.clipboard.writeText(resultText)
                .then(() => {
                    showMessage("Results copied to clipboard");
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    // Fall back to showing the results in an alert
                    alert(resultText);
                });
        } else {
            // Fall back to showing the results in an alert
            alert(resultText);
        }
    }

    // Show a modal
    function showModal(modal) {
        modal.classList.add('show');
        setTimeout(() => {
            modal.querySelector('.modal-content').style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'translateY(0)';
        }, 10);
    }

    // Hide a modal
    function hideModal(modal) {
        modal.querySelector('.modal-content').style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            modal.classList.remove('show');
        }, 300);
    }

    // Load words from file, then start the game
    loadWordsFromFile();
});