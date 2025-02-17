document.addEventListener('DOMContentLoaded', function() {
document.querySelector('.ForgotPassword-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = this;

    // Check form validity using browser's built-in validation
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated'); // This will show the validation messages
        return;
    }
    const formData = new FormData(form);
    console.log(console.log(JSON.stringify(Object.fromEntries(formData.entries()))))

    const spinner = document.getElementById('spinner1');
    const submitText = document.getElementById('submit-text1');
    spinner.classList.remove('d-none');
    submitText.classList.add('d-none');

    const errorMessage = document.getElementById('error-message');
    const successAlert = document.getElementById('success-alert');
    const successMessage = document.getElementById('success-message');
    const errorAlert = document.getElementById('error-alert');
    // Reset previous messages
    errorAlert.classList.add('d-none');
    errorMessage.innerHTML = '';
    successAlert.classList.add('d-none');
    successMessage.innerHTML = '';

    var username = document.getElementById("Username").value;
    var question = document.getElementById("question");
    var answer = document.getElementById("answer");

    if (answer.value === "") {
        fetch(`https://localhost:7091/auth/api/get/username/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            spinner.classList.add('d-none');
            submitText.classList.remove('d-none');
            
            if (response.status === 200) {
                return response.json().then(data => {
                    var user = document.getElementById("Username");
                    user.readOnly  = true;
                    question.value = data.message
                    question.type ="text";
                    question.readOnly  = true;
                    answer.type = "text";
                    successMessage.innerText ='Enter correct Answer.';
                    successAlert.classList.remove('d-none');
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
                errorMessage.innerText = error;
                errorAlert.classList.remove('d-none');
        });
        return;
    }
    

    fetch(`https://localhost:7091/auth/api/forgot/password`, {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData.entries())),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        spinner.classList.add('d-none');
        submitText.classList.remove('d-none');
        
        if (response.status === 200) {
            return response.json().then(data => {
                localStorage.setItem('password_message', data.message);
                localStorage.setItem('password_username', username);
                window.location.href = 'verifyotp.html';
               
            });
        } else if (response.status === 400) {
            return response.json().then(data => {
           
                errorMessage.innerText = data.message || 'An error occurred. Please try again later.';
                errorAlert.classList.remove('d-none');
            });
        } else {
            // Handle other error statuses
            errorMessage.innerText = 'An error occurred. Please try again later.';
            errorAlert.classList.remove('d-none');
        }
    }).catch(error => {
            errorMessage.innerText = error;
            errorAlert.classList.remove('d-none');
    });
    
});


})