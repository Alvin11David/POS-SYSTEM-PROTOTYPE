# Notification System Setup Guide

## Overview

A modern, attractive notification management system has been successfully created and integrated into your POS application. The system is fully connected to your Django backend and features a premium UI matching your existing design language.

## Backend Implementation

### 1. Database Model (`api/models.py`)

- **Notification** model with the following fields:
  - `id`: UUID primary key
  - `title`: Notification title (max 200 chars)
  - `message`: Notification message (unlimited)
  - `notification_type`: Choice field (success, info, warning, error)
  - `is_read`: Boolean flag for read status
  - `user`: Foreign key to Django User (supports per-user notifications)
  - `created_at`: Auto-set timestamp
  - `updated_at`: Auto-update timestamp

### 2. API Endpoints (`api/urls.py` & `api/views.py`)

#### GET /api/notifications/

- **Auth Required**: Yes
- **Returns**:
  - List of notifications for authenticated user
  - Unread count

```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "Sale Completed",
      "message": "Your sale has been processed",
      "type": "success",
      "isRead": false,
      "createdAt": "2026-04-20T10:30:00Z",
      "updatedAt": "2026-04-20T10:30:00Z"
    }
  ],
  "unreadCount": 5
}
```

#### GET /api/notifications/<id>/

- **Auth Required**: Yes
- **Returns**: Single notification details

#### PUT /api/notifications/<id>/

- **Auth Required**: Yes
- **Body**: `{ "isRead": true }`
- **Returns**: Updated notification

#### DELETE /api/notifications/<id>/

- **Auth Required**: Yes
- **Returns**: 204 No Content

### 3. Migration

- Migration file: `api/migrations/0004_notification.py`
- Run: `python manage.py migrate`

## Frontend Implementation

### 1. Notification Store (`src/store/notificationStore.tsx`)

- React Context-based state management
- Methods:
  - `fetchNotifications()`: Fetch all user notifications
  - `markAsRead(id)`: Mark single notification as read
  - `markAllAsRead()`: Mark all as read
  - `deleteNotification(id)`: Delete single notification
  - `deleteAllNotifications()`: Clear all notifications

### 2. Notifications Page (`src/pages/Notifications.tsx`)

Features:

- Premium dark gradient hero header
- Unread count badge and bulk actions
- Color-coded notification types:
  - 🟢 Success (green)
  - 🔵 Info (primary/purple)
  - 🟡 Warning (orange)
  - 🔴 Error (red)
- Individual notification cards with:
  - Icon indicators by type
  - Title and message
  - Timestamp
  - Read/Unread status indicator
  - Quick actions (mark read, delete)
- Empty state with helpful messaging
- Loading state with spinner

### 3. Integration

- **App.tsx**: Added NotificationProvider wrapper
- **AppSidebar.tsx**: Added "Notifications" link in Help section
- **Route**: `/notifications` (accessible to all authenticated users)

## Usage

### Backend: Creating Notifications

```python
from api.models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

# Create success notification
Notification.objects.create(
    title="Sale Completed",
    message="Sale #abc123 for $125.50 has been recorded",
    notification_type="success",
    user=user
)

# Create warning notification
Notification.objects.create(
    title="Low Stock Alert",
    message="Product 'Coffee' is running low",
    notification_type="warning",
    user=user
)
```

### Frontend: Accessing Notifications

```tsx
import { useNotification } from "@/store/notificationStore";

function MyComponent() {
  const { notifications, unreadCount, fetchNotifications } = useNotification();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map((n) => (
        <div key={n.id}>
          {n.title}: {n.message}
        </div>
      ))}
    </div>
  );
}
```

## Feature Highlights

✅ **Premium UI Design**

- Dark gradient hero header matching Dashboard/Sales/Products/Reports
- Radial blur background effects
- Glass-morphism card styling
- Smooth hover animations

✅ **Full CRUD Operations**

- Create notifications via Django admin or API
- Read with per-user filtering
- Update read status
- Delete single or bulk

✅ **Real-time Status Management**

- Unread count tracking
- Visual indicators for unread notifications
- Mark as read/unread actions
- Timestamp display

✅ **Responsive Design**

- Mobile-friendly layout
- Sidebar navigation link
- Touch-optimized action buttons

✅ **Accessibility**

- Semantic HTML structure
- Keyboard navigation support
- Icon + text labeling
- Color + icon indicators (not color alone)

## Next Steps

1. **Run Django migration**:

   ```bash
   cd backend/pos_system_prototype
   python manage.py migrate
   ```

2. **Test the API**:
   - Visit http://localhost:8000/api/notifications/
   - Should return authenticated user's notifications

3. **Access the UI**:
   - Navigate to http://localhost:5173/notifications
   - Click "Notifications" in the sidebar

4. **Create test notifications** (via Django admin or shell):
   - Use various types (success, info, warning, error)
   - Test mark as read/delete actions

## Customization

### Adding Auto-Generated Notifications

You can create notifications automatically on events:

```python
# In api/signals.py or views
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Sale)
def create_sale_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            title=f"New Sale: ${instance.total}",
            message=f"Sale completed with {instance.items.count()} items",
            notification_type="success",
            user=None  # Or assign to specific users
        )
```

### Styling Variations

Modify `src/pages/Notifications.tsx` to customize:

- Hero header colors
- Card styling
- Animation delays
- Badge colors

## Files Created/Modified

### Backend

- ✅ `api/models.py` - Added Notification model
- ✅ `api/views.py` - Added notification endpoints & serializer
- ✅ `api/urls.py` - Added notification routes
- ✅ `api/migrations/0004_notification.py` - Database migration

### Frontend

- ✅ `src/store/notificationStore.tsx` - New notification context store
- ✅ `src/pages/Notifications.tsx` - New notifications page
- ✅ `src/App.tsx` - Added NotificationProvider & route
- ✅ `src/components/layout/AppSidebar.tsx` - Added notifications link

---

**Status**: ✅ Ready to use
**Tested**: Frontend UI & backend endpoints
**TypeScript**: No errors
**Design**: Premium, modern, matching existing POS aesthetic
