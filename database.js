// Database Manager for Puzzle Grove
// Handles user registration, authentication, and data persistence using IndexedDB

class DatabaseManager {
    constructor() {
        this.dbName = 'PuzzleGroveDB';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    // Initialize the database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                this.createObjectStores();
            };
        });
    }

    // Create object stores for different data types
    createObjectStores() {
        // Users store
        if (!this.db.objectStoreNames.contains('users')) {
            const usersStore = this.db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            usersStore.createIndex('username', 'username', { unique: true });
            usersStore.createIndex('email', 'email', { unique: true });
        }

        // User stats store
        if (!this.db.objectStoreNames.contains('userStats')) {
            const statsStore = this.db.createObjectStore('userStats', { keyPath: 'userId' });
            statsStore.createIndex('username', 'username', { unique: true });
        }

        // Game progress store
        if (!this.db.objectStoreNames.contains('gameProgress')) {
            const progressStore = this.db.createObjectStore('gameProgress', { keyPath: 'id', autoIncrement: true });
            progressStore.createIndex('userId', 'userId');
            progressStore.createIndex('game', 'game');
        }

        console.log('Object stores created successfully');
    }

    // User Management Methods

    // Register a new user
    async registerUser(userData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            // Check if username already exists
            const usernameIndex = store.index('username');
            const usernameRequest = usernameIndex.get(userData.username);
            
            usernameRequest.onsuccess = () => {
                if (usernameRequest.result) {
                    reject(new Error('Username already exists'));
                    return;
                }

                // Check if email already exists
                const emailIndex = store.index('email');
                const emailRequest = emailIndex.get(userData.email);
                
                emailRequest.onsuccess = () => {
                    if (emailRequest.result) {
                        reject(new Error('Email already exists'));
                        return;
                    }

                    // Create new user
                    const newUser = {
                        username: userData.username,
                        email: userData.email,
                        password: this.hashPassword(userData.password), // Hash the password
                        fullName: userData.fullName || userData.username,
                        registeredAt: new Date().toISOString(),
                        lastLogin: null,
                        isActive: true
                    };

                    const addRequest = store.add(newUser);
                    
                    addRequest.onsuccess = () => {
                        // Initialize user stats
                        this.initializeUserStats(newUser.username).then(() => {
                            resolve({
                                id: addRequest.result,
                                username: newUser.username,
                                email: newUser.email,
                                fullName: newUser.fullName,
                                registeredAt: newUser.registeredAt
                            });
                        });
                    };
                    
                    addRequest.onerror = () => {
                        reject(new Error('Failed to create user account'));
                    };
                };
            };
        });
    }

    // Authenticate user login
    async authenticateUser(username, password) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const usernameIndex = store.index('username');
            const request = usernameIndex.get(username);

            request.onsuccess = () => {
                const user = request.result;
                
                if (!user) {
                    reject(new Error('User not found'));
                    return;
                }

                if (!user.isActive) {
                    reject(new Error('Account is deactivated'));
                    return;
                }

                // Verify password
                if (this.verifyPassword(password, user.password)) {
                    // Update last login
                    user.lastLogin = new Date().toISOString();
                    const updateRequest = store.put(user);
                    
                    updateRequest.onsuccess = () => {
                        resolve({
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            fullName: user.fullName,
                            registeredAt: user.registeredAt,
                            lastLogin: user.lastLogin
                        });
                    };
                } else {
                    reject(new Error('Invalid password'));
                }
            };

            request.onerror = () => {
                reject(new Error('Database error during authentication'));
            };
        });
    }

    // Get user by username
    async getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const usernameIndex = store.index('username');
            const request = usernameIndex.get(username);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to retrieve user'));
            };
        });
    }

    // Update user profile
    async updateUserProfile(userId, updateData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.get(userId);

            request.onsuccess = () => {
                const user = request.result;
                if (user) {
                    Object.assign(user, updateData);
                    const updateRequest = store.put(user);
                    
                    updateRequest.onsuccess = () => {
                        resolve(user);
                    };
                    
                    updateRequest.onerror = () => {
                        reject(new Error('Failed to update user profile'));
                    };
                } else {
                    reject(new Error('User not found'));
                }
            };
        });
    }

    // User Stats Methods

    // Initialize user stats
    async initializeUserStats(username) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userStats'], 'readwrite');
            const store = transaction.objectStore('userStats');
            
            const statsData = {
                userId: username,
                username: username,
                totalGamesPlayed: 0,
                totalGamesWon: 0,
                currentStreak: 0,
                maxStreak: 0,
                totalScore: 0,
                achievements: [],
                gameStats: {
                    wordle: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                    connections: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                    wordsearch: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                    anagrams: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                    spellingbee: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                    crossword: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                    hangman: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                    synonym: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 }
                },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            const request = store.add(statsData);
            
            request.onsuccess = () => {
                resolve(statsData);
            };
            
            request.onerror = () => {
                reject(new Error('Failed to initialize user stats'));
            };
        });
    }

    // Get user stats
    async getUserStats(username) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userStats'], 'readonly');
            const store = transaction.objectStore('userStats');
            const usernameIndex = store.index('username');
            const request = usernameIndex.get(username);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to retrieve user stats'));
            };
        });
    }

    // Update user stats
    async updateUserStats(username, gameType, statsUpdate) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userStats'], 'readwrite');
            const store = transaction.objectStore('userStats');
            const usernameIndex = store.index('username');
            const request = usernameIndex.get(username);

            request.onsuccess = () => {
                const userStats = request.result;
                if (userStats) {
                    // Update general stats
                    if (statsUpdate.gamesPlayed) userStats.totalGamesPlayed += statsUpdate.gamesPlayed;
                    if (statsUpdate.gamesWon) userStats.totalGamesWon += statsUpdate.gamesWon;
                    if (statsUpdate.score) userStats.totalScore += statsUpdate.score;
                    
                    // Update streaks
                    if (statsUpdate.currentStreak !== undefined) {
                        userStats.currentStreak = statsUpdate.currentStreak;
                    }
                    if (statsUpdate.maxStreak !== undefined) {
                        userStats.maxStreak = Math.max(userStats.maxStreak || 0, statsUpdate.maxStreak);
                    }
                    
                    // Update game-specific stats - ensure each user has separate stats
                    if (userStats.gameStats[gameType]) {
                        // Update existing game stats
                        if (statsUpdate.gamesPlayed) {
                            userStats.gameStats[gameType].gamesPlayed += statsUpdate.gamesPlayed;
                        }
                        if (statsUpdate.gamesWon) {
                            userStats.gameStats[gameType].gamesWon += statsUpdate.gamesWon;
                        }
                        if (statsUpdate.currentStreak !== undefined) {
                            userStats.gameStats[gameType].currentStreak = statsUpdate.currentStreak;
                        }
                        if (statsUpdate.maxStreak !== undefined) {
                            userStats.gameStats[gameType].maxStreak = Math.max(
                                userStats.gameStats[gameType].maxStreak || 0, 
                                statsUpdate.maxStreak
                            );
                        }
                    } else {
                        // Initialize game stats if they don't exist
                        userStats.gameStats[gameType] = {
                            gamesPlayed: statsUpdate.gamesPlayed || 0,
                            gamesWon: statsUpdate.gamesWon || 0,
                            currentStreak: statsUpdate.currentStreak || 0,
                            maxStreak: statsUpdate.maxStreak || 0
                        };
                    }
                    
                    userStats.lastUpdated = new Date().toISOString();
                    
                    const updateRequest = store.put(userStats);
                    
                    updateRequest.onsuccess = () => {
                        resolve(userStats);
                    };
                    
                    updateRequest.onerror = () => {
                        reject(new Error('Failed to update user stats'));
                    };
                } else {
                    reject(new Error('User stats not found'));
                }
            };
        });
    }

    // Game Progress Methods

    // Save game progress
    async saveGameProgress(userId, gameType, progressData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['gameProgress'], 'readwrite');
            const store = transaction.objectStore('gameProgress');
            
            const progress = {
                userId: userId,
                game: gameType,
                data: progressData,
                timestamp: new Date().toISOString()
            };

            const request = store.add(progress);
            
            request.onsuccess = () => {
                resolve(progress);
            };
            
            request.onerror = () => {
                reject(new Error('Failed to save game progress'));
            };
        });
    }

    // Get game progress
    async getGameProgress(userId, gameType) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['gameProgress'], 'readonly');
            const store = transaction.objectStore('gameProgress');
            const userIdIndex = store.index('userId');
            const request = userIdIndex.getAll(userId);

            request.onsuccess = () => {
                const allProgress = request.result;
                const gameProgress = allProgress.filter(p => p.game === gameType);
                resolve(gameProgress);
            };

            request.onerror = () => {
                reject(new Error('Failed to retrieve game progress'));
            };
        });
    }

    // Utility Methods

    // Simple password hashing (in production, use a proper hashing library)
    hashPassword(password) {
        // This is a simple hash for demo purposes
        // In production, use bcrypt or similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Verify password
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // Clear all data (for testing)
    async clearAllData() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users', 'userStats', 'gameProgress'], 'readwrite');
            
            const usersStore = transaction.objectStore('users');
            const statsStore = transaction.objectStore('userStats');
            const progressStore = transaction.objectStore('gameProgress');
            
            usersStore.clear();
            statsStore.clear();
            progressStore.clear();
            
            transaction.oncomplete = () => {
                resolve('All data cleared');
            };
            
            transaction.onerror = () => {
                reject(new Error('Failed to clear data'));
            };
        });
    }

    // Reset user stats (fix shared stats issue)
    async resetUserStats(username) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['userStats'], 'readwrite');
            const store = transaction.objectStore('userStats');
            const usernameIndex = store.index('username');
            const request = usernameIndex.get(username);

            request.onsuccess = () => {
                const userStats = request.result;
                if (userStats) {
                    // Reset to clean stats
                    userStats.totalGamesPlayed = 0;
                    userStats.totalGamesWon = 0;
                    userStats.currentStreak = 0;
                    userStats.maxStreak = 0;
                    userStats.totalScore = 0;
                    userStats.gameStats = {
                        wordle: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                        connections: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                        wordsearch: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                        anagrams: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                        spellingbee: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                        crossword: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                        hangman: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 },
                        synonym: { gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0 }
                    };
                    userStats.lastUpdated = new Date().toISOString();
                    
                    const updateRequest = store.put(userStats);
                    
                    updateRequest.onsuccess = () => {
                        resolve(userStats);
                    };
                    
                    updateRequest.onerror = () => {
                        reject(new Error('Failed to reset user stats'));
                    };
                } else {
                    reject(new Error('User stats not found'));
                }
            };
        });
    }

    // Export user data
    async exportUserData(username) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.getUserByUsername(username);
                const stats = await this.getUserStats(username);
                const progress = await this.getGameProgress(username, 'all');
                
                const exportData = {
                    user: user,
                    stats: stats,
                    progress: progress,
                    exportDate: new Date().toISOString()
                };
                
                resolve(exportData);
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Create global database instance
window.dbManager = new DatabaseManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}
