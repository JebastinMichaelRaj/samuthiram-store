const ProductDB = {
    cache: [],

    async init() {
        await this.fetchAll();
        console.log('✅ ProductDB integrated with Node/MongoDB:', this.cache.length, 'products');
        
        // Auto-refresh frontend
        if (typeof loadProducts === 'function') {
            loadProducts();
        }
        if (typeof renderProducts === 'function') {
            renderProducts();
        }

        // Auto-refresh admin
        if (typeof refreshDashboard === 'function' && typeof refreshProductsTable === 'function') {
            refreshDashboard();
            refreshProductsTable();
            if (typeof refreshPriceGrid === 'function') refreshPriceGrid();
        }
    },

    async fetchAll() {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                this.cache = await res.json();
            }
        } catch (e) {
            console.error('Failed to fetch from backend', e);
        }
        return this.cache;
    },

    getAll() {
        return this.cache;
    },

    getByCategory(category) {
        if (category === 'all') return this.cache;
        return this.cache.filter(p => p.category === category);
    },

    getById(id) {
        return this.cache.find(p => p.id === parseInt(id));
    },

    async add(product) {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || `Server error ${res.status}`);
        }
        const saved = await res.json();
        // Use the server-assigned ID (avoids race-condition duplicate IDs)
        this.cache.push(saved);
        return saved;
    },

    async update(id, updates) {
        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || `Server error ${res.status}`);
        }
        const updated = await res.json();
        const idx = this.cache.findIndex(p => p.id === updated.id);
        if (idx !== -1) this.cache[idx] = updated;
        return updated;
    },

    async delete(id) {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || `Server error ${res.status}`);
        }
        // Remove from cache only after server confirms deletion
        this.cache = this.cache.filter(p => p.id !== parseInt(id));
    },

    bulkUpdatePrices(updates) {
        updates.forEach(({ id, price }) => {
            const product = this.cache.find(p => p.id === parseInt(id));
            if (product) {
                product.price = parseFloat(price);
                product.lastUpdated = new Date().toISOString();
            }
        });

        // Backend bulk updates sequentially (for simplicity)
        Promise.all(updates.map(u => 
            fetch(`/api/products/${u.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: u.price })
            })
        )).then(() => this.fetchAll()).catch(console.error);
    },

    async toggleStock(id) {
        const product = this.cache.find(p => p.id === parseInt(id));
        if (!product) return null;
        const newStock = !product.inStock;
        const updated = await this.update(id, { inStock: newStock });
        return updated;
    },

    resetToDefaults() {
        // Trigger seed on backend
        fetch('/api/seed', { method: 'POST' })
            .then(() => this.fetchAll())
            .then(() => {
                if (typeof refreshDashboard === 'function') {
                    refreshDashboard();
                    refreshProductsTable();
                    if (typeof refreshPriceGrid === 'function') refreshPriceGrid();
                }
            }).catch(console.error);
    },

    export() {
        return JSON.stringify(this.cache, null, 2);
    },

    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!Array.isArray(data)) return false;
            
            // Re-seed with new data
            fetch('/api/seed', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(() => this.fetchAll())
            .then(() => {
                if (typeof refreshDashboard === 'function') {
                    refreshDashboard();
                    refreshProductsTable();
                    if (typeof refreshPriceGrid === 'function') refreshPriceGrid();
                }
            }).catch(console.error);
            return true;
        } catch (e) {
            return false;
        }
    },

    getCategories() {
        return [
            { key: 'vegetables', name: 'Vegetables', emoji: '🥦' },
            { key: 'fruits', name: 'Fruits', emoji: '🍎' },
            { key: 'rice', name: 'Rice & Grains', emoji: '🍚' },
            { key: 'snacks', name: 'Snacks', emoji: '🍪' },
            { key: 'beverages', name: 'Beverages', emoji: '🥤' },
            { key: 'dairy', name: 'Dairy', emoji: '🥛' },
            { key: 'spices', name: 'Spices', emoji: '🌶️' }
        ];
    },

    getStats() {
        const all = this.cache;
        return {
            total: all.length,
            inStock: all.filter(p => p.inStock).length,
            outOfStock: all.filter(p => !p.inStock).length,
            categories: [...new Set(all.map(p => p.category))].length,
            avgPrice: all.length > 0 ? Math.round(all.reduce((sum, p) => sum + p.price, 0) / all.length) : 0
        };
    },

    search(query) {
        const q = query.toLowerCase();
        return this.cache.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    }
};

// Auto-initialize silently
ProductDB.init();