 /* ============================================
   SAMUTHIRAM STORE - Admin Panel Logic
   Product Management Dashboard
   ============================================ */

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    ProductDB.init();
    initAuth();
});

// ============ AUTHENTICATION ============
function initAuth() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const passwordToggle = document.getElementById('passwordToggle');
    
    // Check if already logged in
    if (sessionStorage.getItem('samuthiram_logged_in') === 'true') {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        initDashboard();
        return;
    }
    
    // Password toggle
    passwordToggle.addEventListener('click', () => {
        const input = document.getElementById('loginPassword');
        const icon = passwordToggle.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
    
    // Login form
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Get stored credentials or use defaults
        const storedAuth = JSON.parse(localStorage.getItem('samuthiram_admin_credentials') || '{}');
        const validUser = storedAuth.username || 'admin';
        const validPass = storedAuth.password || 'samuthiram123';
        
        if (username === validUser && password === validPass) {
            sessionStorage.setItem('samuthiram_logged_in', 'true');
            loginScreen.style.display = 'none';
            dashboard.style.display = 'flex';
            initDashboard();
        } else {
            loginError.textContent = '❌ Invalid username or password!';
            loginForm.classList.add('shake');
            setTimeout(() => loginForm.classList.remove('shake'), 500);
        }
    });
}

// ============ DASHBOARD INIT ============
function initDashboard() {
    initSidebar();
    initNavigation();
    initDashboardPage();
    initProductsPage();
    initAddProductPage();
    initQuickPricePage();
    initSettingsPage();
    initLogout();
    updateLastUpdated();
}

// ============ SIDEBAR ============
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    const close = document.getElementById('sidebarClose');
    
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    close.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
    
    // Close on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 && 
            !sidebar.contains(e.target) && 
            !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// ============ NAVIGATION ============
function initNavigation() {
    const links = document.querySelectorAll('.sidebar-link[data-page]');
    const quickBtns = document.querySelectorAll('[data-action]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
            
            // Close mobile sidebar
            document.getElementById('sidebar').classList.remove('open');
        });
    });
    
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            navigateTo(action);
        });
    });
}

function navigateTo(page) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-link[data-page]').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    // Update page visibility
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    const activePage = document.getElementById(`page-${page}`);
    if (activePage) activePage.classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'products': 'All Products',
        'add-product': 'Add Product',
        'quick-price': 'Quick Price Update',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    // Refresh page data
    if (page === 'dashboard') refreshDashboard();
    if (page === 'products') refreshProductsTable();
    if (page === 'quick-price') refreshPriceGrid();
    if (page === 'add-product') resetProductForm();
}

// ============ DASHBOARD PAGE ============
function initDashboardPage() {
    refreshDashboard();
}

function refreshDashboard() {
    const stats = ProductDB.getStats();
    
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statInStock').textContent = stats.inStock;
    document.getElementById('statOutStock').textContent = stats.outOfStock;
    document.getElementById('statCategories').textContent = stats.categories;
    
    // Recent updates
    const products = ProductDB.getAll()
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
        .slice(0, 5);
    
    const recentList = document.getElementById('recentList');
    recentList.innerHTML = products.map(p => `
        <div class="recent-item">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/40x40/e8f5e9/2e7d32?text=${p.name.charAt(0)}'">
            <div class="recent-item-info">
                <div class="recent-item-name">${p.name}</div>
                <div class="recent-item-meta">${formatTimeAgo(p.lastUpdated)}</div>
            </div>
            <div class="recent-item-price">₹${p.price}</div>
        </div>
    `).join('');
    
    // Category breakdown
    const categories = ProductDB.getCategories();
    const all = ProductDB.getAll();
    const colors = ['#2e7d32', '#ff6d00', '#1e88e5', '#7b1fa2', '#e53935', '#00838f', '#f9a825'];
    
    const breakdown = document.getElementById('categoryBreakdown');
    breakdown.innerHTML = categories.map((cat, i) => {
        const count = all.filter(p => p.category === cat.key).length;
        const pct = all.length > 0 ? (count / all.length * 100) : 0;
        return `
            <div class="cat-bar">
                <div class="cat-bar-label">${cat.emoji} ${cat.name}</div>
                <div class="cat-bar-track">
                    <div class="cat-bar-fill" style="width:${pct}%;background:${colors[i % colors.length]}"></div>
                </div>
                <div class="cat-bar-count">${count}</div>
            </div>
        `;
    }).join('');
}

