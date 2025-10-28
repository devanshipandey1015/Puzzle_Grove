/**
 * Spelling Bee Game - Puzzle Grove
 * Inspired by NYT Spelling Bee
 */

// Game settings
const MINIMUM_WORD_LENGTH = 4;
const MIN_PANGRAM_LENGTH = 7;
const MIN_VOWELS = 2;
const NUM_LETTERS = 7;

// Game state
let letters = ['a', 'e', 'i', 'n', 's', 't', 'r']; // Default letters
let centerLetter = 't'; // Default center letter
let currentWord = '';
let foundWords = [];
let allPossibleWords = [];
let totalPossiblePoints = 0;
let gameScore = 0;
let pangrams = [];
let gameOver = false;
let dictionary = [];

// DOM elements (will be initialized on DOM load)
let messageDisplay;
let currentScoreElement;
let currentRankElement;
let foundWordsElement;
let possiblePointsElement;
let wordDisplayElement;
let wordsListElement;
let hexCells;

// User preferences
let darkMode = localStorage.getItem('darkMode') === 'true';
let highContrast = localStorage.getItem('highContrast') === 'true';

// Wait for DOM to be fully loaded then start the game
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing game');
    
    // Initialize DOM elements
    messageDisplay = document.getElementById('messageDisplay');
    currentScoreElement = document.getElementById('current-score');
    currentRankElement = document.getElementById('current-rank');
    foundWordsElement = document.getElementById('found-count');
    possiblePointsElement = document.getElementById('total-possible');
    wordDisplayElement = document.getElementById('current-word');
    wordsListElement = document.getElementById('words-list');
    hexCells = document.querySelectorAll('.hex-cell');
    
    // Update UI based on saved preferences
    document.body.classList.toggle('dark-theme', darkMode);
    document.body.classList.toggle('high-contrast', highContrast);
    
    // Set toggle states if elements exist
    const darkThemeToggle = document.getElementById('darkThemeToggle');
    const highContrastToggle = document.getElementById('highContrastToggle');
    if (darkThemeToggle) darkThemeToggle.checked = darkMode;
    if (highContrastToggle) highContrastToggle.checked = highContrast;
    
    // Set up modal buttons immediately
    setupModalButtons();
    
    // Start the game
    initializeGame();
});

// Setup modal buttons separately to ensure they work
function setupModalButtons() {
    console.log('Setting up modal buttons...');
    
    const helpBtn = document.getElementById('helpBtn');
    const statsBtn = document.getElementById('statsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    console.log('Modal buttons:', { helpBtn: !!helpBtn, statsBtn: !!statsBtn, settingsBtn: !!settingsBtn });
    
    if (helpBtn) {
        helpBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Help button clicked via onclick');
            openModal('helpModal');
        };
    }
    
    if (statsBtn) {
        statsBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Stats button clicked via onclick');
            openModal('statsModal');
        };
    }
    
    if (settingsBtn) {
        settingsBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Settings button clicked via onclick');
            openModal('settingsModal');
        };
    }
    
    // Close modal functionality
    document.querySelectorAll('.close').forEach(closeButton => {
        closeButton.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked');
            closeAllModals();
        };
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.onclick = function(e) {
            if (e.target === modal) {
                closeAllModals();
            }
        };
    });
    
    console.log('Modal buttons setup complete');
}

// Initialize the game
async function initializeGame() {
    console.log('Initializing game...');
    
    try {
        await loadDictionary();
        generateLetters();
        findValidWords();
        setupGame();
        updateUI();
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
        
        // Emergency fallback - ensure we have some letters
        console.log('Using fallback letters');
        letters = ['a', 'e', 'i', 'n', 's', 't', 'r'];
        centerLetter = 't';
        setupGame();
    }
}

// Load dictionary
async function loadDictionary() {
    try {
        console.log("Loading dictionary...");
        const response = await fetch('dictionary.txt');
        if (response.ok) {
            const text = await response.text();
            dictionary = text.split('\n').map(word => word.trim().toLowerCase()).filter(word => word.length > 0);
            console.log(`Loaded ${dictionary.length} words from dictionary`);
        } else {
            throw new Error('Failed to load dictionary');
        }
    } catch (error) {
        console.error('Error loading dictionary:', error);
        // Use a default dictionary with our letters
        dictionary = ["test", "rent", "sent", "nest", "seat", "neat", "teen", "tear", "rate", 
                     "rain", "train", "stain", "strain", "saint", "siren", "resin", 
                     "inert", "steal", "stare", "raise", "arise", "astir", "east", 
                     "teas", "rise", "rest", "tins", "nets", "ties", "tire", "true", "arts", "rats"];
        console.log('Using default dictionary with', dictionary.length, 'words');
    }
}

