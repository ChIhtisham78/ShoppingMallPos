document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.login-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const form = this;

        // Check form validity using browser's built-in validation
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated'); // This will show the validation messages
            return;
        }
        
        const formData = new FormData(form);
        const spinner = document.getElementById('spinner');
        const loginText = document.getElementById('login-text');
        const errorAlert = document.getElementById('error-alert');
        const errorMessage = document.getElementById('error-message');
        const successAlert = document.getElementById('success-alert');
        const successMessage = document.getElementById('success-message');

        // Reset previous messages
        errorAlert.classList.add('d-none');
        errorMessage.innerHTML = '';
        successAlert.classList.add('d-none');
        successMessage.innerHTML = '';
        
        // Show spinner, hide login text
        spinner.classList.remove('d-none');
        loginText.classList.add('d-none');

        // Send the login request
        fetch('https://localhost:7091/auth/api/user/login', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData.entries())), // Convert form data to JSON
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            spinner.classList.add('d-none');
            loginText.classList.remove('d-none');
            
            if (response.ok) {
                return response.json().then(data => {
                    console.log(data)
                    localStorage.setItem('pos_token', data.token);
                    
                    if (data.isAdmin===true) {
                        window.location.href = 'dashboard.html';
                    } else if (data.isSales===true) {
                        window.location.href = 'index.html';
                    } else {
                        localStorage.removeItem('pos_token');
                        window.location.href = 'login.html';
                    }
                });
            } else if (response.status === 400) {
                return response.json().then(data => {
                    errorMessage.innerText = data.message || 'Invalid credentials.';
                    errorAlert.classList.remove('d-none');
                });
            } else {
                // Handle other error statuses
                errorMessage.innerText = 'An error occurred. Please try again later.';
                errorAlert.classList.remove('d-none');
            }
        }).catch(error => {
                spinner.classList.add('d-none');
                loginText.classList.remove('d-none');
                errorMessage.innerText = 'Server is not responding. Please try again later.';
                errorAlert.classList.remove('d-none');
        });
        
    });


    

});
