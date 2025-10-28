// Database Initialization Script
// This script sets up the database with demo user and initial data

document.addEventListener('DOMContentLoaded', async function() {
    // Wait for database to be ready
    await window.dbManager.init();
    
    // Check if demo user exists, if not create it
    try {
        await window.dbManager.getUserByUsername('dhaarmi');
        console.log('Demo user already exists');
    } catch (error) {
        // Demo user doesn't exist, create it
        try {
            const demoUser = await window.dbManager.registerUser({
                username: 'dhaarmi',
                email: 'demo@puzzlegrove.com',
                password: '2005',
                fullName: 'Demo User'
            });
            console.log('Demo user created successfully:', demoUser);
        } catch (createError) {
            console.error('Error creating demo user:', createError);
        }
    }
    
    // Initialize some sample data for demo user
    try {
        const stats = await window.dbManager.getUserStats('dhaarmi');
        if (stats) {
            // Add some sample game progress
            await window.dbManager.updateUserStats('dhaarmi', 'wordle', {
                gamesPlayed: 5,
                gamesWon: 4,
                currentStreak: 3,
                maxStreak: 5
            });
            
            await window.dbManager.updateUserStats('dhaarmi', 'connections', {
                gamesPlayed: 3,
                gamesWon: 2,
                currentStreak: 1,
                maxStreak: 3
            });

            await window.dbManager.updateUserStats('dhaarmi', 'anagrams', {
                gamesPlayed: 7,
                gamesWon: 6,
                currentStreak: 2,
                maxStreak: 4
            });

            await window.dbManager.updateUserStats('dhaarmi', 'wordsearch', {
                gamesPlayed: 4,
                gamesWon: 3,
                currentStreak: 0,
                maxStreak: 2
            });
            
            console.log('Demo user stats initialized');
        }
    } catch (error) {
        console.error('Error initializing demo user stats:', error);
    }
    
    console.log('Database initialization complete');
});