// Generate a deterministic set of letters based on the date
function generateLetters() {
    // Use the current date as seed to get consistent letters for the day
    const today = new Date();
    let seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Linear Congruential Generator for deterministic randomness
    function nextRand() {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    }
    function randIndex(max) { return Math.floor(nextRand() * max); }

    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];

    let selectedLetters = new Set();
    let vowelCount = 0;

    // Ensure we have at least MIN_VOWELS vowels
    while (vowelCount < MIN_VOWELS) {
        const vowel = vowels[randIndex(vowels.length)];
        if (!selectedLetters.has(vowel)) {
            selectedLetters.add(vowel);
            vowelCount++;
        }
    }

    // Fill the rest with seeded random letters
    while (selectedLetters.size < NUM_LETTERS) {
        const isVowel = nextRand() < 0.2;
        const letterPool = isVowel ? vowels : consonants;
        const letter = letterPool[randIndex(letterPool.length)];
        selectedLetters.add(letter);
    }

    // Convert to array and deterministically shuffle
    letters = Array.from(selectedLetters);
    for (let i = letters.length - 1; i > 0; i--) {
        const j = randIndex(i + 1);
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    // Choose center letter deterministically
    centerLetter = letters[randIndex(letters.length)];

    // Move center letter to the center position (index 3)
    const centerIndex = letters.indexOf(centerLetter);
    if (centerIndex !== 3) {
        [letters[centerIndex], letters[3]] = [letters[3], letters[centerIndex]];
    }

    centerLetter = letters[3];
    console.log("Generated letters:", letters, "Center letter:", centerLetter);
}

// Find all valid words that can be made from the letters
function findValidWords() {
    const letterSet = new Set(letters);
    const requiredLetter = centerLetter;
    
    allPossibleWords = dictionary.filter(word => {
        if (word.length < MINIMUM_WORD_LENGTH) return false;
        if (!word.includes(requiredLetter)) return false;
        
        for (const char of word) {
            if (!letterSet.has(char)) return false;
        }
        
        return true;
    });
    
    // Identify pangrams
    pangrams = allPossibleWords.filter(word => {
        const uniqueLetters = new Set(word.split(''));
        return uniqueLetters.size === NUM_LETTERS;
    });
    
    // Calculate total possible points
    totalPossiblePoints = calculateTotalPoints(allPossibleWords);
    
    console.log(`Found ${allPossibleWords.length} valid words including ${pangrams.length} pangrams`);
}

// Calculate points for a list of words
function calculateTotalPoints(wordList) {
    return wordList.reduce((total, word) => total + calculateWordPoints(word), 0);
}

// Calculate points for a single word (Scrabble scoring)
function calculateWordPoints(word) {
    const values = {
        a: 1, e: 1, i: 1, o: 1, u: 1, l: 1, n: 1, s: 1, t: 1, r: 1,
        d: 2, g: 2,
        b: 3, c: 3, m: 3, p: 3,
        f: 4, h: 4, v: 4, w: 4, y: 4,
        k: 5,
        j: 8, x: 8,
        q: 10, z: 10
    };

    let points = 0;
    for (const ch of word) {
        points += values[ch] || 1;
    }
    return points;
}

// Check if a word is a pangram
function isPangram(word) {
    return pangrams.includes(word);
}

