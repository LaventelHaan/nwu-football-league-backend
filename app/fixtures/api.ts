// API utility for fixtures CRUD
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/fixtures';

export async function getFixtures() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Failed to fetch fixtures');
  return res.json();
}

export async function getFixture(id: number) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Failed to fetch fixture');
  return res.json();
}

export async function createFixture(data: any) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create fixture');
  return res.json();
}

export async function updateFixture(id: number, data: any) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update fixture');
  return res.json();
}

export async function deleteFixture(id: number) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete fixture');
  return res.json();
}
