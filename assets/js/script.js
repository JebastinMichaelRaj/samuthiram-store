/* ============================================
   SAMUTHIRAM STORE - Main Store Logic
   FIX: Uses safe storage, no file:// errors
   ============================================ */

// ============ GLOBAL STATE ============
let cart = [];
let displayedProducts = 8;
let currentFilter = 'all';
let testimonialIndex = 0;
let productsData = [];

// ============ DOM READY ============
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initPreloader();
    initHeader();
    initMobileNav();
    initSearch();
    initCategories();
    initCart();
    initTestimonials();
    initScrollReveal();
    initCounterAnimation();
    initBackToTop();
    initFloatingWhatsApp();
    initSmoothScroll();
    initParticles();
    initFeedback();
    initOrderHistory();

    // Cross-tab cart sync via storage event (no unnecessary re-renders)
    window.addEventListener('storage', (e) => {
        if (e.key === 'samuthiram_cart') {
            try { cart = JSON.parse(e.newValue) || []; } catch(_) {}
            updateCartBadge();
            renderProducts();
        }
    });

    // Refresh product list from API every 30s (picks up admin price/stock changes)
    setInterval(async () => {
        try {
            const prev = JSON.stringify(productsData.map(p => p.id + '_' + p.price + '_' + p.inStock));
            await ProductDB.fetchAll();
            const fresh = ProductDB.getAll().filter(p => p.inStock);
            if (JSON.stringify(fresh.map(p => p.id + '_' + p.price + '_' + p.inStock)) !== prev) {
                // Auto-hide cards for products that just went out of stock
                const removedIds = productsData
                    .filter(old => !fresh.find(f => f.id === old.id))
                    .map(p => p.id);
                checkOutOfStockCards(removedIds);
                productsData = fresh;
                // Only re-render after fade-out animation completes
                if (removedIds.length > 0) {
                    setTimeout(() => renderProducts(), 400);
                } else {
                    renderProducts();
                }
            }
        } catch(e) {}
    }, 30000);
});

// ============ LOAD PRODUCTS ============
async function loadProducts() {
    try {
        await ProductDB.fetchAll();
        productsData = ProductDB.getAll().filter(p => p.inStock);
        renderProducts();
        initFilterTabs();
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            displayedProducts += 8;
            renderProducts();
        });
    } catch(e) {
        console.warn('ProductDB not available, using empty array');
        productsData = [];
        renderProducts();
    }
}

// ============ IMAGE HELPER ============
function getProductImage(product) {
    if (product.image && product.image.length > 5 && !product.image.startsWith('assets/img/logo')) {
        return product.image;
    }
    return PlaceholderImg.generate(product.name, product.category);
}

// ============ PRELOADER ============
function initPreloader() {
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => preloader.classList.add('hidden'), 1800);
    });
    setTimeout(() => preloader.classList.add('hidden'), 4000);
}

// ============ HEADER ============
function initHeader() {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);

        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
                });
            }
        });
    });
}

// ============ MOBILE NAV ============
function initMobileNav() {
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileNavOverlay');
    const close = document.getElementById('mobileNavClose');
    const links = document.querySelectorAll('.mobile-link');

    const openNav = () => { nav.classList.add('open'); document.body.classList.add('no-scroll'); };
    const closeNav = () => { nav.classList.remove('open'); document.body.classList.remove('no-scroll'); };

    toggle.addEventListener('click', openNav);
    overlay.addEventListener('click', closeNav);
    close.addEventListener('click', closeNav);
    links.forEach(l => l.addEventListener('click', closeNav));
}

