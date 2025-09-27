export const mockMenu = {
  1: {
    name: "Meghana Foods",
    cuisine: "Biryani, North Indian, Asian",
    rating: 4.4,
    items: [
      { id: 101, name: "Chicken Biryani", price: 350, description: "Aromatic and flavorful biryani with tender chicken.", isVeg: false },
      { id: 102, name: "Paneer Butter Masala", price: 280, description: "Creamy and rich paneer curry.", isVeg: true },
      { id: 103, name: "Gobi Manchurian", price: 220, description: "Crispy cauliflower florets in a tangy sauce.", isVeg: true },
      { id: 104, name: "Mutton Keema", price: 450, description: "Spicy minced mutton curry.", isVeg: false },
    ]
  },
  2: {
    name: "KFC",
    cuisine: "Burger, Fast Food",
    rating: 4.1,
    items: [
      { id: 201, name: "Zinger Burger", price: 199, description: "Crispy chicken fillet in a soft bun.", isVeg: false },
      { id: 202, name: "Hot Wings", price: 250, description: "Spicy and crispy chicken wings.", isVeg: false },
      { id: 203, name: "Veg Strips", price: 180, description: "Crispy vegetable strips.", isVeg: true },
      { id: 204, name: "Fries", price: 99, description: "Classic salted french fries.", isVeg: true },
    ]
  },
  // Add more restaurants as needed
};

export const getMenuByRestaurantId = (id) => {
  return mockMenu[id] || null;
};