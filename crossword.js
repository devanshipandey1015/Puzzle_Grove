/**
 * Crossword Puzzle Game - Puzzle Grove
 * A complete interactive crossword puzzle implementation
 */

// Game configuration
const GRID_SIZE = 15;
const CELL_SIZE = 30;

// Daily puzzle system
const PUZZLE_START_DATE = new Date('2025-01-01'); // Start date for puzzle numbering

// Game state
let currentPuzzle = null;
let selectedCell = null;
let selectedWord = null;
let selectedDirection = null;
let completedWords = new Set();
let hintsUsed = 0;
let gameStartTime = null;
let gameTimer = null;
let currentPuzzleDate = null;
let puzzleNumber = 0;

// Settings
let settings = {
    showTimer: true,
    autoCheck: true,
    darkTheme: false,
    soundEffects: true
};

// DOM elements
let grid = null;
let acrossClues = null;
let downClues = null;
let messageDisplay = null;
let completedWordsElement = null;
let totalWordsElement = null;
let hintsUsedElement = null;
let currentDirectionElement = null;
let currentClueElement = null;

// Daily puzzle collection - rotates based on date
const dailyPuzzles = [
    // Puzzle 1 - Animals Theme
    {
        grid: [
            ['C', 'A', 'T', null, null, 'D', 'O', 'G', null, null, 'F', 'O', 'X', null, null],
            [null, null, 'H', null, null, null, null, 'O', null, null, null, null, 'E', null, null],
            [null, null, 'E', null, null, null, null, 'A', null, null, null, null, 'N', null, null],
            [null, null, 'E', null, null, null, null, 'T', null, null, null, null, null, null, null],
            ['H', 'O', 'R', 'S', 'E', null, null, null, null, null, 'B', 'E', 'A', 'R', null],
            [null, null, null, null, 'L', null, null, null, null, null, null, null, null, 'A', null],
            [null, null, null, null, 'E', null, null, null, null, null, null, null, null, 'B', null],
            [null, null, null, null, 'P', null, null, null, null, null, null, null, null, 'B', null],
            [null, null, null, null, 'H', null, null, 'W', 'O', 'L', 'F', null, null, 'I', null],
            [null, null, null, null, 'A', null, null, null, null, null, null, null, null, 'T', null],
            ['F', 'I', 'S', 'H', null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, 'T', null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        clues: {
            across: [
                { number: 1, clue: "Feline pet", answer: "CAT", startRow: 0, startCol: 0 },
                { number: 5, clue: "Man's best friend", answer: "DOG", startRow: 0, startCol: 5 },
                { number: 7, clue: "Sly red animal", answer: "FOX", startRow: 0, startCol: 10 },
                { number: 9, clue: "Large farm animal", answer: "HORSE", startRow: 4, startCol: 0 },
                { number: 11, clue: "Large forest mammal", answer: "BEAR", startRow: 4, startCol: 10 },
                { number: 13, clue: "Pack hunter", answer: "WOLF", startRow: 8, startCol: 7 },
                { number: 15, clue: "Aquatic animal", answer: "FISH", startRow: 10, startCol: 0 }
            ],
            down: [
                { number: 1, clue: "Baby goat", answer: "THE", startRow: 0, startCol: 2 },
                { number: 2, clue: "Mountain animal", answer: "GOAT", startRow: 0, startCol: 7 },
                { number: 3, clue: "Large African mammal", answer: "ELEPHANT", startRow: 4, startCol: 4 },
                { number: 4, clue: "Hopping marsupial", answer: "RABBIT", startRow: 4, startCol: 13 },
                { number: 6, clue: "Striped African animal", answer: "ZEBRA", startRow: 0, startCol: 12 }
            ]
        }
    },
    
    // Puzzle 2 - Food Theme
    {
        grid: [
            ['B', 'R', 'E', 'A', 'D', null, null, 'P', 'I', 'Z', 'Z', 'A', null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, 'P', null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, 'P', null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, 'L', null, null, null],
            ['C', 'A', 'K', 'E', null, null, null, 'S', 'A', 'L', 'A', 'D', null, null, null],
            [null, null, null, 'G', null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, 'G', null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, 'S', null, null, null, null, null, null, null, null, null, null, null],
            ['M', 'E', 'A', 'T', null, null, null, 'S', 'O', 'U', 'P', null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            ['R', 'I', 'C', 'E', null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        clues: {
            across: [
                { number: 1, clue: "Baked staple food", answer: "BREAD", startRow: 0, startCol: 0 },
                { number: 6, clue: "Italian dish with cheese", answer: "PIZZA", startRow: 0, startCol: 7 },
                { number: 8, clue: "Sweet dessert", answer: "CAKE", startRow: 4, startCol: 0 },
                { number: 10, clue: "Healthy green dish", answer: "SALAD", startRow: 4, startCol: 7 },
                { number: 12, clue: "Protein source", answer: "MEAT", startRow: 8, startCol: 0 },
                { number: 14, clue: "Hot liquid food", answer: "SOUP", startRow: 8, startCol: 7 },
                { number: 16, clue: "Asian grain", answer: "RICE", startRow: 10, startCol: 0 }
            ],
            down: [
                { number: 2, clue: "Breakfast item", answer: "EGGS", startRow: 4, startCol: 3 },
                { number: 4, clue: "Red fruit", answer: "APPLE", startRow: 0, startCol: 11 }
            ]
        }
    },

    // Puzzle 3 - Nature Theme
    {
        grid: [
            ['T', 'R', 'E', 'E', null, null, 'S', 'U', 'N', null, null, 'W', 'I', 'N', 'D'],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            ['F', 'L', 'O', 'W', 'E', 'R', null, null, null, null, 'G', 'R', 'A', 'S', 'S'],
            [null, null, null, null, null, 'A', null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, 'I', null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, 'N', null, null, null, null, null, null, null, null, null],
            ['M', 'O', 'U', 'N', 'T', 'A', 'I', 'N', null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            ['L', 'A', 'K', 'E', null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        clues: {
            across: [
                { number: 1, clue: "Tall plant with trunk", answer: "TREE", startRow: 0, startCol: 0 },
                { number: 5, clue: "Star in our sky", answer: "SUN", startRow: 0, startCol: 6 },
                { number: 7, clue: "Moving air", answer: "WIND", startRow: 0, startCol: 11 },
                { number: 9, clue: "Colorful bloom", answer: "FLOWER", startRow: 4, startCol: 0 },
                { number: 11, clue: "Green ground cover", answer: "GRASS", startRow: 4, startCol: 10 },
                { number: 13, clue: "High peak", answer: "MOUNTAIN", startRow: 8, startCol: 0 },
                { number: 15, clue: "Body of water", answer: "LAKE", startRow: 10, startCol: 0 }
            ],
            down: [
                { number: 3, clue: "Water from sky", answer: "RAIN", startRow: 4, startCol: 5 }
            ]
        }
    },

    // Puzzle 4 - Home Theme
    {
        grid: [
            ['H', 'O', 'U', 'S', 'E', null, null, 'D', 'O', 'O', 'R', null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            ['C', 'H', 'A', 'I', 'R', null, null, 'T', 'A', 'B', 'L', 'E', null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            ['B', 'E', 'D', null, null, null, null, 'L', 'A', 'M', 'P', null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            ['S', 'O', 'F', 'A', null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        clues: {
            across: [
                { number: 1, clue: "Place where people live", answer: "HOUSE", startRow: 0, startCol: 0 },
                { number: 6, clue: "Entry to a room", answer: "DOOR", startRow: 0, startCol: 7 },
                { number: 8, clue: "Seat with backrest", answer: "CHAIR", startRow: 4, startCol: 0 },
                { number: 10, clue: "Surface for eating", answer: "TABLE", startRow: 4, startCol: 7 },
                { number: 12, clue: "Place to sleep", answer: "BED", startRow: 8, startCol: 0 },
                { number: 14, clue: "Light source", answer: "LAMP", startRow: 8, startCol: 7 },
                { number: 16, clue: "Living room seating", answer: "SOFA", startRow: 12, startCol: 0 }
            ],
            down: []
        }
    },

    // Puzzle 5 - School Theme
    {
        grid: [
            ['B', 'O', 'O', 'K', null, null, 'P', 'E', 'N', null, null, 'D', 'E', 'S', 'K'],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            ['P', 'A', 'P', 'E', 'R', null, null, 'T', 'E', 'S', 'T', null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            ['M', 'A', 'T', 'H', null, null, null, 'R', 'E', 'A', 'D', null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            ['S', 'T', 'U', 'D', 'Y', null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        clues: {
            across: [
                { number: 1, clue: "Reading material", answer: "BOOK", startRow: 0, startCol: 0 },
                { number: 5, clue: "Writing tool", answer: "PEN", startRow: 0, startCol: 6 },
                { number: 7, clue: "Student workplace", answer: "DESK", startRow: 0, startCol: 11 },
                { number: 9, clue: "Writing material", answer: "PAPER", startRow: 4, startCol: 0 },
                { number: 11, clue: "Exam", answer: "TEST", startRow: 4, startCol: 7 },
                { number: 13, clue: "Numbers subject", answer: "MATH", startRow: 8, startCol: 0 },
                { number: 15, clue: "Look at books", answer: "READ", startRow: 8, startCol: 7 },
                { number: 17, clue: "Learn hard", answer: "STUDY", startRow: 12, startCol: 0 }
            ],
            down: []
        }
    }
];

// Get today's puzzle based on date
function getTodaysPuzzle() {
    const today = new Date();
    const startDate = new Date('2025-01-01'); // Fixed start date for consistent puzzle rotation
    
    // Calculate days since start date
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // Get puzzle index (cycles through available puzzles)
    const puzzleIndex = daysDiff % dailyPuzzles.length;
    
    // Set current puzzle date and number for display
    currentPuzzleDate = new Date(today);
    puzzleNumber = daysDiff + 1;
    
    return dailyPuzzles[puzzleIndex];
}

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    console.log('Crossword game initializing...');
    initializeDOM();
    loadSettings();
    initializeGame();
    setupEventListeners();
});

// Initialize DOM elements
function initializeDOM() {
    grid = document.getElementById('crosswordGrid');
    acrossClues = document.getElementById('acrossClues');
    downClues = document.getElementById('downClues');
    messageDisplay = document.getElementById('messageDisplay');
    completedWordsElement = document.getElementById('completedWords');
    totalWordsElement = document.getElementById('totalWords');
    hintsUsedElement = document.getElementById('hintsUsed');
    currentDirectionElement = document.getElementById('currentDirection');
    currentClueElement = document.getElementById('currentClue');
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('crosswordSettings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
    applySettings();
}

// Apply settings to the UI
function applySettings() {
    document.body.classList.toggle('dark-theme', settings.darkTheme);
    
    // Update toggle states
    const darkThemeToggle = document.getElementById('darkThemeToggle');
    const showTimerToggle = document.getElementById('showTimerToggle');
    const autoCheckToggle = document.getElementById('autoCheckToggle');
    const soundToggle = document.getElementById('soundToggle');
    
    if (darkThemeToggle) darkThemeToggle.checked = settings.darkTheme;
    if (showTimerToggle) showTimerToggle.checked = settings.showTimer;
    if (autoCheckToggle) autoCheckToggle.checked = settings.autoCheck;
    if (soundToggle) soundToggle.checked = settings.soundEffects;
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('crosswordSettings', JSON.stringify(settings));
}

// Initialize the game
function initializeGame() {
    currentPuzzle = getTodaysPuzzle();
    updatePuzzleInfo();
    createGrid();
    populateClues();
    updateStats();
    startTimer();
    
    // Show welcome message with puzzle info
    const today = currentPuzzleDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    showMessage(`Welcome to today's crossword! Puzzle #${puzzleNumber} for ${today}`, 'info');
}

// Update puzzle info display
function updatePuzzleInfo() {
    const puzzleInfoElement = document.getElementById('puzzleInfo');
    if (puzzleInfoElement && currentPuzzleDate) {
        const today = currentPuzzleDate.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        puzzleInfoElement.textContent = `Puzzle #${puzzleNumber} • ${today}`;
    }
}

// Create the crossword grid
function createGrid() {
    grid.innerHTML = '';
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'crossword-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const letter = currentPuzzle.grid[row][col];
            
            if (letter === null) {
                cell.classList.add('black');
            } else {
                // Add cell number if it's the start of a word
                const cellNumber = getCellNumber(row, col);
                if (cellNumber) {
                    const numberElement = document.createElement('div');
                    numberElement.className = 'cell-number';
                    numberElement.textContent = cellNumber;
                    cell.appendChild(numberElement);
                }
                
                // Add input element
                const input = document.createElement('input');
                input.className = 'cell-input';
                input.type = 'text';
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;
                
                cell.appendChild(input);
                
                // Add click handler
                cell.addEventListener('click', () => selectCell(row, col));
                input.addEventListener('input', handleCellInput);
                input.addEventListener('keydown', handleKeyDown);
                input.addEventListener('focus', () => selectCell(row, col));
            }
            
            grid.appendChild(cell);
        }
    }
}

// Get cell number for clues
function getCellNumber(row, col) {
    // Check across clues
    for (const clue of currentPuzzle.clues.across) {
        if (clue.startRow === row && clue.startCol === col) {
            return clue.number;
        }
    }
    
    // Check down clues
    for (const clue of currentPuzzle.clues.down) {
        if (clue.startRow === row && clue.startCol === col) {
            return clue.number;
        }
    }
    
    return null;
}

// Populate clues in the UI
function populateClues() {
    // Populate across clues
    acrossClues.innerHTML = '';
    currentPuzzle.clues.across.forEach(clue => {
        const clueElement = document.createElement('div');
        clueElement.className = 'clue-item';
        clueElement.dataset.direction = 'across';
        clueElement.dataset.number = clue.number;
        clueElement.innerHTML = `<span class="clue-number">${clue.number}.</span>${clue.clue}`;
        clueElement.addEventListener('click', () => selectClue('across', clue.number));
        acrossClues.appendChild(clueElement);
    });
    
    // Populate down clues
    downClues.innerHTML = '';
    currentPuzzle.clues.down.forEach(clue => {
        const clueElement = document.createElement('div');
        clueElement.className = 'clue-item';
        clueElement.dataset.direction = 'down';
        clueElement.dataset.number = clue.number;
        clueElement.innerHTML = `<span class="clue-number">${clue.number}.</span>${clue.clue}`;
        clueElement.addEventListener('click', () => selectClue('down', clue.number));
        downClues.appendChild(clueElement);
    });
}

// Select a cell
function selectCell(row, col) {
    // Clear previous selection
    clearSelection();
    
    selectedCell = { row, col };
    
    // Find words that include this cell
    const wordsAtCell = findWordsAtCell(row, col);
    
    if (wordsAtCell.length > 0) {
        // If we already have a selected word and it's one of the options, toggle direction
        if (selectedWord && wordsAtCell.some(word => 
            word.direction === selectedDirection && word.number === selectedWord.number)) {
            const otherWord = wordsAtCell.find(word => 
                word.direction !== selectedDirection || word.number !== selectedWord.number);
            if (otherWord) {
                selectWord(otherWord.direction, otherWord.number);
            }
        } else {
            // Select the first word
            selectWord(wordsAtCell[0].direction, wordsAtCell[0].number);
        }
    }
    
    // Focus the input
    const cellElement = getCellElement(row, col);
    const input = cellElement.querySelector('.cell-input');
    if (input) {
        input.focus();
    }
}

// Find words that include a specific cell
function findWordsAtCell(row, col) {
    const words = [];
    
    // Check across words
    currentPuzzle.clues.across.forEach(clue => {
        const { startRow, startCol } = clue;
        if (startRow === row && col >= startCol && col < startCol + clue.answer.length) {
            words.push({ direction: 'across', number: clue.number, clue });
        }
    });
    
    // Check down words
    currentPuzzle.clues.down.forEach(clue => {
        const { startRow, startCol } = clue;
        if (startCol === col && row >= startRow && row < startRow + clue.answer.length) {
            words.push({ direction: 'down', number: clue.number, clue });
        }
    });
    
    return words;
}

// Select a word by clicking on a clue
function selectClue(direction, number) {
    selectWord(direction, number);
    
    // Focus on the first cell of the word
    const clue = currentPuzzle.clues[direction].find(c => c.number === number);
    if (clue) {
        selectCell(clue.startRow, clue.startCol);
    }
}

// Select a word and highlight it
function selectWord(direction, number) {
    clearSelection();
    
    selectedDirection = direction;
    const clue = currentPuzzle.clues[direction].find(c => c.number === number);
    if (!clue) return;
    
    selectedWord = clue;
    
    // Highlight the word cells
    highlightWord(direction, clue);
    
    // Update clue display
    updateCurrentClueDisplay();
    
    // Mark clue as active
    const clueElement = document.querySelector(`[data-direction="${direction}"][data-number="${number}"]`);
    if (clueElement) {
        clueElement.classList.add('active');
    }
}

// Highlight word cells
function highlightWord(direction, clue) {
    const { startRow, startCol, answer } = clue;
    
    for (let i = 0; i < answer.length; i++) {
        const row = direction === 'across' ? startRow : startRow + i;
        const col = direction === 'across' ? startCol + i : startCol;
        
        const cellElement = getCellElement(row, col);
        if (cellElement) {
            cellElement.classList.add('highlighted');
        }
    }
}

// Clear all selections and highlights
function clearSelection() {
    // Clear cell highlights
    document.querySelectorAll('.crossword-cell').forEach(cell => {
        cell.classList.remove('active', 'highlighted');
    });
    
    // Clear clue highlights
    document.querySelectorAll('.clue-item').forEach(clue => {
        clue.classList.remove('active');
    });
    
    selectedCell = null;
    selectedWord = null;
    selectedDirection = null;
}

// Get cell element by row and col
function getCellElement(row, col) {
    return document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"]`);
}

// Handle cell input
function handleCellInput(event) {
    const input = event.target;
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    const value = input.value.toUpperCase();
    
    input.value = value;
    
    if (value && selectedWord && selectedDirection) {
        // Move to next cell in the word
        moveToNextCell(row, col);
        
        // Auto-check if enabled
        if (settings.autoCheck) {
            checkCurrentWord();
        }
    }
}

// Handle keyboard navigation
function handleKeyDown(event) {
    const input = event.target;
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    
    switch (event.key) {
        case 'Backspace':
            if (!input.value) {
                moveToPreviousCell(row, col);
            }
            break;
        case 'Delete':
            input.value = '';
            break;
        case 'Tab':
            event.preventDefault();
            moveToNextWord();
            break;
        case 'Enter':
            event.preventDefault();
            checkCurrentWord();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            moveToAdjacentCell(row, col - 1);
            break;
        case 'ArrowRight':
            event.preventDefault();
            moveToAdjacentCell(row, col + 1);
            break;
        case 'ArrowUp':
            event.preventDefault();
            moveToAdjacentCell(row - 1, col);
            break;
        case 'ArrowDown':
            event.preventDefault();
            moveToAdjacentCell(row + 1, col);
            break;
    }
}

// Move to next cell in current word
function moveToNextCell(currentRow, currentCol) {
    if (!selectedWord || !selectedDirection) return;
    
    const { startRow, startCol, answer } = selectedWord;
    let nextRow, nextCol;
    
    if (selectedDirection === 'across') {
        nextCol = currentCol + 1;
        nextRow = currentRow;
        if (nextCol >= startCol + answer.length) return; // End of word
    } else {
        nextRow = currentRow + 1;
        nextCol = currentCol;
        if (nextRow >= startRow + answer.length) return; // End of word
    }
    
    const nextCell = getCellElement(nextRow, nextCol);
    const nextInput = nextCell?.querySelector('.cell-input');
    if (nextInput) {
        nextInput.focus();
        nextInput.select();
    }
}

// Move to previous cell in current word
function moveToPreviousCell(currentRow, currentCol) {
    if (!selectedWord || !selectedDirection) return;
    
    const { startRow, startCol } = selectedWord;
    let prevRow, prevCol;
    
    if (selectedDirection === 'across') {
        prevCol = currentCol - 1;
        prevRow = currentRow;
        if (prevCol < startCol) return; // Start of word
    } else {
        prevRow = currentRow - 1;
        prevCol = currentCol;
        if (prevRow < startRow) return; // Start of word
    }
    
    const prevCell = getCellElement(prevRow, prevCol);
    const prevInput = prevCell?.querySelector('.cell-input');
    if (prevInput) {
        prevInput.focus();
        prevInput.select();
    }
}

// Move to adjacent cell (arrow keys)
function moveToAdjacentCell(row, col) {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
    
    const cell = getCellElement(row, col);
    if (cell && !cell.classList.contains('black')) {
        selectCell(row, col);
    }
}

// Move to next word
function moveToNextWord() {
    // Implementation for moving to the next incomplete word
    const allClues = [...currentPuzzle.clues.across, ...currentPuzzle.clues.down];
    const incompleteWords = allClues.filter(clue => !isWordComplete(clue));
    
    if (incompleteWords.length > 0) {
        const nextWord = incompleteWords[0];
        const direction = currentPuzzle.clues.across.includes(nextWord) ? 'across' : 'down';
        selectClue(direction, nextWord.number);
    }
}

// Check if current word is correct
function checkCurrentWord() {
    if (!selectedWord) return;
    
    const currentAnswer = getCurrentWordAnswer();
    const isCorrect = currentAnswer === selectedWord.answer;
    
    if (isCorrect) {
        markWordAsCorrect();
        showMessage(`Correct! "${selectedWord.answer}"`, 'success');
        
        if (settings.soundEffects) {
            playSuccessSound();
        }
        
        // Check if puzzle is complete
        if (isPuzzleComplete()) {
            completePuzzle();
        }
    } else if (currentAnswer.length === selectedWord.answer.length) {
        showMessage('Incorrect. Try again!', 'error');
        
        if (settings.soundEffects) {
            playErrorSound();
        }
    }
}

// Get current word answer from grid
function getCurrentWordAnswer() {
    if (!selectedWord || !selectedDirection) return '';
    
    const { startRow, startCol, answer } = selectedWord;
    let currentAnswer = '';
    
    for (let i = 0; i < answer.length; i++) {
        const row = selectedDirection === 'across' ? startRow : startRow + i;
        const col = selectedDirection === 'across' ? startCol + i : startCol;
        
        const cell = getCellElement(row, col);
        const input = cell?.querySelector('.cell-input');
        currentAnswer += input?.value || '';
    }
    
    return currentAnswer.toUpperCase();
}

// Mark word as correct
function markWordAsCorrect() {
    if (!selectedWord || !selectedDirection) return;
    
    const wordKey = `${selectedDirection}-${selectedWord.number}`;
    completedWords.add(wordKey);
    
    // Mark cells as correct
    const { startRow, startCol, answer } = selectedWord;
    
    for (let i = 0; i < answer.length; i++) {
        const row = selectedDirection === 'across' ? startRow : startRow + i;
        const col = selectedDirection === 'across' ? startCol + i : startCol;
        
        const cell = getCellElement(row, col);
        if (cell) {
            cell.classList.add('correct');
        }
    }
    
    // Mark clue as completed
    const clueElement = document.querySelector(`[data-direction="${selectedDirection}"][data-number="${selectedWord.number}"]`);
    if (clueElement) {
        clueElement.classList.add('completed');
    }
    
    updateStats();
}

// Check if word is complete and correct
function isWordComplete(clue) {
    const direction = currentPuzzle.clues.across.includes(clue) ? 'across' : 'down';
    const wordKey = `${direction}-${clue.number}`;
    return completedWords.has(wordKey);
}

// Check if puzzle is complete
function isPuzzleComplete() {
    const totalWords = currentPuzzle.clues.across.length + currentPuzzle.clues.down.length;
    return completedWords.size === totalWords;
}

// Complete the puzzle
function completePuzzle() {
    stopTimer();
    showMessage('🎉 Congratulations! You completed the crossword! 🎉', 'success');
    
    setTimeout(() => {
        showCompletionModal();
    }, 2000);
}

// Update current clue display
function updateCurrentClueDisplay() {
    if (selectedWord && selectedDirection) {
        currentDirectionElement.textContent = `${selectedWord.number} ${selectedDirection.toUpperCase()}`;
        currentClueElement.textContent = selectedWord.clue;
    } else {
        currentDirectionElement.textContent = 'Select a word to begin';
        currentClueElement.textContent = '';
    }
}

// Update game statistics
function updateStats() {
    if (completedWordsElement) completedWordsElement.textContent = completedWords.size;
    if (totalWordsElement) {
        const total = currentPuzzle.clues.across.length + currentPuzzle.clues.down.length;
        totalWordsElement.textContent = total;
    }
    if (hintsUsedElement) hintsUsedElement.textContent = hintsUsed;
}

// Show message to user
function showMessage(text, type = 'info') {
    if (!messageDisplay) return;
    
    messageDisplay.textContent = text;
    messageDisplay.className = `message-display ${type} show`;
    
    setTimeout(() => {
        messageDisplay.classList.remove('show');
    }, 3000);
}

// Timer functions
function startTimer() {
    if (!settings.showTimer) return;
    
    gameStartTime = Date.now();
    gameTimer = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function updateTimer() {
    if (!gameStartTime) return;
    
    const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update timer display if it exists
    const timerElement = document.getElementById('gameTimer');
    if (timerElement) {
        timerElement.textContent = timeString;
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Show completion modal
function showCompletionModal() {
    // Update final stats
    const totalWords = currentPuzzle.clues.across.length + currentPuzzle.clues.down.length;
    const elapsed = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('finalTotalWords').textContent = totalWords;
    document.getElementById('finalHintsUsed').textContent = hintsUsed;
    document.getElementById('finalTime').textContent = timeString;
    
    showModal('completionModal');
}

// Hint functions
function showHint() {
    if (!selectedWord) {
        showMessage('Please select a word first!', 'error');
        return;
    }
    
    const hintText = generateHint();
    document.getElementById('hintContent').innerHTML = `
        <p><strong>${selectedWord.number} ${selectedDirection.toUpperCase()}:</strong> ${selectedWord.clue}</p>
        <p><strong>Hint:</strong> ${hintText}</p>
        <p><strong>Length:</strong> ${selectedWord.answer.length} letters</p>
    `;
    
    showModal('hintModal');
}

function generateHint() {
    if (!selectedWord) return '';
    
    const answer = selectedWord.answer;
    const currentAnswer = getCurrentWordAnswer();
    
    // Show pattern with known letters
    let pattern = '';
    for (let i = 0; i < answer.length; i++) {
        if (currentAnswer[i] && currentAnswer[i] === answer[i]) {
            pattern += currentAnswer[i];
        } else {
            pattern += '_';
        }
    }
    
    return `Pattern: ${pattern.split('').join(' ')}`;
}

function revealLetter() {
    if (!selectedWord || !selectedDirection) {
        showMessage('Please select a word first!', 'error');
        return;
    }
    
    const { startRow, startCol, answer } = selectedWord;
    const currentAnswer = getCurrentWordAnswer();
    
    // Find first incorrect or empty letter
    for (let i = 0; i < answer.length; i++) {
        if (!currentAnswer[i] || currentAnswer[i] !== answer[i]) {
            const row = selectedDirection === 'across' ? startRow : startRow + i;
            const col = selectedDirection === 'across' ? startCol + i : startCol;
            
            const cell = getCellElement(row, col);
            const input = cell?.querySelector('.cell-input');
            
            if (input) {
                input.value = answer[i];
                hintsUsed++;
                updateStats();
                closeAllModals();
                showMessage(`Revealed letter: ${answer[i]}`, 'info');
                
                if (settings.autoCheck) {
                    checkCurrentWord();
                }
                return;
            }
        }
    }
    
    showMessage('All letters are already correct!', 'info');
}

// Control functions
function clearCurrentWord() {
    if (!selectedWord || !selectedDirection) {
        showMessage('Please select a word first!', 'error');
        return;
    }
    
    const { startRow, startCol, answer } = selectedWord;
    
    for (let i = 0; i < answer.length; i++) {
        const row = selectedDirection === 'across' ? startRow : startRow + i;
        const col = selectedDirection === 'across' ? startCol + i : startCol;
        
        const cell = getCellElement(row, col);
        const input = cell?.querySelector('.cell-input');
        
        if (input) {
            input.value = '';
        }
    }
    
    showMessage('Word cleared!', 'info');
}

function revealCurrentWord() {
    if (!selectedWord || !selectedDirection) {
        showMessage('Please select a word first!', 'error');
        return;
    }
    
    const { startRow, startCol, answer } = selectedWord;
    
    for (let i = 0; i < answer.length; i++) {
        const row = selectedDirection === 'across' ? startRow : startRow + i;
        const col = selectedDirection === 'across' ? startCol + i : startCol;
        
        const cell = getCellElement(row, col);
        const input = cell?.querySelector('.cell-input');
        
        if (input) {
            input.value = answer[i];
        }
    }
    
    hintsUsed += answer.length;
    updateStats();
    markWordAsCorrect();
    showMessage(`Revealed word: ${answer}`, 'info');
}

function checkAllAnswers() {
    let correctCount = 0;
    let totalCount = 0;
    
    [...currentPuzzle.clues.across, ...currentPuzzle.clues.down].forEach(clue => {
        const direction = currentPuzzle.clues.across.includes(clue) ? 'across' : 'down';
        const { startRow, startCol, answer } = clue;
        
        let currentAnswer = '';
        for (let i = 0; i < answer.length; i++) {
            const row = direction === 'across' ? startRow : startRow + i;
            const col = direction === 'across' ? startCol + i : startCol;
            
            const cell = getCellElement(row, col);
            const input = cell?.querySelector('.cell-input');
            currentAnswer += input?.value || '';
        }
        
        totalCount++;
        if (currentAnswer.toUpperCase() === answer) {
            correctCount++;
            const wordKey = `${direction}-${clue.number}`;
            if (!completedWords.has(wordKey)) {
                completedWords.add(wordKey);
                
                // Mark cells as correct
                for (let i = 0; i < answer.length; i++) {
                    const row = direction === 'across' ? startRow : startRow + i;
                    const col = direction === 'across' ? startCol + i : startCol;
                    
                    const cell = getCellElement(row, col);
                    if (cell) {
                        cell.classList.add('correct');
                    }
                }
                
                // Mark clue as completed
                const clueElement = document.querySelector(`[data-direction="${direction}"][data-number="${clue.number}"]`);
                if (clueElement) {
                    clueElement.classList.add('completed');
                }
            }
        }
    });
    
    updateStats();
    showMessage(`${correctCount} of ${totalCount} words correct!`, correctCount === totalCount ? 'success' : 'info');
    
    if (correctCount === totalCount) {
        setTimeout(() => completePuzzle(), 1500);
    }
}

function resetPuzzle() {
    if (confirm('Are you sure you want to reset the puzzle? All progress will be lost.')) {
        resetPuzzleState();
        
        // Clear all inputs
        document.querySelectorAll('.cell-input').forEach(input => {
            input.value = '';
        });
        
        // Remove all visual states
        document.querySelectorAll('.crossword-cell').forEach(cell => {
            cell.classList.remove('correct', 'incorrect', 'active', 'highlighted');
        });
        
        document.querySelectorAll('.clue-item').forEach(clue => {
            clue.classList.remove('completed', 'active');
        });
        
        updateStats();
        startTimer();
        showMessage('Puzzle reset!', 'info');
    }
}

function newPuzzle() {
    // Check if there's a newer puzzle available (for testing or if day changed)
    const newDailyPuzzle = getTodaysPuzzle();
    
    if (JSON.stringify(newDailyPuzzle) !== JSON.stringify(currentPuzzle)) {
        // New puzzle available
        currentPuzzle = newDailyPuzzle;
        resetPuzzleState();
        updatePuzzleInfo();
        createGrid();
        populateClues();
        updateStats();
        startTimer();
        
        const today = currentPuzzleDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        showMessage(`New puzzle loaded! Puzzle #${puzzleNumber} for ${today}`, 'info');
    } else {
        // Same puzzle, just reset
        resetPuzzle();
    }
    
    closeAllModals();
}

function resetPuzzleState() {
    completedWords.clear();
    hintsUsed = 0;
    clearSelection();
}

// Sound functions (placeholder)
function playSuccessSound() {
    if (!settings.soundEffects) return;
    // Implementation would play a success sound
}

function playErrorSound() {
    if (!settings.soundEffects) return;
    // Implementation would play an error sound
}

// Setup event listeners
function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', closeAllModals);
    });
    
    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });
    
    // Header buttons
    document.getElementById('hintBtn')?.addEventListener('click', showHint);
    document.getElementById('checkBtn')?.addEventListener('click', checkAllAnswers);
    document.getElementById('resetBtn')?.addEventListener('click', resetPuzzle);
    document.getElementById('settingsBtn')?.addEventListener('click', () => showModal('settingsModal'));
    
    // Control buttons
    document.getElementById('clearWordBtn')?.addEventListener('click', clearCurrentWord);
    document.getElementById('revealWordBtn')?.addEventListener('click', revealCurrentWord);
    document.getElementById('checkWordBtn')?.addEventListener('click', checkCurrentWord);
    
    // Modal buttons
    document.getElementById('revealLetterBtn')?.addEventListener('click', revealLetter);
    document.getElementById('newPuzzleBtn')?.addEventListener('click', newPuzzle);
    document.getElementById('shareResultsBtn')?.addEventListener('click', shareResults);
    
    // Settings toggles
    document.getElementById('darkThemeToggle')?.addEventListener('change', (e) => {
        settings.darkTheme = e.target.checked;
        saveSettings();
        applySettings();
    });
    
    document.getElementById('showTimerToggle')?.addEventListener('change', (e) => {
        settings.showTimer = e.target.checked;
        saveSettings();
        if (settings.showTimer) {
            startTimer();
        } else {
            stopTimer();
        }
    });
    
    document.getElementById('autoCheckToggle')?.addEventListener('change', (e) => {
        settings.autoCheck = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('soundToggle')?.addEventListener('change', (e) => {
        settings.soundEffects = e.target.checked;
        saveSettings();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('cell-input')) return;
        
        switch (e.key) {
            case 'Escape':
                closeAllModals();
                clearSelection();
                break;
            case 'h':
            case 'H':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    showHint();
                }
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    resetPuzzle();
                }
                break;
        }
    });
}

// Share results function
function shareResults() {
    const totalWords = currentPuzzle.clues.across.length + currentPuzzle.clues.down.length;
    const elapsed = gameStartTime ? Math.floor((Date.now() - gameStartTime) / 1000) : 0;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const today = currentPuzzleDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    
    const shareText = `🧩 Crossword Puzzle #${puzzleNumber} (${today})\n\n📊 Results:\n• ${completedWords.size}/${totalWords} words solved\n• ${hintsUsed} hints used\n• Time: ${timeString}\n\nPlay daily puzzles at Puzzle Grove!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Daily Crossword Results',
            text: shareText
        });
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showMessage('Results copied to clipboard!', 'success');
        });
    } else {
        showMessage('Sharing not supported on this device', 'error');
    }
}