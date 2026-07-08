const API_URL = "http://localhost:5000/api"; // Render deploy hone ke baad yahan Render URL dalein

document.addEventListener("DOMContentLoaded", () => {
    // Check Authentication state for navbar
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const authLink = document.getElementById("auth-link");

    if (token && authLink) {
        authLink.innerText = `Logout (${user.name})`;
        authLink.href = "#";
        authLink.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
        if (user.role === 'admin' && !document.getElementById('admin-nav')) {
            const nav = document.getElementById("nav-links");
            const adminLink = document.createElement("a");
            adminLink.id = "admin-nav";
            adminLink.href = "admin.html";
            adminLink.innerText = "Admin Panel";
            nav.appendChild(adminLink);
        }
    }

    // --- Page Routing Logic ---
    if (document.getElementById("products-container")) loadProducts();
    if (document.getElementById("login-form")) handleAuth();
    if (document.getElementById("cart-container")) loadCart();
    if (document.getElementById("add-product-form")) handleAdminPanel();
});

// Load Products on Homepage
async function loadProducts() {
    const container = document.getElementById("products-container");
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image_url || 'https://via.placeholder.com/150'}" alt="${p.title}">
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <h4>$${p.price}</h4>
            <button onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
    `).join('');
}

// Add Item To Cart
async function addToCart(productId) {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first!");

    const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
    });
    if (res.ok) alert("Product added to cart!");
}

// Auth Login / Signup
function handleAuth() {
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "index.html";
        } else alert(data.message);
    });

    document.getElementById("signup-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const role = document.getElementById("signup-role").value;

        const res = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role })
        });
        if (res.ok) { alert("Signup Success! Please login."); window.location.reload(); }
    });
}

// Load Cart and Mock Checkout
async function loadCart() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("cart-container");
    if (!token) return container.innerHTML = "<h3>Please login to see your cart.</h3>";

    const res = await fetch(`${API_URL}/cart`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const items = await res.json();
    let total = 0;

    if (items.length === 0) {
        container.innerHTML = "Your cart is empty.";
        return;
    }

    container.innerHTML = items.map(item => {
        total += item.price * item.quantity;
        return `
            <div style="background: white; padding: 10px; margin: 10px 0; display:flex; justify-content:space-between;">
                p>${item.title} (x${item.quantity}) - $${item.price * item.quantity}</p>
                <button onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
    }).join('');

    document.getElementById("total-price-view").innerText = `Total: $${total}`;
    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn.style.display = "block";
    checkoutBtn.onclick = async () => {
        const orderRes = await fetch(`${API_URL}/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ total_price: total })
        });
        if (orderRes.ok) { alert("Order placed successfully!"); window.location.href = "index.html"; }
    };
}

async function removeFromCart(cartId) {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/cart/${cartId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });
    loadCart();
}

// Admin Operations
function handleAdminPanel() {
    const token = localStorage.getItem("token");
    document.getElementById("add-product-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const product = {
            title: document.getElementById("p-title").value,
            description: document.getElementById("p-desc").value,
            price: document.getElementById("p-price").value,
            image_url: document.getElementById("p-img").value,
            stock: document.getElementById("p-stock").value
        };
        const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(product)
        });
        if (res.ok) { alert("Product added!"); window.location.reload(); }
    });
}