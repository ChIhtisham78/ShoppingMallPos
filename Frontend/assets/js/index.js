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
function formatCurrency1(value) {
    if (value === undefined || value === null) {
        return '₦0.00'; // or any default value you'd prefer
    }
    return '₦' + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
  // Reset previous messages
      errorAlert.classList.add('d-none');
      errorMessage.innerHTML = '';
      successAlert.classList.add('d-none');
      successMessage.innerHTML = '';

      document.getElementById('productName').addEventListener('input', function() {
        fetchProduct();
      });

      function fetchProduct() {
        loadingSpinner.style.display = 'block';
        const productName = document.getElementById('productName').value;
        const url = `https://localhost:7091/admin/api/index/product/items?Name=${productName}`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }).then(response => {
            if (response.status === 204) {
                const container = document.querySelector('.list-container');
                container.innerHTML = `
                    <div class="text-center">
                        <p class="h5">
                            <strong>Search for a product to add to cart</strong>
                        </p>
                    </div>
                `;
                return null;
            } else if (response.status === 200) {
                return response.json();
            } else {
                return response.json().then(data => {
                    errorMessage.innerText = data.message || 'An error occurred. Please try again later.';
                    errorAlert.classList.remove('d-none');
                });
            }
        })
        .then(data => {
            if (!data) return; // Stop further processing if no data
    
            const container = document.querySelector('.list-container');
            container.innerHTML = ''; // Clear the previous results
    
            if (data.length === 0) {
                container.innerHTML = `
                    <div class="text-center">
                        <p class="h5">
                            <strong class="text-danger">Not Found</strong>
                        </p>
                    </div>
                `;
            } else {
                data.forEach((index) => {
                    const rowHtml = `
                        <a style="text-decoration: none; color: inherit;cursor:pointer;" href="#!" onclick="addToCart(${index.Id}, '${index.Name}', ${index.Price}, ${index.Stock})">
                            <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                                <div class="ms-2 me-auto" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    <div class="fw-bold">${index.Name}</div>
                                    ID: ${index.Id}<br>
                                    ${formatCurrency(index.Price)}
                                </div>
                                <span class="badge rounded-pill ${index.Stock > 0 ? 'bg-success' : 'bg-danger'}">
                                    ${index.Stock > 0 ? 'In-Stock' : 'Out of Stock'} <br> ${index.Stock}
                                </span>
                            </div>
                        </a>
                    `;
                    container.innerHTML += rowHtml;
                });
            }
        });
    }
    

    
    
    window.addToCart = function addToCart(id, name, price, stock) {
        const container = document.querySelector('.cart-table'); 
        const existingRow = container.querySelector(`tr[data-id="${id}"]`);
        if (existingRow) {
            alert("This item is already in the cart!");
            return; 
        }
    
        const rowHtml = `
            <tr data-id="${id}">
            <td>${id}</td>
            <td class="name">${name}</td>
            <td class="text-primary in-stock" data-in-stock="${stock}"><b id="stock${id}">${stock}</b></td>
            <td class="product-price">${price.toFixed(2)}</td>
            <td>
                <div class="quantity-input">
                    <button class="btn btn-outline-secondary" onclick="decrement(${id})"><i class="bi bi-dash"></i></button>
                    <input type="number" id="quantity${id}" class="form-control mx-2" value="1" min="1" readonly>
                    <button class="btn btn-outline-secondary" onclick="increment(${id})"><i class="bi bi-plus"></i></button>
                </div>
            </td>
            <td class="total-price" id="total${id}">${price.toFixed(2)}</td>
            <td class="text-center">
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${id})"><i class="bi bi-x-circle"></i></button>
            </td>
        </tr>
    `;

    // Append the new row to the cart table
    container.innerHTML += rowHtml;

    // Initialize stock reduction for the new product
    updateStockDisplay(id, -1); // Reduce stock by 1 on add
    updateGrandTotal(); // Update grand total on load
};