// ============ SEARCH ============
function initSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.getElementById('searchBarContainer');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const suggestions = document.getElementById('searchSuggestions');
    const heroSearchInput = document.getElementById('heroSearchInput');

    searchToggle.addEventListener('click', () => {
        searchContainer.classList.toggle('open');
        if (searchContainer.classList.contains('open')) setTimeout(() => searchInput.focus(), 300);
    });

    searchClose.addEventListener('click', () => {
        searchContainer.classList.remove('open');
        searchInput.value = '';
        suggestions.classList.remove('active');
    });

    function performSearch(query, target) {
        if (query.length < 2) { target.classList.remove('active'); return; }

        const results = productsData.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);

        if (results.length === 0) {
            target.classList.add('active');
            target.innerHTML = '<div class="search-suggestion-item"><div class="ssi-info"><div class="ssi-name">No products found</div></div></div>';
            return;
        }

        target.classList.add('active');
        target.innerHTML = results.map(p => `
            <div class="search-suggestion-item" data-category="${p.category}">
                <img src="${getProductImage(p)}" alt="${p.name}">
                <div class="ssi-info">
                    <div class="ssi-name">${p.name}</div>
                    <div class="ssi-category">${capitalize(p.category)} • ${p.unit} • ₹${p.price}</div>
                </div>
            </div>
        `).join('');

        target.querySelectorAll('.search-suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                setFilter(item.dataset.category);
                searchContainer.classList.remove('open');
                searchInput.value = '';
                target.classList.remove('active');
                document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    searchInput.addEventListener('input', (e) => performSearch(e.target.value, suggestions));

    if (heroSearchInput) {
        const doSearch = () => {
            const q = heroSearchInput.value.trim().toLowerCase();
            if (q) {
                const match = productsData.find(p => p.category.includes(q) || p.name.toLowerCase().includes(q));
                setFilter(match ? match.category : 'all');
                document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
                heroSearchInput.value = '';
            }
        };
        heroSearchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') doSearch(); });
        const btn = document.querySelector('.hero-search-btn');
        if (btn) btn.addEventListener('click', doSearch);
    }
}

function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }

// ============ CATEGORIES ============
function initCategories() {
    const scroller = document.getElementById('categoryScroller');
    document.getElementById('catScrollLeft').addEventListener('click', () => scroller.scrollBy({ left: -300, behavior: 'smooth' }));
    document.getElementById('catScrollRight').addEventListener('click', () => scroller.scrollBy({ left: 300, behavior: 'smooth' }));

    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            setFilter(card.dataset.category);
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ============ PRODUCTS ============


function getFilteredProducts() {
    if (currentFilter === 'all') return productsData;
    return productsData.filter(p => p.category === currentFilter);
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    const filtered = getFilteredProducts();
    const toShow = filtered.slice(0, displayedProducts);

    grid.innerHTML = '';

    if (toShow.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                <div style="font-size:48px;margin-bottom:16px;">🔍</div>
                <h3 style="font-family:var(--font-display);margin-bottom:8px;">No Products Found</h3>
                <p style="color:var(--text-muted);">Try a different category</p>
            </div>`;
        return;
    }

    toShow.forEach((product, i) => {
        const inCart = cart.find(item => item.id === product.id);
        const qty = inCart ? inCart.qty : 0;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);
        card.style.animationDelay = `${i * 0.05}s`;

        card.innerHTML = `
            ${product.badge ? `<div class="product-card-badge ${product.badgeType}">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy"
                     onerror="PlaceholderImg.handleError(this,'${product.name.replace(/'/g, '\\&#39;')}','${product.category}')">
            </div>
            <div class="product-info">
                <span class="product-category-tag">${capitalize(product.category)}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-unit">${product.unit}</p>
                <div class="product-price-display">
                    <span class="product-price">₹${product.price}</span>
                </div>
                <div class="product-actions">
                    <div class="quantity-selector ${qty > 0 ? 'active' : ''}" data-id="${product.id}">
                        <button class="qty-btn qty-minus" data-id="${product.id}">−</button>
                        <span class="qty-value">${qty}</span>
                        <button class="qty-btn qty-plus" data-id="${product.id}">+</button>
                    </div>
                    <button class="add-btn ${qty > 0 ? 'hidden' : ''}" data-id="${product.id}">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>`;

        grid.appendChild(card);
    });

    // Attach events
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            addToCart(id);
            const card = btn.closest('.product-card');
            card.querySelector('.quantity-selector').classList.add('active');
            btn.classList.add('hidden');
            flyToCart(e);
        });
    });

    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', () => updateCartQty(parseInt(btn.dataset.id), 1));
    });

    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', () => updateCartQty(parseInt(btn.dataset.id), -1));
    });

    document.getElementById('loadMoreBtn').style.display = displayedProducts >= filtered.length ? 'none' : 'inline-flex';
}

function initFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            setFilter(tab.dataset.filter);
        });
    });
}

function setFilter(filter) {
    currentFilter = filter;
    displayedProducts = 8;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
    document.querySelectorAll('.category-card').forEach(c => c.classList.toggle('active', c.dataset.category === filter));
    renderProducts();
}

// ============ CART ============
function initCart() {
    document.getElementById('cartToggle').addEventListener('click', openCart);
    document.getElementById('cartClose').addEventListener('click', closeCart);
    document.getElementById('cartOverlay').addEventListener('click', closeCart);
    document.getElementById('clearCart').addEventListener('click', () => {
        cart = [];
        updateCartUI();
        renderProducts();
        showToast('Cart cleared', 'info');
    });
    document.getElementById('orderWhatsApp').addEventListener('click', sendWhatsAppOrder);

    // Load saved cart
    try {
        const saved = localStorage.getItem('samuthiram_cart');
        if (saved) { cart = JSON.parse(saved); updateCartBadge(); }
    } catch(e) {}
}

function openCart() {
    document.getElementById('cartPanel').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
    document.body.classList.add('no-scroll');
    updateCartUI();
}

function closeCart() {
    document.getElementById('cartPanel').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(i => i.id === productId);
    if (existing) { existing.qty += 1; }
    else { cart.push({ id: product.id, name: product.name, unit: product.unit, price: product.price, image: product.image, qty: 1 }); }

    saveCart();
    updateCartBadge();
    showToast(`${product.name} added!`, 'success');

    // Update the qty display in the product card immediately — no full re-render needed
    const item = cart.find(i => i.id === productId);
    const qtySpan = document.querySelector(`.quantity-selector[data-id="${productId}"] .qty-value`);
    if (qtySpan && item) qtySpan.textContent = item.qty;
}

function updateCartQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            // Remove from cart
            cart = cart.filter(i => i.id !== productId);
            showToast('Item removed', 'info');

            // Reset the product card inline — no full re-render
            const selector = document.querySelector(`.quantity-selector[data-id="${productId}"]`);
            const addBtn   = document.querySelector(`.add-btn[data-id="${productId}"]`);
            if (selector) selector.classList.remove('active');
            if (addBtn)   addBtn.classList.remove('hidden');

            // Update qty display to 0 in case it's briefly visible
            const qtySpan = selector ? selector.querySelector('.qty-value') : null;
            if (qtySpan) qtySpan.textContent = '0';
        } else {
            // Update qty span inline only
            const qtySpan = document.querySelector(`.quantity-selector[data-id="${productId}"] .qty-value`);
            if (qtySpan) qtySpan.textContent = item.qty;
        }
    } else if (delta > 0) {
        addToCart(productId);
        return;
    }

    saveCart();
    updateCartBadge();
    // Only refresh the cart panel if it's already open — avoids any DOM re-renders
    if (document.getElementById('cartPanel').classList.contains('open')) {
        updateCartUI();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart(); updateCartBadge(); updateCartUI(); renderProducts();
    showToast('Item removed', 'info');
}

function saveCart() {
    try { localStorage.setItem('samuthiram_cart', JSON.stringify(cart)); } catch(e) {}
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    badge.textContent = cart.reduce((sum, i) => sum + i.qty, 0);
    badge.classList.remove('bounce'); void badge.offsetWidth; badge.classList.add('bounce');
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotalItems = document.getElementById('cartTotalItems');

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <h4>Your cart is empty</h4>
                <p>Add some products to get started!</p>
                <a href="#products" class="btn btn-primary" onclick="closeCart();document.getElementById('products').scrollIntoView({behavior:'smooth'});return false;">Browse Products</a>
            </div>`;
        cartFooter.style.display = 'none';
        return;
    }

    cartFooter.style.display = 'block';
    let totalQty = 0, totalPrice = 0;

    cartItems.innerHTML = cart.map(item => {
        totalQty += item.qty;
        const itemTotal = item.price * item.qty;
        totalPrice += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${getProductImage(item)}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-unit">${item.unit} • ₹${item.price} × ${item.qty} = <strong>₹${itemTotal}</strong></div>
                </div>
                <div class="cart-item-qty">
                    <button class="cart-qty-btn" onclick="updateCartQty(${item.id},-1)">−</button>
                    <span class="cart-qty-value">${item.qty}</span>
                    <button class="cart-qty-btn" onclick="updateCartQty(${item.id},1)">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>`;
    }).join('');

    cartTotalItems.textContent = `${totalQty} items • ₹${totalPrice}`;
}

