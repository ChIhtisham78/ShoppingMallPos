
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('pos_token');
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    const successAlert = document.getElementById('success-alert');
    const successMessage = document.getElementById('success-message');
    const loadingSpinner = document.getElementById('loadingSpinner');
    function formatCurrency(value) {
        if (value === undefined || value === null) {
            return '₦0.00'; // or any default value you'd prefer
        }
        return '₦' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    // Reset previous messages
    function resetMessages() {
        errorAlert.classList.add('d-none');
        errorMessage.innerHTML = '';
        successAlert.classList.add('d-none');
        successMessage.innerHTML = '';
    }

    resetMessages();

    let currentPage = 1;
    let productName = "";
    

    document.getElementById('filterForm').addEventListener('submit', function(event) {
        event.preventDefault();
        resetMessages(); // Reset messages on new filter submission

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;
        const availability = document.getElementById('availability').value;
        
        function formatDateToISO(dateString) {
            if (!dateString) return null; // Return null if no date is provided
    const date = new Date(dateString);

    // Get UTC components
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}T00:00:00Z`;
        }

        // Format dates only if they are provided
        const formattedStartDate = formatDateToISO(startDate);
        const formattedEndDate = formatDateToISO(endDate);

        // Create the query parameters
        const queryParameters = [
            availability ? `Availability=${encodeURIComponent(availability)}` : '',
            formattedStartDate ? `DateMin=${formattedStartDate}` : '',
            formattedEndDate ? `DateMax=${formattedEndDate}` : '',
            minPrice ? `PriceMin=${minPrice}` : '',
            maxPrice ? `PriceMax=${maxPrice}` : ''
        ].filter(param => param).join('&'); // Filter out empty parameters

        fetchProducts(queryParameters);
    });

    document.getElementById('prevPage').addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            fetchProducts();
        }
    });

    document.getElementById('nextPage').addEventListener('click', function(e) {
        e.preventDefault();
        currentPage++;
        fetchProducts();
    });

    document.getElementById('productName').addEventListener('input', function() {
        currentPage = 1;
        productName = document.getElementById('productName').value;
        fetchProducts();
      });

    function fetchProducts(queryParameters = '') {
        
        loadingSpinner.style.display = 'block';
        const url = `https://localhost:7091/admin/api/list/products?Name=${productName}&PageNumber=${currentPage}&${queryParameters}`;
        fetch(url, {
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
            const tableBody = document.querySelector('.table-container'); // Target table body
            tableBody.innerHTML = '';
            if (data.products.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">No data found</td>
                    </tr>
                `;
            } else {
                data.products.forEach((product) => {
                    const rowHtml = `
                    <tr>
                        <th scope="row">${product.Id}</th>
                        <td>${product.Name}</td>
                        <td>${product.Stock}</td>
                        <td>${formatCurrency(product.Price)}</td>
                        <td>${new Date(product.CreatedAt).toLocaleString()}</td>
                        <td>
                            <button class="btn btn-sm ${product.Stock > 0 ? 'btn-success' : 'btn-danger'}">
                                ${product.Stock > 0 ? 'In-Stock' : 'Out of Stock'}
                            </button>
                        </td>
                        <td>
                        <a href="#" class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#UpdateModel" 
                            data-id="${product.Id}" data-price="${product.Price}" data-name="${product.Name}" data-stock="${product.Stock}">
                           <i class="bi bi-pencil"></i> Update
                        </a></d>
                    </tr>
                    `;
                    tableBody.innerHTML += rowHtml;

                    
                });
            }
            const updateModal = document.getElementById('UpdateModel');
            updateModal.addEventListener('show.bs.modal', event => {
                const button = event.relatedTarget; // Button that triggered the modal
                const id = button.getAttribute('data-id');
                const name = button.getAttribute('data-name');
                const stock = button.getAttribute('data-stock');
                const price = button.getAttribute('data-price');

                document.getElementById('productname').value = name;
                document.getElementById('productamount').value = price;
                document.getElementById('productstock').value = stock;
                document.getElementById('productId').value = id;
            })
            const itemsPerPage = 10; // Set your items per page here
            const totalPages = Math.ceil(data.totalProducts / itemsPerPage);
            document.getElementById('remainng').innerText = `${currentPage}/${totalPages}`;

            // Show or hide the Next button
            const nextPageButton = document.getElementById('nextPage');
            const prevPageButton = document.getElementById('prevPage');
            if (currentPage >= totalPages) {
                nextPageButton.classList.add('disabled'); // Add class to visually disable
            } else {
                nextPageButton.classList.remove('disabled'); // Remove class to enable
            }
        
            if (currentPage <= 1) {
                prevPageButton.classList.add('disabled'); // Add class to visually disable
            } else {
                prevPageButton.classList.remove('disabled'); // Remove class to enable
            }
        }).catch(error => {
            console.log(error);
            errorMessage.innerText = error;
            errorAlert.classList.remove('d-none');
        })
        .finally(() => {
            loadingSpinner.style.display = 'none';
        });
    }

    fetchProducts(); // Fetch initial products


    document.getElementById('addProduct-form').addEventListener('submit', function(event) {
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
        fetch(`https://localhost:7091/admin/api/create/product`, {
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
            
            if (response.status===200) {
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
            errorMessage.innerText = error;
            errorAlert.classList.remove('d-none');

        })

    })


    document.querySelector('.UpdateProduct-form').addEventListener('submit', function(event) {
        const id = document.getElementById('productId').value;
        event.preventDefault();
        const form = this;
        const formData = new FormData(form);
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated'); // This will show the validation messages
            return;
        }
        const spinner = document.getElementById('spinner1');
        const submitText = document.getElementById('submit-text1');
        
        // Show spinner, hide login text
        spinner.classList.remove('d-none');
        submitText.classList.add('d-none');
        fetch(`https://localhost:7091/admin/api/update/product/${id}`, {
            method: 'PUT',
            body: JSON.stringify(Object.fromEntries(formData.entries())), // Convert form data to JSON
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            spinner.classList.add('d-none');
            submitText.classList.remove('d-none');
            
            if (response.status===200) {
                return response.json().then(data => {
                    successMessage.innerText = data.message || "updated successfully";
                    successAlert.classList.remove('d-none');
                });
            }else {
                return response.json().then(data => {
                errorMessage.innerText =data.message || 'An error occurred. Please try again later.';
                errorAlert.classList.remove('d-none');
                })
            };
        });


    });


    document.getElementById('uploadProduct-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const form = this;
        const formData = new FormData();
        // Check form validity using browser's built-in validation
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated'); // This will show the validation messages
            return;
        }

        const spinner = document.getElementById('spinner4');
        const submitText = document.getElementById('submit-text4');
        
        // Show spinner, hide login text
        spinner.classList.remove('d-none');
        submitText.classList.add('d-none');

        
        formData.append('file', document.getElementById('productsFile').files[0]); // Append file
        fetch(`https://localhost:7091/admin/api/upload/product`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            spinner.classList.add('d-none');
            submitText.classList.remove('d-none');
            if (response.status===200) {
                return response.json().then(data => {
                successMessage.innerText = data.message;
                successAlert.classList.remove('d-none');
                })
            } else {
              return response.json().then(data => {
                  errorMessage.innerText =data.message || 'An error occurred. Please try again later.';
                  errorAlert.classList.remove('d-none');
                })
            }
        })
        .catch(error => {
            errorMessage.innerText = ('An error occurred. Please try again later.');
            errorAlert.classList.remove('d-none');
        });

        
        })



});