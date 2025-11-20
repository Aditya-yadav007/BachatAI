/**
 * User Notification Page JavaScript
 * Handles read-only display of active notifications
 */

class UserNotificationPage {
    constructor() {
        this.notificationManager = new NotificationManager();
        this.refreshInterval = null;
        this.init();
    }

    /**
     * Initialize the user notification page
     */
    init() {
        this.bindEvents();
        this.loadNotifications();
        this.startAutoRefresh();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadNotifications();
        });

        // Check again button in empty state
        document.getElementById('checkAgainBtn').addEventListener('click', () => {
            this.loadNotifications();
        });

        // Close modal when clicking outside
        document.getElementById('notificationModal').addEventListener('click', (e) => {
            if (e.target.id === 'notificationModal') {
                this.closeNotificationModal();
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeNotificationModal();
            }
        });
    }

    /**
     * Load and display active notifications
     */
    async loadNotifications() {
        this.showLoading();
        
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            const notifications = this.notificationManager.getActiveNotifications();
            this.displayNotifications(notifications);
            this.updateNotificationCount(notifications.length);
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.showError('Failed to load notifications. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Display notifications in the UI
     * @param {Array} notifications - Array of notification objects
     */
    displayNotifications(notifications) {
        const container = document.getElementById('notificationsContainer');
        const emptyState = document.getElementById('emptyState');

        if (notifications.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        
        // Sort notifications by timestamp (newest first)
        const sortedNotifications = notifications.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        container.innerHTML = sortedNotifications
            .map(notification => this.createNotificationCard(notification))
            .join('');

        // Add animation delay to cards
        const cards = container.querySelectorAll('.notification-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    /**
     * Create HTML for notification card
     * @param {Object} notification - Notification object
     * @returns {string} HTML string
     */
    createNotificationCard(notification) {
        const hasLink = notification.link && notification.link.trim().length > 0;
        const timeAgo = this.getTimeAgo(notification.timestamp);
        
        return `
            <article class="notification-card" data-id="${notification.id}">
                <div class="notification-header">
                    <div class="notification-meta">
                        <time class="notification-time" datetime="${notification.timestamp}" title="${new Date(notification.timestamp).toLocaleString()}">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            ${timeAgo}
                        </time>
                        ${hasLink ? '<span class="has-link-indicator"><i class="fas fa-link" aria-hidden="true"></i></span>' : ''}
                    </div>
                    <button class="notification-expand" onclick="userPage.showNotificationDetails('${notification.id}')" 
                            aria-label="View full notification" title="View details">
                        <i class="fas fa-expand-alt" aria-hidden="true"></i>
                    </button>
                </div>
                
                <div class="notification-content">
                    <h2 class="notification-title">${this.escapeHtml(notification.title)}</h2>
                    <p class="notification-message">${this.escapeHtml(notification.message)}</p>
                    
                    ${hasLink ? `
                        <div class="notification-actions">
                            <a href="${notification.link}" target="_blank" rel="noopener noreferrer" class="notification-link">
                                <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                                Open Link
                            </a>
                        </div>
                    ` : ''}
                </div>
                
                <div class="notification-footer">
                    <div class="notification-status">
                        <span class="status-badge status-active">
                            <i class="fas fa-check-circle" aria-hidden="true"></i>
                            Active
                        </span>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Show notification details in modal
     * @param {string} id - Notification ID
     */
    showNotificationDetails(id) {
        const notification = this.notificationManager.getNotificationById(id);
        if (!notification) {
            console.error('Notification not found:', id);
            return;
        }

        const modal = document.getElementById('notificationModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalFooter = document.getElementById('modalFooter');

        modalTitle.textContent = notification.title;
        
        modalBody.innerHTML = `
            <div class="modal-notification-content">
                <div class="modal-meta">
                    <time datetime="${notification.timestamp}">
                        <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                        ${this.notificationManager.formatTimestamp(notification.timestamp)}
                    </time>
                    <span class="modal-status">
                        <i class="fas fa-check-circle" aria-hidden="true"></i>
                        Active
                    </span>
                </div>
                
                <div class="modal-message">
                    <p>${this.escapeHtml(notification.message)}</p>
                </div>
                
                ${notification.link ? `
                    <div class="modal-link-section">
                        <h4>Related Link:</h4>
                        <a href="${notification.link}" target="_blank" rel="noopener noreferrer" class="modal-link">
                            <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                            ${notification.link}
                        </a>
                    </div>
                ` : ''}
            </div>
        `;

        modalFooter.innerHTML = `
            <div class="modal-actions">
                ${notification.link ? `
                    <a href="${notification.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                        <i class="fas fa-external-link-alt" aria-hidden="true"></i>
                        Open Link
                    </a>
                ` : ''}
                <button class="btn btn-secondary" onclick="userPage.closeNotificationModal()">
                    Close
                </button>
            </div>
        `;

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management for accessibility
        modalTitle.focus();
    }

    /**
     * Close notification modal
     */
    closeNotificationModal() {
        const modal = document.getElementById('notificationModal');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }

    /**
     * Update notification count display
     * @param {number} count - Number of active notifications
     */
    updateNotificationCount(count) {
        document.getElementById('activeNotificationCount').textContent = count;
    }

    /**
     * Show loading state
     */
    showLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('notificationsContainer').style.opacity = '0.5';
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('notificationsContainer').style.opacity = '1';
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const container = document.getElementById('notificationsContainer');
        container.innerHTML = `
            <div class="error-state">
                <div class="error-content">
                    <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    <h3>Error Loading Notifications</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="userPage.loadNotifications()">
                        <i class="fas fa-retry" aria-hidden="true"></i>
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Get human-readable time ago string
     * @param {string} timestamp - ISO timestamp string
     * @returns {string} Time ago string
     */
    getTimeAgo(timestamp) {
        try {
            const now = new Date();
            const notificationTime = new Date(timestamp);
            const diffInSeconds = Math.floor((now - notificationTime) / 1000);

            if (diffInSeconds < 60) {
                return 'Just now';
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            } else if (diffInSeconds < 2592000) {
                const days = Math.floor(diffInSeconds / 86400);
                return `${days} day${days > 1 ? 's' : ''} ago`;
            } else {
                return notificationTime.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        } catch (error) {
            return 'Unknown time';
        }
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Start auto-refresh functionality
     */
    startAutoRefresh() {
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadNotifications();
        }, 30000);
    }

    /**
     * Stop auto-refresh functionality
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Handle page visibility change to pause/resume auto-refresh
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.stopAutoRefresh();
        } else {
            this.startAutoRefresh();
            this.loadNotifications(); // Refresh when page becomes visible
        }
    }
}

// Global functions for onclick handlers
window.closeNotificationModal = function() {
    userPage.closeNotificationModal();
};

// Initialize user page when DOM is loaded
let userPage;
document.addEventListener('DOMContentLoaded', function() {
    userPage = new UserNotificationPage();
    window.userPage = userPage; // Make available globally for onclick handlers
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        userPage.handleVisibilityChange();
    });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        userPage.stopAutoRefresh();
    });
});
