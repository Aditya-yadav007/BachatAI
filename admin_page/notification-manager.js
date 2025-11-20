/**
 * Notification Manager - Shared JavaScript Module
 * Handles localStorage operations for notifications between admin and user pages
 */

class NotificationManager {
    constructor() {
        this.storageKey = 'bachatai_notifications';
        this.init();
    }

    /**
     * Initialize the notification system
     * Creates sample data if no notifications exist
     */
    init() {
        if (!this.getNotifications().length) {
            this.createSampleData();
        }
    }

    /**
     * Get all notifications from localStorage
     * @returns {Array} Array of notification objects
     */
    getNotifications() {
        try {
            const notifications = localStorage.getItem(this.storageKey);
            return notifications ? JSON.parse(notifications) : [];
        } catch (error) {
            console.error('Error reading notifications from localStorage:', error);
            return [];
        }
    }

    /**
     * Get only active notifications (for user page)
     * @returns {Array} Array of active notification objects
     */
    getActiveNotifications() {
        return this.getNotifications().filter(notification => notification.isActive);
    }

    /**
     * Save notifications to localStorage
     * @param {Array} notifications - Array of notification objects
     * @returns {boolean} Success status
     */
    saveNotifications(notifications) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(notifications));
            return true;
        } catch (error) {
            console.error('Error saving notifications to localStorage:', error);
            return false;
        }
    }

    /**
     * Add a new notification
     * @param {Object} notificationData - Notification data object
     * @returns {Object|null} Created notification or null if failed
     */
    addNotification(notificationData) {
        try {
            const notifications = this.getNotifications();
            const newNotification = {
                id: this.generateId(),
                title: notificationData.title.trim(),
                message: notificationData.message.trim(),
                link: notificationData.link ? notificationData.link.trim() : '',
                timestamp: new Date().toISOString(),
                isActive: notificationData.isActive !== undefined ? notificationData.isActive : true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            notifications.unshift(newNotification); // Add to beginning
            
            if (this.saveNotifications(notifications)) {
                return newNotification;
            }
            return null;
        } catch (error) {
            console.error('Error adding notification:', error);
            return null;
        }
    }

    /**
     * Update an existing notification
     * @param {string} id - Notification ID
     * @param {Object} updateData - Data to update
     * @returns {Object|null} Updated notification or null if failed
     */
    updateNotification(id, updateData) {
        try {
            const notifications = this.getNotifications();
            const index = notifications.findIndex(n => n.id === id);
            
            if (index === -1) {
                console.error('Notification not found:', id);
                return null;
            }

            // Update notification with new data
            notifications[index] = {
                ...notifications[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            if (this.saveNotifications(notifications)) {
                return notifications[index];
            }
            return null;
        } catch (error) {
            console.error('Error updating notification:', error);
            return null;
        }
    }

    /**
     * Delete a notification
     * @param {string} id - Notification ID
     * @returns {boolean} Success status
     */
    deleteNotification(id) {
        try {
            const notifications = this.getNotifications();
            const filteredNotifications = notifications.filter(n => n.id !== id);
            
            if (filteredNotifications.length === notifications.length) {
                console.error('Notification not found:', id);
                return false;
            }

            return this.saveNotifications(filteredNotifications);
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }

    /**
     * Toggle notification active status
     * @param {string} id - Notification ID
     * @returns {boolean} Success status
     */
    toggleNotificationStatus(id) {
        try {
            const notifications = this.getNotifications();
            const notification = notifications.find(n => n.id === id);
            
            if (!notification) {
                console.error('Notification not found:', id);
                return false;
            }

            notification.isActive = !notification.isActive;
            notification.updatedAt = new Date().toISOString();

            return this.saveNotifications(notifications);
        } catch (error) {
            console.error('Error toggling notification status:', error);
            return false;
        }
    }

    /**
     * Get a single notification by ID
     * @param {string} id - Notification ID
     * @returns {Object|null} Notification object or null if not found
     */
    getNotificationById(id) {
        const notifications = this.getNotifications();
        return notifications.find(n => n.id === id) || null;
    }

    /**
     * Generate a unique ID for notifications
     * @returns {string} Unique ID
     */
    generateId() {
        return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Format timestamp for display
     * @param {string} timestamp - ISO timestamp string
     * @returns {string} Formatted date string
     */
    formatTimestamp(timestamp) {
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    }

    /**
     * Validate notification data
     * @param {Object} data - Notification data to validate
     * @returns {Object} Validation result with isValid and errors
     */
    validateNotification(data) {
        const errors = [];

        if (!data.title || data.title.trim().length === 0) {
            errors.push('Title is required');
        } else if (data.title.trim().length > 100) {
            errors.push('Title must be less than 100 characters');
        }

        if (!data.message || data.message.trim().length === 0) {
            errors.push('Message is required');
        } else if (data.message.trim().length > 500) {
            errors.push('Message must be less than 500 characters');
        }

        if (data.link && data.link.trim().length > 0) {
            try {
                new URL(data.link.trim());
            } catch {
                errors.push('Link must be a valid URL');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Create sample data for demonstration
     */
    createSampleData() {
        const sampleNotifications = [
            {
                id: this.generateId(),
                title: 'Welcome to BachatAI',
                message: 'Thank you for joining our financial management platform. Explore our features to start managing your finances better.',
                link: 'https://bachatai.com/getting-started',
                timestamp: new Date().toISOString(),
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                title: 'System Maintenance Scheduled',
                message: 'We will be performing scheduled maintenance on Sunday, 3:00 AM - 5:00 AM IST. Some features may be temporarily unavailable.',
                link: '',
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                isActive: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: this.generateId(),
                title: 'New Feature: Budget Tracking',
                message: 'We have launched a new budget tracking feature. Set your monthly budgets and track your expenses in real-time.',
                link: 'https://bachatai.com/features/budget-tracking',
                timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                isActive: false,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];

        this.saveNotifications(sampleNotifications);
    }

    /**
     * Clear all notifications (for testing purposes)
     */
    clearAllNotifications() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing notifications:', error);
            return false;
        }
    }

    /**
     * Get notification statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        const notifications = this.getNotifications();
        return {
            total: notifications.length,
            active: notifications.filter(n => n.isActive).length,
            inactive: notifications.filter(n => !n.isActive).length
        };
    }
}

// Export for use in other files
window.NotificationManager = NotificationManager;
