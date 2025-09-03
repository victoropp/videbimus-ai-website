# Consultation Rooms API Documentation

## Base URL
```
Development: http://localhost:3000/api/consultation
Production: https://videbimus.ai/api/consultation
```

## Authentication
All endpoints require authentication via NextAuth.js session cookie or Authorization header with JWT token.

---

## 📋 Room Management Endpoints

### GET /rooms
Get list of consultation rooms for authenticated user.

**Query Parameters:**
- `limit` (number, optional): Maximum rooms to return (default: 10)
- `offset` (number, optional): Pagination offset (default: 0)
- `status` (string, optional): Filter by status (SCHEDULED, ACTIVE, COMPLETED, CANCELLED)

**Response:**
```json
{
  "rooms": [
    {
      "id": "test-room-001",
      "name": "Demo Consultation Room",
      "roomType": "consultation",
      "status": "SCHEDULED",
      "clientId": "user123",
      "consultantId": "consultant456",
      "scheduledAt": "2025-01-29T10:00:00Z",
      "durationMinutes": 60,
      "settings": {
        "videoEnabled": true,
        "screenShareEnabled": true,
        "whiteboardEnabled": true,
        "chatEnabled": true
      },
      "_count": {
        "messages": 5,
        "documents": 3,
        "participants": 2
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

### POST /rooms
Create a new consultation room.

**Request Body:**
```json
{
  "name": "Strategy Session",
  "description": "Q1 Planning Discussion",
  "roomType": "consultation",
  "clientId": "client123",
  "scheduledAt": "2025-01-30T14:00:00Z",
  "durationMinutes": 90,
  "settings": {
    "videoEnabled": true,
    "recordingEnabled": false,
    "whiteboardEnabled": true
  }
}
```

**Response:**
```json
{
  "room": {
    "id": "room-abc123",
    "name": "Strategy Session",
    "status": "SCHEDULED",
    "createdAt": "2025-01-28T10:00:00Z"
  }
}
```

### GET /rooms/{roomId}
Get detailed information about a specific room.

**Response:**
```json
{
  "room": {
    "id": "test-room-001",
    "name": "Demo Consultation Room",
    "description": "Test room for demos",
    "status": "ACTIVE",
    "client": {
      "id": "client123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "consultant": {
      "id": "consultant456",
      "name": "Jane Smith",
      "email": "jane@videbimus.ai"
    },
    "participants": [],
    "messages": [],
    "documents": [],
    "whiteboards": []
  },
  "userRole": "consultant",
  "permissions": {
    "canEdit": true,
    "canShare": true,
    "canManage": true,
    "canInvite": true,
    "canDelete": true
  }
}
```

### PATCH /rooms/{roomId}
Update room details.

**Request Body:**
```json
{
  "name": "Updated Room Name",
  "status": "ACTIVE",
  "scheduledAt": "2025-01-30T15:00:00Z"
}
```

### DELETE /rooms/{roomId}
Delete a consultation room (consultant only).

---

## 💬 Messaging Endpoints

### GET /rooms/{roomId}/messages
Get messages for a room.

**Query Parameters:**
- `limit` (number): Max messages (default: 50)
- `lastId` (string): Get messages after this ID
- `since` (datetime): Get messages since timestamp

**Response:**
```json
{
  "messages": [
    {
      "id": "msg123",
      "roomId": "room456",
      "senderId": "user789",
      "content": "Hello, let's begin our session",
      "messageType": "text",
      "sender": {
        "id": "user789",
        "name": "John Doe",
        "image": "/avatar.jpg"
      },
      "createdAt": "2025-01-28T10:30:00Z"
    }
  ]
}
```

### POST /rooms/{roomId}/messages
Send a message to a room.

**Request Body:**
```json
{
  "content": "Thanks for joining the consultation",
  "messageType": "text",
  "metadata": {}
}
```

---

## 📄 Document Management Endpoints

### GET /rooms/{roomId}/documents
Get documents for a room.

**Response:**
```json
{
  "documents": [
    {
      "id": "doc123",
      "title": "Project Proposal",
      "description": "Q1 2025 Strategy",
      "documentType": "document",
      "fileName": "proposal.pdf",
      "fileSize": 245760,
      "mimeType": "application/pdf",
      "isShared": true,
      "uploader": {
        "id": "user123",
        "name": "John Doe"
      },
      "createdAt": "2025-01-28T09:00:00Z"
    }
  ]
}
```

### POST /rooms/{roomId}/documents
Upload a document (multipart/form-data) or create text document (JSON).

**For File Upload:**
```
Content-Type: multipart/form-data

