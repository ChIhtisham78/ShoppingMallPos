document.addEventListener('DOMContentLoaded', function() {
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    const successAlert = document.getElementById('success-alert');
    const successMessage = document.getElementById('success-message');

    errorAlert.classList.add('d-none');
    errorMessage.innerHTML = '';
    successAlert.classList.add('d-none');
    successMessage.innerHTML = '';
    const token = localStorage.getItem('pos_token')
    if (token == null && token == 'undefined') {
      window.location.href = 'login.html';
    }
    
    function formatCurrency1(value) {
        if (value === undefined || value === null) {
            return '₦0.00'; // or any default value you'd prefer
        }
        return '₦' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    fetch('https://localhost:7091/admin/api/user/profile', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
      }).then(response => {
          if (response.ok) {
            return response.json().then(data => {
              console.log(data)
              document.getElementById('fullName').innerHTML= data.Name;
              document.getElementById('username').innerHTML= data.Username;
              document.getElementById('totalSales').innerHTML= formatCurrency1(data.totalPrice);
              document.getElementById('totalProductSoldPrice').innerHTML= data.totalSales;

            })
        }else {
            return response.json().then(data => {
            // Handle other error statuses
            errorMessage.innerText =data.message || 'An error occurred. Please try again later.';
            errorAlert.classList.remove('d-none');
            })
          }
      }).catch(error => {
        errorMessage.innerText =error;
        errorAlert.classList.remove('d-none');
      })


      document.querySelector('.changePassword-form').addEventListener('submit', function(event) {
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
        
        // Show spinner, hide login text
        spinner.classList.remove('d-none');
        loginText.classList.add('d-none');

        // Send the login request
        fetch('https://localhost:7091/auth/api/change/password', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData.entries())), // Convert form data to JSON
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            spinner.classList.add('d-none');
            loginText.classList.remove('d-none');
            
            if (response.ok) {
                return response.json().then(data => {
                    successMessage.innerText = data.message || 'Password Changed successfully';
                    successAlert.classList.remove('d-none');
                })
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
                spinner.classList.add('d-none');
                loginText.classList.remove('d-none');
                errorMessage.innerText = 'Server is not responding. Please try again later.';
                errorAlert.classList.remove('d-none');
        });

    })
        

})