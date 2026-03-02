const socket = io();

// Escuchamos el evento 'updateProducts' que envía el servidor
socket.on('updateProducts', (products) => {
    const productList = document.getElementById('productList');
    productList.innerHTML = ''; // Limpiamos la lista para no duplicar

    products.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${product.title}</strong> - $${product.price} (Código: ${product.code})
            <button onclick="deleteProduct(${product.id})">Eliminar</button>
        `;
        productList.appendChild(li);
    });
});

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        price: Number(document.getElementById('price').value),
        code: document.getElementById('code').value,
        stock: Number(document.getElementById('stock').value),
        category: document.getElementById('category').value,
        status: true
    };

    // Hacemos el POST a nuestra API
    await fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    });

    document.getElementById('productForm').reset();
});

// Función para eliminar ejecutando un DELETE HTTP
async function deleteProduct(id) {
    await fetch(`/api/products/${id}`, {
        method: 'DELETE'
    });
}