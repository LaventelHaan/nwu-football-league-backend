// Request
POST /api/announcements
{
  "title": "Extra Training Session",
  "content": "Extra session for goalkeepers on Thursday at 14:00.",
  "priority": "HIGH",
  "scheduled_date": "2025-09-30"
}

// Response
{
  "success": true,
  "message": "Announcement created successfully",
  "data": {
    "announcement_id": 3,
    "title": "Extra Training Session",
    "priority": "HIGH",
    "scheduled_date": "2025-09-30",
    "created_at": "2025-09-20T14:30:00Z"
  }
}