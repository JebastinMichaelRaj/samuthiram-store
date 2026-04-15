const defaultProducts = [
    // VEGETABLES
    {
        id: 1, name: "Fresh Tomatoes", category: "vegetables", unit: "1 kg", price: 40,
        image: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 2, name: "Green Broccoli", category: "vegetables", unit: "500 g", price: 55,
        image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 3, name: "Fresh Carrots", category: "vegetables", unit: "1 kg", price: 35,
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 4, name: "Green Capsicum", category: "vegetables", unit: "500 g", price: 30,
        image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 5, name: "Fresh Onions", category: "vegetables", unit: "1 kg", price: 45,
        image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 6, name: "Potatoes", category: "vegetables", unit: "1 kg", price: 30,
        image: "https://images.unsplash.com/photo-1508313880080-c8bef4cb67b6?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 7, name: "Fresh Spinach", category: "vegetables", unit: "250 g", price: 15,
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 8, name: "Cauliflower", category: "vegetables", unit: "1 pc", price: 25,
        image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 9, name: "Fresh Cucumber", category: "vegetables", unit: "500 g", price: 20,
        image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 10, name: "Beetroot", category: "vegetables", unit: "500 g", price: 25,
        image: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 11, name: "Ladies Finger", category: "vegetables", unit: "500 g", price: 30,
        image: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 12, name: "Drumstick", category: "vegetables", unit: "250 g", price: 20,
        image: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },

    // FRUITS
    {
        id: 13, name: "Fresh Bananas", category: "fruits", unit: "1 dozen", price: 50,
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
        badge: "Popular", badgeType: "", inStock: true
    },
    {
        id: 14, name: "Red Apples", category: "fruits", unit: "1 kg", price: 180,
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 15, name: "Sweet Oranges", category: "fruits", unit: "1 kg", price: 80,
        image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 16, name: "Fresh Mangoes", category: "fruits", unit: "1 kg", price: 120,
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop",
        badge: "Seasonal", badgeType: "", inStock: true
    },
    {
        id: 17, name: "Grapes", category: "fruits", unit: "500 g", price: 65,
        image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 18, name: "Watermelon", category: "fruits", unit: "1 pc", price: 45,
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 19, name: "Fresh Papaya", category: "fruits", unit: "1 pc", price: 40,
        image: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 20, name: "Pomegranate", category: "fruits", unit: "500 g", price: 95,
        image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 21, name: "Guava", category: "fruits", unit: "500 g", price: 35,
        image: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },

    // RICE & GRAINS
    {
        id: 22, name: "Basmati Rice", category: "rice", unit: "5 kg", price: 450,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
        badge: "Best Seller", badgeType: "", inStock: true
    },
    {
        id: 23, name: "Ponni Rice", category: "rice", unit: "5 kg", price: 380,
        image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=400&fit=crop",
        badge: "Popular", badgeType: "", inStock: true
    },
    {
        id: 24, name: "Toor Dal", category: "rice", unit: "1 kg", price: 130,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 25, name: "Moong Dal", category: "rice", unit: "1 kg", price: 120,
        image: "https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 26, name: "Wheat Flour (Atta)", category: "rice", unit: "5 kg", price: 250,
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 27, name: "Urad Dal", category: "rice", unit: "1 kg", price: 110,
        image: "https://images.unsplash.com/photo-1612257416648-ee7a6c533d4f?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },

    // SNACKS
    {
        id: 28, name: "Mixture Snack", category: "snacks", unit: "200 g", price: 60,
        image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop",
        badge: "Popular", badgeType: "", inStock: true
    },
    {
        id: 29, name: "Potato Chips", category: "snacks", unit: "150 g", price: 30,
        image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 30, name: "Biscuits Pack", category: "snacks", unit: "300 g", price: 35,
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 31, name: "Murukku", category: "snacks", unit: "250 g", price: 50,
        image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop",
        badge: "Local", badgeType: "", inStock: true
    },
    {
        id: 32, name: "Cookies", category: "snacks", unit: "250 g", price: 45,
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },

    // BEVERAGES
    {
        id: 33, name: "Fresh Milk", category: "beverages", unit: "1 L", price: 56,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
        badge: "Daily", badgeType: "fresh", inStock: true
    },
    {
        id: 34, name: "Tea Powder", category: "beverages", unit: "500 g", price: 180,
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop",
        badge: "Popular", badgeType: "", inStock: true
    },
    {
        id: 35, name: "Coffee Powder", category: "beverages", unit: "200 g", price: 150,
        image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 36, name: "Coconut Water", category: "beverages", unit: "1 L", price: 40,
        image: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=400&h=400&fit=crop",
        badge: "Natural", badgeType: "fresh", inStock: true
    },

    // DAIRY
    {
        id: 37, name: "Fresh Curd", category: "dairy", unit: "500 g", price: 30,
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 38, name: "Paneer", category: "dairy", unit: "200 g", price: 80,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop",
        badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 39, name: "Butter", category: "dairy", unit: "100 g", price: 55,
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 40, name: "Ghee", category: "dairy", unit: "500 ml", price: 320,
        image: "https://images.unsplash.com/photo-1600398142498-7d8b4b8e6e4c?w=400&h=400&fit=crop",
        badge: "Pure", badgeType: "fresh", inStock: true
    },

    // SPICES
    {
        id: 41, name: "Turmeric Powder", category: "spices", unit: "200 g", price: 45,
        image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop",
        badge: "Pure", badgeType: "fresh", inStock: true
    },
    {
        id: 42, name: "Red Chilli Powder", category: "spices", unit: "250 g", price: 65,
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 43, name: "Cumin Seeds", category: "spices", unit: "100 g", price: 40,
        image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 44, name: "Garam Masala", category: "spices", unit: "100 g", price: 55,
        image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=400&fit=crop",
        badge: "Premium", badgeType: "", inStock: true
    },
    {
        id: 45, name: "Black Pepper", category: "spices", unit: "100 g", price: 75,
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 46, name: "Mustard Seeds", category: "spices", unit: "200 g", price: 30,
        image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 47, name: "Coriander Powder", category: "spices", unit: "200 g", price: 35,
        image: "https://images.unsplash.com/photo-1599909533681-74b8e279024c?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    },
    {
        id: 48, name: "Fennel Seeds", category: "spices", unit: "100 g", price: 35,
        image: "https://images.unsplash.com/photo-1591227261920-93da0e3bc1e4?w=400&h=400&fit=crop",
        badge: "", badgeType: "", inStock: true
    }
];

module.exports = defaultProducts;
