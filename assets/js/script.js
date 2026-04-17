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
    initProducts();
    initCart();
    initTestimonials();
    initScrollReveal();
    initCounterAnimation();
    initBackToTop();
    initFloatingWhatsApp();
    initSmoothScroll();
    initParticles();

    // Auto-refresh every 5s to pick up admin changes
    setInterval(() => {
        try {
            const fresh = ProductDB.getAll().filter(p => p.inStock);
            if (JSON.stringify(fresh.map(p => p.id + '_' + p.price)) !== 
                JSON.stringify(productsData.map(p => p.id + '_' + p.price))) {
                productsData = fresh;
                renderProducts();
            }
        } catch(e) {}
    }, 5000);
});

// ============ LOAD PRODUCTS ============
function loadProducts() {
    try {
        productsData = ProductDB.getAll().filter(p => p.inStock);
    } catch(e) {
        console.warn('ProductDB not available, using empty array');
        productsData = [];
    }
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
                <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">
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
function initProducts() {
    renderProducts();
    initFilterTabs();
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        displayedProducts += 8;
        renderProducts();
    });
}

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
        card.style.animationDelay = `${i * 0.05}s`;

        card.innerHTML = `
            ${product.badge ? `<div class="product-card-badge ${product.badgeType}">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x400/e8f5e9/2e7d32?text=${encodeURIComponent(product.name)}'">
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
        const saved = safeStorage.getItem('samuthiram_cart');
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
}

function updateCartQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) { cart = cart.filter(i => i.id !== productId); showToast('Item removed', 'info'); }
    } else if (delta > 0) { addToCart(productId); return; }
    saveCart(); updateCartBadge(); renderProducts(); updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart(); updateCartBadge(); updateCartUI(); renderProducts();
    showToast('Item removed', 'info');
}

function saveCart() {
    try { safeStorage.setItem('samuthiram_cart', JSON.stringify(cart)); } catch(e) {}
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
                    <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
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

// ============ WHATSAPP ORDER ============
function sendWhatsAppOrder() {
    if (cart.length === 0) { showToast('Cart is empty!', 'error'); return; }

    const address = document.getElementById('deliveryAddress').value.trim();
    if (!address) { showToast('Please enter delivery address!', 'error'); document.getElementById('deliveryAddress').focus(); return; }

    let msg = `🛒 *Hello Samuthiram Store!*\n\nI'd like to order:\n\n`;
    let total = 0;
    cart.forEach((item, i) => {
        const t = item.price * item.qty;
        total += t;
        msg += `${i+1}. *${item.name}* (${item.unit})\n   ${item.qty} × ₹${item.price} = *₹${t}*\n`;
    });
    msg += `\n💰 *Total: ₹${total}*\n\n📍 *Address:*\n${address}\n\n🕐 Please deliver ASAP. Thank you! 🙏`;

    window.open(`https://wa.me/919345635274?text=${encodeURIComponent(msg)}`, '_blank');
    showToast('Opening WhatsApp...', 'success');

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
