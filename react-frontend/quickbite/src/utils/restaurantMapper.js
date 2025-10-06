// Utility functions to map backend restaurant data to frontend format

export const mapRestaurantFromBackend = (backendRestaurant) => {
  return {
    id: backendRestaurant.id,
    name: backendRestaurant.name,
    description: backendRestaurant.description || '',
    image: backendRestaurant.image || backendRestaurant.coverImage || '/api/placeholder/300/200',
    coverImage: backendRestaurant.coverImage || backendRestaurant.image || '/api/placeholder/800/400',
    rating: backendRestaurant.rating || 0,
    totalRatings: backendRestaurant.totalRatings || 0,
    cuisine: backendRestaurant.cuisineType || 'Unknown',
    deliveryTime: backendRestaurant.deliveryTime || '30-40 mins',
    deliveryFee: backendRestaurant.deliveryFee || 0,
    minimumOrder: backendRestaurant.minimumOrder || 0,
    isOpen: backendRestaurant.isOpen || false,
    isActive: backendRestaurant.isActive || false,
    isVeg: backendRestaurant.isVeg || false,
    isPureVeg: backendRestaurant.isPureVeg || false,
    openingHours: backendRestaurant.openingHours || '10:00 AM - 11:00 PM',
    deliveryRadiusKm: backendRestaurant.deliveryRadiusKm || 5,
    latitude: backendRestaurant.latitude || 0,
    longitude: backendRestaurant.longitude || 0,
    tags: backendRestaurant.tags ? backendRestaurant.tags.split(',') : [],
    address: backendRestaurant.address || '',
    contactNumber: backendRestaurant.contactNumber || '',
    ownerId: backendRestaurant.ownerId,
    status: backendRestaurant.status,
    openingTime: backendRestaurant.openingTime,
    closingTime: backendRestaurant.closingTime,
    menuCategories: backendRestaurant.menuCategories || [],
    // Add offers array for compatibility (can be populated from backend later)
    offers: [],
    // Add location object for compatibility
    location: {
      lat: backendRestaurant.latitude || 0,
      lng: backendRestaurant.longitude || 0
    }
  };
};

export const mapMenuCategoryFromBackend = (backendCategory) => {
  return {
    id: backendCategory.id,
    name: backendCategory.name,
    menuItems: (backendCategory.menuItems || []).map(mapMenuItemFromBackend)
  };
};

export const mapMenuItemFromBackend = (backendItem) => {
  return {
    id: backendItem.id,
    name: backendItem.name,
    description: backendItem.description || '',
    price: backendItem.price || 0,
    originalPrice: backendItem.originalPrice || backendItem.price || 0,
    image: backendItem.imageUrl || '/api/placeholder/200/150',
    inStock: backendItem.inStock !== false,
    isVeg: backendItem.isVeg || false,
    isPopular: backendItem.isPopular || false,
    preparationTime: backendItem.preparationTime || 15,
    customizationJson: backendItem.customizationJson || '[]',
    nutritionJson: backendItem.nutritionJson || '{}',
    // Add customization options for frontend compatibility
    customization: parseCustomizationJson(backendItem.customizationJson),
    nutrition: parseNutritionJson(backendItem.nutritionJson)
  };
};

// Helper functions to parse JSON strings
const parseCustomizationJson = (jsonString) => {
  try {
    return jsonString ? JSON.parse(jsonString) : [];
  } catch {
    return [];
  }
};

const parseNutritionJson = (jsonString) => {
  try {
    return jsonString ? JSON.parse(jsonString) : {};
  } catch {
    return {};
  }
};

// Map array of restaurants
export const mapRestaurantsFromBackend = (backendRestaurants) => {
  return (backendRestaurants || []).map(mapRestaurantFromBackend);
};
