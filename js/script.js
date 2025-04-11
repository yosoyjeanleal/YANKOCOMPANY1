 
 
 // Base de datos de productos para YankoCompany
 const products = [
    {
        id: 1,
        title: "Smartphone Yanko X1",
        price: 599.99,
        image: "https://via.placeholder.com/600x600?text=Smartphone+Yanko",
        description: "El último smartphone de YankoCompany con cámara de 48MP, pantalla AMOLED de 6.5 pulgadas y 128GB de almacenamiento. Diseño premium con procesador de última generación.",
        category: "electronics",
        features: [
            "Pantalla AMOLED 6.5'' Full HD+",
            "Cámara triple 48MP + 12MP + 5MP",
            "128GB almacenamiento, 8GB RAM",
            "Batería 4500mAh con carga rápida",
            "Procesador Yanko X1 Octa-core"
        ]
    },
    {
        id: 2,
        title: "Laptop Yanko Pro",
        price: 999.99,
        oldPrice: 1199.99,
        image: "https://via.placeholder.com/600x600?text=Laptop+Yanko",
        description: "Laptop potente de YankoCompany con procesador i7 de 11va generación, 16GB RAM y SSD de 512GB. Ideal para trabajo profesional y gaming.",
        category: "electronics",
        features: [
            "Procesador Intel i7-1165G7",
            "16GB RAM DDR4, 512GB SSD",
            "Pantalla 15.6'' Full HD IPS",
            "Tarjeta gráfica NVIDIA MX450",
            "Batería de hasta 10 horas"
        ]
    },
    {
        id: 3,
        title: "Camiseta Yanko Premium",
        price: 34.99,
        image: "https://via.placeholder.com/600x600?text=Camiseta+Yanko",
        description: "Camiseta premium 100% algodón orgánico de YankoCompany, disponible en varios colores. Corte moderno y cómodo para uso diario.",
        category: "clothing",
        features: [
            "100% algodón orgánico",
            "Disponible en tallas S-XXL",
            "Colores: Negro, Blanco, Gris",
            "Estampado resistente al lavado",
            "Hecho con materiales sostenibles"
        ]
    },
    {
        id: 4,
        title: "Sofá Yanko Modern",
        price: 699.99,
        oldPrice: 799.99,
        image: "https://via.placeholder.com/600x600?text=Sofá+Yanko",
        description: "Sofá de tres plazas de YankoCompany con tapizado en tela resistente y diseño escandinavo. Color gris antracita con detalles en madera.",
        category: "home",
        features: [
            "Medidas: 200x90x85 cm",
            "Estructura de madera sólida",
            "Espuma de alta densidad",
            "Patas de roble natural",
            "Fácil montaje incluido"
        ]
    }
];

// Variables globales
let cart = JSON.parse(localStorage.getItem('yanko-cart')) || [];
let currentCategory = 'all';
let currentSearch = '';

// Elementos del DOM
const productsGrid = document.getElementById('products-grid');
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const overlay = document.getElementById('overlay');
const closeCart = document.getElementById('close-cart');
const continueShopping = document.getElementById('continue-shopping');
const checkoutBtn = document.getElementById('checkout');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const productModal = document.getElementById('product-modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalPrice = document.getElementById('modal-price');
const modalDescription = document.getElementById('modal-description');
const modalAddToCart = document.getElementById('modal-add-to-cart');
const closeAndContinue = document.getElementById('close-and-continue');
const productFeatures = document.getElementById('product-features');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const categoryLinks = document.querySelectorAll('.categories a');
const menuToggle = document.getElementById('menu-toggle');
const categories = document.getElementById('categories');

// Inicializar la tienda
function initStore() {
    renderProducts();
    updateCartCount();
    
    // Event listeners para el modal
    closeModal.addEventListener('click', closeProductModal);
    closeAndContinue.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeProductModal();
        }
    });
    
    // Event listeners para el carrito
    cartIcon.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    overlay.addEventListener('click', closeCartSidebar);
    continueShopping.addEventListener('click', closeCartSidebar);
    checkoutBtn.addEventListener('click', processWhatsAppPayment);
    
    // Event listeners para categorías
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            filterByCategory(link.getAttribute('data-category'));
            // Cerrar el menú en móvil después de seleccionar una categoría
            if (window.innerWidth <= 768) {
                categories.classList.remove('show');
            }
        });
    });
    
    // Event listeners para búsqueda
    searchBtn.addEventListener('click', searchProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
    
    // Event listener para añadir al carrito desde el modal
    modalAddToCart.addEventListener('click', (e) => {
        const productId = parseInt(e.target.getAttribute('data-id'));
        addToCart(productId);
        showFeedback('¡Producto añadido al carrito!', 'success');
    });
    
    // Event listener para el menú toggle
    menuToggle.addEventListener('click', () => {
        categories.classList.toggle('show');
    });
}

