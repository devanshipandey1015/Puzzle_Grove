// Anagrams.js - Logic for the Anagrams puzzle game

document.addEventListener('DOMContentLoaded', async function() {
    // DOM elements
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const submitButton = document.getElementById('submit-button');
    const nextButton = document.getElementById('next-button');
    const hintButton = document.getElementById('hint-button');
    const answerInput = document.getElementById('answer-input');
    const anagramDisplay = document.getElementById('anagram-word');
    const feedbackMessage = document.getElementById('feedback-message');
    const currentThemeDisplay = document.getElementById('current-theme');
    const wordsSolvedDisplay = document.getElementById('words-solved');
    const solvedList = document.getElementById('solved-list');
    const messageDisplay = document.getElementById('messageDisplay');
    
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
    const difficultySelect = document.getElementById('difficultySelect');
    const closeButtons = document.querySelectorAll('.close');
    const shareButton = document.getElementById('shareButton');
    const gameEndShareButton = document.getElementById('gameEndShareButton');
    const playAgainButton = document.getElementById('playAgainButton');
    const gameEndMessage = document.getElementById('gameEndMessage');
    
    // Game state
    let currentTheme = "";
    let currentWordIndex = 0;
    let solvedWords = [];
    let currentAnswer = "";
    let gameActive = false;
    let hasGivenHint = false;
    let difficulty = 'normal';
    
    // Game statistics
    let gameStats = {
        gamesPlayed: 0,
        wordsGuessed: 0,
        themesCompleted: 0,
        currentStreak: 0,
        maxStreak: 0
    };
    
    // Themes with 5 words each (all 6+ letters)
    const themes = {
        animals: [
            { word: "elephant", hint: "Has a trunk" },
            { word: "giraffe", hint: "Tallest land animal" },
            { word: "dolphin", hint: "Intelligent marine mammal" },
            { word: "panther", hint: "Black big cat" },
            { word: "penguin", hint: "Flightless bird in tuxedo" }
        ],
        countries: [
            { word: "germany", hint: "Known for engineering and beer" },
            { word: "brazil", hint: "Famous for carnival and soccer" },
            { word: "australia", hint: "Known for kangaroos" },
            { word: "thailand", hint: "Known as the Land of Smiles" },
            { word: "jamaica", hint: "Birthplace of reggae music" }
        ],
        occupations: [
            { word: "surgeon", hint: "Performs operations" },
            { word: "teacher", hint: "Works in schools" },
            { word: "architect", hint: "Designs buildings" },
            { word: "scientist", hint: "Conducts research" },
            { word: "musician", hint: "Creates and performs songs" }
        ],
        foods: [
            { word: "pancake", hint: "Breakfast dish with syrup" },
            { word: "lasagna", hint: "Italian layered pasta dish" },
            { word: "burrito", hint: "Wrapped Mexican food" },
            { word: "spaghetti", hint: "Long, thin pasta" },
            { word: "avocado", hint: "Green fruit used in guacamole" }
        ],
        space: [
            { word: "planet", hint: "Orbits a star" },
            { word: "galaxy", hint: "Collection of stars" },
            { word: "asteroid", hint: "Space rock" },
            { word: "satellite", hint: "Object that orbits another" },
            { word: "universe", hint: "All of space and time" }
        ]
    };
    
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
                if (userStats && userStats.gameStats && userStats.gameStats.anagrams) {
                    const anagramsStats = userStats.gameStats.anagrams;
                    gameStats = {
                        gamesPlayed: anagramsStats.gamesPlayed || 0,
                        wordsGuessed: anagramsStats.wordsGuessed || 0,
                        themesCompleted: anagramsStats.themesCompleted || 0,
                        currentStreak: anagramsStats.currentStreak || 0,
                        maxStreak: anagramsStats.maxStreak || 0
                    };
                }
            }
        } catch (error) {
            console.error('Error loading game state from database:', error);
            // Continue with default stats if database fails
        }
        
        // Load settings from localStorage (these are user preferences, not game stats)
        const darkMode = localStorage.getItem('anagramsDarkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-theme');
            darkThemeToggle.checked = true;
        }
        
        const highContrast = localStorage.getItem('anagramsHighContrast') === 'true';
        if (highContrast) {
            document.body.classList.add('high-contrast');
            highContrastToggle.checked = true;
        }
        
        difficulty = localStorage.getItem('anagramsDifficulty') || 'normal';
        difficultySelect.value = difficulty;
        
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
                await window.dbManager.updateUserStats(currentUser.username, 'anagrams', {
                    gamesPlayed: gameStats.gamesPlayed,
                    wordsGuessed: gameStats.wordsGuessed,
                    themesCompleted: gameStats.themesCompleted,
                    currentStreak: gameStats.currentStreak,
                    maxStreak: gameStats.maxStreak
                });
            }
        } catch (error) {
            console.error('Error saving game state to database:', error);
            // Continue without saving if database fails
        }
        
        // Save settings to localStorage (these are user preferences, not game stats)
        localStorage.setItem('anagramsDarkMode', document.body.classList.contains('dark-theme'));
        localStorage.setItem('anagramsHighContrast', document.body.classList.contains('high-contrast'));
        localStorage.setItem('anagramsDifficulty', difficulty);
    }

    // Update the statistics display
    function updateStatsDisplay() {
        document.getElementById('gamesPlayed').textContent = gameStats.gamesPlayed;
        document.getElementById('wordsGuessed').textContent = gameStats.wordsGuessed;
        document.getElementById('currentStreak').textContent = gameStats.currentStreak;
        document.getElementById('maxStreak').textContent = gameStats.maxStreak;
    }
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetGame);
    submitButton.addEventListener('click', checkAnswer);
    nextButton.addEventListener('click', nextWord);
    hintButton.addEventListener('click', showHint);
    
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
    
    difficultySelect.addEventListener('change', () => {
        difficulty = difficultySelect.value;
        saveGameState();
        
        // Update UI based on difficulty
        if (difficulty === 'hard' && gameActive) {
            hintButton.disabled = true;
            showMessage('Hint button disabled in hard mode', 'error');
        } else if (gameActive) {
            hintButton.disabled = false;
        }
    });
    
    // Share buttons
    shareButton.addEventListener('click', shareResults);
    gameEndShareButton.addEventListener('click', shareResults);
    
    // Play again button
    playAgainButton.addEventListener('click', () => {
        hideModal(gameEndModal);
        resetGame();
    });
    
    // Escape key closes modals
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                hideModal(openModal);
            }
        }
    });
    
    // Enter key submission
    answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && gameActive) {
            checkAnswer();
        }
    });
    
    // Function to scramble a word (generate anagram)
    function scrambleWord(word) {
        const wordArray = word.split('');
        
        // Keep shuffling until we get a different arrangement
        let scrambled = word;
        while (scrambled === word) {
            for (let i = wordArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
            }
            scrambled = wordArray.join('');
        }
        
        return scrambled;
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
    
    // Show message
    function showMessage(message, type = 'info') {
        messageDisplay.textContent = message;
        messageDisplay.className = 'message-display ' + type;
        
        // Auto-hide after a few seconds
        setTimeout(() => {
            messageDisplay.textContent = '';
            messageDisplay.className = 'message-display';
        }, 3000);
    }
    
    // Share results
    function shareResults() {
        const themesPlayed = gameStats.gamesPlayed;
        const themesCompleted = gameStats.themesCompleted;
        const wordsGuessed = gameStats.wordsGuessed;
        const streak = gameStats.currentStreak;
        
        let shareText = `🧩 Puzzle Grove: Anagrams 🧩\n\n`;
        shareText += `Themes Played: ${themesPlayed}\n`;
        shareText += `Themes Completed: ${themesCompleted}\n`;
        shareText += `Words Solved: ${wordsGuessed}\n`;
        shareText += `Current Streak: ${streak}\n\n`;
        shareText += `Play now at puzzlegrove.com`;
        
        try {
            if (navigator.share) {
                navigator.share({
                    title: 'My Puzzle Grove Anagrams Results',
                    text: shareText
                });
            } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(shareText);
                showMessage('Results copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Error sharing results:', error);
            showMessage('Error sharing results', 'error');
        }
    }

    // Function to get a random theme
    function getRandomTheme() {
        const themeKeys = Object.keys(themes);
        const randomIndex = Math.floor(Math.random() * themeKeys.length);
        return themeKeys[randomIndex];
    }
    
    // Function to start the game
    function startGame() {
        currentTheme = getRandomTheme();
        currentWordIndex = 0;
        solvedWords = [];
        gameActive = true;
        
        // Update stats
        gameStats.gamesPlayed++;
        saveGameState();
        updateStatsDisplay();
        
        // Update UI
        currentThemeDisplay.textContent = `Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`;
        wordsSolvedDisplay.textContent = `0/5 words solved`;
        solvedList.innerHTML = '';
        feedbackMessage.textContent = '';
        feedbackMessage.className = '';
        
        // Enable game controls
        answerInput.disabled = false;
        submitButton.disabled = false;
        
        // Handle hint button based on difficulty
        if (difficulty === 'hard') {
            hintButton.disabled = true;
        } else {
            hintButton.disabled = false;
        }
        
        nextButton.disabled = true;
        
        // Display first word
        displayCurrentWord();
        
        showMessage(`Starting ${currentTheme} theme!`, 'success');
    }
    
    // Function to display the current word
    function displayCurrentWord() {
        if (currentWordIndex < themes[currentTheme].length) {
            currentAnswer = themes[currentTheme][currentWordIndex].word;
            const scrambledWord = scrambleWord(currentAnswer);
            anagramDisplay.textContent = scrambledWord.toUpperCase();
            answerInput.value = '';
            hasGivenHint = false;
        } else {
            // All words completed
            gameActive = false;
            anagramDisplay.textContent = "All words solved!";
            answerInput.disabled = true;
            submitButton.disabled = true;
            nextButton.disabled = true;
            hintButton.disabled = true;
            feedbackMessage.textContent = "Congratulations! You've solved all the anagrams!";
            feedbackMessage.className = "correct";
        }
    }
    
    // Function to check the user's answer
    function checkAnswer() {
        const userAnswer = answerInput.value.toLowerCase().trim();
        
        if (userAnswer === currentAnswer) {
            // Correct answer
            solvedWords.push(currentAnswer);
            feedbackMessage.textContent = "Correct!";
            feedbackMessage.className = "correct";
            
            // Update stats
            gameStats.wordsGuessed++;
            saveGameState();
            
            // Add to solved list
            const listItem = document.createElement('li');
            listItem.textContent = currentAnswer.charAt(0).toUpperCase() + currentAnswer.slice(1);
            solvedList.appendChild(listItem);
            
            // Update solved count
            wordsSolvedDisplay.textContent = `${solvedWords.length}/5 words solved`;
            
            // Disable input and change buttons
            answerInput.disabled = true;
            submitButton.disabled = true;
            nextButton.disabled = false;
            hintButton.disabled = true;
            
            // Check if theme is complete
            if (currentWordIndex + 1 >= themes[currentTheme].length) {
                setTimeout(() => {
                    completeTheme();
                }, 1000);
            } else {
                // Move to next word
                currentWordIndex++;
            }
            
            showMessage('Correct answer!', 'success');
        } else {
            // Incorrect answer
            feedbackMessage.textContent = "Try again!";
            feedbackMessage.className = "incorrect";
            showMessage('Not quite right, try again!', 'error');
        }
    }
    
    // Function to handle theme completion
    function completeTheme() {
        // Update stats
        gameStats.themesCompleted++;
        gameStats.currentStreak++;
        if (gameStats.currentStreak > gameStats.maxStreak) {
            gameStats.maxStreak = gameStats.currentStreak;
        }
        saveGameState();
        updateStatsDisplay();
        
        // Show completion message
        gameEndMessage.textContent = `Congratulations! You've completed the ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} theme with all 5 words solved!`;
        showModal(gameEndModal);
    }
    
    // Function to move to the next word
    function nextWord() {
        if (currentWordIndex <= themes[currentTheme].length) {
            answerInput.disabled = false;
            submitButton.disabled = false;
            nextButton.disabled = true;
            hintButton.disabled = false;
            displayCurrentWord();
        }
    }
    
    // Function to show a hint
    function showHint() {
        if (difficulty === 'hard') {
            showMessage('Hints are disabled in hard mode', 'error');
            return;
        }
        
        if (!hasGivenHint) {
            const hint = themes[currentTheme][currentWordIndex].hint;
            const hintElement = document.createElement('p');
            hintElement.className = 'hint';
            hintElement.textContent = `Hint: ${hint}`;
            
            // Remove any existing hint
            const existingHint = document.querySelector('.hint');
            if (existingHint) {
                existingHint.remove();
            }
            
            feedbackMessage.after(hintElement);
            hasGivenHint = true;
            showMessage('Hint revealed!', 'info');
        } else {
            showMessage('You already used your hint for this word', 'info');
        }
    }
    
    // Function to reset the game
    function resetGame() {
        gameActive = false;
        answerInput.disabled = true;
        submitButton.disabled = true;
        nextButton.disabled = true;
        hintButton.disabled = true;
        
        // Reset displays
        anagramDisplay.textContent = "Press Start to begin";
        currentThemeDisplay.textContent = "Press Start to Begin";
        wordsSolvedDisplay.textContent = "0/5 words solved";
        feedbackMessage.textContent = "";
        feedbackMessage.className = "";
        answerInput.value = "";
        solvedList.innerHTML = "";
        
        // Remove any hints
        const existingHint = document.querySelector('.hint');
        if (existingHint) {
            existingHint.remove();
        }
        
        showMessage('Game reset. Press Start to play again.', 'info');
    }
    
    // Initialize the game
    try {
        await loadGameState();
    } catch (error) {
        console.error('Error loading game state:', error);
    }
});