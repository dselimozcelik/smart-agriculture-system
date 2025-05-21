import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  plantId: string;
}

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const Notifications = ({ notifications, onDismiss }: NotificationsProps) => {
  // Only show up to 3 notifications at once
  const visibleNotifications = notifications.slice(0, 3);
  
  return (
    <div className="fixed bottom-4 right-4 space-y-3 max-w-sm w-full z-50 pointer-events-none">
      {visibleNotifications.map((notification, index) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onDismiss={onDismiss}
          index={index}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  index: number;
}

const NotificationItem = ({ notification, onDismiss, index }: NotificationItemProps) => {
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    // Auto dismiss after 5 seconds
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
    }, 5000 - (index * 500)); // Stagger dismissal time based on index
    
    // Add a slight delay before actually removing to allow for exit animation
    const removeTimer = setTimeout(() => {
      if (isExiting) {
        onDismiss(notification.id);
      }
    }, 5300 - (index * 500));

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(removeTimer);
    };
  }, [notification.id, onDismiss, isExiting, index]);

  const getIcon = () => {
    switch (notification.type) {
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'warning':
        return 'bg-status-warning bg-opacity-10 dark:bg-status-warning dark:bg-opacity-20 border-status-warning border-opacity-25 dark:border-status-warning dark:border-opacity-40';
      case 'error':
        return 'bg-status-critical bg-opacity-10 dark:bg-status-critical dark:bg-opacity-20 border-status-critical border-opacity-25 dark:border-status-critical dark:border-opacity-40';
      case 'info':
        return 'bg-primary bg-opacity-10 dark:bg-primary dark:bg-opacity-20 border-primary border-opacity-25 dark:border-primary dark:border-opacity-40';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case 'warning':
        return 'text-status-warning';
      case 'error':
        return 'text-status-critical';
      case 'info':
        return 'text-primary';
    }
  };

  const getIconBgColor = () => {
    switch (notification.type) {
      case 'warning':
        return 'bg-status-warning bg-opacity-15 dark:bg-status-warning dark:bg-opacity-25 text-status-warning';
      case 'error':
        return 'bg-status-critical bg-opacity-15 dark:bg-status-critical dark:bg-opacity-25 text-status-critical';
      case 'info':
        return 'bg-primary bg-opacity-15 dark:bg-primary dark:bg-opacity-25 text-primary';
    }
  };

  return (
    <div 
      className={`
        p-4 rounded-lg shadow-xl border backdrop-blur-sm
        pointer-events-auto
        transform transition-all duration-300 ease-in-out
        ${getBgColor()}
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        animate-fade-in-right
      `}
      style={{ animationDelay: `${index * 100}ms` }}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full mr-3 ${getIconBgColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 ml-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsExiting(true);
            // Add small delay before actually dismissing
            setTimeout(() => onDismiss(notification.id), 300);
          }}
          className={`ml-3 ${getTextColor()} hover:opacity-70 transition-opacity p-1`}
          aria-label="Close notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notifications; 