// ============ PRODUCTS TABLE PAGE ============
function initProductsPage() {
    const searchInput = document.getElementById('adminSearchInput');
    const categoryFilter = document.getElementById('adminCategoryFilter');
    const stockFilter = document.getElementById('adminStockFilter');
    
    // Populate category filter
    const categories = ProductDB.getCategories();
    categories.forEach(cat => {
        categoryFilter.innerHTML += `<option value="${cat.key}">${cat.emoji} ${cat.name}</option>`;
    });
    
    // Events
    searchInput.addEventListener('input', () => refreshProductsTable());
    categoryFilter.addEventListener('change', () => refreshProductsTable());
    stockFilter.addEventListener('change', () => refreshProductsTable());
    
    refreshProductsTable();
}

function refreshProductsTable() {
    const search = document.getElementById('adminSearchInput').value.toLowerCase();
    const category = document.getElementById('adminCategoryFilter').value;
    const stock = document.getElementById('adminStockFilter').value;
    
    let products = ProductDB.getAll();
    
    // Filter
    if (search) {
        products = products.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search)
        );
    }
    if (category !== 'all') {
        products = products.filter(p => p.category === category);
    }
    if (stock === 'instock') {
        products = products.filter(p => p.inStock);
    } else if (stock === 'outofstock') {
        products = products.filter(p => !p.inStock);
    }
    
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted);">
                    <i class="fas fa-box-open" style="font-size:36px;display:block;margin-bottom:12px;"></i>
                    No products found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(p => {
        const catInfo = ProductDB.getCategories().find(c => c.key === p.category);
        return `
            <tr data-id="${p.id}">
                <td>
                    <img class="table-product-img" src="${p.image}" alt="${p.name}" 
                         onerror="this.src='https://via.placeholder.com/48x48/e8f5e9/2e7d32?text=${p.name.charAt(0)}'">
                </td>
                <td>
                    <div class="table-product-name">
                        ${p.name}
                        ${p.badge ? `<span class="table-product-badge ${p.badgeType === 'fresh' ? 'badge-fresh' : 'badge-default'}">${p.badge}</span>` : ''}
                    </div>
                </td>
                <td><span class="table-category">${catInfo ? catInfo.emoji : ''} ${capitalize(p.category)}</span></td>
                <td>${p.unit}</td>
                <td><span class="table-price">₹${p.price}</span></td>
                <td>
                    <span class="status-badge ${p.inStock ? 'status-instock' : 'status-outofstock'}">
                        <i class="fas ${p.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                        ${p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </td>
                <td><span class="table-date">${formatTimeAgo(p.lastUpdated)}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn edit" onclick="editProduct(${p.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn toggle" onclick="toggleProductStock(${p.id})" title="Toggle Stock">
                            <i class="fas ${p.inStock ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteProduct(${p.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ============ ADD / EDIT PRODUCT ============
function initAddProductPage() {
    const form = document.getElementById('productForm');
    const categorySelect = document.getElementById('productCategory');
    const imageFile = document.getElementById('imageFile');
    const imageUrl = document.getElementById('imageUrl');
    const loadImageUrlBtn = document.getElementById('loadImageUrl');
    const cancelBtn = document.getElementById('formCancelBtn');
    
    // Populate categories
    const categories = ProductDB.getCategories();
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.key}">${cat.emoji} ${cat.name}</option>`;
    });
    
    // Image file upload → convert to base64
    imageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                adminToast('Image must be less than 2MB', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreview(ev.target.result);
                document.getElementById('productImage').value = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Image URL load
    loadImageUrlBtn.addEventListener('click', () => {
        const url = imageUrl.value.trim();
        if (url) {
            setImagePreview(url);
            document.getElementById('productImage').value = url;
        }
    });
    
    imageUrl.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            loadImageUrlBtn.click();
        }
    });
    
    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const editId = document.getElementById('editProductId').value;
        const imageValue = document.getElementById('productImage').value;
        
        if (!imageValue) {
            adminToast('Please add a product image!', 'error');
            return;
        }
        
        const productData = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            unit: document.getElementById('productUnit').value.trim(),
            badge: document.getElementById('productBadge').value.trim(),
            badgeType: document.getElementById('productBadgeType').value,
            image: imageValue,
            inStock: document.getElementById('productInStock').checked
        };
        
        if (editId) {
            // Update existing
            ProductDB.update(parseInt(editId), productData);
            adminToast(`✅ "${productData.name}" updated successfully!`, 'success');
        } else {
            // Add new
            ProductDB.add(productData);
            adminToast(`✅ "${productData.name}" added successfully!`, 'success');
        }
        
        resetProductForm();
        navigateTo('products');
        updateLastUpdated();
    });
    
    // Cancel
    cancelBtn.addEventListener('click', () => {
        resetProductForm();
        navigateTo('products');
    });
}

