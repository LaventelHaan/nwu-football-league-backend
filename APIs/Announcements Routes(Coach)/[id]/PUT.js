// Request
PUT /api/announcements/1
{
  "title": "Updated Training Schedule",
  "content": "Training times have changed to 17:00",
  "priority": "HIGH",
  "scheduled_date": "2025-09-24"
}

// Response
{
  "success": true,
  "message": "Announcement updated successfully",
  "data": {
    "announcement_id": 1,
    "title": "Updated Training Schedule",
    "updated_at": "2025-09-20T15:00:00Z"
  }
}