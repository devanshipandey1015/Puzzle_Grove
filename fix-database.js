// Database Fix Script
// This script fixes the shared statistics issue by resetting all user stats

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Starting database fix...');
    
    try {
        // Wait for database to be ready
        await window.dbManager.init();
        
        // Get all users
        const transaction = window.dbManager.db.transaction(['users'], 'readonly');
        const usersStore = transaction.objectStore('users');
        const usersRequest = usersStore.getAll();
        
        usersRequest.onsuccess = async () => {
            const users = usersRequest.result;
            console.log(`Found ${users.length} users to fix`);
            
            // Reset stats for each user
            for (const user of users) {
                try {
                    console.log(`Resetting stats for user: ${user.username}`);
                    await window.dbManager.resetUserStats(user.username);
                    console.log(`✅ Stats reset for ${user.username}`);
                } catch (error) {
                    console.error(`❌ Error resetting stats for ${user.username}:`, error);
                }
            }
            
            console.log('Database fix completed!');
            alert('Database has been fixed! All user statistics have been reset and separated.');
        };
        
        usersRequest.onerror = () => {
            console.error('Error loading users for fix');
        };
        
    } catch (error) {
        console.error('Error during database fix:', error);
    }
});
