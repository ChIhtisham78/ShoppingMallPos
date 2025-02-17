document.addEventListener('DOMContentLoaded', function() {
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    const successAlert = document.getElementById('success-alert');
    const successMessage = document.getElementById('success-message');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const loadingSpinner1 = document.getElementById('loadingSpinner1');

    errorAlert.classList.add('d-none');
    errorMessage.innerHTML = '';
    successAlert.classList.add('d-none');
    successMessage.innerHTML = '';
    const token = localStorage.getItem('pos_token')
    if (token == null && token == 'undefined') {
      window.location.href = 'login.html';
    }
    function formatCurrency(value) {
      if (value === undefined || value === null) {
          return '₦0.00';
      }
      if (value >= 1000000) {
          return '₦' + (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
      } else if (value >= 1000) {
          return '₦' + (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
      } else {
          return '₦' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
  }
  function formatCurrency1(value) {
    if (value === undefined || value === null) {
        return '₦0.00'; // or any default value you'd prefer
    }
    return '₦' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
fetch('https://localhost:7091/admin/api/get/users/list', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token
    }
})
.then(response => {
    if (response.status===200) {
        return response.json().then(data => {
        const selectElement = document.getElementById('saleAgent');
        data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.Id;  // set the value as id
        option.textContent = item.Name;  // set the display text as name
        selectElement.appendChild(option);

        })

        })
    }else{
        const selectElement = document.getElementById('departmentSelect');
        selectElement.innerHTML = "unexpected error occurred"
    }
})

    let currentPage = 1;
    let productName = "";
    document.getElementById('filterForm').addEventListener('submit', function(event) {
        event.preventDefault();
     

        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const minPrice = document.getElementById('minPrice').value;
        const maxPrice = document.getElementById('maxPrice').value;
        const customerName = document.getElementById('CustomerName').value;
        const saleAgent = document.getElementById('saleAgent').value;
        
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
            saleAgent ? `SalesAgent=${encodeURIComponent(saleAgent)}` : '',
            customerName ? `CustomerName=${customerName}` : '',
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
        const url = `https://localhost:7091/admin/api/sales/summary?ProductName=${productName}&PageNumber=${currentPage}&${queryParameters}`;
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
            document.getElementById('totalProductSoldPrice').innerHTML= formatCurrency(data.totalPrice);
            document.getElementById('totalSales').innerHTML= data.totalQuery;
            const tableBody = document.querySelector('.table-container'); // Target table body
            tableBody.innerHTML = '';
            if (data.sales.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">No data found</td>
                    </tr>
                `;
            } else {
                data.sales.forEach((index) => {
                    const rowHtml = `
                    <tr>
                        <th scope="row">${index.Id}</th>
                        <td>${index.SalesAgent}</td>
                        <td>${index.CustomerName}</td>
                        <td>${formatCurrency1(index.TotalPrice)}</td>
                        <td>${new Date(index.CreatedAt).toLocaleString()}</td>
                        <td>
                        <a href="#" class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#UpdateModel" 
                            data-id="${index.Id}">
                           <i class="bi bi-eye"></i> Details
                        </a></d>
                    </tr>
                    `;
                    tableBody.innerHTML += rowHtml;

                    
                });
            }
            
            const itemsPerPage = 10; // Set your items per page here
            const totalPages = Math.ceil(data.totalSales / itemsPerPage);
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

    fetchProducts();

    const updateModal = document.getElementById('UpdateModel');
    updateModal.addEventListener('show.bs.modal', event => {
        
        const button = event.relatedTarget; // Button that triggered the modal
        const id = button.getAttribute('data-id');
        const url = `https://localhost:7091/admin/api/sales/details/${id}`;
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
                    loadingSpinner1.style.display = 'none'; // Hide spinner on error
                    return;
                });
            }
        }).then(data => {
            
            document.getElementById('receiptID').innerHTML = data.Id ;
            document.getElementById('receiptSaleName').innerHTML = data.SalesAgent;
            document.getElementById('receiptName').innerHTML = data.CustomerName;
            document.getElementById('receiptPrice').innerHTML = formatCurrency1(data.TotalPrice);
            document.getElementById('receiptDate').innerHTML = new Date(data.CreatedAt).toLocaleString() ;
            printReceipt(data.SalesProduct, data.CustomerName, data.TotalPrice)
            const tableBody = document.querySelector('.cart-table'); // Target table body
            tableBody.innerHTML = '';
            if (data.SalesProduct.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">No data found</td>
                    </tr>
                `;
            } else {
                data.SalesProduct.forEach((index) => {
                    const rowHtml = `
                    <tr>
                        <th scope="row">${index.ProductId}</th>
                        <td>${index.ProductName}</td>
                        <td>${index.ProductStock}</td>
                        <td>${formatCurrency1(index.ProductPrice)}</td>
                        <td>${index.Quality}</td>
                        <td>${formatCurrency1(index.TotalPrice)}</td>
                    </tr>
                    `;
                    tableBody.innerHTML += rowHtml;

                    
                });
            }
        })
        
    })

            var buttons = document.querySelectorAll('#viewVisual');
            let chartInstance; // Declare chart instance outside the loop
            
            buttons.forEach(button => {
                button.addEventListener('click', function () {
                    loadingSpinner1.style.display = 'block';
            
                    const url = `https://localhost:7091/admin/api/sales/visualization/data`;
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
                                loadingSpinner1.style.display = 'none'; // Hide spinner on error
                                return;
                            });
                        }
                    }).then(data => {
                        const bar = document.querySelector('#barChart');
                        bar.innerHTML = ''; // Clear the previous chart canvas
                        const dailyType = this.getAttribute('data-type');
                        const title = document.getElementById('data-title');
                        let salesData = [];
                        let labels = [];
            
                        if (dailyType === "daily") {
                            title.innerHTML = "Daily Sales Report";
                            salesData = data.dailyTotals;
                            if (!Array.isArray(salesData)) {
                                salesData = Object.values(salesData);
                            }
                            labels = salesData.map((_, index) => `Day ${index + 1}`);
                        } else if (dailyType === "weekly") {
                            title.innerHTML = "Weekly Sales Report";
                            const weeklyTotals = data.weeklyTotals;
                            salesData = [
                                weeklyTotals["Week 1"],
                                weeklyTotals["Week 2"],
                                weeklyTotals["Week 3"],
                                weeklyTotals["Week 4"],
                                weeklyTotals["Week 5"] || 0,
                            ];
                            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
                        } else if (dailyType === "monthly") {
                            title.innerHTML = "Monthly Sales Report";
                            const monthlyTotals = data.monthlyTotals;
                            salesData = [
                                monthlyTotals["January"],
                                monthlyTotals["February"],
                                monthlyTotals["March"],
                                monthlyTotals["April"],
                                monthlyTotals["May"],
                                monthlyTotals["June"],
                                monthlyTotals["July"],
                                monthlyTotals["August"],
                                monthlyTotals["September"],
                                monthlyTotals["October"],
                                monthlyTotals["November"],
                                monthlyTotals["December"]
                            ];
                            labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        }
            
                        // Clear existing chart instance if it exists
                        if (chartInstance) {
                            chartInstance.destroy(); // Destroy the previous chart instance
                        }
            
                        // Create a new chart
                        chartInstance = new Chart(bar, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: 'Sales Report',
                                    data: salesData,
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.2)',
                                        'rgba(255, 159, 64, 0.2)',
                                        'rgba(255, 205, 86, 0.2)',
                                        'rgba(75, 192, 192, 0.2)',
                                        'rgba(54, 162, 235, 0.2)',
                                        'rgba(153, 102, 255, 0.2)',
                                        'rgba(201, 203, 207, 0.2)',
                                        'rgba(255, 159, 64, 0.2)',
                                        'rgba(255, 205, 86, 0.2)',
                                        'rgba(75, 192, 192, 0.2)',
                                        'rgba(54, 162, 235, 0.2)',
                                        'rgba(153, 102, 255, 0.2)'
                                    ],
                                    borderColor: [
                                        'rgb(255, 99, 132)',
                                        'rgb(255, 159, 64)',
                                        'rgb(255, 205, 86)',
                                        'rgb(75, 192, 192)',
                                        'rgb(54, 162, 235)',
                                        'rgb(153, 102, 255)',
                                        'rgb(201, 203, 207)',
                                        'rgb(255, 159, 64)',
                                        'rgb(255, 205, 86)',
                                        'rgb(75, 192, 192)',
                                        'rgb(54, 162, 235)',
                                        'rgb(153, 102, 255)'
                                    ],
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }
                        });
            
                        loadingSpinner1.style.display = 'none'; // Hide spinner after loading data and rendering chart
                    }).catch(error => {
                        console.error('Error:', error);
                        loadingSpinner1.style.display = 'none'; // Hide spinner on fetch error
                    });
                });
            });
            
    function printReceipt(data, customerName, grandPrice){
    console.log(data)
    const cartBody = document.getElementById('cart-body');
    cartBody.innerHTML = '';
    if (data.length === 0) {
        const emptyRow = `<tr><td colspan="4" class="text-center">No items in cart</td></tr>`;
        cartBody.innerHTML = emptyRow;
        return;
    }
    document.getElementById('grand-total').innerHTML = formatCurrency1(grandPrice);
    document.getElementById('customerName2').innerHTML = customerName +"<br>";

    data.forEach(item => {
        const rowHtml = `
            <tr data-id="${item.ProductId}">
                <td>${item.ProductName}</td>
                <td>${item.ProductPrice.toFixed(2)}</td>
                <td>${item.Quality}</td>               
                <td>${item.TotalPrice.toFixed(2)}</td>
            </tr>
        `;
        cartBody.innerHTML += rowHtml; // Append new row
    });

    // cartBody.innerHTML = '';
}
                
   



})