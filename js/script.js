// Constantes y variables globales
const CART_STORAGE_KEY = 'yanko-cart';
const WHATSAPP_NUMBER = '+584268092177';

let products = [];
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
let currentCategory = 'all';
let currentSearch = '';

// Elementos del DOM
const DOM = {
    productsGrid: document.getElementById('products-grid'),
    cartIcon: document.getElementById('cart-icon'),
    cartCount: document.getElementById('cart-count'),
    cartSidebar: document.getElementById('cart-sidebar'),
    overlay: document.getElementById('overlay'),
    closeCart: document.getElementById('close-cart'),
    continueShopping: document.getElementById('continue-shopping'),
    checkoutBtn: document.getElementById('checkout'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    productModal: document.getElementById('product-modal'),
    closeModal: document.getElementById('close-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalImage: document.getElementById('modal-image'),
    modalPrice: document.getElementById('modal-price'),
    modalDescription: document.getElementById('modal-description'),
    modalAddToCart: document.getElementById('modal-add-to-cart'),
    closeAndContinue: document.getElementById('close-and-continue'),
    productFeatures: document.getElementById('product-features'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    categoryLinks: document.querySelectorAll('.categories a'),
    menuToggle: document.getElementById('menu-toggle'),
    categories: document.getElementById('categories')
};

// Funciones de utilidad
const utils = {
    normalizeText: (text) => {
        if (!text) return '';
        return text.toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/gi, '')
            .trim();
    },
    
    showFeedback: (message, type = 'success') => {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 2000);
    },
    
    saveCart: () => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
};

// Funciones principales
const store = {
    async loadProducts() {
        try {
            const response = await fetch('/data/productos.json');
            products = await response.json();
            this.renderProducts();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            DOM.productsGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar productos. Intenta recargar la página.</p>
                </div>
            `;
        }
    },
    
    renderProducts() {
        DOM.productsGrid.innerHTML = '';
        
        const filteredProducts = products.filter(product => {
            const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
            const normalizedSearch = utils.normalizeText(currentSearch);
            
            return matchesCategory && (
                utils.normalizeText(product.title).includes(normalizedSearch) ||
                utils.normalizeText(product.description).includes(normalizedSearch) ||
                (product.features || []).some(f => 
                    utils.normalizeText(f).includes(normalizedSearch))
            );
        });
        
        if (filteredProducts.length === 0) {
            DOM.productsGrid.innerHTML = `
                <p class="empty-cart-message">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron productos.</p>
                </p>
            `;
            return;
        }
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    ${product.oldPrice ? '<span class="product-badge">Oferta</span>' : ''}
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
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
            
            productCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart') && !e.target.closest('.add-to-cart')) {
                    this.openProductModal(product.id);
                }
            });
            
            productCard.querySelector('.add-to-cart').addEventListener('click', (e) => {
                e.stopPropagation();
                this.addToCart(product.id);
                utils.showFeedback('¡Producto añadido al carrito!');
            });
            
            DOM.productsGrid.appendChild(productCard);
        });
    },
    
    openProductModal(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        DOM.modalTitle.textContent = product.title;
        DOM.modalImage.src = product.image;
        DOM.modalPrice.innerHTML = `$${product.price.toFixed(2)}${product.oldPrice ? ` <span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}`;
        DOM.modalDescription.textContent = product.description;
        DOM.modalAddToCart.setAttribute('data-id', product.id);
        
        DOM.productFeatures.innerHTML = '';
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            DOM.productFeatures.appendChild(li);
        });
        
        DOM.productModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },
    
    closeProductModal() {
        DOM.productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    },
    
    addToCart(productId) {
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
        
        this.updateCartCount();
        utils.saveCart();
    },
    
    renderCartItems() {
        if (cart.length === 0) {
            DOM.cartItems.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
            DOM.cartTotal.textContent = 'Total: $0.00';
            return;
        }
        
        DOM.cartItems.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
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
            
            cartItem.querySelector('.minus').addEventListener('click', () => this.updateQuantity(item.id, -1));
            cartItem.querySelector('.plus').addEventListener('click', () => this.updateQuantity(item.id, 1));
            cartItem.querySelector('.quantity-input').addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (!isNaN(newQuantity) && newQuantity >= 1) {
                    this.updateQuantity(item.id, newQuantity - item.quantity);
                } else {
                    e.target.value = item.quantity;
                }
            });
            cartItem.querySelector('.remove-item').addEventListener('click', () => this.removeFromCart(item.id));
            
            DOM.cartItems.appendChild(cartItem);
        });
        
        DOM.cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    },
    
    updateQuantity(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;
        
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity < 1) {
            cart.splice(itemIndex, 1);
        }
        
        this.updateCartCount();
        utils.saveCart();
        this.renderCartItems();
    },
    
    removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        this.updateCartCount();
        utils.saveCart();
        this.renderCartItems();
        utils.showFeedback('Producto eliminado del carrito', 'error');
    },
    
    updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        DOM.cartCount.textContent = totalItems;
    },
    
    openCart() {
        DOM.cartSidebar.classList.add('open');
        DOM.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.renderCartItems();
    },
    
    closeCartSidebar() {
        DOM.cartSidebar.classList.remove('open');
        DOM.overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    },
    
    processWhatsAppPayment() {
        if (cart.length === 0) {
            utils.showFeedback('Tu carrito está vacío', 'error');
            return;
        }
        
        let message = "¡Hola YankoCompany! Quiero comprar:\n\n";
        cart.forEach(item => {
            message += `- ${item.title} (${item.quantity} x $${item.price.toFixed(2)}) = $${(item.quantity * item.price).toFixed(2)}\n`;
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `\n*Total:* $${total.toFixed(2)}\n\n`;
        
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    },
    
    filterByCategory(category) {
        currentCategory = category;
        this.renderProducts();
        
        DOM.categoryLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-category') === category);
        });
    },
    
    searchProducts() {
        currentSearch = DOM.searchInput.value.trim();
        this.renderProducts();
    },
    
    initEventListeners() {
        // Modal
        DOM.closeModal.addEventListener('click', () => this.closeProductModal());
        DOM.closeAndContinue.addEventListener('click', () => this.closeProductModal());
        DOM.productModal.addEventListener('click', (e) => {
            if (e.target === DOM.productModal) this.closeProductModal();
        });
        
        // Carrito
        DOM.cartIcon.addEventListener('click', () => this.openCart());
        DOM.closeCart.addEventListener('click', () => this.closeCartSidebar());
        DOM.overlay.addEventListener('click', () => this.closeCartSidebar());
        DOM.continueShopping.addEventListener('click', () => this.closeCartSidebar());
        DOM.checkoutBtn.addEventListener('click', () => this.processWhatsAppPayment());
        
        // Categorías
        DOM.categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByCategory(link.getAttribute('data-category'));
                if (window.innerWidth <= 768) {
                    DOM.categories.classList.remove('show');
                }
            });
        });
        
        // Búsqueda
        DOM.searchBtn.addEventListener('click', () => this.searchProducts());
        DOM.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchProducts();
        });
        
        // Añadir al carrito desde modal
        DOM.modalAddToCart.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            this.addToCart(productId);
            utils.showFeedback('¡Producto añadido al carrito!');
        });
        
        // Menú mobile
        DOM.menuToggle.addEventListener('click', () => {
            DOM.categories.classList.toggle('show');
        });
    },
    
    async init() {
        await this.loadProducts();
        this.updateCartCount();
        this.initEventListeners();
    }
};

// Inicializar la tienda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => store.init());