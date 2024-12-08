document.getElementById('subscribeBtn').addEventListener('click', async function() {
    try {
      const response = await fetch('/subscribe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`Failed to subscribe. Status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.url) {
        window.location.href = responseData.url;
      } else {
        console.error('Unexpected response data:', responseData);
      }
    } catch (err) {
      console.error('Error during subscription request:', err);
    }
  });