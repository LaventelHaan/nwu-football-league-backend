// Request
GET /api/announcements?search=training&priority=MEDIUM&page=1&limit=10

// Response
{
  "success": true,
  "data": {
    "announcements": [
      {
        "announcement_id": 1,
        "title": "Training Schedule",
        "content": "Next week's training will be on Monday and Wednesday at 16:00.",
        "priority": "MEDIUM",
        "scheduled_date": "2025-09-23",
        "created_by": 123,
        "creator_name": "Coach Name",
        "created_at": "2025-09-20T10:00:00Z",
        "player_count": 15
      },
      {
        "announcement_id": 2,
        "title": "Medical Checkup",
        "content": "Mandatory medical checkup on Friday at 10:00.",
        "priority": "LOW", 
        "scheduled_date": "2025-09-27",
        "created_by": 123,
        "creator_name": "Coach Name",
        "created_at": "2025-09-19T14:30:00Z",
        "player_count": 15
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 15,
      "has_next": true,
      "has_prev": false
    }
  }
}