// ============ AUTO-HIDE OUT-OF-STOCK CARDS ============
function checkOutOfStockCards(removedIds) {
    if (!removedIds || removedIds.length === 0) return;
    removedIds.forEach(id => {
        const card = document.querySelector(`.product-card[data-product-id="${id}"]`);
        if (card) {
            // Smooth fade-out + collapse animation
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease, max-height 0.4s ease, margin 0.4s ease, padding 0.4s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            card.style.maxHeight = card.offsetHeight + 'px';
            // Start collapse after fade
            setTimeout(() => {
                card.style.maxHeight = '0';
                card.style.margin = '0';
                card.style.padding = '0';
                card.style.overflow = 'hidden';
            }, 350);
        }
    });
}

// ============ ORDER HISTORY ============
function initOrderHistory() {
    const btn = document.getElementById('myOrdersBtn');
    if (!btn) return;
    btn.addEventListener('click', openOrderHistory);

    document.getElementById('orderHistoryClose')?.addEventListener('click', closeOrderHistory);
    document.getElementById('orderHistoryOverlay')?.addEventListener('click', closeOrderHistory);
    document.getElementById('orderTrackInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') trackManualOrder();
    });
    document.getElementById('orderTrackBtn')?.addEventListener('click', trackManualOrder);
}

function openOrderHistory() {
    document.getElementById('orderHistoryPanel')?.classList.add('open');
    document.getElementById('orderHistoryOverlay')?.classList.add('open');
    document.body.classList.add('no-scroll');
    renderOrderHistory();
}

function closeOrderHistory() {
    document.getElementById('orderHistoryPanel')?.classList.remove('open');
    document.getElementById('orderHistoryOverlay')?.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

function renderOrderHistory() {
    const list = document.getElementById('myOrdersList');
    if (!list) return;
    const myOrders = JSON.parse(localStorage.getItem('samuthiram_my_orders') || '[]');
    if (myOrders.length === 0) {
        list.innerHTML = `
            <div class="orders-empty">
                <div class="orders-empty-icon">📦</div>
                <h4>No orders yet</h4>
                <p>Your order history will appear here after you place an order via WhatsApp.</p>
            </div>`;
        return;
    }
    list.innerHTML = myOrders.map(o => `
        <div class="order-history-card" onclick="loadOrderDetail('${o.orderId}')">
            <div class="ohc-left">
                <div class="ohc-id">${o.orderId}</div>
                <div class="ohc-date">${new Date(o.placedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
            </div>
            <div class="ohc-right">
                <div class="ohc-total">₹${o.total}</div>
                <div class="ohc-arrow"><i class="fas fa-chevron-right"></i></div>
            </div>
        </div>`).join('');
}

async function loadOrderDetail(orderId) {
    const detail = document.getElementById('orderDetail');
    if (!detail) return;
    detail.innerHTML = `<div class="order-detail-loading"><i class="fas fa-spinner fa-spin"></i> Loading…</div>`;
    detail.classList.add('open');

    try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error('Order not found');
        const order = await res.json();

        const statusLabels = {
            placed:           { icon: '📋', label: 'Order Placed',       color: '#1e88e5' },
            confirmed:        { icon: '✅', label: 'Confirmed',           color: '#43a047' },
            preparing:        { icon: '👨‍🍳', label: 'Preparing',          color: '#fb8c00' },
            out_for_delivery: { icon: '🚚', label: 'Out for Delivery',   color: '#8e24aa' },
            delivered:        { icon: '🎉', label: 'Delivered',           color: '#00897b' },
            cancelled:        { icon: '❌', label: 'Cancelled',           color: '#e53935' }
        };
        const allStatuses = ['placed','confirmed','preparing','out_for_delivery','delivered'];
        const currentIdx = allStatuses.indexOf(order.status);
        const cur = statusLabels[order.status] || statusLabels.placed;

        detail.innerHTML = `
            <button class="order-detail-back" onclick="document.getElementById('orderDetail').classList.remove('open')">
                <i class="fas fa-arrow-left"></i> Back
            </button>
            <div class="order-detail-header">
                <div class="order-detail-id">${order.orderId}</div>
                <div class="order-detail-status" style="color:${cur.color}">${cur.icon} ${cur.label}</div>
                <div class="order-detail-date">${new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
            </div>

            <!-- Status Progress Bar -->
            <div class="status-progress">
                ${allStatuses.map((s, i) => {
                    const sl = statusLabels[s];
                    const done = i <= currentIdx && order.status !== 'cancelled';
                    return `<div class="status-step ${done ? 'done' : ''} ${order.status === s ? 'current' : ''}">
                        <div class="status-dot">${sl.icon}</div>
                        <div class="status-step-label">${sl.label}</div>
                    </div>`;
                }).join('<div class="status-connector"></div>')}
            </div>

            <!-- Items -->
            <div class="order-detail-items">
                <h4><i class="fas fa-shopping-bag"></i> Items Ordered</h4>
                ${order.items.map(it => `
                    <div class="order-detail-item">
                        <div class="odi-name">${it.name} <span class="odi-unit">(${it.unit})</span></div>
                        <div class="odi-qty">${it.qty} × ₹${it.price} = <strong>₹${it.total}</strong></div>
                    </div>`).join('')}
                <div class="order-detail-total">Total: <strong>₹${order.totalAmount}</strong></div>
            </div>

            <!-- Address -->
            <div class="order-detail-address">
                <i class="fas fa-map-marker-alt"></i>
                <span>${order.deliveryAddress}</span>
            </div>`;
    } catch(err) {
        detail.innerHTML = `<div class="order-detail-loading" style="color:#e53935"><i class="fas fa-exclamation-circle"></i> ${err.message}</div>`;
    }
}

