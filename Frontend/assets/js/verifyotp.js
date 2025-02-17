
document.addEventListener('DOMContentLoaded', function() {
    const PasswordMessage = localStorage.getItem('password_message');
    const passwordUsername = localStorage.getItem('password_username');
    if (PasswordMessage !== null && PasswordMessage !== 'undefined'){
        document.getElementById('success-alert').classList.remove("d-none");
        document.getElementById('success-message').innerHTML = PasswordMessage;
    }
    document.getElementById('otpUsername').value = passwordUsername;



    document.querySelector('.verifyOtp-form').addEventListener('submit', function(event) {
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
        fetch('https://localhost:7091/auth/api/verify/otp', {
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
                localStorage.removeItem('password_username');
                localStorage.removeItem('password_message');
                alert(data.message)
                window.location.href = 'login.html';
    
                })
            }else{
                return response.json().then(data => {
                    // Display error message for incorrect credentials
                    errorMessage.innerText = data.message || data.errors.Username;
                    errorAlert.classList.remove('d-none');
                });
            }
        }).catch(error => {
            spinner.classList.add('d-none');
            loginText.classList.remove('d-none');
            errorMessage.innerText = 'Server is not responding. Please try again later.';
            errorAlert.classList.remove('d-none');
          })
    });
    });
    