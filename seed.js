const defaultProducts = [
    // VEGETABLES
    {
        id: 1, name: "Fresh Tomatoes", category: "vegetables", unit: "1 kg", price: 40,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 2, name: "Green Broccoli", category: "vegetables", unit: "500 g", price: 55,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 3, name: "Fresh Carrots", category: "vegetables", unit: "1 kg", price: 35,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 4, name: "Green Capsicum", category: "vegetables", unit: "500 g", price: 30,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 5, name: "Fresh Onions", category: "vegetables", unit: "1 kg", price: 45,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 6, name: "Potatoes", category: "vegetables", unit: "1 kg", price: 30,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 7, name: "Fresh Spinach", category: "vegetables", unit: "250 g", price: 15,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 8, name: "Cauliflower", category: "vegetables", unit: "1 pc", price: 25,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 9, name: "Fresh Cucumber", category: "vegetables", unit: "500 g", price: 20,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 10, name: "Beetroot", category: "vegetables", unit: "500 g", price: 25,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 11, name: "Ladies Finger", category: "vegetables", unit: "500 g", price: 30,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 12, name: "Drumstick", category: "vegetables", unit: "250 g", price: 20,
        image: "", badge: "", badgeType: "", inStock: true
    },

    // FRUITS
    {
        id: 13, name: "Fresh Bananas", category: "fruits", unit: "1 dozen", price: 50,
        image: "", badge: "Popular", badgeType: "", inStock: true
    },
    {
        id: 14, name: "Red Apples", category: "fruits", unit: "1 kg", price: 180,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 15, name: "Sweet Oranges", category: "fruits", unit: "1 kg", price: 80,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 16, name: "Fresh Mangoes", category: "fruits", unit: "1 kg", price: 120,
        image: "", badge: "Seasonal", badgeType: "", inStock: true
    },
    {
        id: 17, name: "Grapes", category: "fruits", unit: "500 g", price: 65,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 18, name: "Watermelon", category: "fruits", unit: "1 pc", price: 45,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 19, name: "Fresh Papaya", category: "fruits", unit: "1 pc", price: 40,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 20, name: "Pomegranate", category: "fruits", unit: "500 g", price: 95,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 21, name: "Guava", category: "fruits", unit: "500 g", price: 35,
        image: "", badge: "", badgeType: "", inStock: true
    },

    // RICE & GRAINS
    {
        id: 22, name: "Basmati Rice", category: "rice", unit: "5 kg", price: 450,
        image: "", badge: "Best Seller", badgeType: "", inStock: true
    },
    {
        id: 23, name: "Ponni Rice", category: "rice", unit: "5 kg", price: 380,
        image: "", badge: "Popular", badgeType: "", inStock: true
    },
    {
        id: 24, name: "Toor Dal", category: "rice", unit: "1 kg", price: 130,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 25, name: "Moong Dal", category: "rice", unit: "1 kg", price: 120,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 26, name: "Wheat Flour (Atta)", category: "rice", unit: "5 kg", price: 250,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 27, name: "Urad Dal", category: "rice", unit: "1 kg", price: 110,
        image: "", badge: "", badgeType: "", inStock: true
    },

    // SNACKS
    {
        id: 28, name: "Mixture Snack", category: "snacks", unit: "200 g", price: 60,
        image: "", badge: "Popular", badgeType: "", inStock: true
    },
    {
        id: 29, name: "Potato Chips", category: "snacks", unit: "150 g", price: 30,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 30, name: "Biscuits Pack", category: "snacks", unit: "300 g", price: 35,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 31, name: "Murukku", category: "snacks", unit: "250 g", price: 50,
        image: "", badge: "Local", badgeType: "", inStock: true
    },
    {
        id: 32, name: "Cookies", category: "snacks", unit: "250 g", price: 45,
        image: "", badge: "", badgeType: "", inStock: true
    },

    // BEVERAGES
    {
        id: 33, name: "Fresh Milk", category: "beverages", unit: "1 L", price: 56,
        image: "", badge: "Daily", badgeType: "fresh", inStock: true
    },
    {
        id: 34, name: "Tea Powder", category: "beverages", unit: "500 g", price: 180,
        image: "", badge: "Popular", badgeType: "", inStock: true
    },
    {
        id: 35, name: "Coffee Powder", category: "beverages", unit: "200 g", price: 150,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 36, name: "Coconut Water", category: "beverages", unit: "1 L", price: 40,
        image: "", badge: "Natural", badgeType: "fresh", inStock: true
    },

    // DAIRY
    {
        id: 37, name: "Fresh Curd", category: "dairy", unit: "500 g", price: 30,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 38, name: "Paneer", category: "dairy", unit: "200 g", price: 80,
        image: "", badge: "Fresh", badgeType: "fresh", inStock: true
    },
    {
        id: 39, name: "Butter", category: "dairy", unit: "100 g", price: 55,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 40, name: "Ghee", category: "dairy", unit: "500 ml", price: 320,
        image: "", badge: "Pure", badgeType: "fresh", inStock: true
    },

    // SPICES
    {
        id: 41, name: "Turmeric Powder", category: "spices", unit: "200 g", price: 45,
        image: "", badge: "Pure", badgeType: "fresh", inStock: true
    },
    {
        id: 42, name: "Red Chilli Powder", category: "spices", unit: "250 g", price: 65,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 43, name: "Cumin Seeds", category: "spices", unit: "100 g", price: 40,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 44, name: "Garam Masala", category: "spices", unit: "100 g", price: 55,
        image: "", badge: "Premium", badgeType: "", inStock: true
    },
    {
        id: 45, name: "Black Pepper", category: "spices", unit: "100 g", price: 75,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 46, name: "Mustard Seeds", category: "spices", unit: "200 g", price: 30,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 47, name: "Coriander Powder", category: "spices", unit: "200 g", price: 35,
        image: "", badge: "", badgeType: "", inStock: true
    },
    {
        id: 48, name: "Fennel Seeds", category: "spices", unit: "100 g", price: 35,
        image: "", badge: "", badgeType: "", inStock: true
    }
];

module.exports = defaultProducts;
