/* ============================================
   SAMUTHIRAM STORE - Admin Panel Logic
   Product Management Dashboard
   ============================================ */

// ============ INIT ============
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthAndInit();
});

// ============ AUTHENTICATION ============
async function checkAuthAndInit() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('adminDashboard');

    // Check if already logged in (server-side session)
    try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (data.loggedIn) {
            await ProductDB.init();
            loginScreen.style.display = 'none';
            dashboard.style.display = 'flex';
            initDashboard();
            return;
        }
    } catch(e) {
        console.warn('Auth check failed:', e);
    }

    // Show login
    initAuth();
}

// ============ AUTHENTICATION ============
function initAuth() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const passwordToggle = document.getElementById('passwordToggle');

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

    // Login form — authenticates via server-side session
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalLabel = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...'; }

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                await ProductDB.init();
                loginScreen.style.display = 'none';
                dashboard.style.display = 'flex';
                initDashboard();
            } else {
                loginError.textContent = '❌ ' + (data.error || 'Invalid username or password!');
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 500);
            }
        } catch (err) {
            loginError.textContent = '❌ Network error. Please try again.';
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalLabel; }
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
    initOrdersPage();
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
    const activeLink = document.querySelector(`.sidebar-link[data-page="` + page + `"]`);
    if (activeLink) activeLink.classList.add('active');
    
    // Update page visibility
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    const activePage = document.getElementById(`page-` + page);
    if (activePage) activePage.classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'products': 'All Products',
        'add-product': 'Add Product',
        'quick-price': 'Quick Price Update',
        'orders': 'Orders',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    
    // Refresh page data
    if (page === 'dashboard') refreshDashboard();
    if (page === 'products') refreshProductsTable();
    if (page === 'quick-price') refreshPriceGrid();
    if (page === 'add-product') resetProductForm();
    if (page === 'orders') refreshOrdersTable();
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
            <img src="` + p.image + `" alt="` + p.name + `" onerror="this.src='https://via.placeholder.com/40x40/e8f5e9/2e7d32?text=` + p.name.charAt(0) + `'">
            <div class="recent-item-info">
                <div class="recent-item-name">` + p.name + `</div>
                <div class="recent-item-meta">` + formatTimeAgo(p.lastUpdated) + `</div>
            </div>
            <div class="recent-item-price">₹` + p.price + `</div>
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
                <div class="cat-bar-label">` + cat.emoji + ` ` + cat.name + `</div>
                <div class="cat-bar-track">
                    <div class="cat-bar-fill" style="width:` + pct + `%;background:` + colors[i % colors.length] + `"></div>
                </div>
                <div class="cat-bar-count">` + count + `</div>
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
        categoryFilter.innerHTML += `<option value="` + cat.key + `">` + cat.emoji + ` ` + cat.name + `</option>`;
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
            <tr data-id="` + p.id + `">
                <td>
                    <img class="table-product-img" src="` + p.image + `" alt="` + p.name + `" 
                         onerror="this.src='https://via.placeholder.com/48x48/e8f5e9/2e7d32?text=` + p.name.charAt(0) + `'">
                </td>
                <td>
                    <div class="table-product-name">
                        ` + p.name + `
                        ` + (p.badge ? `<span class="table-product-badge ` + (p.badgeType === 'fresh' ? 'badge-fresh' : 'badge-default') + `">` + p.badge + `</span>` : '') + `
                    </div>
                </td>
                <td><span class="table-category">` + (catInfo ? catInfo.emoji : '') + ` ` + capitalize(p.category) + `</span></td>
                <td>` + p.unit + `</td>
                <td><span class="table-price">₹` + p.price + `</span></td>
                <td>
                    <span class="status-badge ` + (p.inStock ? 'status-instock' : 'status-outofstock') + `">
                        <i class="fas ` + (p.inStock ? 'fa-check-circle' : 'fa-times-circle') + `"></i>
                        ` + (p.inStock ? 'In Stock' : 'Out of Stock') + `
                    </span>
                </td>
                <td><span class="table-date">` + formatTimeAgo(p.lastUpdated) + `</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn edit" onclick="editProduct(` + p.id + `)" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn toggle" onclick="toggleProductStock(` + p.id + `)" title="Toggle Stock">
                            <i class="fas ` + (p.inStock ? 'fa-eye-slash' : 'fa-eye') + `"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteProduct(` + p.id + `)" title="Delete">
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
    const cancelBtn = document.getElementById('formCancelBtn');
    
    // Populate categories
    const categories = ProductDB.getCategories();
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="` + cat.key + `">` + cat.emoji + ` ` + cat.name + `</option>`;
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
    
    // Form submit
    form.addEventListener('submit', async (e) => {
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

        const submitBtn = document.getElementById('formSubmitBtn');
        const originalLabel = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            if (editId) {
                await ProductDB.update(parseInt(editId), productData);
                adminToast('✅ "' + productData.name + '" updated successfully!', 'success');
            } else {
                await ProductDB.add(productData);
                adminToast('✅ "' + productData.name + '" added successfully!', 'success');
            }
            resetProductForm();
            navigateTo('products');
            updateLastUpdated();
        } catch (err) {
            adminToast('❌ Operation failed: ' + err.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalLabel;
        }
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
    preview.innerHTML = `<img src="${src}" alt="Preview" onerror="this.parentElement.innerHTML='<i class=&quot;fas fa-exclamation-triangle&quot;></i><span>Failed to load</span>'">`;
}

async function toggleProductStock(id) {
    try {
        const product = await ProductDB.toggleStock(id);
        if (product) {
            adminToast(product.name + ' is now ' + (product.inStock ? 'In Stock' : 'Out of Stock'), 'info');
            refreshProductsTable();
            refreshDashboard();
            updateLastUpdated();
        }
    } catch (err) {
        adminToast('❌ Failed to update stock: ' + err.message, 'error');
    }
}

function deleteProduct(id) {
    const product = ProductDB.getById(id);
    if (!product) return;

    showConfirm(
        '🗑️',
        'Delete "' + product.name + '"?',
        'This product will be permanently removed from the store.',
        async () => {
            try {
                await ProductDB.delete(id);
                adminToast('"✅ ' + product.name + '" deleted!', 'success');
                refreshProductsTable();
                refreshDashboard();
                updateLastUpdated();
            } catch (err) {
                adminToast('❌ Delete failed: ' + err.message, 'error');
            }
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
        categoryFilter.innerHTML += '<option value="' + cat.key + '">' + cat.emoji + ' ' + cat.name + '</option>';
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
        <div class="price-card" data-id="` + p.id + `">
            <img src="` + p.image + `" alt="` + p.name + `" onerror="this.src='https://via.placeholder.com/50x50/e8f5e9/2e7d32?text=` + p.name.charAt(0) + `'">
            <div class="price-card-info">
                <div class="price-card-name">` + p.name + `</div>
                <div class="price-card-unit">` + p.unit + `</div>
            </div>
            <div class="price-card-input">
                <span>₹</span>
                <input type="number" value="` + p.price + `" min="0" step="0.50" data-id="` + p.id + `" class="price-input">
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
    adminToast('✅ ' + updates.length + ' product prices updated!', 'success');
    updateLastUpdated();
}

// ============ SETTINGS ============
function initSettingsPage() {
    // Change Password
    document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPass = document.getElementById('newPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        if (newPass.length < 6) { adminToast('Password must be at least 6 characters!', 'error'); return; }
        if (newPass !== confirmPass) { adminToast('Passwords do not match!', 'error'); return; }

        try {
            const res = await fetch('/api/admin/generate-hash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPass })
            });
            if (res.ok) {
                const data = await res.json();
                adminToast('✅ New hash generated! Add ADMIN_PASSWORD_HASH to your .env file.', 'success');
                console.info('[Admin] New ADMIN_PASSWORD_HASH:', data.hash);
                document.getElementById('changePasswordForm').reset();
            } else {
                adminToast('⚠️ In production, update ADMIN_PASSWORD_HASH in your .env file manually.', 'info');
            }
        } catch (err) {
            adminToast('❌ Failed to update password: ' + err.message, 'error');
        }
    });
    
    // Export
    document.getElementById('exportDataBtn').addEventListener('click', () => {
        const data = ProductDB.export();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'samuthiram-products-' + new Date().toISOString().slice(0,10) + '.json';
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
        showConfirm('👋', 'Logout?', 'You will need to login again.', async () => {
            try {
                await fetch('/api/admin/logout', { method: 'POST' });
            } catch(e) {}
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
    toast.className = 'admin-toast ' + type;
    
    let icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';
    
    toast.innerHTML = '<span class="admin-toast-icon">' + icon + '</span><span class="admin-toast-msg">' + message + '</span>';
    
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
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (el) {
        el.textContent = 'Last updated: ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
}

// ============ ORDERS PAGE ============
function initOrdersPage() {
    document.getElementById('orderStatusFilter')?.addEventListener('change', refreshOrdersTable);
    refreshOrdersTable();
}

async function refreshOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    const filterVal = document.getElementById('orderStatusFilter')?.value || 'all';
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)"><i class="fas fa-spinner fa-spin" style="font-size:24px"></i></td></tr>';

    try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Failed to fetch orders');
        let orders = await res.json();

        // Update badge
        const badge = document.getElementById('ordersBadge');
        const newCount = orders.filter(o => o.status === 'placed').length;
        if (badge) badge.textContent = newCount > 0 ? newCount : '';

        if (filterVal !== 'all') {
            orders = orders.filter(o => o.status === filterVal);
        }

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)"><i class="fas fa-receipt" style="font-size:36px;display:block;margin-bottom:12px;"></i>No orders found</td></tr>';
            return;
        }

        const statusConfig = {
            placed:           { label: 'Placed',           color: '#1e88e5', bg: '#e3f2fd' },
            confirmed:        { label: 'Confirmed',         color: '#43a047', bg: '#e8f5e9' },
            preparing:        { label: 'Preparing',         color: '#fb8c00', bg: '#fff3e0' },
            out_for_delivery: { label: 'Out for Delivery', color: '#8e24aa', bg: '#f3e5f5' },
            delivered:        { label: 'Delivered',         color: '#00897b', bg: '#e0f2f1' },
            cancelled:        { label: 'Cancelled',         color: '#e53935', bg: '#ffebee' }
        };

        tbody.innerHTML = orders.map(o => {
            const sc = statusConfig[o.status] || statusConfig.placed;
            const itemSummary = o.items.slice(0, 2).map(i => i.name + ' ×' + i.qty).join(', ') +
                (o.items.length > 2 ? ' +' + (o.items.length - 2) + ' more' : '');
            const date = new Date(o.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
            const shortAddr = o.deliveryAddress.length > 40 ? o.deliveryAddress.slice(0, 40) + '…' : o.deliveryAddress;

            return `<tr>
                <td><strong style="font-family:monospace;font-size:13px">` + o.orderId + `</strong></td>
                <td style="font-size:13px;color:var(--text-muted)">` + date + `</td>
                <td style="font-size:13px;max-width:160px">` + itemSummary + `</td>
                <td><strong>₹` + o.totalAmount + `</strong></td>
                <td style="font-size:12px;color:var(--text-muted);max-width:140px">` + shortAddr + `</td>
                <td>
                    <span class="status-badge" style="background:` + sc.bg + `;color:` + sc.color + `;border:1px solid ` + sc.color + `33">
                        ` + sc.label + `
                    </span>
                </td>
                <td>
                    <select class="toolbar-select" style="font-size:12px;padding:4px 8px"
                            onchange="updateOrderStatus('` + o.orderId + `', this.value, this)">
                        <option value="">— Move to —</option>
                        <option value="placed">📋 Placed</option>
                        <option value="confirmed">✅ Confirmed</option>
                        <option value="preparing">👨‍🍳 Preparing</option>
                        <option value="out_for_delivery">🚚 Out for Delivery</option>
                        <option value="delivered">🎉 Delivered</option>
                        <option value="cancelled">❌ Cancelled</option>
                    </select>
                </td>
            </tr>`;
        }).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:#e53935">❌ ' + err.message + '</td></tr>';
    }
}

async function updateOrderStatus(orderId, status, selectEl) {
    if (!status) return;
    selectEl.disabled = true;
    try {
        const res = await fetch(`/api/orders/` + orderId + `/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, note: 'Updated by admin' })
        });
        if (!res.ok) throw new Error('Update failed');
        adminToast('✅ Order ' + orderId + ' → ' + status.replace(/_/g,' '), 'success');
        refreshOrdersTable();
    } catch (err) {
        adminToast('❌ ' + err.message, 'error');
        selectEl.disabled = false;
        selectEl.value = '';
    }
}