// Setup the game UI
function setupGame() {
    console.log('Setting up game with letters:', letters);
    
    if (!hexCells || hexCells.length === 0) {
        console.error('Hex cells not found!');
        return;
    }
    
    // Display letters in the honeycomb
    hexCells.forEach((cell, index) => {
        if (index < letters.length) {
            cell.textContent = letters[index].toUpperCase();
            console.log(`Setting cell ${index} to ${letters[index].toUpperCase()}`);
            
            // Remove existing classes
            cell.classList.remove('center', 'required');
            
            // Add center class only to the center letter (index 3)
            if (index === 3) {
                cell.classList.add('center', 'required');
            }
            
            // Remove previous event listeners by cloning the node
            const newCell = cell.cloneNode(true);
            cell.parentNode.replaceChild(newCell, cell);
            
            // Add click handler to the new cell
            newCell.addEventListener('click', () => {
                if (!gameOver) {
                    addLetter(letters[index]);
                    newCell.classList.add('clicked');
                    setTimeout(() => newCell.classList.remove('clicked'), 120);
                }
            });
        }
    });
    
    // Re-query hex cells after cloning
    hexCells = document.querySelectorAll('.hex-cell');
    
    // Setup button event listeners
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Button handlers
    const deleteBtn = document.getElementById('delete-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const enterBtn = document.getElementById('enter-btn');
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteLetter);
        console.log('Delete button listener added');
    }
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', shuffleLetters);
        console.log('Shuffle button listener added');
    }
    if (enterBtn) {
        enterBtn.addEventListener('click', submitWord);
        console.log('Enter button listener added');
    }
    
    // Modal buttons
    const helpBtn = document.getElementById('helpBtn');
    const statsBtn = document.getElementById('statsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    console.log('Modal buttons found:', {
        helpBtn: !!helpBtn,
        statsBtn: !!statsBtn,
        settingsBtn: !!settingsBtn
    });
    
    if (helpBtn) {
        helpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Help button clicked');
            openModal('helpModal');
        });
        console.log('Help button listener added');
    }
    if (statsBtn) {
        statsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Stats button clicked');
            openModal('statsModal');
        });
        console.log('Stats button listener added');
    }
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Settings button clicked');
            openModal('settingsModal');
        });
        console.log('Settings button listener added');
    }
    
    // Close modal buttons
    document.querySelectorAll('.close').forEach(closeButton => {
        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Close button clicked');
            closeAllModals();
        });
    });
    
    // Settings toggles
    const darkThemeToggle = document.getElementById('darkThemeToggle');
    const highContrastToggle = document.getElementById('highContrastToggle');
    
    if (darkThemeToggle) darkThemeToggle.addEventListener('change', toggleDarkMode);
    if (highContrastToggle) highContrastToggle.addEventListener('change', toggleHighContrast);
    
    // Keyboard listeners
    document.addEventListener('keydown', handleKeyPress);
    
    console.log('Event listeners setup complete');
}

// Handle keyboard input
function handleKeyPress(e) {
    if (gameOver) return;
    
    const key = e.key.toLowerCase();
    
    if (letters.includes(key)) {
        addLetter(key);
    } else if (key === 'backspace' || key === 'delete') {
        deleteLetter();
    } else if (key === 'enter') {
        e.preventDefault();
        submitWord();
    }
}

// Add letter to current word
function addLetter(letter) {
    currentWord += letter;
    updateWordDisplay();
    
    // Visual feedback
    if (wordDisplayElement) {
        wordDisplayElement.style.borderColor = '#ffcc00';
        wordDisplayElement.style.backgroundColor = 'rgba(255, 204, 0, 0.1)';
        setTimeout(() => {
            wordDisplayElement.style.borderColor = '#ddd';
            wordDisplayElement.style.backgroundColor = 'transparent';
        }, 300);
    }
}

// Delete the last letter
function deleteLetter() {
    if (currentWord.length > 0) {
        currentWord = currentWord.slice(0, -1);
        updateWordDisplay();
    }
}

// Update the word display
function updateWordDisplay() {
    if (wordDisplayElement) {
        wordDisplayElement.textContent = currentWord.toUpperCase();
    }
}

// Submit the current word
function submitWord() {
    console.log("Submitting word:", currentWord);
    
    if (currentWord.length < MINIMUM_WORD_LENGTH) {
        showMessage(`Words must be at least ${MINIMUM_WORD_LENGTH} letters long.`, 'error');
        return;
    }
    
    if (!currentWord.includes(centerLetter)) {
        showMessage(`Words must contain the center letter: ${centerLetter.toUpperCase()}`, 'error');
        return;
    }
    
    if (!allPossibleWords.includes(currentWord)) {
        showMessage('Not in word list.', 'error');
        return;
    }
    
    if (foundWords.includes(currentWord)) {
        showMessage('Word already found.', 'error');
        currentWord = '';
        updateWordDisplay();
        return;
    }
    
    // Word is valid
    foundWords.push(currentWord);
    const wordPoints = calculateWordPoints(currentWord);
    gameScore += wordPoints;
    
    // Show appropriate message
    if (isPangram(currentWord)) {
        showMessage('Pangram! +' + wordPoints + ' points', 'special');
    } else {
        showMessage('Nice! +' + wordPoints + ' points', 'success');
    }
    
    // Update UI
    updateUI();
    addWordToFoundList(currentWord);
    
    // Clear the current word
    currentWord = '';
    updateWordDisplay();
    
    // Check if all words found
    if (allPossibleWords.length > 0 && foundWords.length === allPossibleWords.length) {
        endGame();
    }
}

