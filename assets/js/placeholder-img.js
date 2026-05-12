/* ============================================
   SAMUTHIRAM STORE - Local Image Generator
   Creates SVG placeholders per category
   ============================================ */

const PlaceholderImg = {
    categoryConfig: {
        vegetables: { emoji: '🥦', bg: '#e8f5e9', color: '#2e7d32' },
        fruits:     { emoji: '🍎', bg: '#fff3e0', color: '#e65100' },
        rice:       { emoji: '🍚', bg: '#fff8e1', color: '#f9a825' },
        snacks:     { emoji: '🍪', bg: '#fce4ec', color: '#c62828' },
        beverages:  { emoji: '🥤', bg: '#e3f2fd', color: '#1565c0' },
        dairy:      { emoji: '🥛', bg: '#f3e5f5', color: '#7b1fa2' },
        spices:     { emoji: '🌶️', bg: '#fbe9e7', color: '#bf360c' },
        default:    { emoji: '🛒', bg: '#f5f5f5', color: '#616161' }
    },

    /**
     * Generate an inline SVG data URI for a product placeholder
     * @param {string} name - Product name
     * @param {string} category - Product category key
     * @returns {string} - data:image/svg+xml URI
     */
    generate(name, category) {
        const cfg = this.categoryConfig[category] || this.categoryConfig.default;
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
            <rect width="400" height="400" fill="${cfg.bg}" rx="16"/>
            <text x="200" y="160" text-anchor="middle" font-size="80">${cfg.emoji}</text>
            <text x="200" y="250" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="${cfg.color}">${this.escapeXml(name || 'Product')}</text>
            <text x="200" y="290" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="${cfg.color}80">${this.escapeXml(this.capitalize(category || 'item'))}</text>
        </svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    },

    /**
     * Get a small thumbnail SVG (for tables, carts, etc.)
     */
    thumbnail(name, category) {
        const cfg = this.categoryConfig[category] || this.categoryConfig.default;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
            <rect width="80" height="80" fill="${cfg.bg}" rx="8"/>
            <text x="40" y="45" text-anchor="middle" font-size="32">${cfg.emoji}</text>
            <text x="40" y="65" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="${cfg.color}">${this.escapeXml((name || '').substring(0, 12))}</text>
        </svg>`;
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    },

    /**
     * Set fallback for an <img> element that failed to load
     */
    handleError(imgEl, name, category) {
        imgEl.onerror = null; // prevent infinite loop
        imgEl.src = this.generate(name, category);
    },

    escapeXml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