file: [binary data]
title: "Contract Document"
description: "Final version"
documentType: "attachment"
```

**For Text Document:**
```json
{
  "title": "Meeting Notes",
  "content": "## Key Points\n- Discussion item 1\n- Action items",
  "documentType": "document"
}
```

### GET /rooms/{roomId}/documents/{documentId}
Download a specific document.

### DELETE /rooms/{roomId}/documents/{documentId}
Delete a document (uploader or consultant only).

---

## 🎨 Whiteboard Endpoints

### GET /rooms/{roomId}/whiteboard
Get the latest whiteboard state.

**Response:**
```json
{
  "whiteboard": {
    "id": "wb123",
    "roomId": "room456",
    "canvasData": {
      "version": "5.3.0",
      "objects": [
        {
          "type": "rect",
          "left": 100,
          "top": 100,
          "width": 200,
          "height": 100,
          "fill": "blue"
        }
      ]
    },
    "version": 3,
    "title": "Planning Board",
    "updatedBy": "user123",
    "updatedAt": "2025-01-28T11:00:00Z"
  }
}
```

### PUT /rooms/{roomId}/whiteboard
Save whiteboard state.

**Request Body:**
```json
{
  "canvasData": {
    "version": "5.3.0",
    "objects": [...]
  },
  "title": "Updated Whiteboard"
}
```

---

## ✅ Action Items Endpoints

### GET /rooms/{roomId}/action-items
Get action items for a room.

**Response:**
```json
{
  "actionItems": [
    {
      "id": "action123",
      "title": "Review proposal",
      "description": "Review and provide feedback",
      "assigneeId": "user456",
      "status": "pending",
      "priority": "high",
      "dueDate": "2025-02-01T17:00:00Z",
      "createdAt": "2025-01-28T10:00:00Z"
    }
  ]
}
```

### POST /rooms/{roomId}/action-items
Create an action item.

**Request Body:**
```json
{
  "title": "Complete market analysis",
  "description": "Research competitor pricing",
  "assigneeId": "user789",
  "priority": "medium",
  "dueDate": "2025-02-05T17:00:00Z"
}
```

---

## 📊 Analytics Endpoints

### GET /rooms/{roomId}/analytics
Get room analytics and usage statistics.

**Response:**
```json
{
  "analytics": {
    "totalDuration": 3600,
    "messageCount": 45,
    "participantCount": 3,
    "documentsShared": 5,
    "whiteboardEdits": 12,
    "peakConcurrentUsers": 3,
    "averageSessionLength": 1200
  }
}
```

---

## 🔍 Search Endpoints

### GET /rooms/search
Search across all rooms.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Filter by room type
- `dateFrom` (datetime): Start date
- `dateTo` (datetime): End date

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Please sign in to access this resource"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Room not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user
- **File uploads**: 10 per hour per user

Headers returned:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## WebSocket Events (Future)

### Connection
```javascript
ws://localhost:3000/api/consultation/ws?roomId=room123&token=jwt_token
```

### Events
- `message:new` - New message in room
- `document:added` - Document uploaded
- `whiteboard:update` - Whiteboard changed
- `user:joined` - User joined room
- `user:left` - User left room
- `room:updated` - Room details changed