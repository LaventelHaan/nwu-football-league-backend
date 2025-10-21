// Request
GET /api/announcements/stats

// Response
{
  "success": true,
  "data": {
    "total_announcements": 15,
    "high_priority": 3,
    "medium_priority": 8,
    "low_priority": 4,
    "upcoming_scheduled": 5,
    "today_announcements": 2
  }
}