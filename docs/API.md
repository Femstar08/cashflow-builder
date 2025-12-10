# API Documentation

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

Most endpoints require authentication. Include user context in request headers or body as needed.

## Rate Limiting

- **API Routes**: 60 requests per minute per IP address
- **Upload Endpoints**: 10 requests per minute per IP address
- **Auth Endpoints**: 5 requests per 15 minutes per IP address

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when the limit resets

When rate limited, you'll receive a `429 Too Many Requests` response with a `Retry-After` header.

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Endpoints

### Health Check

**GET** `/api/health`

Check application and service health.

**Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "status": "healthy" | "degraded",
  "services": {
    "database": "healthy" | "unhealthy",
    "openai": "configured" | "not_configured"
  }
}
```

---

### Profiles

#### Get Profile

**GET** `/api/profiles/[profileId]`

Get a single business profile by ID.

**Response:**
```json
{
  "profile": {
    "id": "uuid",
    "name": "Business Name",
    "industry": "Technology",
    // ... other profile fields
  }
}
```

---

### Documents

#### Upload Documents

**POST** `/api/profile/documents`

Upload one or more documents for a profile.

**Request Body:**
```json
{
  "profileId": "uuid",
  "files": [
    {
      "name": "document.pdf",
      "type": "application/pdf",
      "content": "data:application/pdf;base64,..."
    }
  ],
  "uploadedBy": "user-uuid",
  "uploadedByRole": "client" | "accountant" | "admin"
}
```

**Validation:**
- Maximum 10 files per request
- Maximum file size: 10MB
- Allowed types: PDF, Word, Excel, CSV, Images (PNG, JPEG)

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 12345,
      "extracted": true
    }
  ]
}
```

#### List Documents

**GET** `/api/profile/documents?profileId=uuid`

Get all documents for a profile.

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 12345,
      "extractedText": "...",
      "uploadedBy": "user-uuid",
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Update Document Tags

**PATCH** `/api/profile/documents/[documentId]/tags`

Update tags for a document.

**Request Body:**
```json
{
  "tags": ["Business plan", "Financial"]
}
```

**Response:**
```json
{
  "success": true,
  "tags": ["Business plan", "Financial"]
}
```

---

### Assumptions

#### Get Assumptions

**GET** `/api/profile/assumptions?profileId=uuid&status=active`

Get assumptions for a profile.

**Query Parameters:**
- `profileId` (required) - Profile UUID
- `status` (optional) - Filter by status: "active" | "all"

**Response:**
```json
{
  "assumptions": [
    {
      "id": "uuid",
      "profile_id": "uuid",
      "assumption": "Assumed no employees",
      "reason": "No staffing information provided",
      "category": "staffing",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "created_by": "agent"
    }
  ]
}
```

#### Create Assumption

**POST** `/api/profile/assumptions`

Create a new assumption.

**Request Body:**
```json
{
  "profileId": "uuid",
  "assumption": "Assumed no employees",
  "reason": "No staffing information provided",
  "category": "staffing",
  "createdBy": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "assumption": {
    "id": "uuid",
    "profile_id": "uuid",
    "assumption": "Assumed no employees",
    "status": "active",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Assumption Status

**PATCH** `/api/profile/assumptions`

Update assumption status (e.g., mark as superseded).

**Request Body:**
```json
{
  "assumptionId": "uuid",
  "status": "superseded",
  "updatedByAssumptionId": "new-assumption-uuid"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### Activities

#### Get Activities

**GET** `/api/profile/activities?profileId=uuid`

Get activity log for a profile (last 50 entries).

**Response:**
```json
{
  "activities": [
    {
      "id": "uuid",
      "profile_id": "uuid",
      "user_id": "user-uuid",
      "activity_type": "document_uploaded",
      "description": "Uploaded 2 document(s)",
      "metadata": {
        "document_count": 2
      },
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Agent Chat

#### Chat with Agent

**POST** `/api/agent/chat`

Send a message to the AI agent.

**Request Body:**
```json
{
  "message": "Hello, I'd like to create a cashflow forecast",
  "conversationHistory": [],
  "profileId": "uuid",
  "userId": "user-uuid",
  "userRole": "client",
  "stage": "gathering",
  "isInitial": false,
  "attachments": []
}
```

**Response:**
```json
{
  "response": "I'd be happy to help you create a cashflow forecast...",
  "businessProfile": { /* profile data */ },
  "cashflowAssumptions": { /* assumptions */ },
  "questions": ["What is your monthly revenue?"],
  "commentary": "Additional context..."
}
```

---

## Validation

All endpoints validate input data:

- **UUIDs**: Must match UUID v4 format
- **Strings**: Length constraints applied where relevant
- **File Names**: Sanitized to prevent path traversal
- **File Types**: Whitelist of allowed MIME types
- **File Sizes**: Maximum size limits enforced

Validation errors return `400 Bad Request` with details.

## Error Logging

All errors are logged with context. In production, errors are sent to the configured error tracking service.

