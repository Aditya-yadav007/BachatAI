/**
 * Admin Notification Panel JavaScript
 * Handles CRUD operations for notifications management
 */

class AdminPanel {
    constructor() {
        this.notificationManager = new NotificationManager();
        this.currentEditId = null;
        this.init();
    }

    /**
     * Initialize the admin panel
     */
    init() {
        this.bindEvents();
        this.loadNotifications();
        this.updateStats();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Form submission
        document.getElementById('notificationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel edit
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadNotifications();
            this.updateStats();
            this.showMessage('Notifications refreshed', 'success');
        });

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.confirmClearAll();
        });

        // Form input validation
        document.getElementById('notificationTitle').addEventListener('input', this.validateForm.bind(this));
        document.getElementById('notificationMessage').addEventListener('input', this.validateForm.bind(this));
        document.getElementById('notificationLink').addEventListener('input', this.validateForm.bind(this));
    }

    /**
     * Handle form submission (add or edit)
     */
    handleFormSubmit() {
        const formData = this.getFormData();
        const validation = this.notificationManager.validateNotification(formData);

        if (!validation.isValid) {
            this.showMessage(validation.errors.join('<br>'), 'error');
            return;
        }

        let result;
        if (this.currentEditId) {
            // Update existing notification
            result = this.notificationManager.updateNotification(this.currentEditId, formData);
            if (result) {
                this.showMessage('Notification updated successfully!', 'success');
                this.cancelEdit();
            } else {
                this.showMessage('Failed to update notification', 'error');
            }
        } else {
            // Add new notification
            result = this.notificationManager.addNotification(formData);
            if (result) {
                this.showMessage('Notification added successfully!', 'success');
                this.resetForm();
            } else {
                this.showMessage('Failed to add notification', 'error');
            }
        }

        if (result) {
            this.loadNotifications();
            this.updateStats();
        }
    }

    /**
     * Get form data
     * @returns {Object} Form data object
     */
    getFormData() {
        return {
            title: document.getElementById('notificationTitle').value.trim(),
            message: document.getElementById('notificationMessage').value.trim(),
            link: document.getElementById('notificationLink').value.trim(),
            isActive: document.getElementById('notificationStatus').value === 'true'
        };
    }

    /**
     * Validate form inputs
     */
    validateForm() {
        const formData = this.getFormData();
        const validation = this.notificationManager.validateNotification(formData);
        
        // Update submit button state
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = !validation.isValid;
        
        // Clear previous error messages if form is valid
        if (validation.isValid) {
            this.clearMessages();
        }
    }

    /**
     * Load and display notifications
     */
    loadNotifications() {
        const notifications = this.notificationManager.getNotifications();
        const tableBody = document.getElementById('notificationsTableBody');
        const emptyState = document.getElementById('emptyState');

        if (notifications.length === 0) {
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tableBody.innerHTML = notifications.map(notification => this.createNotificationRow(notification)).join('');
    }

    /**
     * Create HTML for notification table row
     * @param {Object} notification - Notification object
     * @returns {string} HTML string
     */
    createNotificationRow(notification) {
        const statusClass = notification.isActive ? 'status-active' : 'status-inactive';
        const statusText = notification.isActive ? 'Active' : 'Inactive';
        const linkDisplay = notification.link ? 
            `<a href="${notification.link}" target="_blank" class="link-preview" title="${notification.link}">
                <i class="fas fa-external-link-alt"></i>
            </a>` : 
            '<span class="no-link">No link</span>';

        return `
            <tr data-id="${notification.id}">
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td class="title-cell">
                    <div class="title-content" title="${notification.title}">
                        ${notification.title}
                    </div>
                </td>
                <td class="message-cell">
                    <div class="message-content" title="${notification.message}">
                        ${notification.message}
                    </div>
                </td>
                <td class="link-cell">
                    ${linkDisplay}
                </td>
                <td class="date-cell">
                    <time datetime="${notification.timestamp}" title="${new Date(notification.timestamp).toLocaleString()}">
                        ${this.notificationManager.formatTimestamp(notification.timestamp)}
                    </time>
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="adminPanel.editNotification('${notification.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm ${notification.isActive ? 'btn-warning' : 'btn-success'}" 
                                onclick="adminPanel.toggleStatus('${notification.id}')" 
                                title="${notification.isActive ? 'Deactivate' : 'Activate'}">
                            <i class="fas ${notification.isActive ? 'fa-pause' : 'fa-play'}"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteNotification('${notification.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Edit notification
     * @param {string} id - Notification ID
     */
    editNotification(id) {
        const notification = this.notificationManager.getNotificationById(id);
        if (!notification) {
            this.showMessage('Notification not found', 'error');
            return;
        }

        // Populate form with notification data
        document.getElementById('notificationTitle').value = notification.title;
        document.getElementById('notificationMessage').value = notification.message;
        document.getElementById('notificationLink').value = notification.link || '';
        document.getElementById('notificationStatus').value = notification.isActive.toString();

        // Update form UI for editing
        this.currentEditId = id;
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Notification';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
        this.showMessage('Editing notification. Make changes and click Update.', 'info');
    }

    /**
     * Cancel edit mode
     */
    cancelEdit() {
        this.currentEditId = null;
        this.resetForm();
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-plus"></i> Add Notification';
        document.getElementById('cancelBtn').style.display = 'none';
        this.clearMessages();
    }

    /**
     * Toggle notification status
     * @param {string} id - Notification ID
     */
    toggleStatus(id) {
        const notification = this.notificationManager.getNotificationById(id);
        if (!notification) {
            this.showMessage('Notification not found', 'error');
            return;
        }

        const newStatus = notification.isActive ? 'deactivated' : 'activated';
        if (this.notificationManager.toggleNotificationStatus(id)) {
            this.showMessage(`Notification ${newStatus} successfully!`, 'success');
            this.loadNotifications();
            this.updateStats();
        } else {
            this.showMessage('Failed to update notification status', 'error');
        }
    }

    /**
     * Delete notification with confirmation
     * @param {string} id - Notification ID
     */
    deleteNotification(id) {
        const notification = this.notificationManager.getNotificationById(id);
        if (!notification) {
            this.showMessage('Notification not found', 'error');
            return;
        }

        this.showConfirmModal(
            'Delete Notification',
            `Are you sure you want to delete "${notification.title}"? This action cannot be undone.`,
            () => {
                if (this.notificationManager.deleteNotification(id)) {
                    this.showMessage('Notification deleted successfully!', 'success');
                    this.loadNotifications();
                    this.updateStats();
                    
                    // Cancel edit if deleting currently edited notification
                    if (this.currentEditId === id) {
                        this.cancelEdit();
                    }
                } else {
                    this.showMessage('Failed to delete notification', 'error');
                }
            }
        );
    }

    /**
     * Confirm clear all notifications
     */
    confirmClearAll() {
        const stats = this.notificationManager.getStats();
        if (stats.total === 0) {
            this.showMessage('No notifications to clear', 'info');
            return;
        }

        this.showConfirmModal(
            'Clear All Notifications',
            `Are you sure you want to delete all ${stats.total} notifications? This action cannot be undone.`,
            () => {
                if (this.notificationManager.clearAllNotifications()) {
                    this.showMessage('All notifications cleared successfully!', 'success');
                    this.loadNotifications();
                    this.updateStats();
                    this.cancelEdit();
                } else {
                    this.showMessage('Failed to clear notifications', 'error');
                }
            }
        );
    }

    /**
     * Show confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback for confirmation
     */
    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'flex';
        
        // Set up confirm button
        const confirmBtn = document.getElementById('confirmAction');
        confirmBtn.onclick = () => {
            onConfirm();
            this.closeConfirmModal();
        };
    }

    /**
     * Close confirmation modal
     */
    closeConfirmModal() {
        document.getElementById('confirmModal').style.display = 'none';
    }

    /**
     * Update statistics display
     */
    updateStats() {
        const stats = this.notificationManager.getStats();
        document.getElementById('totalCount').textContent = stats.total;
        document.getElementById('activeCount').textContent = stats.active;
    }

    /**
     * Reset form to initial state
     */
    resetForm() {
        document.getElementById('notificationForm').reset();
        document.getElementById('notificationStatus').value = 'true';
        this.validateForm();
    }

    /**
     * Show message to user
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, info, warning)
     */
    showMessage(message, type = 'info') {
        const messagesContainer = document.getElementById('formMessages');
        messagesContainer.innerHTML = `
            <div class="message message-${type}">
                <i class="fas ${this.getMessageIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                this.clearMessages();
            }, 3000);
        }
    }

    /**
     * Get icon for message type
     * @param {string} type - Message type
     * @returns {string} Font Awesome icon class
     */
    getMessageIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Clear all messages
     */
    clearMessages() {
        document.getElementById('formMessages').innerHTML = '';
    }
}

// Global functions for onclick handlers
window.closeConfirmModal = function() {
    adminPanel.closeConfirmModal();
};

// Initialize admin panel when DOM is loaded
let adminPanel;
document.addEventListener('DOMContentLoaded', function() {
    adminPanel = new AdminPanel();
    window.adminPanel = adminPanel; // Make available globally for onclick handlers
});
