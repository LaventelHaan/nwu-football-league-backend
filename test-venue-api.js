async function testVenueAPI() {
  try {
    // Test GET
    const getResponse = await fetch('http://localhost:3002/api/venues');
    const getData = await getResponse.json();
    console.log('GET venues:', getData);

    // Test POST
    const postResponse = await fetch('http://localhost:3002/api/venues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Venue',
        address: 'Test Address',
        capacity: 1000,
        type: 'Stadium',
        surface: 'Natural Grass',
        status: 'Active',
        facilities: ['Floodlights'],
        manager: 'Test Manager',
        managerPhone: '1234567890',
        managerEmail: 'test@manager.com',
        fields: []
      })
    });
    const postData = await postResponse.json();
    console.log('POST venue:', postData);

    // Test GET again
    const getResponse2 = await fetch('http://localhost:3002/api/venues');
    const getData2 = await getResponse2.json();
    console.log('GET venues after POST:', getData2);

  } catch (err) {
    console.error('Error:', err);
  }
}

testVenueAPI();