async function trackManualOrder() {
    const input = document.getElementById('orderTrackInput');
    const orderId = input?.value.trim().toUpperCase();
    if (!orderId) return;
    // Add to local list if not already there
    const myOrders = JSON.parse(localStorage.getItem('samuthiram_my_orders') || '[]');
    if (!myOrders.find(o => o.orderId === orderId)) {
        myOrders.unshift({ orderId, placedAt: new Date().toISOString(), total: 0 });
        localStorage.setItem('samuthiram_my_orders', JSON.stringify(myOrders.slice(0, 20)));
        renderOrderHistory();
    }
    loadOrderDetail(orderId);
    if (input) input.value = '';
}

// ============ WHATSAPP ORDER ============
async function sendWhatsAppOrder() {
    if (cart.length === 0) { showToast('Cart is empty!', 'error'); return; }

    const address = document.getElementById('deliveryAddress').value.trim();
    if (!address) {
        showToast('Please enter delivery address!', 'error');
        document.getElementById('deliveryAddress').focus();
        return;
    }

    let msg = `🛒 *Hello Samuthiram Store!*\n\nI'd like to order:\n\n`;
    let total = 0;
    const orderItems = [];

    cart.forEach((item, i) => {
        const t = item.price * item.qty;
        total += t;
        msg += `${i+1}. *${item.name}* (${item.unit})\n   ${item.qty} × ₹${item.price} = *₹${t}*\n`;
        orderItems.push({ productId: item.id, name: item.name, unit: item.unit, price: item.price, qty: item.qty, total: t });
    });
    msg += `\n💰 *Total: ₹${total}*\n\n📍 *Address:*\n${address}\n\n🕐 Please deliver ASAP. Thank you! 🙏`;

    // Save order to DB before opening WhatsApp
    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: orderItems, totalAmount: total, deliveryAddress: address })
        });
        if (res.ok) {
            const data = await res.json();
            // Store orderId in localStorage so customer can track it
            const myOrders = JSON.parse(localStorage.getItem('samuthiram_my_orders') || '[]');
            myOrders.unshift({ orderId: data.orderId, placedAt: new Date().toISOString(), total });
            localStorage.setItem('samuthiram_my_orders', JSON.stringify(myOrders.slice(0, 20)));
            msg += `\n\n📋 *Order Track ID: ${data.orderId}*\n_(Use this ID on our website to track your order status)_`;
        }
    } catch(err) {
        console.warn('Could not save order to DB:', err);
    }

    window.open(`https://wa.me/919345635274?text=${encodeURIComponent(msg)}`, '_blank');
    showToast('📲 Opening WhatsApp…', 'success');

    setTimeout(() => { cart = []; saveCart(); updateCartBadge(); updateCartUI(); renderProducts(); closeCart(); }, 1000);
}

