// Utility functions for calling the admin backend API
const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:4000/api';

export async function getVenues() {
  const res = await fetch(`${API_BASE}/venues`);
  if (!res.ok) throw new Error('Failed to fetch venues');
  return res.json();
}

export async function getPlayers() {
  const res = await fetch(`${API_BASE}/players`);
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

// Add more functions as needed (create, update, delete)
