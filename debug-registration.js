// Debug registration script
// Run this in browser console on the registration page

// Test data
const testData = {
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  phone: "1234567890",
  dateOfBirth: "1990-01-01",
  password: "password123",
  role: "player",
  team: "NWU A",
  position: "Forward"
};

console.log("Testing registration API directly...");

// Test the API call
fetch('/api/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  return response.json();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Network error:', error);
});