function editProduct(id) {
    const product = ProductDB.getById(id);
    if (!product) return;
    
    navigateTo('add-product');
    
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
    document.getElementById('formSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Update Product';
    document.getElementById('editProductId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productUnit').value = product.unit;
    document.getElementById('productBadge').value = product.badge || '';
    document.getElementById('productBadgeType').value = product.badgeType || '';
    document.getElementById('productInStock').checked = product.inStock;
    document.getElementById('productImage').value = product.image;
    document.getElementById('imageUrl').value = product.image.startsWith('data:') ? '' : product.image;
    
    setImagePreview(product.image);
}

function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('editProductId').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Product';
    document.getElementById('formSubmitBtn').innerHTML = '<i class="fas fa-save"></i> Save Product';
    document.getElementById('productInStock').checked = true;
    
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '<i class="fas fa-image"></i><span>No image selected</span>';
}

function setImagePreview(src) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `<img src="${src}" alt="Preview" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-exclamation-triangle\\'></i><span>Failed to load</span>'">`;
}

function toggleProductStock(id) {
    const product = ProductDB.toggleStock(id);
    if (product) {
        adminToast(`${product.name} is now ${product.inStock ? 'In Stock' : 'Out of Stock'}`, 'info');
        refreshProductsTable();
        updateLastUpdated();
    }
}

function deleteProduct(id) {
    const product = ProductDB.getById(id);
    if (!product) return;
    
    showConfirm(
        '🗑️',
        `Delete "${product.name}"?`,
        'This product will be removed from the store.',
        () => {
            ProductDB.delete(id);
            adminToast(`"${product.name}" deleted!`, 'success');
            refreshProductsTable();
            refreshDashboard();
            updateLastUpdated();
        }
    );
}

// ============ QUICK PRICE UPDATE ============
function initQuickPricePage() {
    const categoryFilter = document.getElementById('priceFilterCategory');
    const saveBtn = document.getElementById('savePricesBtn');
    
    // Populate category filter
    const categories = ProductDB.getCategories();
    categories.forEach(cat => {
        categoryFilter.innerHTML += `<option value="${cat.key}">${cat.emoji} ${cat.name}</option>`;
    });
    
    categoryFilter.addEventListener('change', () => refreshPriceGrid());
    
    saveBtn.addEventListener('click', () => {
        savePrices();
    });
    
    refreshPriceGrid();
}

