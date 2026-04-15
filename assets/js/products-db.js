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

    add(product) {
        product.id = this.cache.length > 0 ? Math.max(...this.cache.map(p => p.id)) + 1 : 1;
        product.lastUpdated = new Date().toISOString();
        this.cache.push(product);

        // Background update
        fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        }).then(() => this.fetchAll()).catch(console.error);

        return product;
    },

    update(id, updates) {
        const index = this.cache.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.cache[index] = { ...this.cache[index], ...updates, lastUpdated: new Date().toISOString() };
            
            // Background update
            fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            }).then(() => this.fetchAll()).catch(console.error);
            
            return this.cache[index];
        }
        return null;
    },

    delete(id) {
        this.cache = this.cache.filter(p => p.id !== parseInt(id));
        
        // Background update
        fetch(`/api/products/${id}`, {
            method: 'DELETE'
        }).then(() => this.fetchAll()).catch(console.error);
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

    toggleStock(id) {
        const product = this.cache.find(p => p.id === parseInt(id));
        if (product) {
            product.inStock = !product.inStock;
            product.lastUpdated = new Date().toISOString();
            
            this.update(id, { inStock: product.inStock });
            return product;
        }
        return null;
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