// Renderizar productos
function renderProducts() {
    productsGrid.innerHTML = '';

    const filteredProducts = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                            product.description.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p class="empty-cart-message"><i class="fas fa-search"></i><p>No se encontraron productos.</p></p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                ${product.oldPrice ? '<span class="product-badge">Oferta</span>' : ''}
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">
                    $${product.price.toFixed(2)}
                    ${product.oldPrice ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
                </div>
                <button class="add-to-cart" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Añadir al carrito
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);

        // Click para abrir modal (evita que se dispare cuando se hace click en el botón de carrito)
        productCard.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-cart') && !e.target.closest('.add-to-cart')) {
                openProductModal(product.id);
            }
        });

        // Click en el botón de añadir al carrito
        productCard.querySelector('.add-to-cart').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevenir que se abra el modal
            addToCart(product.id);
            showFeedback('¡Producto añadido al carrito!', 'success');
        });
    });
}

// Abrir modal de producto
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    modalTitle.textContent = product.title;
    modalImage.src = product.image;
    modalPrice.innerHTML = `$${product.price.toFixed(2)}${product.oldPrice ? ` <span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}`;
    modalDescription.textContent = product.description;
    modalAddToCart.setAttribute('data-id', product.id);
    
    // Limpiar y agregar características
    productFeatures.innerHTML = '';
    product.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        productFeatures.appendChild(li);
    });
    
    productModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de producto
function closeProductModal() {
    productModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Abrir carrito
function openCart() {
    cartSidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartItems();
}

// Cerrar carrito
function closeCartSidebar() {
    cartSidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Añadir producto al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartCount();
    saveCartToLocalStorage();
}

// Renderizar items del carrito
       // Renderizar items del carrito
       function renderCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-basket"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.textContent = 'Total: $0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.title}</h3>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
        
        // Event listeners para los controles de cantidad
        cartItem.querySelector('.minus').addEventListener('click', () => {
            updateQuantity(item.id, -1);
        });
        
        cartItem.querySelector('.plus').addEventListener('click', () => {
            updateQuantity(item.id, 1);
        });
        
        cartItem.querySelector('.quantity-input').addEventListener('change', (e) => {
            const newQuantity = parseInt(e.target.value);
            if (!isNaN(newQuantity) && newQuantity >= 1) {
                updateQuantity(item.id, newQuantity - item.quantity);
            } else {
                e.target.value = item.quantity;
            }
        });
        
        cartItem.querySelector('.remove-item').addEventListener('click', () => {
            removeFromCart(item.id);
        });
    });
    
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

// Actualizar cantidad de un producto en el carrito
function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity += change;
    
    if (cart[itemIndex].quantity < 1) {
        cart.splice(itemIndex, 1);
    }
    
    updateCartCount();
    saveCartToLocalStorage();
    renderCartItems();
}

// Eliminar producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    saveCartToLocalStorage();
    renderCartItems();
    showFeedback('Producto eliminado del carrito', 'error');
}

// Actualizar contador del carrito
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Guardar carrito en localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('yanko-cart', JSON.stringify(cart));
}

// Procesar pago por WhatsApp
function processWhatsAppPayment() {
    if (cart.length === 0) {
        showFeedback('Tu carrito está vacío', 'error');
        return;
    }
    
    let message = "¡Hola YankoCompany! Quiero comprar los siguientes productos:\n\n";
    
    cart.forEach(item => {
        message += `- ${item.title} (${item.quantity} x $${item.price.toFixed(2)}) = $${(item.quantity * item.price).toFixed(2)}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Total:* $${total.toFixed(2)}\n\n`;
    message += "*Mis datos de envío son:*\n";
    message += "Nombre: [COMPLETAR]\n";
    message += "Dirección: [COMPLETAR]\n";
    message += "Teléfono: [COMPLETAR]\n\n";
    message += "Por favor confirmen disponibilidad y forma de pago. ¡Gracias!";
    
    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Número de WhatsApp (reemplaza con tu número real)
    const whatsappNumber = "1234567890";
    
    // Abrir WhatsApp con el mensaje
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Opcional: Vaciar el carrito después del pedido
    // cart = [];
    // updateCartCount();
    // saveCartToLocalStorage();
    // renderCartItems();
}

// Filtrar productos por categoría
function filterByCategory(category) {
    currentCategory = category;
    renderProducts();
    
    // Actualizar clase active en los enlaces de categoría
    categoryLinks.forEach(link => {
        if (link.getAttribute('data-category') === category) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Buscar productos
function searchProducts() {
    currentSearch = searchInput.value.trim();
    renderProducts();
}

// Mostrar mensaje de feedback
function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message';
    feedback.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Inicializar la tienda al cargar la página
window.addEventListener('DOMContentLoaded', initStore);