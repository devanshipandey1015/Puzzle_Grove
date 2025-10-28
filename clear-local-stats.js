// Clear Local Storage Statistics
// This script clears all localStorage game statistics to force database usage

document.addEventListener('DOMContentLoaded', function() {
    console.log('Clearing localStorage game statistics...');
    
    // List of all localStorage keys that store game statistics
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
            console.log(`Cleared ${key} from localStorage`);
        }
    });
    
    // Clear any other potential stats keys
    Object.keys(localStorage).forEach(key => {
        if (key.includes('Stats') || key.includes('puzzleGroveStats_')) {
            localStorage.removeItem(key);
            console.log(`Cleared ${key} from localStorage`);
        }
    });
    
    console.log('localStorage statistics cleared successfully!');
    console.log('Games will now use the database for statistics.');
});
