// Database Fix Script
// This script fixes the shared statistics issue by resetting all user stats

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.dbManager.init();
        const transaction = window.dbManager.db.transaction(['users'], 'readonly');
        const usersStore = transaction.objectStore('users');
        const usersRequest = usersStore.getAll();

        usersRequest.onsuccess = async () => {
            const users = usersRequest.result;
            for (const user of users) {
                try {
                    await window.dbManager.resetUserStats(user.username);
                } catch (error) {
                    console.error('Error resetting stats for user:', user.username, error);
                }
            }
            alert('Database has been fixed! All user statistics have been reset and separated.');
        };

        usersRequest.onerror = () => {
            console.error('Error loading users for fix');
        };
    } catch (error) {
        console.error('Error during database fix:', error);
    }
});