function refreshPriceGrid() {
    const category = document.getElementById('priceFilterCategory').value;
    const products = category === 'all' ? ProductDB.getAll() : ProductDB.getByCategory(category);
    
    const grid = document.getElementById('priceUpdateGrid');
    grid.innerHTML = products.map(p => `
        <div class="price-card" data-id="${p.id}">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/50x50/e8f5e9/2e7d32?text=${p.name.charAt(0)}'">
            <div class="price-card-info">
                <div class="price-card-name">${p.name}</div>
                <div class="price-card-unit">${p.unit}</div>
            </div>
            <div class="price-card-input">
                <span>₹</span>
                <input type="number" value="${p.price}" min="0" step="0.50" data-id="${p.id}" class="price-input">
            </div>
        </div>
    `).join('');
}

function savePrices() {
    const inputs = document.querySelectorAll('.price-input');
    const updates = [];
    
    inputs.forEach(input => {
        updates.push({
            id: parseInt(input.dataset.id),
            price: parseFloat(input.value)
        });
    });
    
    ProductDB.bulkUpdatePrices(updates);
    adminToast(`✅ ${updates.length} product prices updated!`, 'success');
    updateLastUpdated();
}

// ============ SETTINGS ============
function initSettingsPage() {
    // Change Password
    document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;
        
        if (newPass.length < 6) {
            adminToast('Password must be at least 6 characters!', 'error');
            return;
        }
        
        if (newPass !== confirmPass) {
            adminToast('Passwords do not match!', 'error');
            return;
        }
        
        const creds = JSON.parse(localStorage.getItem('samuthiram_admin_credentials') || '{}');
        creds.username = creds.username || 'admin';
        creds.password = newPass;
        localStorage.setItem('samuthiram_admin_credentials', JSON.stringify(creds));
        
        adminToast('✅ Password updated successfully!', 'success');
        document.getElementById('changePasswordForm').reset();
    });
    
    // Export
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        const data = ProductDB.export();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `samuthiram-products-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        adminToast('✅ Products exported!', 'success');
    });
    
    // Import
    document.getElementById('importFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                showConfirm(
                    '📦',
                    'Import Products?',
                    'This will replace all existing products.',
                    () => {
                        const success = ProductDB.import(ev.target.result);
                        if (success) {
                            adminToast('✅ Products imported successfully!', 'success');
                            refreshDashboard();
                            refreshProductsTable();
                        } else {
                            adminToast('❌ Invalid file format!', 'error');
                        }
                    }
                );
            };
            reader.readAsText(file);
        }
    });
    
    // Reset
    document.getElementById('resetDataBtn').addEventListener('click', () => {
        showConfirm(
            '⚠️',
            'Reset All Products?',
            'This will restore all products to their default values. Custom products will be lost.',
            () => {
                ProductDB.resetToDefaults();
                adminToast('✅ Products reset to defaults!', 'success');
                refreshDashboard();
                refreshProductsTable();
                refreshPriceGrid();
            }
        );
    });
}

// ============ LOGOUT ============
function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        showConfirm('👋', 'Logout?', 'You will need to login again.', () => {
            sessionStorage.removeItem('samuthiram_logged_in');
            location.reload();
        });
    });
}

// ============ CONFIRM DIALOG ============
function showConfirm(icon, title, message, onConfirm) {
    const overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    overlay.classList.add('open');
    
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    
    const newOk = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    
    const newCancel = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    
    newOk.addEventListener('click', () => {
        overlay.classList.remove('open');
        onConfirm();
    });
    
    newCancel.addEventListener('click', () => {
        overlay.classList.remove('open');
    });
}

// ============ TOAST ============
function adminToast(message, type = 'success') {
    const container = document.getElementById('adminToastContainer');
    const toast = document.createElement('div');
    toast.className = `admin-toast ${type}`;
    
    let icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';
    
    toast.innerHTML = `
        <span class="admin-toast-icon">${icon}</span>
        <span class="admin-toast-msg">${message}</span>
    `;
    
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ============ UTILITIES ============
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (el) {
        el.textContent = `Last updated: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    }
}