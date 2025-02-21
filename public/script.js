window.onload = async function() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/index.html';
    return;
  }

  try {
    const roleResponse = await fetch('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const roleResult = await roleResponse.json();
    console.log('Role result:', roleResult); 
    if (!roleResponse.ok) {
      alert(roleResult.message);
      return;
    }

    const userRole = roleResult.role;
    console.log('User role:', userRole); 

    if (userRole === 'admin') {
      document.getElementById('productsSection').style.display = 'block';
      document.getElementById('ordersSection').style.display = 'none';
    } else {
      document.getElementById('productsSection').style.display = 'none';
      document.getElementById('ordersSection').style.display = 'block';
    }

    const productsResponse = await fetch('/products', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const productsResult = await productsResponse.json();
    console.log('Products result:', productsResult); 

    if (productsResponse.ok) {
      const productsContainer = document.getElementById('productsContainer');
      const productSelect = document.getElementById('productSelect');
      productsResult.products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.textContent = `${product.title} - $${product.price}`;
        productsContainer.appendChild(productElement);

        const option = document.createElement('option');
        option.value = product._id;
        option.textContent = product.title;
        productSelect.appendChild(option);
      });
    } else {
      alert(productsResult.message);
    }

    // Загружаем заказы
    const ordersResponse = await fetch('/orders', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const ordersResult = await ordersResponse.json();
    console.log('Orders result:', ordersResult); // Проверяем заказы

    if (ordersResponse.ok) {
      const ordersContainer = document.getElementById('ordersContainer');
      ordersResult.orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.innerHTML = `Order: Product ID - ${order.product_id}, Quantity - ${order.quantity}`;
        ordersContainer.appendChild(orderDiv);
      });
    } else {
      alert(ordersResult.message);
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
};

    document.getElementById('createOrderForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const productId = document.getElementById('productSelect').value;
  const quantity = document.getElementById('orderQuantity').value;
  const token = localStorage.getItem('authToken');

  const response = await fetch('/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ product_id: productId, quantity: quantity })
  });

  const result = await response.json();
  if (response.ok) {
    alert('Order created successfully');
    window.location.reload(); // Reload the page to update the list of orders
  } else {
    alert(result.message);
  }
});

// Update order
document.getElementById('updateOrderButton').addEventListener('click', async function() {
  const orderId = document.getElementById('updateOrderId').value;
  const newQuantity = document.getElementById('updateQuantity').value;
  if (!orderId || !newQuantity) {
    alert('Please provide both order ID and new quantity');
    return;
  }

  const token = localStorage.getItem('authToken');
  const response = await fetch(`/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity: newQuantity })
  });

  const result = await response.json();
  if (response.ok) {
    alert('Order updated successfully');
    window.location.reload(); // Reload the page to update the list of orders
  } else {
    alert(result.message);
  }
});

// Delete order
document.getElementById('deleteOrderButton').addEventListener('click', async function() {
  const orderId = document.getElementById('deleteOrderId').value;
  if (!orderId) {
    alert('Please provide an order ID to delete');
    return;
  }

  const token = localStorage.getItem('authToken');
  const response = await fetch(`/orders/${orderId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  if (response.ok) {
    alert('Order deleted successfully');
    window.location.reload(); // Reload the page to update the list of orders
  } else {
    alert(result.message);
  }
});
  

     // Создание продукта
document.getElementById('createProductForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const name = document.getElementById('productName').value;
  const description = document.getElementById('productDescription').value;
  const price = document.getElementById('productPrice').value;
  const token = localStorage.getItem('authToken');

  const response = await fetch('/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title:name,description, price:price })
  });

  const result = await response.json();
  if (response.ok) {
    alert('Product created successfully');
    window.location.reload(); 
  } else {
    alert(result.message);
  }
});

// Обновление продукта
document.getElementById('updateProductButton').addEventListener('click', async function() {
  const productId = document.getElementById('updateProductId').value;
  const newName = document.getElementById('updateProductName').value;
  const newDescription = document.getElementById('updateProductDescription').value;
  const newPrice = document.getElementById('updateProductPrice').value;
  if (!productId || !newName || !newDescription || !newPrice) {
    alert('Please provide all required product details');
    return;
  }

  const token = localStorage.getItem('authToken');
  const response = await fetch(`/products/${productId}`, {
    method: 'PUT',
    headers: {
     'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: newName,newDescription, price: newPrice })
  });

  const result = await response.json();
  if (response.ok) {
    alert('Product updated successfully');
    window.location.reload();
  } else {
    alert(result.message);
  }
});

// Удаление продукта
document.getElementById('deleteProductButton').addEventListener('click', async function() {
  const productId = document.getElementById('deleteProductId').value;
  if (!productId) {
    alert('Please provide a product ID to delete');
    return;
  }

  const token = localStorage.getItem('authToken');
  const response = await fetch(`/products/${productId}`, {
    method: 'DELETE',
    headers: {
     'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  if (response.ok) {
    alert('Product deleted successfully');
    window.location.reload();
  } else {
    alert(result.message);
  }
});


