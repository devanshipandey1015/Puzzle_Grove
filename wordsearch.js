// Word Strands Game Logic
document.addEventListener('DOMContentLoaded', async function() {
    // Game variables
    let grid = [];
    let gridSize = 9; // 9x9 grid
    let words = [];
    let foundWords = [];
    let selectedTiles = [];
    let currentPuzzle = null;
    let hintsUsed = 0;
    let startTime = null;
    let gameCompleted = false;
    
    // Game statistics
    let gameStats = {
        gamesPlayed: 0,
        totalWordsFound: 0,
        totalHintsUsed: 0,
        totalCompletionTime: 0, // in seconds
    };

    // Puzzle themes with words - similar to NYT Strands format
    const puzzleThemes = [
        {
            id: 1,
            theme: "Types of Trees",
            description: "Find words related to different tree species",
            words: ["OAK", "MAPLE", "PINE", "BIRCH", "CEDAR", "WILLOW", "PALM", "SPRUCE", "REDWOOD"]
        },
        {
            id: 2,
            theme: "Weather Phenomena",
            description: "Discover different weather conditions and events",
            words: ["RAIN", "SNOW", "HAIL", "FROST", "SLEET", "THUNDER", "MIST", "STORM", "BREEZE", "TORNADO"]
        },
        {
            id: 3,
            theme: "Celestial Bodies",
            description: "Identify objects found in space",
            words: ["STAR", "MOON", "PLANET", "COMET", "GALAXY", "NEBULA", "METEOR", "ASTEROID", "SATELLITE"]
        },
        {
            id: 4,
            theme: "Kitchen Utensils",
            description: "Find tools used for cooking and food preparation",
            words: ["SPOON", "KNIFE", "WHISK", "LADLE", "GRATER", "TONGS", "SPATULA", "PEELER", "STRAINER"]
        },
        {
            id: 5,
            theme: "Music Genres",
            description: "Discover different styles of music",
            words: ["JAZZ", "ROCK", "BLUES", "METAL", "TECHNO", "FOLK", "COUNTRY", "REGGAE", "CLASSICAL", "HIPHOP"]
        },
        {
            id: 6,
            theme: "Gemstones",
            description: "Find precious and semi-precious stones",
            words: ["RUBY", "AMBER", "OPAL", "DIAMOND", "EMERALD", "SAPPHIRE", "TOPAZ", "GARNET", "JADE", "PEARL"]
        },
        {
            id: 7,
            theme: "Sports Equipment",
            description: "Identify gear used in various sports",
            words: ["BALL", "RACKET", "HELMET", "GLOVE", "SKATES", "PADDLE", "NET", "GOAL", "BAT", "CLUB"]
        },
        {
            id: 8,
            theme: "Ocean Creatures",
            description: "Find animals that live in the sea",
            words: ["SHARK", "WHALE", "CRAB", "SEAL", "DOLPHIN", "OCTOPUS", "TURTLE", "LOBSTER", "JELLYFISH"]
        },
        {
            id: 9,
            theme: "Fruits",
            description: "Discover different types of fruit",
            words: ["APPLE", "BANANA", "ORANGE", "GRAPE", "MANGO", "MELON", "KIWI", "PEACH", "PLUM", "CHERRY"]
        },
        {
            id: 10,
            theme: "Computer Terms",
            description: "Identify technology and computing concepts",
            words: ["MOUSE", "PIXEL", "DISK", "MEMORY", "ROUTER", "SERVER", "BROWSER", "KEYBOARD", "MONITOR", "CODE"]
        }
    ];

    // Element references
    const gameBoard = document.getElementById('gameBoard');
    const currentWordDisplay = document.getElementById('currentWord');
    const clearWordBtn = document.getElementById('clearWordBtn');
    const hintBtn = document.getElementById('hintBtn');
    const revealBtn = document.getElementById('revealBtn');
    const foundWordsList = document.getElementById('foundWordsList');
    const messageDisplay = document.getElementById('messageDisplay');
    const foundWordsCount = document.getElementById('foundWordsCount');
    const totalWordsCount = document.getElementById('totalWordsCount');
    const progressBar = document.getElementById('progressBar');
    const gameTheme = document.getElementById('gameTheme');
    const themeDescription = document.getElementById('themeDescription');

    // Modal elements
    const helpModal = document.getElementById('helpModal');
    const statsModal = document.getElementById('statsModal');
    const settingsModal = document.getElementById('settingsModal');
    const gameCompleteModal = document.getElementById('gameCompleteModal');
    const wordListModal = document.getElementById('wordListModal');
    
    const helpBtn = document.getElementById('helpBtn');
    const statsBtn = document.getElementById('statsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const darkThemeToggle = document.getElementById('darkThemeToggle');
    const highContrastToggle = document.getElementById('highContrastToggle');
    const soundToggle = document.getElementById('soundToggle');
    const closeButtons = document.querySelectorAll('.close');
    const shareButton = document.getElementById('shareButton');
    const gameEndShareButton = document.getElementById('gameEndShareButton');
    const playAgainButton = document.getElementById('playAgainButton');
    const completeWordList = document.getElementById('completeWordList');

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
                if (userStats && userStats.gameStats && userStats.gameStats.wordsearch) {
                    const wordsearchStats = userStats.gameStats.wordsearch;
                    gameStats = {
                        gamesPlayed: wordsearchStats.gamesPlayed || 0,
                        gamesWon: wordsearchStats.gamesWon || 0,
                        currentStreak: wordsearchStats.currentStreak || 0,
                        maxStreak: wordsearchStats.maxStreak || 0,
                        hintsUsed: wordsearchStats.hintsUsed || 0,
                        wordsFound: wordsearchStats.wordsFound || 0,
                        avgTime: wordsearchStats.avgTime || 0
                    };
                }
            }
        } catch (error) {
            console.error('Error loading game state from database:', error);
            // Continue with default stats if database fails
        }
        
        // Load settings from localStorage (these are user preferences, not game stats)
        const darkMode = localStorage.getItem('wordsearchDarkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-theme');
            darkThemeToggle.checked = true;
        }
        
        const highContrast = localStorage.getItem('wordsearchHighContrast') === 'true';
        if (highContrast) {
            document.body.classList.add('high-contrast');
            highContrastToggle.checked = true;
        }
        
        const soundEnabled = localStorage.getItem('wordsearchSound') !== 'false'; // Default to true
        soundToggle.checked = soundEnabled;
        
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
                await window.dbManager.updateUserStats(currentUser.username, 'wordsearch', {
                    gamesPlayed: gameStats.gamesPlayed,
                    gamesWon: gameStats.gamesWon,
                    currentStreak: gameStats.currentStreak,
                    maxStreak: gameStats.maxStreak,
                    hintsUsed: gameStats.hintsUsed,
                    wordsFound: gameStats.wordsFound,
                    avgTime: gameStats.avgTime
                });
            }
        } catch (error) {
            console.error('Error saving game state to database:', error);
            // Continue without saving if database fails
        }
        
        // Save settings to localStorage (these are user preferences, not game stats)
        localStorage.setItem('wordsearchDarkMode', document.body.classList.contains('dark-theme'));
        localStorage.setItem('wordsearchHighContrast', document.body.classList.contains('high-contrast'));
        localStorage.setItem('wordsearchSound', soundToggle.checked);
    }

    // Update the statistics display
    function updateStatsDisplay() {
        document.getElementById('gamesPlayed').textContent = gameStats.gamesPlayed;
        document.getElementById('wordsFound').textContent = gameStats.totalWordsFound;
        document.getElementById('hintsUsed').textContent = gameStats.totalHintsUsed;
        
        // Calculate average completion time in minutes
        let avgTime = 0;
        if (gameStats.gamesPlayed > 0) {
            avgTime = Math.round((gameStats.totalCompletionTime / gameStats.gamesPlayed) / 60 * 10) / 10;
        }
        document.getElementById('avgCompletionTime').textContent = avgTime;
    }

    // Choose a random puzzle
    function selectRandomPuzzle() {
        // Get list of previously used puzzles from local storage
        const usedPuzzleIds = JSON.parse(localStorage.getItem('wordsearchUsedPuzzles')) || [];
        
        // Filter out previously used puzzles
        let availablePuzzles = puzzleThemes.filter(puzzle => !usedPuzzleIds.includes(puzzle.id));
        
        // If all puzzles have been used, reset the list
        if (availablePuzzles.length === 0) {
            availablePuzzles = [...puzzleThemes];
            localStorage.setItem('wordsearchUsedPuzzles', JSON.stringify([]));
        }
        
        // Select a random puzzle
        const randomIndex = Math.floor(Math.random() * availablePuzzles.length);
        const puzzle = availablePuzzles[randomIndex];
        
        // Add to used puzzles list
        usedPuzzleIds.push(puzzle.id);
        localStorage.setItem('wordsearchUsedPuzzles', JSON.stringify(usedPuzzleIds));
        
        return puzzle;
    }

    // Initialize the game
    async function initGame() {
        await loadGameState();
        
        // Reset game state
        foundWords = [];
        selectedTiles = [];
        hintsUsed = 0;
        startTime = Date.now();
        gameCompleted = false;
        
        // Get a random puzzle
        currentPuzzle = selectRandomPuzzle();
        words = currentPuzzle.words.map(word => word.toUpperCase());
        
        // Update theme display
        gameTheme.textContent = currentPuzzle.theme;
        themeDescription.textContent = currentPuzzle.description;
        totalWordsCount.textContent = words.length;
        foundWordsCount.textContent = 0;
        
        // Reset progress bar
        updateProgressBar();
        
        // Clear displays
        currentWordDisplay.textContent = '';
        foundWordsList.innerHTML = '';
        
        // Create the grid
        createGrid();
        
        // Display the grid
        displayGrid();
        
        // Set up event listeners
        setupEventListeners();
    }

    // Create a grid with words placed in it
    function createGrid() {
        // Initialize empty grid
        grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
        
        // Sort words by length (longest first to ensure they fit)
        const sortedWords = [...words].sort((a, b) => b.length - a.length);
        
        // Place each word in the grid
        sortedWords.forEach(word => {
            placeWord(word);
        });
        
        // Fill remaining empty cells with random letters
        fillEmptyCells();
    }

    // Place a word in the grid
    function placeWord(word) {
        const directions = [
            [0, 1],   // right
            [1, 0],   // down
            [1, 1],   // diagonal down-right
            [0, -1],  // left
            [-1, 0],  // up
            [-1, -1], // diagonal up-left
            [1, -1],  // diagonal down-left
            [-1, 1]   // diagonal up-right
        ];
        
        // Shuffle directions for variety
        shuffleArray(directions);
        
        // Try each direction until the word fits
        for (const [dx, dy] of directions) {
            // Try different starting positions
            for (let attempt = 0; attempt < 50; attempt++) {
                const startX = Math.floor(Math.random() * gridSize);
                const startY = Math.floor(Math.random() * gridSize);
                
                // Check if word fits in this direction from this starting point
                if (wordFits(word, startX, startY, dx, dy)) {
                    // Place the word
                    for (let i = 0; i < word.length; i++) {
                        const x = startX + i * dx;
                        const y = startY + i * dy;
                        grid[y][x] = word[i];
                    }
                    return true;
                }
            }
        }
        
        // If we couldn't place the word after all attempts
        console.warn(`Could not place word: ${word}`);
        return false;
    }

    // Check if a word fits in the grid at the given position and direction
    function wordFits(word, startX, startY, dx, dy) {
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * dx;
            const y = startY + i * dy;
            
            // Check if position is within grid bounds
            if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) {
                return false;
            }
            
            // Check if cell is empty or has the same letter
            if (grid[y][x] !== '' && grid[y][x] !== word[i]) {
                return false;
            }
        }
        
        return true;
    }

    // Fill empty cells with random letters
    function fillEmptyCells() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (grid[y][x] === '') {
                    grid[y][x] = letters.charAt(Math.floor(Math.random() * letters.length));
                }
            }
        }
    }

    // Display the grid on the game board
    function displayGrid() {
        // Clear the game board
        gameBoard.innerHTML = '';
        
        // Set the grid template
        gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        
        // Create tiles for each cell
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.textContent = grid[y][x];
                tile.dataset.x = x;
                tile.dataset.y = y;
                
                gameBoard.appendChild(tile);
            }
        }
    }

    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Handle tile click
    function handleTileClick(event) {
        if (gameCompleted) return;
        
        const tile = event.target;
        
        // Get coordinates
        const x = parseInt(tile.dataset.x);
        const y = parseInt(tile.dataset.y);
        
        // Check if already selected
        const tileIndex = selectedTiles.findIndex(t => t.x === x && t.y === y);
        
        if (tileIndex !== -1) {
            // If it's the last tile, deselect it
            if (tileIndex === selectedTiles.length - 1) {
                tile.classList.remove('selected');
                selectedTiles.pop();
                updateCurrentWord();
            }
            return;
        }
        
        // If no tiles selected yet, or this tile is adjacent to the last selected tile
        if (selectedTiles.length === 0 || isAdjacent(x, y, selectedTiles[selectedTiles.length - 1])) {
            // Add to selected tiles
            tile.classList.add('selected');
            selectedTiles.push({ x, y, letter: grid[y][x] });
            updateCurrentWord();
            
            // Check if this forms a valid word
            const currentWord = getCurrentWord();
            if (currentWord.length >= 3 && words.includes(currentWord)) {
                // Word found!
                handleWordFound(currentWord);
            }
        }
    }

    // Check if two tiles are adjacent (including diagonals)
    function isAdjacent(x1, y1, tile2) {
        const x2 = tile2.x;
        const y2 = tile2.y;
        
        // Check if they're within 1 cell of each other
        return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
    }

    // Get the current word from selected tiles
    function getCurrentWord() {
        return selectedTiles.map(tile => tile.letter).join('');
    }

    // Update the current word display
    function updateCurrentWord() {
        currentWordDisplay.textContent = getCurrentWord();
    }

    // Handle when a word is found
    function handleWordFound(word) {
        // Check if already found
        if (foundWords.includes(word)) {
            showMessage('Word already found!', 'error');
            clearSelectedTiles();
            return;
        }
        
        // Add to found words
        foundWords.push(word);
        
        // Play success sound if enabled
        playSound('success');
        
        // Mark selected tiles as found
        selectedTiles.forEach(tile => {
            const tileElement = document.querySelector(`.tile[data-x="${tile.x}"][data-y="${tile.y}"]`);
            tileElement.classList.remove('selected');
            tileElement.classList.add('found');
        });
        
        // Add to found words list
        const wordElement = document.createElement('div');
        wordElement.className = 'found-word';
        wordElement.textContent = word;
        foundWordsList.appendChild(wordElement);
        
        // Update found words count
        foundWordsCount.textContent = foundWords.length;
        
        // Update progress bar
        updateProgressBar();
        
        // Clear selected tiles
        selectedTiles = [];
        currentWordDisplay.textContent = '';
        
        // Show success message
        showMessage(`Found: ${word}!`, 'success');
        
        // Check if all words are found
        if (foundWords.length === words.length) {
            gameComplete();
        }
    }

    // Update the progress bar
    function updateProgressBar() {
        const progress = (foundWords.length / words.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Play a sound effect
    function playSound(type) {
        if (!soundToggle.checked) return;
        
        // Use AudioContext for browser compatibility
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'success') {
            // Success sound (ascending notes)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'error') {
            // Error sound (descending notes)
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'hint') {
            // Hint sound (two notes)
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        }
    }

    // Show a message to the user
    function showMessage(text, type = '') {
        messageDisplay.textContent = text;
        messageDisplay.className = 'message-display show';
        if (type) {
            messageDisplay.classList.add(type);
        }
        
        // Play sound for error messages
        if (type === 'error') {
            playSound('error');
        }
        
        // Clear message after a few seconds
        setTimeout(() => {
            messageDisplay.classList.remove('show');
        }, 3000);
    }

    // Clear all selected tiles
    function clearSelectedTiles() {
        // Remove selected class from tiles
        selectedTiles.forEach(tile => {
            const tileElement = document.querySelector(`.tile[data-x="${tile.x}"][data-y="${tile.y}"]`);
            tileElement.classList.remove('selected');
        });
        
        // Clear selected tiles array
        selectedTiles = [];
        currentWordDisplay.textContent = '';
    }

    // Give a hint (highlight a letter from an unfound word)
    function giveHint() {
        // Find unfound words
        const unfoundWords = words.filter(word => !foundWords.includes(word));
        
        if (unfoundWords.length === 0) {
            return;
        }
        
        // Select a random unfound word
        const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
        
        // Find this word in the grid
        const wordPositions = findWordInGrid(randomWord);
        
        if (wordPositions.length > 0) {
            // Select a random letter position
            const randomPosition = wordPositions[Math.floor(Math.random() * wordPositions.length)];
            
            // Highlight this tile
            const tile = document.querySelector(`.tile[data-x="${randomPosition.x}"][data-y="${randomPosition.y}"]`);
            
            // Remove any existing hint classes
            const existingHints = document.querySelectorAll('.tile.hint');
            existingHints.forEach(hint => hint.classList.remove('hint'));
            
            // Add hint class
            tile.classList.add('hint');
            
            // Increment hints used
            hintsUsed++;
            
            // Play hint sound
            playSound('hint');
            
            // Show message
            showMessage('Hint: Check the highlighted letter');
            
            // Remove hint after a few seconds
            setTimeout(() => {
                tile.classList.remove('hint');
            }, 5000);
        }
    }

    // Find all positions of a word in the grid
    function findWordInGrid(word) {
        const positions = [];
        
        // Check every cell
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                // If this cell matches the first letter
                if (grid[y][x] === word[0]) {
                    // Check each direction
                    const directions = [
                        [0, 1],   // right
                        [1, 0],   // down
                        [1, 1],   // diagonal down-right
                        [0, -1],  // left
                        [-1, 0],  // up
                        [-1, -1], // diagonal up-left
                        [1, -1],  // diagonal down-left
                        [-1, 1]   // diagonal up-right
                    ];
                    
                    for (const [dx, dy] of directions) {
                        // Check if word fits in this direction
                        let matches = true;
                        const wordPositions = [];
                        
                        for (let i = 0; i < word.length; i++) {
                            const checkX = x + i * dx;
                            const checkY = y + i * dy;
                            
                            // Check bounds
                            if (checkX < 0 || checkX >= gridSize || checkY < 0 || checkY >= gridSize) {
                                matches = false;
                                break;
                            }
                            
                            // Check letter
                            if (grid[checkY][checkX] !== word[i]) {
                                matches = false;
                                break;
                            }
                            
                            wordPositions.push({ x: checkX, y: checkY });
                        }
                        
                        if (matches) {
                            // We found the word!
                            positions.push(...wordPositions);
                            // Only need to find it once
                            return positions;
                        }
                    }
                }
            }
        }
        
        return positions;
    }

    // Reveal a complete word
    function revealWord() {
        // Find unfound words
        const unfoundWords = words.filter(word => !foundWords.includes(word));
        
        if (unfoundWords.length === 0) {
            return;
        }
        
        // Select a random unfound word
        const randomWord = unfoundWords[Math.floor(Math.random() * unfoundWords.length)];
        
        // Find this word in the grid
        const wordPositions = findWordInGrid(randomWord);
        
        if (wordPositions.length > 0) {
            // Create fake "selected tiles" to match the word
            selectedTiles = wordPositions.map(pos => ({
                x: pos.x,
                y: pos.y,
                letter: grid[pos.y][pos.x]
            }));
            
            // Highlight these tiles
            selectedTiles.forEach(tile => {
                const tileElement = document.querySelector(`.tile[data-x="${tile.x}"][data-y="${tile.y}"]`);
                tileElement.classList.add('selected');
            });
            
            // Update current word
            updateCurrentWord();
            
            // Show message
            showMessage(`Revealing word: ${randomWord}`);
            
            // Count this as using multiple hints
            hintsUsed += 3;
            
            // After a brief delay, mark the word as found
            setTimeout(() => {
                handleWordFound(randomWord);
            }, 1500);
        }
    }

    // Handle game completion
    function gameComplete() {
        gameCompleted = true;
        const endTime = Date.now();
        const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds
        
        // Update game statistics
        gameStats.gamesPlayed++;
        gameStats.totalWordsFound += words.length;
        gameStats.totalHintsUsed += hintsUsed;
        gameStats.totalCompletionTime += timeTaken;
        
        // Save stats
        saveGameState();
        updateStatsDisplay();
        
        // Format time for display
        const minutes = Math.floor(timeTaken / 60);
        const seconds = timeTaken % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update completion message
        document.getElementById('completionMessage').textContent = 
            `Great job! You found all ${words.length} words related to "${currentPuzzle.theme}".`;
        
        document.getElementById('completionTime').textContent = timeString;
        document.getElementById('completionWordsFound').textContent = `${words.length}/${words.length}`;
        document.getElementById('completionHintsUsed').textContent = hintsUsed;
        
        // Show game completion modal
        showModal(gameCompleteModal);
    }

    // Generate share text for social sharing
    function generateShareText() {
        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', { 
            month: 'numeric', day: 'numeric', year: '2-digit'
        });
        
        let shareText = `Word Strands (${dateString})\n`;
        shareText += `Theme: ${currentPuzzle.theme}\n`;
        shareText += `Words Found: ${foundWords.length}/${words.length}\n`;
        shareText += `Hints Used: ${hintsUsed}\n\n`;
        
        // Add emojis for each found word
        const emojiMap = ['🟦', '🟩', '🟪', '🟨'];
        let emojiString = '';
        
        for (let i = 0; i < words.length; i++) {
            const wordIndex = i % 4;
            if (foundWords.includes(words[i])) {
                emojiString += emojiMap[wordIndex];
            } else {
                emojiString += '⬜';
            }
            if ((i + 1) % 4 === 0) emojiString += '\n';
        }
        
        shareText += emojiString + '\n';
        shareText += 'Play at Puzzle Grove!';
        
        return shareText;
    }

    // Share results
    function shareResults() {
        const shareText = generateShareText();
        
        if (navigator.share) {
            navigator.share({
                title: 'My Word Strands Results',
                text: shareText
            }).catch(console.error);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    showMessage('Results copied to clipboard');
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    alert(shareText);
                });
        } else {
            alert(shareText);
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        // Tile clicks
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.addEventListener('click', handleTileClick);
        });
        
        // Button clicks
        clearWordBtn.addEventListener('click', clearSelectedTiles);
        hintBtn.addEventListener('click', giveHint);
        revealBtn.addEventListener('click', revealWord);
        
        // Modal buttons
        helpBtn.addEventListener('click', () => showModal(helpModal));
        statsBtn.addEventListener('click', () => showModal(statsModal));
        settingsBtn.addEventListener('click', () => showModal(settingsModal));
        
        // Close modal buttons
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                hideModal(modal);
            });
        });
        
        // Settings toggles
        darkThemeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-theme', darkThemeToggle.checked);
            saveGameState();
        });
        
        highContrastToggle.addEventListener('change', () => {
            document.body.classList.toggle('high-contrast', highContrastToggle.checked);
            saveGameState();
        });
        
        soundToggle.addEventListener('change', () => {
            saveGameState();
        });
        
        // Share buttons
        shareButton.addEventListener('click', shareResults);
        gameEndShareButton.addEventListener('click', shareResults);
        
        // Play again button
        playAgainButton.addEventListener('click', async () => {
            hideModal(gameCompleteModal);
            await initGame();
        });
        
        // Click outside modal to close
        document.addEventListener('click', event => {
            if (event.target.classList.contains('modal')) {
                hideModal(event.target);
            }
        });
        
        // Keyboard support
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    hideModal(openModal);
                } else {
                    clearSelectedTiles();
                }
            }
        });
    }

    // Show a modal
    function showModal(modal) {
        modal.classList.add('show');
        
        setTimeout(() => {
            modal.querySelector('.modal-content').style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'translateY(0)';
        }, 10);
        
        // If word list modal, populate it
        if (modal === wordListModal) {
            completeWordList.innerHTML = '';
            
            words.forEach(word => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-item';
                if (foundWords.includes(word)) {
                    wordItem.classList.add('found');
                }
                wordItem.textContent = word;
                completeWordList.appendChild(wordItem);
            });
        }
    }

    // Hide a modal
    function hideModal(modal) {
        modal.querySelector('.modal-content').style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            modal.classList.remove('show');
        }, 300);
    }

    // Start the game
    try {
        await initGame();
    } catch (error) {
        console.error('Error initializing game:', error);
        // Fallback: try to load without database
        try {
            await loadGameState();
        } catch (fallbackError) {
            console.error('Fallback loadGameState failed:', fallbackError);
        }
    }
});