window.increment = function increment(id) {
    const quantityInput = document.getElementById(`quantity${id}`);
    const stockElement = document.getElementById(`stock${id}`);
    let stockCount = parseInt(stockElement.innerText);

    if (stockCount <= 0) {
        alert("No more product available!");
        return; // Prevent increment if stock is 0
    }

    quantityInput.value = parseInt(quantityInput.value) + 1;
    stockCount -= 1; // Decrease stock
    stockElement.innerText = stockCount; // Update stock display
    updateTotal(`quantity${id}`, `total${id}`, `stock${id}`);
    updateStockColor(stockElement); // Update color based on stock
}

window.decrement = function decrement(id) {
    const quantityInput = document.getElementById(`quantity${id}`);
    const stockElement = document.getElementById(`stock${id}`);
    let stockCount = parseInt(stockElement.innerText);

    if (quantityInput.value > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
        stockCount += 1; // Increase stock
        stockElement.innerText = stockCount; // Update stock display
        updateTotal(`quantity${id}`, `total${id}`, `stock${id}`);
        updateStockColor(stockElement); // Update color based on stock
    }
}

window.deleteProduct = function deleteProduct(id) {
    const container = document.querySelector('.cart-table'); // Target the cart table body
    const row = container.querySelector(`tr[data-id="${id}"]`);
    const stockElement = row.querySelector('.in-stock b');
    const stockCount = parseInt(stockElement.innerText);
    const quantityInput = row.querySelector('input[type="number"]');
    const quantity = parseInt(quantityInput.value);

    // Return stock count to stock element
    stockElement.innerText = stockCount + quantity;
    updateStockColor(stockElement); // Update stock color after deletion

    // Remove the row from the table
    row.remove();
    updateGrandTotal(); // Update grand total after deletion
}

// Additional functions
function updateTotal(quantityId, totalId, stockId) {
    const quantity = parseInt(document.getElementById(quantityId).value);
    const price = parseFloat(document.querySelector(`tr[data-id="${stockId.replace('stock', '')}"] .product-price`).innerText);
    const total = quantity * price;
    document.getElementById(totalId).innerText = total.toFixed(2);
    updateGrandTotal(); // Update grand total after each change
}

function updateGrandTotal() {
    const totalElements = document.querySelectorAll('.total-price');
    let grandTotal = 0;

    totalElements.forEach(totalElement => {
        grandTotal += parseFloat(totalElement.innerText);
    });

    document.getElementById('grandTotal').innerText = formatCurrency(grandTotal);
}

function updateStockDisplay(id, change) {
    const stockElement = document.getElementById(`stock${id}`);
    let stockCount = parseInt(stockElement.innerText);
    stockCount += change; // Increase or decrease stock based on change value
    stockElement.innerText = stockCount; // Update stock display
    updateStockColor(stockElement); // Update stock color
}

