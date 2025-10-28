// Connections Game Logic
document.addEventListener('DOMContentLoaded', async function() {
    // Game variables
    let currentPuzzle = null;
    let selectedTiles = [];
    let foundGroups = [];
    let mistakesCount = 0;
    let gameOver = false;
    let allWords = [];

    // Game statistics
    let gameStats = {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        mistakesAvg: 0
    };

    // Element references
    const gameBoard = document.querySelector('.game-board');
    const messageDisplay = document.getElementById('messageDisplay');
    const mistakesCounter = document.getElementById('mistakesCount');
    const groupsContainer = document.querySelector('.groups-container');
    const submitBtn = document.getElementById('submitBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const deselectBtn = document.getElementById('deselectBtn');
    
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
                if (userStats && userStats.gameStats && userStats.gameStats.connections) {
                    const connectionsStats = userStats.gameStats.connections;
                    gameStats = {
                        gamesPlayed: connectionsStats.gamesPlayed || 0,
                        gamesWon: connectionsStats.gamesWon || 0,
                        currentStreak: connectionsStats.currentStreak || 0,
                        maxStreak: connectionsStats.maxStreak || 0,
                        mistakesAvg: connectionsStats.mistakesAvg || 0
                    };
                }
            }
        } catch (error) {
            console.error('Error loading game state from database:', error);
            // Continue with default stats if database fails
        }
        
        // Load settings from localStorage (these are user preferences, not game stats)
        const darkMode = localStorage.getItem('connectionsDarkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-theme');
            darkThemeToggle.checked = true;
        }
        
        const highContrast = localStorage.getItem('connectionsHighContrast') === 'true';
        if (highContrast) {
            document.body.classList.add('high-contrast');
            highContrastToggle.checked = true;
        }
        
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
                await window.dbManager.updateUserStats(currentUser.username, 'connections', {
                    gamesPlayed: gameStats.gamesPlayed,
                    gamesWon: gameStats.gamesWon,
                    currentStreak: gameStats.currentStreak,
                    maxStreak: gameStats.maxStreak,
                    mistakesAvg: gameStats.mistakesAvg
                });
            }
        } catch (error) {
            console.error('Error saving game state to database:', error);
            // Continue without saving if database fails
        }
        
        // Save settings to localStorage (these are user preferences, not game stats)
        localStorage.setItem('connectionsDarkMode', document.body.classList.contains('dark-theme'));
        localStorage.setItem('connectionsHighContrast', document.body.classList.contains('high-contrast'));
    }

    // Update the statistics display
    function updateStatsDisplay() {
        document.getElementById('gamesPlayed').textContent = gameStats.gamesPlayed;
        
        const winPercentage = gameStats.gamesPlayed > 0 ? 
            Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100) : 0;
        document.getElementById('winPercentage').textContent = winPercentage;
        
        document.getElementById('currentStreak').textContent = gameStats.currentStreak;
        document.getElementById('maxStreak').textContent = gameStats.maxStreak;
    }

    // Fetch puzzles from JSON file
    async function fetchPuzzles() {
        try {
            const response = await fetch('connections_words.json');
            if (!response.ok) {
                throw new Error('Failed to load puzzles');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading puzzles:', error);
            showMessage('Error loading puzzles. Please try again later.', 'error');
            return [];
        }
    }

    // Choose a random puzzle
    async function selectRandomPuzzle() {
        const puzzles = await fetchPuzzles();
        if (puzzles.length === 0) {
            return null;
        }
        
        // Get list of previously used puzzles from local storage
        const usedPuzzleIds = JSON.parse(localStorage.getItem('connectionsUsedPuzzles')) || [];
        
        // Filter out previously used puzzles
        let availablePuzzles = puzzles.filter(puzzle => !usedPuzzleIds.includes(puzzle.id));
        
        // If all puzzles have been used, reset the list
        if (availablePuzzles.length === 0) {
            availablePuzzles = [...puzzles];
            localStorage.setItem('connectionsUsedPuzzles', JSON.stringify([]));
        }
        
        // Select a random puzzle
        const randomIndex = Math.floor(Math.random() * availablePuzzles.length);
        const puzzle = availablePuzzles[randomIndex];
        
        // Add to used puzzles list
        usedPuzzleIds.push(puzzle.id);
        localStorage.setItem('connectionsUsedPuzzles', JSON.stringify(usedPuzzleIds));
        
        return puzzle;
    }

    // Initialize the game
    async function initGame() {
        await loadGameState();
        
        // Get a random puzzle
        currentPuzzle = await selectRandomPuzzle();
        if (!currentPuzzle) {
            showMessage('Failed to load puzzle. Please try again.', 'error');
            return;
        }
        
        // Reset game state
        selectedTiles = [];
        foundGroups = [];
        mistakesCount = 0;
        gameOver = false;
        
        // Update mistakes counter
        mistakesCounter.textContent = mistakesCount;
        
        // Clear the game board and groups container
        gameBoard.innerHTML = '';
        groupsContainer.innerHTML = '';
        
        // Create all words array and shuffle
        allWords = [];
        currentPuzzle.answers.forEach(group => {
            group.members.forEach(word => {
                allWords.push({
                    word: word,
                    level: group.level,
                    group: group.group
                });
            });
        });
        
        // Shuffle the words
        shuffleArray(allWords);
        
        // Create tiles for the game board
        createTiles();
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Create tiles for the words
    function createTiles() {
        allWords.forEach((item, index) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = item.word;
            tile.dataset.index = index;
            tile.dataset.level = item.level;
            tile.dataset.group = item.group;
            
            tile.addEventListener('click', () => {
                if (gameOver || tile.classList.contains('found')) return;
                
                const tileIndex = parseInt(tile.dataset.index);
                const selectedIndex = selectedTiles.findIndex(i => i === tileIndex);
                
                if (selectedIndex !== -1) {
                    // Deselect tile
                    tile.classList.remove('selected');
                    selectedTiles.splice(selectedIndex, 1);
                } else {
                    // Select tile (max 4)
                    if (selectedTiles.length < 4) {
                        tile.classList.add('selected');
                        selectedTiles.push(tileIndex);
                    }
                }
                
                // Update submit button state
                submitBtn.disabled = selectedTiles.length !== 4;
            });
            
            gameBoard.appendChild(tile);
        });
    }
    
    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Show a message to the user
    function showMessage(text, type = '') {
        messageDisplay.textContent = text;
        messageDisplay.className = 'message-display show';
        if (type) {
            messageDisplay.classList.add(type);
        }
        
        // Clear message after a few seconds
        setTimeout(() => {
            messageDisplay.classList.remove('show');
        }, 3000);
    }
    
    // Check if selected tiles form a valid group
    function checkSelectedGroup() {
        if (selectedTiles.length !== 4) return false;
        
        // Get the level (group) of the first selected tile
        const level = allWords[selectedTiles[0]].level;
        
        // Check if all selected tiles have the same level
        return selectedTiles.every(index => allWords[index].level === level);
    }
    
    // Handle submission of a group
    function submitSelectedGroup() {
        if (selectedTiles.length !== 4) return;
        
        const isValid = checkSelectedGroup();
        if (isValid) {
            // Get the group info from the first selected tile
            const groupLevel = allWords[selectedTiles[0]].level;
            const groupName = allWords[selectedTiles[0]].group;
            
            // Mark tiles as found
            selectedTiles.forEach(index => {
                const tile = document.querySelector(`.tile[data-index="${index}"]`);
                tile.classList.remove('selected');
                tile.classList.add('found');
            });
            
            // Create and display the found group
            const groupElement = document.createElement('div');
            groupElement.className = 'found-group';
            groupElement.dataset.level = groupLevel;
            
            const titleElement = document.createElement('div');
            titleElement.className = 'group-title';
            titleElement.textContent = groupName;
            
            const membersElement = document.createElement('div');
            membersElement.className = 'group-members';
            
            selectedTiles.forEach(index => {
                const memberElement = document.createElement('div');
                memberElement.className = 'group-member';
                memberElement.textContent = allWords[index].word;
                membersElement.appendChild(memberElement);
            });
            
            groupElement.appendChild(titleElement);
            groupElement.appendChild(membersElement);
            groupsContainer.appendChild(groupElement);
            
            // Add to found groups
            foundGroups.push(groupLevel);
            
            // Clear selected tiles
            selectedTiles = [];
            
            // Show success message
            showMessage('Group found!', 'success');
            
            // Check for game completion
            if (foundGroups.length === 4) {
                gameComplete(true);
            }
        } else {
            // Shake the selected tiles
            selectedTiles.forEach(index => {
                const tile = document.querySelector(`.tile[data-index="${index}"]`);
                tile.classList.add('shake');
                setTimeout(() => {
                    tile.classList.remove('shake');
                    tile.classList.remove('selected');
                }, 500);
            });
            
            // Increment mistakes
            mistakesCount++;
            mistakesCounter.textContent = mistakesCount;
            
            // Check for game over (4 mistakes)
            if (mistakesCount >= 4) {
                gameComplete(false);
            } else {
                // Show error message
                showMessage('Not a group. Try again!', 'error');
                
                // Clear selected tiles
                selectedTiles = [];
            }
        }
        
        // Update submit button state
        submitBtn.disabled = true;
    }
    
    // Shuffle the tiles
    function shuffleTiles() {
        // Only shuffle tiles that haven't been found yet
        const remainingWordIndices = [];
        for (let i = 0; i < allWords.length; i++) {
            if (!selectedTiles.includes(i) && !foundGroups.includes(allWords[i].level)) {
                remainingWordIndices.push(i);
            }
        }
        
        shuffleArray(remainingWordIndices);
        
        // Create a new array of shuffled words
        const newWords = [...allWords];
        let currentIndex = 0;
        
        for (let i = 0; i < newWords.length; i++) {
            // Skip found tiles
            if (foundGroups.includes(newWords[i].level)) continue;
            
            // Replace this word with a shuffled one
            if (currentIndex < remainingWordIndices.length) {
                const newIndex = remainingWordIndices[currentIndex];
                newWords[i] = allWords[newIndex];
                currentIndex++;
            }
        }
        
        // Update the DOM
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach((tile, index) => {
            if (!tile.classList.contains('found')) {
                const wordData = newWords[index];
                tile.textContent = wordData.word;
                tile.dataset.index = index;
                tile.dataset.level = wordData.level;
                tile.dataset.group = wordData.group;
                tile.classList.remove('selected');
            }
        });
        
        // Reset selected tiles
        selectedTiles = [];
        
        // Update submit button state
        submitBtn.disabled = true;
        
        // Update allWords array
        allWords = newWords;
    }
    
    // Deselect all tiles
    function deselectAllTiles() {
        const tiles = document.querySelectorAll('.tile.selected');
        tiles.forEach(tile => {
            tile.classList.remove('selected');
        });
        
        selectedTiles = [];
        
        // Update submit button state
        submitBtn.disabled = true;
    }
    
    // Handle game completion
    function gameComplete(isWin) {
        gameOver = true;
        
        // Update game statistics
        gameStats.gamesPlayed++;
        
        if (isWin) {
            gameStats.gamesWon++;
            gameStats.currentStreak++;
            if (gameStats.currentStreak > gameStats.maxStreak) {
                gameStats.maxStreak = gameStats.currentStreak;
            }
            
            // Calculate average mistakes
            const totalMistakes = (gameStats.mistakesAvg * (gameStats.gamesPlayed - 1)) + mistakesCount;
            gameStats.mistakesAvg = Math.round((totalMistakes / gameStats.gamesPlayed) * 10) / 10;
        } else {
            gameStats.currentStreak = 0;
        }
        
        // Save game stats
        saveGameState();
        updateStatsDisplay();
        
        // Show end game message
        const message = isWin 
            ? `Great job! You completed the puzzle with ${mistakesCount} mistake${mistakesCount !== 1 ? 's' : ''}!`
            : 'Game over! You made 4 mistakes. Better luck next time!';
        
        document.getElementById('gameEndMessage').textContent = message;
        
        // If game over due to mistakes, reveal remaining groups
        if (!isWin) {
            revealRemainingGroups();
        }
        
        // Show game end modal
        showModal(gameEndModal);
    }
    
    // Reveal remaining groups when game is lost
    function revealRemainingGroups() {
        const remainingLevels = [0, 1, 2, 3].filter(level => !foundGroups.includes(level));
        
        remainingLevels.forEach(level => {
            // Find all tiles for this group
            const tilesForGroup = [];
            allWords.forEach((word, index) => {
                if (word.level === level) {
                    tilesForGroup.push(index);
                    
                    // Mark the tile as found
                    const tile = document.querySelector(`.tile[data-index="${index}"]`);
                    tile.classList.remove('selected');
                    tile.classList.add('found');
                }
            });
            
            // Create and display the found group
            const groupData = currentPuzzle.answers.find(group => group.level === level);
            
            const groupElement = document.createElement('div');
            groupElement.className = 'found-group';
            groupElement.dataset.level = level;
            
            const titleElement = document.createElement('div');
            titleElement.className = 'group-title';
            titleElement.textContent = groupData.group;
            
            const membersElement = document.createElement('div');
            membersElement.className = 'group-members';
            
            groupData.members.forEach(word => {
                const memberElement = document.createElement('div');
                memberElement.className = 'group-member';
                memberElement.textContent = word;
                membersElement.appendChild(memberElement);
            });
            
            groupElement.appendChild(titleElement);
            groupElement.appendChild(membersElement);
            groupsContainer.appendChild(groupElement);
        });
    }
    
    // Generate share text for social sharing
    function generateShareText() {
        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', { 
            month: 'numeric', day: 'numeric', year: '2-digit'
        });
        
        let shareText = `Connections (${dateString})\n`;
        
        // Add emoji grid representation
        // Yellow 🟨, Green 🟩, Blue 🟦, Purple 🟪
        const emojiMap = {
            '0': '🟨',
            '1': '🟩',
            '2': '🟦',
            '3': '🟪'
        };
        
        // Sort found groups by level
        const sortedGroups = [...foundGroups].sort((a, b) => a - b);
        
        // Add an emoji for each found group
        sortedGroups.forEach(level => {
            shareText += emojiMap[level];
        });
        
        // Add X for each mistake
        for (let i = 0; i < mistakesCount; i++) {
            shareText += '❌';
        }
        
        shareText += '\n\nPlay at Puzzle Grove!';
        
        return shareText;
    }
    
    // Share results
    function shareResults() {
        const shareText = generateShareText();
        
        if (navigator.share) {
            navigator.share({
                title: 'My Connections Results',
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
        // Game control buttons
        submitBtn.addEventListener('click', submitSelectedGroup);
        submitBtn.disabled = true;
        
        shuffleBtn.addEventListener('click', shuffleTiles);
        deselectBtn.addEventListener('click', deselectAllTiles);
        
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
        
        // Share buttons
        shareButton.addEventListener('click', shareResults);
        gameEndShareButton.addEventListener('click', shareResults);
        
        // Play again button
        playAgainButton.addEventListener('click', async () => {
            hideModal(gameEndModal);
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