// ============ FLY TO CART ============
function flyToCart(event) {
    const cartIcon = document.getElementById('cartToggle');
    const fly = document.createElement('div');
    fly.style.cssText = `position:fixed;width:30px;height:30px;background:linear-gradient(135deg,#2e7d32,#66bb6a);border-radius:50%;z-index:9999;pointer-events:none;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;box-shadow:0 4px 12px rgba(46,125,50,0.4);transition:all 0.7s cubic-bezier(0.2,1,0.3,1);`;
    fly.innerHTML = '<i class="fas fa-plus"></i>';
    const r = event.target.getBoundingClientRect();
    fly.style.left = r.left + r.width/2 - 15 + 'px';
    fly.style.top = r.top + r.height/2 - 15 + 'px';
    document.body.appendChild(fly);
    const cr = cartIcon.getBoundingClientRect();
    requestAnimationFrame(() => {
        fly.style.left = cr.left + cr.width/2 - 15 + 'px';
        fly.style.top = cr.top + cr.height/2 - 15 + 'px';
        fly.style.transform = 'scale(0.3)'; fly.style.opacity = '0.5';
    });
    setTimeout(() => fly.remove(), 800);
}

// ============ TESTIMONIALS ============
function initTestimonials() {
    const track = document.getElementById('testimonialTrack');
    const cards = track.querySelectorAll('.testimonial-card');
    const dotsContainer = document.getElementById('testimonialDots');

    let perView = getCardsPerView();
    let maxIdx = Math.max(0, cards.length - perView);

    function createDots() {
        dotsContainer.innerHTML = '';
        for (let i = 0; i <= maxIdx; i++) {
            const dot = document.createElement('div');
            dot.className = `dot ${i === testimonialIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => { testimonialIndex = i; update(); });
            dotsContainer.appendChild(dot);
        }
    }

    function update() {
        const w = cards[0].offsetWidth + 24;
        track.style.transform = `translateX(-${testimonialIndex * w}px)`;
        dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === testimonialIndex));
    }

    document.getElementById('testPrev').addEventListener('click', () => { testimonialIndex = Math.max(0, testimonialIndex - 1); update(); });
    document.getElementById('testNext').addEventListener('click', () => { testimonialIndex = Math.min(maxIdx, testimonialIndex + 1); update(); });

    let auto = setInterval(() => { testimonialIndex = testimonialIndex >= maxIdx ? 0 : testimonialIndex + 1; update(); }, 5000);
    track.addEventListener('mouseenter', () => clearInterval(auto));
    track.addEventListener('mouseleave', () => { auto = setInterval(() => { testimonialIndex = testimonialIndex >= maxIdx ? 0 : testimonialIndex + 1; update(); }, 5000); });

    window.addEventListener('resize', () => {
        perView = getCardsPerView();
        maxIdx = Math.max(0, cards.length - perView);
        testimonialIndex = Math.min(testimonialIndex, maxIdx);
        createDots(); update();
    });

    createDots();
}

function getCardsPerView() {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
}

// ============ SCROLL REVEAL ============
function initScrollReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
}

// ============ COUNTER ============
function initCounterAnimation() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const target = parseInt(e.target.dataset.count);
                let current = 0;
                const inc = target / 60;
                const timer = setInterval(() => {
                    current += inc;
                    if (current >= target) { e.target.textContent = target.toLocaleString(); clearInterval(timer); }
                    else e.target.textContent = Math.floor(current).toLocaleString();
                }, 30);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-number').forEach(c => obs.observe(c));
}

// ============ BACK TO TOP ============
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500));
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ============ FLOATING WHATSAPP ============
function initFloatingWhatsApp() {
    const btn = document.getElementById('floatingWhatsapp');
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 300));
}

// ============ SMOOTH SCROLL ============
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            const t = document.querySelector(this.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
        });
    });
}

// ============ TOAST ============
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ============ PARTICLES ============
function initParticles() {
    const c = document.getElementById('heroParticles');
    if (!c) return;
    const emojis = ['🥬','🍅','🥕','🍎','🍌','🫑','🥒','🍊','🍇','🥭'];
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.cssText = `position:absolute;font-size:${14+Math.random()*20}px;left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${0.05+Math.random()*0.1};animation:particleFloat ${8+Math.random()*12}s ease-in-out infinite;animation-delay:${Math.random()*5}s;pointer-events:none;`;
        c.appendChild(p);
    }
}

// Inject animation CSS
(function(){ const s=document.createElement('style'); s.textContent=`@keyframes particleFloat{0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(15px,-20px) rotate(10deg)}50%{transform:translate(-10px,-35px) rotate(-5deg)}75%{transform:translate(20px,-15px) rotate(8deg)}}`; document.head.appendChild(s); })();

// ============ FEEDBACK SECTION ============
function initFeedback() {
    const form = document.getElementById('feedbackForm');
    const starsContainer = document.getElementById('feedbackStars');
    const feedbackList = document.getElementById('feedbackList');
    if (!form || !starsContainer) return;

    let selectedRating = 0;

    // Star rating interaction
    const stars = starsContainer.querySelectorAll('.feedback-star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.rating) <= selectedRating);
            });
        });
        star.addEventListener('mouseenter', () => {
            const hoverVal = parseInt(star.dataset.rating);
            stars.forEach(s => {
                s.classList.toggle('hover', parseInt(s.dataset.rating) <= hoverVal);
            });
        });
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });

    // Submit feedback
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (selectedRating === 0) {
            showToast('Please select a star rating!', 'error');
            return;
        }
        const feedbackData = {
            name: document.getElementById('feedbackName').value.trim(),
            email: document.getElementById('feedbackEmail').value.trim(),
            rating: selectedRating,
            message: document.getElementById('feedbackMessage').value.trim()
        };
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });
            if (res.ok) {
                showToast('Thank you for your feedback! 🎉', 'success');
                form.reset();
                selectedRating = 0;
                stars.forEach(s => s.classList.remove('active'));
                loadFeedbackList();
            } else {
                showToast('Failed to submit feedback. Please try again.', 'error');
            }
        } catch (err) {
            showToast('Network error. Please try again later.', 'error');
        }
    });

    // Load existing feedback
    loadFeedbackList();
}

async function loadFeedbackList() {
    const feedbackList = document.getElementById('feedbackList');
    if (!feedbackList) return;
    try {
        const res = await fetch('/api/feedback');
        if (res.ok) {
            const items = await res.json();
            if (items.length === 0) {
                feedbackList.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;">No reviews yet. Be the first to share your thoughts!</p>';
                return;
            }
            feedbackList.innerHTML = items.slice(0, 6).map(fb => {
                const starsHtml = Array.from({length: 5}, (_, i) => 
                    `<i class="fas fa-star" style="color:${i < fb.rating ? '#f9a825' : '#ddd'};font-size:12px;"></i>`
                ).join('');
                const timeAgo = getTimeAgo(fb.createdAt);
                const initial = fb.name.charAt(0).toUpperCase();
                const colors = ['#2e7d32','#e65100','#1565c0','#7b1fa2','#c62828','#00838f'];
                const color = colors[fb.name.length % colors.length];
                return `
                    <div class="feedback-card">
                        <div class="feedback-card-header">
                            <div class="feedback-avatar" style="background:${color}">${initial}</div>
                            <div class="feedback-meta">
                                <strong>${escapeHtml(fb.name)}</strong>
                                <span>${timeAgo}</span>
                            </div>
                            <div class="feedback-rating">${starsHtml}</div>
                        </div>
                        <p class="feedback-text">${escapeHtml(fb.message)}</p>
                    </div>`;
            }).join('');
        }
    } catch (err) {
        console.error('Failed to load feedback', err);
    }
}

function getTimeAgo(dateStr) {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Note: showToast is defined above (line ~573). Duplicate removed.