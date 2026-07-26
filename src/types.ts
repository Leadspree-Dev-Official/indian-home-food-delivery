export type CuisineCategory = 'north' | 'south' | 'east' | 'west' | 'healthy' | 'desserts';

export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: CuisineCategory;
  isVeg: boolean;
  isJain: boolean; // Option for no onion/garlic
  isKeto: boolean;
  isPopular?: boolean;
  chefId: string;
  spicyLevel: 1 | 2 | 3; // 1: Mild, 2: Medium, 3: Hot
  calories?: number;
}

export interface TiffinPlan {
  id: string;
  name: string;
  description: string;
  pricePerWeek: number;
  pricePerMonth: number;
  image: string;
  includes: string[];
  diet: 'veg' | 'non-veg' | 'jain' | 'keto';
}

export interface ChefProfile {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  location: string;
  experience: string;
  bio: string;
  hygieneRating: number; // e.g., 5.0 (FSSAI registered)
  rating: number;
  reviewsCount: number;
}

export interface ThaliCustomization {
  dal: string;
  curry1: string;
  curry2: string;
  rice: string;
  bread: string;
  sweet: string;
}

export interface ItemCustomization {
  spiceLevel: 'Mild' | 'Medium' | 'Hot';
  extraGhee: boolean;
  instructions: string;
  thaliComponents?: ThaliCustomization;
}

export interface CartItem {
  cartId: string; // unique cart item id (to distinguish same meals with different customizations)
  mealId: string; // empty for custom thali
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  isTiffin?: boolean;
  isCustomThali?: boolean;
  customization: ItemCustomization;
}

export type OrderStatus = 'received' | 'cooking' | 'packed' | 'out_for_delivery' | 'arrived';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  gst: number;
  deliveryFee: number;
  discount: number;
  total: number;
  deliveryAddress: string;
  apartment: string;
  deliveryInstructions?: string;
  chefNote?: string;
  paymentMethod: string;
  status: OrderStatus;
  orderTime: string;
  etaMinutes: number;
  chefId: string;
  customerName?: string;
  customerPhone?: string;
}

export interface UserReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  mealName?: string;
}

export interface VisitorInfo {
  name: string;
  businessName: string;
  phone: string;
  address: string;
  brandColor: string;
}