function updateStockColor(stockElement) {
    const stockCount = parseInt(stockElement.innerText);
    if (stockCount < 10) {
        stockElement.classList.add('low-stock'); // Add class for low stock
    } else {
        stockElement.classList.remove('low-stock'); // Remove class if stock is not low
    }
}
    
    // Call fetchProduct to initialize
    fetchProduct();
    

      

      const loadingSpinner1 = document.getElementById('loadingSpinner1');
      loadingSpinner1.style.display = 'block';
        fetch(`https://localhost:7091/admin/api/index/recent/product/items`, {
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
      const container = document.querySelector('.recent-container'); // Target table body
      container.innerHTML = '';
      if (data.length === 0) {
        container.innerHTML = `
              <tr>
                  <td colspan="6" class="text-center">No data found</td>
              </tr>
          `;
      } else {
        data.forEach((index) => {
          const rowHtml = `
          
            <a onclick="addToCart(${index.ProductId}, '${index.ProductName}', ${index.ProductPrice}, ${index.ProductStock})" class="btn btn-secondary d-flex justify-content-between align-items-center m-2 p-2">
                <span><i class="bi bi-tags"></i>. ${index.ProductName}</span>
                <span class="badge bg-white text-secondary" style="margin-left: 20px;">in stock ${index.ProductStock}</span>
            </a>
          `;
          container.innerHTML += rowHtml;
          });
      }
    }).catch(error => {
      console.log(error);
      errorMessage.innerText = error;
      errorAlert.classList.remove('d-none');
  })


  

  document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', function(event) {
        const clickedButton = this; 
        const buttonId = clickedButton.id;

        console.log(`Button clicked: ${buttonId}`);

        let cartData = [];
        let grandPrice = 0;
        const tableRows = document.querySelectorAll('tr[data-id]'); // Select all rows with data-id attribute
        
        tableRows.forEach(row => {
            const id = row.getAttribute('data-id');
            const productName = row.querySelector('.name').innerText;
            const productPrice = row.querySelector('.product-price').innerText;
            const quantity = row.querySelector(`#quantity${id}`).value;
            const total = row.querySelector(`#total${id}`).innerText;
            const totalConvert = parseFloat(row.querySelector('.total-price').innerText.replace(/[^0-9.-]+/g,"")) || 0;

            // Push the product data to the array
            cartData.push({
                ProductId : id,
                Quantity : quantity,
                TotalPrice : total,
                productName : productName,
                productPrice : productPrice,
            });
            grandPrice += totalConvert;
            
        });
        console.log(cartData);
        
        
        let customerName = document.getElementById('customerName').value;
        
        if (grandPrice === 0.00) {
          alert("Please select a product to purchase")
          return;
        }
        if (!customerName.trim()) {
          alert("Customer name must not be empty")
          return;
        }
        const spinner = document.getElementById('spinner');
        const submitText = document.getElementById('submit-text');
        spinner.classList.remove('d-none');
        submitText.classList.add('d-none');
        

        fetch(`https://localhost:7091/admin/api/make/sales/${customerName}/${grandPrice}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(cartData),
      }).then(response => {
            spinner.classList.add('d-none');
            submitText.classList.remove('d-none');
            if (response.status===200) {
                return response.json().then(data => {
                const container = document.querySelector('.cart-table');
                var customerNameInput = document.getElementById("customerName");
                container.innerHTML = '';
                customerNameInput.value = '';
                successMessage.innerText = data.message;
                successAlert.classList.remove('d-none');
                if (buttonId === 'purchasePrint') {
                    printReceipt(cartData,customerName,grandPrice);
                }
                })
            } else {
              return response.json().then(data => {
                console.log(data)
                  errorMessage.innerText =data.message || 'An error occurred. Please try again later.';
                  errorAlert.classList.remove('d-none');
                })
            }
        })
        .catch(error => {
            errorMessage.innerText = ('server error occurred.');
            errorAlert.classList.remove('d-none');
        });

        // Here you would typically send the data to the backend, but for now, it's just logged
    });
});
  
function printReceipt(cartData2,customerName,grandPrice) {
    const cartBody = document.getElementById('cart-body');
    cartBody.innerHTML = '';
    if (cartData2.length === 0) {
        const emptyRow = `<tr><td colspan="4" class="text-center">No items in cart</td></tr>`;
        cartBody.innerHTML = emptyRow;
        return;
    }
    document.getElementById('grand-total').innerHTML = formatCurrency1(grandPrice);
    document.getElementById('customerName2').innerHTML = customerName +"<br>";

    cartData2.forEach(item => {
        const rowHtml = `
            <tr data-id="${item.ProductId}">
                <td>${item.productName}</td>
                <td>${item.productPrice}</td>
                <td>${item.Quantity}</td>               
                <td>${item.TotalPrice}</td>
            </tr>
        `;
        cartBody.innerHTML += rowHtml; // Append new row
    });

    cartBody.innerHTML = '';
}


})