// Add a word to the found words list
function addWordToFoundList(word) {
    if (!wordsListElement) return;
    
    const wordElement = document.createElement('div');
    wordElement.textContent = word;
    wordElement.className = 'word-item';
    
    if (isPangram(word)) {
        wordElement.classList.add('pangram');
    }
    
    wordsListElement.appendChild(wordElement);
}

// Update the UI
function updateUI() {
    if (currentScoreElement) currentScoreElement.textContent = gameScore;
    if (foundWordsElement) foundWordsElement.textContent = foundWords.length;
    if (possiblePointsElement) possiblePointsElement.textContent = allPossibleWords.length;
    
    // Update rank
    const rankPercentage = totalPossiblePoints > 0 ? Math.floor((gameScore / totalPossiblePoints) * 100) : 0;
    if (currentRankElement) currentRankElement.textContent = getRank(rankPercentage);
}

// Show a message to the user
function showMessage(msg, type = 'info') {
    if (!messageDisplay) return;
    
    messageDisplay.textContent = msg;
    messageDisplay.className = 'message-display ' + type;
    
    setTimeout(() => {
        messageDisplay.textContent = '';
        messageDisplay.className = 'message-display';
    }, 2000);
}

// Get rank based on percentage of points
function getRank(percentage) {
    if (percentage >= 100) return 'Queen Bee';
    if (percentage >= 90) return 'Genius';
    if (percentage >= 80) return 'Amazing';
    if (percentage >= 70) return 'Outstanding';
    if (percentage >= 60) return 'Excellent';
    if (percentage >= 50) return 'Great';
    if (percentage >= 40) return 'Good';
    if (percentage >= 30) return 'Nice';
    if (percentage >= 20) return 'Solid';
    if (percentage >= 10) return 'Beginner';
    return 'Newbie';
}

// Shuffle the outer letters
function shuffleLetters() {
    const outerLetters = letters.filter(letter => letter !== centerLetter);
    
    // Fisher-Yates shuffle
    for (let i = outerLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [outerLetters[i], outerLetters[j]] = [outerLetters[j], outerLetters[i]];
    }
    
    // Reconstruct with center letter still in center (index 3)
    letters = [...outerLetters.slice(0, 3), centerLetter, ...outerLetters.slice(3)];
    
    // Update UI
    if (hexCells) {
        hexCells.forEach((cell, index) => {
            if (index < letters.length && !cell.classList.contains('center')) {
                cell.textContent = letters[index].toUpperCase();
            }
        });
    }
    
    // Animate the shuffle
    document.querySelectorAll('.hex-cell:not(.center)').forEach(cell => {
        cell.style.transform = 'scale(1.1)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 200);
    });
}

// End the game
function endGame() {
    gameOver = true;
    showMessage('Congratulations! You found all words!', 'special');
}

// Open a modal
function openModal(modalId) {
    console.log('Opening modal:', modalId);
    const modal = document.getElementById(modalId);
    console.log('Modal element found:', !!modal);
    
    if (modal) {
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        console.log('Modal opened successfully');
        
        // Ensure modal is visible and on top
        modal.style.zIndex = '9999';
        modal.style.opacity = '1';
    } else {
        console.error('Modal not found:', modalId);
    }
}

// Close all modals
function closeAllModals() {
    console.log('Closing all modals');
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
}

// Toggle dark mode
function toggleDarkMode() {
    const toggle = document.getElementById('darkThemeToggle');
    if (toggle) {
        darkMode = toggle.checked;
        document.body.classList.toggle('dark-theme', darkMode);
        localStorage.setItem('darkMode', darkMode);
    }
}

// Toggle high contrast mode
function toggleHighContrast() {
    const toggle = document.getElementById('highContrastToggle');
    if (toggle) {
        highContrast = toggle.checked;
        document.body.classList.toggle('high-contrast', highContrast);
        localStorage.setItem('highContrast', highContrast);
    }
}