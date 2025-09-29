// Enhanced Mock data for the food delivery application - Spring Boot ready structure
export const mockUsers = [
  {
    id: 1,
    name: "ashok",
    email: "ashok@gmail.com",
    phone: "+1234567890",
    password: "ashok123", // In real app, this would be hashed
    role: "CUSTOMER",
    isActive: true,
    addresses: [
      {
        id: 1,
        type: "HOME",
        address: "123 Main St, City, State 12345",
        latitude: 40.7128,
        longitude: -74.0060,
        isDefault: true,
        landmark: "Near Central Park"
      }
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@gmail.com",
    phone: "+1234567891",
    password: "admin123",
    role: "ADMIN",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    name: "Restaurant Owner",
    email: "owner@gmail.com",
    phone: "+1234567892",
    password: "owner123",
    role: "RESTAURANT_OWNER",
    restaurantId: 1,
    isActive: true,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z"
  },
  {
    id: 4,
    name: "Delivery Partner",
    email: "delivery@gmail.com",
    phone: "+1234567893",
    password: "delivery123",
    role: "DELIVERY_PARTNER",
    vehicleType: "BIKE",
    vehicleNumber: "MH01AB1234",
    isOnline: true,
    isAvailable: true,
    currentLocation: { latitude: 40.7128, longitude: -74.0060 },
    createdAt: "2024-01-12T08:00:00Z",
    updatedAt: "2024-01-12T08:00:00Z"
  }
];

export const mockRestaurants = [
  {
    id: 1,
    name: "Spice Palace",
    description: "Authentic Indian cuisine with a modern twist",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
    coverImage: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800",
    rating: 4.5,
    totalRatings: 1250,
    deliveryTime: "25-30 mins",
    deliveryFee: 2.99,
    minimumOrder: 15.00,
    cuisine: "Indian",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "456 Food Street, City, State 12345",
    phone: "+1234567894",
    openingHours: "10:00 AM - 11:00 PM",
    ownerId: 3,
    location: { latitude: 40.7589, longitude: -73.9851 },
    tags: ["Popular", "Fast Delivery", "Best Seller"],
    offers: [
      { id: 1, title: "20% off on orders above ₹300", type: "PERCENTAGE", value: 20, minOrder: 300 },
      { id: 2, title: "Free delivery on orders above ₹200", type: "FREE_DELIVERY", value: 0, minOrder: 200 }
    ],
    menu: [
      {
        id: 1,
        category: "Starters",
        items: [
          {
            id: 101,
            name: "Chicken Tikka",
            description: "Tender chicken marinated in spices and grilled to perfection",
            price: 12.99,
            originalPrice: 15.99,
            image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 15,
            customization: [
              { name: "Spice Level", options: ["Mild", "Medium", "Hot"], required: true },
              { name: "Extra", options: ["Extra Sauce", "Extra Onions"], required: false }
            ],
            nutrition: { calories: 250, protein: 25, carbs: 5, fat: 12 }
          },
          {
            id: 102,
            name: "Samosas",
            description: "Crispy pastries filled with spiced potatoes and peas",
            price: 6.99,
            originalPrice: 8.99,
            image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: false,
            preparationTime: 10,
            nutrition: { calories: 180, protein: 4, carbs: 25, fat: 8 }
          },
          {
            id: 103,
            name: "Paneer Tikka",
            description: "Grilled cottage cheese with aromatic spices",
            price: 10.99,
            originalPrice: 13.99,
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: true,
            preparationTime: 12,
            nutrition: { calories: 200, protein: 15, carbs: 8, fat: 10 }
          }
        ]
      },
      {
        id: 2,
        category: "Main Course",
        items: [
          {
            id: 201,
            name: "Butter Chicken",
            description: "Creamy tomato-based curry with tender chicken pieces",
            price: 18.99,
            originalPrice: 22.99,
            image: "https://images.unsplash.com/photo-1563379091339-03246963d4d1?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 20,
            customization: [
              { name: "Rice Type", options: ["Basmati", "Jasmine", "Brown"], required: true },
              { name: "Bread", options: ["Naan", "Roti", "Paratha"], required: false }
            ],
            nutrition: { calories: 450, protein: 35, carbs: 30, fat: 20 }
          },
          {
            id: 202,
            name: "Biryani",
            description: "Fragrant basmati rice with spiced meat and aromatic spices",
            price: 16.99,
            originalPrice: 19.99,
            image: "https://images.unsplash.com/photo-1563379091339-03246963d4d1?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 25,
            nutrition: { calories: 520, protein: 28, carbs: 45, fat: 22 }
          },
          {
            id: 203,
            name: "Dal Makhani",
            description: "Creamy black lentils cooked with butter and cream",
            price: 14.99,
            originalPrice: 17.99,
            image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: true,
            preparationTime: 18,
            nutrition: { calories: 320, protein: 18, carbs: 35, fat: 15 }
          }
        ]
      },
      {
        id: 3,
        category: "Desserts",
        items: [
          {
            id: 301,
            name: "Gulab Jamun",
            description: "Soft milk dumplings in rose syrup",
            price: 8.99,
            originalPrice: 10.99,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: true,
            preparationTime: 5,
            nutrition: { calories: 280, protein: 6, carbs: 45, fat: 8 }
          }
        ]
      }
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 2,
    name: "Pizza Corner",
    description: "Fresh Italian pizzas made with authentic ingredients",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop",
    rating: 4.3,
    totalRatings: 890,
    deliveryTime: "20-25 mins",
    deliveryFee: 1.99,
    minimumOrder: 20.00,
    cuisine: "Italian",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "789 Pizza Lane, City, State 12345",
    phone: "+1234567895",
    openingHours: "11:00 AM - 12:00 AM",
    ownerId: 3,
    location: { latitude: 40.7505, longitude: -73.9934 },
    tags: ["Italian", "Pizza", "Fast Delivery"],
    offers: [
      { id: 3, title: "Buy 1 Get 1 Free on Pizzas", type: "BOGO", value: 50, minOrder: 0 }
    ],
    menu: [
      {
        id: 1,
        category: "Pizzas",
        items: [
          {
            id: 301,
            name: "Margherita Pizza",
            description: "Classic tomato, mozzarella, and fresh basil",
            price: 14.99,
            originalPrice: 17.99,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: true,
            preparationTime: 15,
            customization: [
              { name: "Size", options: ["Small", "Medium", "Large"], required: true },
              { name: "Crust", options: ["Thin", "Regular", "Thick"], required: true }
            ],
            nutrition: { calories: 320, protein: 15, carbs: 35, fat: 12 }
          },
          {
            id: 302,
            name: "Pepperoni Pizza",
            description: "Spicy pepperoni with mozzarella cheese",
            price: 16.99,
            originalPrice: 19.99,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 18,
            nutrition: { calories: 380, protein: 18, carbs: 35, fat: 18 }
          },
          {
            id: 303,
            name: "Quattro Stagioni",
            description: "Four seasons pizza with artichokes, mushrooms, ham, and olives",
            price: 19.99,
            originalPrice: 23.99,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: false,
            preparationTime: 20,
            nutrition: { calories: 420, protein: 20, carbs: 38, fat: 22 }
          }
        ]
      },
      {
        id: 2,
        category: "Pasta",
        items: [
          {
            id: 304,
            name: "Spaghetti Carbonara",
            description: "Creamy pasta with eggs, cheese, and pancetta",
            price: 15.99,
            originalPrice: 18.99,
            image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 12,
            nutrition: { calories: 450, protein: 22, carbs: 40, fat: 25 }
          }
        ]
      }
    ],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 3,
    name: "Sushi Master",
    description: "Fresh sushi and authentic Japanese cuisine",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400",
    coverImage: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
    rating: 4.7,
    totalRatings: 2100,
    deliveryTime: "30-35 mins",
    deliveryFee: 3.99,
    minimumOrder: 25.00,
    cuisine: "Japanese",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "321 Sushi Street, City, State 12345",
    phone: "+1234567896",
    openingHours: "12:00 PM - 10:00 PM",
    ownerId: 3,
    location: { latitude: 40.7614, longitude: -73.9776 },
    tags: ["Japanese", "Sushi", "Premium"],
    offers: [
      { id: 4, title: "15% off on orders above ₹500", type: "PERCENTAGE", value: 15, minOrder: 500 }
    ],
    menu: [
      {
        id: 1,
        category: "Sushi Rolls",
        items: [
          {
            id: 401,
            name: "California Roll",
            description: "Crab, avocado, and cucumber roll with sesame seeds",
            price: 8.99,
            originalPrice: 11.99,
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 12,
            nutrition: { calories: 200, protein: 12, carbs: 25, fat: 6 }
          },
          {
            id: 402,
            name: "Dragon Roll",
            description: "Eel, cucumber, and avocado with eel sauce",
            price: 12.99,
            originalPrice: 15.99,
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 15,
            nutrition: { calories: 280, protein: 15, carbs: 30, fat: 10 }
          },
          {
            id: 403,
            name: "Spicy Tuna Roll",
            description: "Fresh tuna with spicy mayo and cucumber",
            price: 10.99,
            originalPrice: 13.99,
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 10,
            nutrition: { calories: 250, protein: 18, carbs: 20, fat: 12 }
          }
        ]
      },
      {
        id: 2,
        category: "Sashimi",
        items: [
          {
            id: 404,
            name: "Salmon Sashimi",
            description: "Fresh salmon slices with wasabi and soy sauce",
            price: 14.99,
            originalPrice: 17.99,
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 8,
            nutrition: { calories: 180, protein: 25, carbs: 2, fat: 8 }
          }
        ]
      },
      {
        id: 3,
        category: "Ramen",
        items: [
          {
            id: 405,
            name: "Tonkotsu Ramen",
            description: "Rich pork bone broth with noodles and toppings",
            price: 16.99,
            originalPrice: 19.99,
            image: "https://images.unsplash.com/photo-1563379091339-03246963d4d1?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 20,
            nutrition: { calories: 450, protein: 22, carbs: 35, fat: 25 }
          }
        ]
      }
    ],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 4,
    name: "Burger King",
    description: "Flame-grilled burgers and crispy fries",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
    coverImage: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800",
    rating: 4.2,
    totalRatings: 3200,
    deliveryTime: "15-20 mins",
    deliveryFee: 0.99,
    minimumOrder: 12.00,
    cuisine: "American",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "555 Burger Avenue, City, State 12345",
    phone: "+1234567897",
    openingHours: "10:00 AM - 11:00 PM",
    ownerId: 3,
    location: { latitude: 40.7505, longitude: -73.9934 },
    tags: ["American", "Burgers", "Fast Food"],
    offers: [
      { id: 5, title: "Free delivery on orders above ₹150", type: "FREE_DELIVERY", value: 0, minOrder: 150 }
    ],
    menu: [
      {
        id: 1,
        category: "Burgers",
        items: [
          {
            id: 501,
            name: "Whopper",
            description: "Flame-grilled beef patty with fresh vegetables",
            price: 9.99,
            originalPrice: 12.99,
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 8,
            nutrition: { calories: 450, protein: 25, carbs: 35, fat: 22 }
          },
          {
            id: 502,
            name: "Chicken Royale",
            description: "Crispy chicken breast with lettuce and mayo",
            price: 8.99,
            originalPrice: 11.99,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 6,
            nutrition: { calories: 380, protein: 22, carbs: 30, fat: 18 }
          },
          {
            id: 503,
            name: "Veggie Burger",
            description: "Plant-based patty with fresh vegetables",
            price: 7.99,
            originalPrice: 9.99,
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: false,
            preparationTime: 5,
            nutrition: { calories: 320, protein: 15, carbs: 35, fat: 12 }
          }
        ]
      },
      {
        id: 2,
        category: "Sides",
        items: [
          {
            id: 504,
            name: "French Fries",
            description: "Crispy golden fries with sea salt",
            price: 4.99,
            originalPrice: 6.99,
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: true,
            preparationTime: 3,
            nutrition: { calories: 280, protein: 4, carbs: 35, fat: 14 }
          },
          {
            id: 505,
            name: "Onion Rings",
            description: "Crispy battered onion rings",
            price: 5.99,
            originalPrice: 7.99,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: false,
            preparationTime: 4,
            nutrition: { calories: 320, protein: 6, carbs: 40, fat: 16 }
          }
        ]
      },
      {
        id: 3,
        category: "Beverages",
        items: [
          {
            id: 506,
            name: "Coca Cola",
            description: "Refreshing cola drink",
            price: 2.99,
            originalPrice: 3.99,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: true,
            preparationTime: 1,
            nutrition: { calories: 140, protein: 0, carbs: 35, fat: 0 }
          }
        ]
      }
    ],
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 5,
    name: "McDonald's",
    description: "World's favorite fast food chain",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop",
    rating: 4.0,
    totalRatings: 4500,
    deliveryTime: "10-15 mins",
    deliveryFee: 0.99,
    minimumOrder: 10.00,
    cuisine: "American",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "777 Fast Food Street, City, State 12345",
    phone: "+1234567898",
    openingHours: "24 Hours",
    ownerId: 3,
    location: { latitude: 40.7589, longitude: -73.9851 },
    tags: ["American", "Fast Food", "24 Hours"],
    offers: [
      { id: 6, title: "Happy Meal Deal", type: "COMBO", value: 30, minOrder: 0 }
    ],
    menu: [
      {
        id: 1,
        category: "Burgers",
        items: [
          {
            id: 601,
            name: "Big Mac",
            description: "Two beef patties with special sauce",
            price: 7.99,
            originalPrice: 9.99,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 5,
            nutrition: { calories: 550, protein: 30, carbs: 40, fat: 28 }
          }
        ]
      }
    ],
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 6,
    name: "Dragon Palace",
    description: "Authentic Chinese cuisine with traditional flavors",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d4d1?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
    rating: 4.4,
    totalRatings: 2100,
    deliveryTime: "30-35 mins",
    deliveryFee: 2.50,
    minimumOrder: 18.00,
    cuisine: "Chinese",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "888 Chinatown Street, City, State 12345",
    phone: "+1234567899",
    openingHours: "11:00 AM - 10:00 PM",
    ownerId: 3,
    location: { latitude: 40.7614, longitude: -73.9776 },
    tags: ["Chinese", "Traditional", "Family Style"],
    offers: [
      { id: 7, title: "15% off on orders above ₹400", type: "PERCENTAGE", value: 15, minOrder: 400 }
    ],
    menu: [
      {
        id: 1,
        category: "Appetizers",
        items: [
          {
            id: 701,
            name: "Spring Rolls",
            description: "Crispy vegetable spring rolls with sweet chili sauce",
            price: 8.99,
            originalPrice: 10.99,
            image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: true,
            preparationTime: 8,
            nutrition: { calories: 180, protein: 6, carbs: 25, fat: 7 }
          },
          {
            id: 702,
            name: "Dumplings",
            description: "Steamed pork dumplings with soy dipping sauce",
            price: 12.99,
            originalPrice: 15.99,
            image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 10,
            nutrition: { calories: 220, protein: 12, carbs: 20, fat: 10 }
          }
        ]
      },
      {
        id: 2,
        category: "Main Course",
        items: [
          {
            id: 703,
            name: "Kung Pao Chicken",
            description: "Spicy chicken with peanuts and vegetables",
            price: 16.99,
            originalPrice: 19.99,
            image: "https://images.unsplash.com/photo-1563379091339-03246963d4d1?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 15,
            nutrition: { calories: 380, protein: 28, carbs: 15, fat: 22 }
          }
        ]
      }
    ],
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 7,
    name: "Taco Fiesta",
    description: "Authentic Mexican street food and tacos",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop",
    rating: 4.6,
    totalRatings: 1800,
    deliveryTime: "20-25 mins",
    deliveryFee: 1.50,
    minimumOrder: 12.00,
    cuisine: "Mexican",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "999 Taco Street, City, State 12345",
    phone: "+1234567800",
    openingHours: "10:00 AM - 11:00 PM",
    ownerId: 3,
    location: { latitude: 40.7505, longitude: -73.9934 },
    tags: ["Mexican", "Street Food", "Spicy"],
    offers: [
      { id: 8, title: "Free guacamole on orders above ₹250", type: "FREE_ITEM", value: 0, minOrder: 250 }
    ],
    menu: [
      {
        id: 1,
        category: "Tacos",
        items: [
          {
            id: 801,
            name: "Carnitas Tacos",
            description: "Slow-cooked pork tacos with onions and cilantro",
            price: 9.99,
            originalPrice: 12.99,
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 8,
            nutrition: { calories: 320, protein: 20, carbs: 25, fat: 15 }
          },
          {
            id: 802,
            name: "Veggie Tacos",
            description: "Grilled vegetables with black beans and salsa",
            price: 8.99,
            originalPrice: 10.99,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: false,
            preparationTime: 6,
            nutrition: { calories: 250, protein: 12, carbs: 35, fat: 8 }
          }
        ]
      }
    ],
    createdAt: "2024-01-07T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 8,
    name: "Thai Garden",
    description: "Authentic Thai cuisine with fresh ingredients",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1563379091339-03246963d4d1?w=800&h=400&fit=crop",
    rating: 4.7,
    totalRatings: 1650,
    deliveryTime: "25-30 mins",
    deliveryFee: 3.00,
    minimumOrder: 20.00,
    cuisine: "Thai",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "111 Thai Street, City, State 12345",
    phone: "+1234567801",
    openingHours: "11:30 AM - 10:30 PM",
    ownerId: 3,
    location: { latitude: 40.7614, longitude: -73.9776 },
    tags: ["Thai", "Spicy", "Fresh"],
    offers: [
      { id: 9, title: "10% off on first order", type: "PERCENTAGE", value: 10, minOrder: 0 }
    ],
    menu: [
      {
        id: 1,
        category: "Curries",
        items: [
          {
            id: 901,
            name: "Green Curry",
            description: "Spicy green curry with coconut milk and vegetables",
            price: 14.99,
            originalPrice: 17.99,
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: true,
            preparationTime: 15,
            nutrition: { calories: 350, protein: 15, carbs: 30, fat: 20 }
          }
        ]
      }
    ],
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 9,
    name: "Mediterranean Breeze",
    description: "Fresh Mediterranean cuisine with healthy options",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop",
    rating: 4.5,
    totalRatings: 1200,
    deliveryTime: "22-28 mins",
    deliveryFee: 2.75,
    minimumOrder: 16.00,
    cuisine: "Mediterranean",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "222 Mediterranean Avenue, City, State 12345",
    phone: "+1234567802",
    openingHours: "10:00 AM - 9:30 PM",
    ownerId: 3,
    location: { latitude: 40.7589, longitude: -73.9851 },
    tags: ["Mediterranean", "Healthy", "Fresh"],
    offers: [
      { id: 10, title: "Free hummus with orders above ₹300", type: "FREE_ITEM", value: 0, minOrder: 300 }
    ],
    menu: [
      {
        id: 1,
        category: "Salads",
        items: [
          {
            id: 1001,
            name: "Greek Salad",
            description: "Fresh tomatoes, cucumbers, olives, and feta cheese",
            price: 12.99,
            originalPrice: 15.99,
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: true,
            isPopular: true,
            preparationTime: 8,
            nutrition: { calories: 200, protein: 8, carbs: 15, fat: 12 }
          }
        ]
      }
    ],
    createdAt: "2024-01-09T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 10,
    name: "Burger Junction",
    description: "Gourmet burgers with premium ingredients",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=400&fit=crop",
    rating: 4.3,
    totalRatings: 2800,
    deliveryTime: "18-22 mins",
    deliveryFee: 1.25,
    minimumOrder: 14.00,
    cuisine: "American",
    isOpen: true,
    isActive: true,
    isVeg: false,
    isPureVeg: false,
    address: "333 Burger Lane, City, State 12345",
    phone: "+1234567803",
    openingHours: "11:00 AM - 12:00 AM",
    ownerId: 3,
    location: { latitude: 40.7505, longitude: -73.9934 },
    tags: ["American", "Burgers", "Gourmet"],
    offers: [
      { id: 11, title: "Combo deals available", type: "COMBO", value: 20, minOrder: 0 }
    ],
    menu: [
      {
        id: 1,
        category: "Burgers",
        items: [
          {
            id: 1101,
            name: "Classic Cheeseburger",
            description: "Beef patty with cheese, lettuce, tomato, and special sauce",
            price: 11.99,
            originalPrice: 14.99,
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=300&fit=crop",
            isAvailable: true,
            isVeg: false,
            isPopular: true,
            preparationTime: 10,
            nutrition: { calories: 480, protein: 25, carbs: 30, fat: 28 }
          }
        ]
      }
    ],
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  }
];

export const mockOrders = [
  {
    id: 1,
    customerId: 1,
    restaurantId: 1,
    deliveryPartnerId: 4,
    status: "delivered",
    items: [
      {
        id: 101,
        name: "Chicken Tikka",
        quantity: 2,
        price: 12.99,
        customization: { "Spice Level": "Medium" }
      },
      {
        id: 201,
        name: "Butter Chicken",
        quantity: 1,
        price: 18.99,
        customization: { "Rice Type": "Basmati" }
      }
    ],
    subtotal: 44.97,
    deliveryFee: 2.99,
    tax: 3.60,
    total: 51.56,
    deliveryAddress: "123 Main St, City, State 12345",
    paymentMethod: "card",
    orderDate: "2024-01-20T18:30:00Z",
    deliveryDate: "2024-01-20T19:15:00Z",
    specialInstructions: "Please ring the doorbell twice"
  },
  {
    id: 2,
    customerId: 1,
    restaurantId: 2,
    deliveryPartnerId: null,
    status: "preparing",
    items: [
      {
        id: 301,
        name: "Margherita Pizza",
        quantity: 1,
        price: 14.99,
        customization: { "Size": "Large", "Crust": "Thin" }
      }
    ],
    subtotal: 14.99,
    deliveryFee: 1.99,
    tax: 1.36,
    total: 18.34,
    deliveryAddress: "123 Main St, City, State 12345",
    paymentMethod: "card",
    orderDate: "2024-01-21T12:00:00Z",
    specialInstructions: ""
  }
];

export const mockCoupons = [
  {
    id: 1,
    code: "WELCOME10",
    description: "10% off on first order",
    discountType: "percentage",
    discountValue: 10,
    minimumOrder: 20,
    maxDiscount: 5,
    validUntil: "2024-12-31",
    isActive: true
  },
  {
    id: 2,
    code: "SAVE5",
    description: "$5 off on orders above $30",
    discountType: "fixed",
    discountValue: 5,
    minimumOrder: 30,
    maxDiscount: 5,
    validUntil: "2024-12-31",
    isActive: true
  }
];

export const mockDeliveryPartners = [
  {
    id: 4,
    name: "Mike Johnson",
    phone: "+1234567893",
    vehicleType: "bike",
    isOnline: true,
    currentLocation: { lat: 40.7128, lng: -74.0060 },
    rating: 4.8,
    totalDeliveries: 150,
    isAvailable: true
  },
  {
    id: 5,
    name: "Sarah Wilson",
    phone: "+1234567897",
    vehicleType: "car",
    isOnline: true,
    currentLocation: { lat: 40.7589, lng: -73.9851 },
    rating: 4.9,
    totalDeliveries: 200,
    isAvailable: false
  }
];

export const mockCategories = [
  { id: 1, name: "Indian", icon: "🍛" },
  { id: 2, name: "Italian", icon: "🍝" },
  { id: 3, name: "Japanese", icon: "🍣" },
  { id: 4, name: "Chinese", icon: "🥢" },
  { id: 5, name: "Mexican", icon: "🌮" },
  { id: 6, name: "American", icon: "🍔" },
  { id: 7, name: "Thai", icon: "🍜" },
  { id: 8, name: "Mediterranean", icon: "🥗" }
];
