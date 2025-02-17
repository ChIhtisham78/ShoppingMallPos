document.addEventListener('DOMContentLoaded', function() {
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
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    const successAlert = document.getElementById('success-alert');
    const successMessage = document.getElementById('success-message');

    // Reset previous messages
    errorAlert.classList.add('d-none');
    errorMessage.innerHTML = '';
    successAlert.classList.add('d-none');
    successMessage.innerHTML = '';
    
    
    fetch('https://localhost:7091/admin/api/admin/dashboard', {
      method: 'GET',
      headers: {
          'Authorization': 'Bearer ' + token
      }
    }).then(response => {
        if (response.ok) {
          return response.json().then(data => {
            console.log(data)
            document.getElementById('totalProduct').innerHTML= data.totalProduct;
            document.getElementById('totalProductInStock').innerHTML=data.availableProduct ;
            document.getElementById('totalProductOutOfStock').innerHTML= data.unavailableProduct;
            document.getElementById('totalProductItem').innerHTML= data.totalProductItems;
            document.getElementById('totalUser').innerHTML= data.totalUsers;
            document.getElementById('totalProductPrice').innerHTML= formatCurrency(data.totalProductPrice);
            document.getElementById('totalProductSoldPrice').innerHTML= formatCurrency(data.totalProductSoldPrice);
            document.getElementById('totalSales').innerHTML= data.totalSales;
            
            const tableBody = document.querySelector('.product-table');
            tableBody.innerHTML = ''; 
            const tableBody1 = document.querySelector('.cart-table');
            tableBody1.innerHTML = ''; 

            if (data.recentProduct.length === 0) {
            tableBody.innerHTML = `
                <tr>
                <td colspan="7" class="text-center">No data found</td>
                </tr>
            `;
            } else {
            data.recentProduct.forEach((index) => {
                const rowHtml = `
                <tr>
                    <th scope="row">${index.Id}</th>
                    <td>${index.Name}</td>
                    <td>${index.Stock}</td>
                    <td>${formatCurrency1(index.Price)}</td>
                    <td>${new Date(index.CreatedAt).toLocaleString()}</td>
                </tr>
                `;
                tableBody.innerHTML += rowHtml;
            })
        }
        if (data.recentSales.length === 0) {
          tableBody1.innerHTML = `
              <tr>
              <td colspan="7" class="text-center">No data found</td>
              </tr>
          `;
          }else {
            data.recentSales.forEach((index) => {
                const rowHtml = `
                <tr>
                    <th scope="row">${index.Id}</th>
                    <td>${index.SalesAgent}</td>
                    <td>${index.CustomerName}</td>
                    <td>${formatCurrency1(index.TotalPrice)}</td>
                    <td>${new Date(index.CreatedAt).toLocaleString()}</td>
                </tr>
                `;
                tableBody1.innerHTML += rowHtml;
            })
        }
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

})