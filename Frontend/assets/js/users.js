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
    fetch('https://localhost:7091/admin/api/list/sales/users', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
      }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(data => {
                errorMessage.innerText = data.message || 'An error occurred. Please try again later.';
                errorAlert.classList.remove('d-none');
                throw new Error('Error fetching data');
            });
        }
    }).then(data => {
        console.log(data)
        const container = document.querySelector('.user-container'); // Target table body
        container.innerHTML = '';
        if (data.users.length === 0) {
            container.innerHTML = `
            <div>
                <span colspan="6" class="text-center">No data found</span>
            </div>
        `;
        }else {
            data.users.forEach((index) => {
                const rowHtml = `
                <div class="col-xl-4">
    
              <div class="card">
                <div class="card-body profile-card pt-4 d-flex flex-column align-items-center">
    
                  <img src="assets/profile_pic.jpg" alt="Profile" class="rounded-circle">
                  <h2>${index.Name}</h2>
                  <h3>${index.Username}</h3>
                   <h3><b>Sale Agent</b></h3>
                </div>
              </div>
    
            </div>
                `;
                container.innerHTML += rowHtml;
            })
        
    }

}).catch(error => {
    console.log(error);
        errorMessage.innerText = error;
        errorAlert.classList.remove('d-none'); // Hide spinner on fetch error
});

document.getElementById('addUser-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = this;
    const formData = new FormData(form);
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated'); // This will show the validation messages
        return;
    }
    const spinner = document.getElementById('spinner');
    const submitText = document.getElementById('submit-text');
    
    // Show spinner, hide login text
    spinner.classList.remove('d-none');
    submitText.classList.add('d-none');
    fetch(`https://localhost:7091/admin/api/create/salesAgent`, {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData.entries())), // Convert form data to JSON
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        spinner.classList.add('d-none');
        submitText.classList.remove('d-none');
        
        if (response.status===201) {
            return response.json().then(data => {
                successMessage.innerText = data.message || "Created successfully";
                successAlert.classList.remove('d-none');
            });
        }else{
            return response.json().then(data => {
                errorMessage.innerText = data.message || 'An error occurred. Please try again later.';
                errorAlert.classList.remove('d-none');
            })
        }
    }).catch(error => {
        console.log(error);
        errorMessage.innerText = "An error occurred. Please try again later.";
        errorAlert.classList.remove('d-none');

    })

})


})