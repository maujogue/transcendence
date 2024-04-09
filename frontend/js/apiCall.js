document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    console.log("OK");
    // Serialize form data
    const formData = new FormData(this);
    
    // Send POST request to backend API endpoint
    fetch('/users/register', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      // Handle API response
      if (data.success) {
        alert('Registration successful!');
        // Redirect or perform any other action upon successful registration
      } else {
        alert('Registration failed: ' + data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });