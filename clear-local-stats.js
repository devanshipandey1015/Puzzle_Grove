// Clear Local Storage Statistics
// This script clears all localStorage game statistics to force database usage

document.addEventListener('DOMContentLoaded', function() {
    const statsKeys = [
        'wordleStats',
        'connectionsStats', 
        'wordsearchStats',
        'anagramsStats',
        'spellingbeeStats',
        'crosswordStats',
        'hangmanStats',
        'synonymStats',
        'puzzleGroveStats_dhaarmi',
        'puzzleGroveStats_test4',
        'puzzleGroveStats_test5',
        'puzzleGroveStats_strads'
    ];
    
    // Clear all statistics from localStorage
    statsKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    });
    
    // Clear any other potential stats keys
    Object.keys(localStorage).forEach(key => {
        if (key.includes('Stats') || key.includes('puzzleGroveStats_')) {
            localStorage.removeItem(key);
        }
    });
    
});
