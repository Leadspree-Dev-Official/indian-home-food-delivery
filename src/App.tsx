import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import ThaliBuilder from './components/ThaliBuilder';
import TiffinSubscriptions from './components/TiffinSubscriptions';
import CartSidebar from './components/CartSidebar';
import OrderTracker from './components/OrderTracker';
import ChefProfiles from './components/ChefProfiles';
import Footer from './components/Footer';
import VisitorOnboarding from './components/VisitorOnboarding';
import AdminDashboard from './components/AdminDashboard';
import { CartItem, Meal, Order, OrderStatus, TiffinPlan, VisitorInfo, ChefProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

// Let's find or generate a unique user token synchronously
const getOrGenerateToken = (): string => {
  if (typeof window === 'undefined') return 'GB-0000-0000';
  
  const params = new URLSearchParams(window.location.search);
  let token = params.get('token');
  
  if (token && /^GB-\d{4}-\d{4}$/.test(token)) {
    localStorage.setItem('gharbhojan_current_token', token);
    return token;
  }
  
  const stored = localStorage.getItem('gharbhojan_current_token');
  if (stored && /^GB-\d{4}-\d{4}$/.test(stored)) {
    const newUrl = `${window.location.origin}${window.location.pathname}?token=${stored}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
    return stored;
  }
  
  const part1 = Math.floor(1000 + Math.random() * 9000);
  const part2 = Math.floor(1000 + Math.random() * 9000);
  const newToken = `GB-${part1}-${part2}`;
  
  localStorage.setItem('gharbhojan_current_token', newToken);
  
  const newUrl = `${window.location.origin}${window.location.pathname}?token=${newToken}`;
  window.history.replaceState({ path: newUrl }, '', newUrl);
  return newToken;
};

export default function App() {
  // Unique User Token State
  const [userToken, setUserToken] = useState<string>(() => getOrGenerateToken());

  // Dynamic contents from API
  const [meals, setMeals] = useState<Meal[]>([]);
  const [chefs, setChefs] = useState<ChefProfile[]>([]);
  const [tiffinPlans, setTiffinPlans] = useState<TiffinPlan[]>([]);
  const [businessName, setBusinessName] = useState<string>("GharBhojan Mom's Kitchen");
  const [isLoadingContents, setIsLoadingContents] = useState<boolean>(true);

  // Administrative routing
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      return path === '/admin' || hash === '#/admin' || hash === '#admin';
    }
    return false;
  });

  // Navigation / View states
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [selectedChefId, setSelectedChefId] = useState<string | null>(null);

  // Visitor Personalization states
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null);
  const [visitorSubmittedAt, setVisitorSubmittedAt] = useState<number | null>(null);
  const [showVisitorModal, setShowVisitorModal] = useState(false);

  // Cart logic states
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Order & Tracking states
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Custom visual Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  // Fetch website contents
  const fetchContents = async () => {
    try {
      const res = await fetch('/api/contents');
      if (res.ok) {
        const data = await res.json();
        setMeals(data.meals);
        setChefs(data.chefs);
        setTiffinPlans(data.tiffinPlans);
        setBusinessName(data.businessName);
      } else {
        const { MEALS, CHEFS, TIFFIN_PLANS } = await import('./data');
        setMeals(MEALS);
        setChefs(CHEFS);
        setTiffinPlans(TIFFIN_PLANS);
      }
    } catch (err) {
      console.error("Failed to fetch dynamic website contents, using static fallbacks", err);
      const { MEALS, CHEFS, TIFFIN_PLANS } = await import('./data');
      setMeals(MEALS);
      setChefs(CHEFS);
      setTiffinPlans(TIFFIN_PLANS);
    } finally {
      setIsLoadingContents(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  // Sync order status back from server (polling)
  useEffect(() => {
    if (!activeOrder) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const ordersList: Order[] = await res.json();
          const currentOrder = ordersList.find(o => o.id === activeOrder.id);
          if (currentOrder && currentOrder.status !== activeOrder.status) {
            setActiveOrder(currentOrder);
            localStorage.setItem(`gharbhojan_active_order_${userToken}`, JSON.stringify(currentOrder));
            triggerToast(`🔔 Order status updated to "${currentOrder.status.replace(/_/g, ' ')}" by the kitchen!`, 'info');
          }
        }
      } catch (err) {
        console.error("Failed to sync order status", err);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeOrder, userToken]);

  // Hash route change listener
  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      setIsAdminMode(path === '/admin' || hash === '#/admin' || hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Auto close toast after 3.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Synchronize state when userToken changes
  useEffect(() => {
    if (!userToken) return;

    // Load visitor info with 3-hour expiration rule
    const savedVisitor = localStorage.getItem(`gharbhojan_visitor_info_${userToken}`);
    const savedTimeStr = localStorage.getItem(`gharbhojan_visitor_time_${userToken}`);
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    if (savedVisitor && savedTimeStr) {
      const submittedAt = parseInt(savedTimeStr, 10);
      const elapsed = Date.now() - submittedAt;

      if (elapsed < THREE_HOURS_MS) {
        // Valid within 3 hours
        try {
          const parsed = JSON.parse(savedVisitor);
          setVisitorInfo(parsed);
          setVisitorSubmittedAt(submittedAt);
          // Always pop open the form on visit as requested!
          setShowVisitorModal(true);
        } catch (e) {
          console.error('Failed to parse visitor details', e);
          setVisitorInfo(null);
          setVisitorSubmittedAt(null);
          setShowVisitorModal(true);
        }
      } else {
        // Expired after 3 hours - reset form
        setVisitorInfo(null);
        setVisitorSubmittedAt(null);
        localStorage.removeItem(`gharbhojan_visitor_info_${userToken}`);
        localStorage.removeItem(`gharbhojan_visitor_time_${userToken}`);
        localStorage.removeItem(`gharbhojan_visitor_name_${userToken}`);
        localStorage.removeItem(`gharbhojan_visitor_phone_${userToken}`);
        localStorage.removeItem(`gharbhojan_visitor_address_${userToken}`);
        setShowVisitorModal(true);
        triggerToast('🕒 3 hours completed! Your form was reset automatically. Please enter your details.', 'info');
      }
    } else {
      // First visit or fresh load
      setVisitorInfo(null);
      setVisitorSubmittedAt(null);
      setShowVisitorModal(true); // Always open form on visit
    }

    // Load cart
    const savedCart = localStorage.getItem(`gharbhojan_cart_${userToken}`);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart items', e);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }

    // Load active order
    const savedOrder = localStorage.getItem(`gharbhojan_active_order_${userToken}`);
    if (savedOrder) {
      try {
        setActiveOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Failed to parse active order', e);
        setActiveOrder(null);
      }
    } else {
      setActiveOrder(null);
    }
  }, [userToken]);

  // Active live 3-hour expiration polling while browsing on site
  useEffect(() => {
    if (!visitorSubmittedAt) return;
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - visitorSubmittedAt;
      if (elapsed >= THREE_HOURS_MS) {
        setVisitorInfo(null);
        setVisitorSubmittedAt(null);
        localStorage.removeItem(`gharbhojan_visitor_info_${userToken}`);
        localStorage.removeItem(`gharbhojan_visitor_time_${userToken}`);
        localStorage.removeItem(`gharbhojan_visitor_name_${userToken}`);
        localStorage.removeItem(`gharbhojan_visitor_phone_${userToken}`);
        localStorage.removeItem(`gharbhojan_visitor_address_${userToken}`);
        setShowVisitorModal(true);
        triggerToast('🕒 3 hours completed! Form reset automatically. Please re-enter your details.', 'info');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [visitorSubmittedAt, userToken]);

  // Monitor URL manual query modifications to switch sessions dynamically
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token && /^GB-\d{4}-\d{4}$/.test(token) && token !== userToken) {
        setUserToken(token);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    const interval = setInterval(handleUrlChange, 1000);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(interval);
    };
  }, [userToken]);

  const handleSaveVisitorInfo = (info: VisitorInfo) => {
    const now = Date.now();
    setVisitorInfo(info);
    setVisitorSubmittedAt(now);
    localStorage.setItem(`gharbhojan_visitor_info_${userToken}`, JSON.stringify(info));
    localStorage.setItem(`gharbhojan_visitor_time_${userToken}`, now.toString());
    localStorage.setItem(`gharbhojan_visitor_name_${userToken}`, info.name);
    localStorage.setItem(`gharbhojan_visitor_phone_${userToken}`, info.phone);
    localStorage.setItem(`gharbhojan_visitor_address_${userToken}`, info.address);
    setShowVisitorModal(false);
    triggerToast(`✨ Details saved for ${info.name.split(' ')[0]}! Form will auto-reset in 3 hours.`, 'success');
  };

  const handleResetVisitorInfo = () => {
    setVisitorInfo(null);
    setVisitorSubmittedAt(null);
    localStorage.removeItem(`gharbhojan_visitor_info_${userToken}`);
    localStorage.removeItem(`gharbhojan_visitor_time_${userToken}`);
    localStorage.removeItem(`gharbhojan_visitor_name_${userToken}`);
    localStorage.removeItem(`gharbhojan_visitor_phone_${userToken}`);
    localStorage.removeItem(`gharbhojan_visitor_address_${userToken}`);
    setShowVisitorModal(true);
    triggerToast(`🔄 Website form reset! Please fill up your details again.`);
  };

  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem(`gharbhojan_cart_${userToken}`, JSON.stringify(updatedCart));
  };

  // Add standard customizable meal
  const handleAddToCart = (
    meal: Meal,
    spiceLevel: 'Mild' | 'Medium' | 'Hot',
    extraGhee: boolean,
    instructions: string
  ) => {
    // Generate unique composite key to distinguish matching items with unique customizations
    const customKey = `${meal.id}-${spiceLevel}-${extraGhee ? 'ghee' : 'noghee'}-${instructions.trim().toLowerCase()}`;
    
    const existingIndex = cartItems.findIndex((item) => item.cartId === customKey);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      saveCartToStorage(updated);
    } else {
      const newItem: CartItem = {
        cartId: customKey,
        mealId: meal.id,
        name: meal.name,
        price: meal.price,
        quantity: 1,
        isVeg: meal.isVeg,
        customization: {
          spiceLevel,
          extraGhee,
          instructions,
        },
      };
      saveCartToStorage([...cartItems, newItem]);
    }
    triggerToast(`✨ Added ${meal.name} to kitchen cart!`);
    setCartOpen(true); // open cart to show confirmation
  };

  // Add customized composite Thali
  const handleAddThaliToCart = (
    thaliName: string,
    price: number,
    components: {
      dal: string;
      curry1: string;
      curry2: string;
      rice: string;
      bread: string;
      sweet: string;
    },
    isVeg: boolean
  ) => {
    const customId = `thali-${Date.now()}`;
    const newItem: CartItem = {
      cartId: customId,
      mealId: '',
      name: thaliName,
      price: price,
      quantity: 1,
      isVeg: isVeg,
      isCustomThali: true,
      customization: {
        spiceLevel: 'Medium',
        extraGhee: true,
        instructions: 'Royal platter assembly',
        thaliComponents: components,
      },
    };
    saveCartToStorage([...cartItems, newItem]);
    triggerToast("🍽️ Custom Royal Thali added to your cart!");
    setCartOpen(true);
  };

  // Add tiffin subscription
  const handleAddTiffinToCart = (
    plan: TiffinPlan,
    billingCycle: 'weekly' | 'monthly',
    slot: 'lunch' | 'dinner' | 'both',
    days: 'weekdays' | 'everyday',
    noOnionGarlic: boolean,
    price: number
  ) => {
    const customId = `tiffin-${plan.id}-${billingCycle}-${slot}-${days}-${noOnionGarlic ? 'satvik' : 'normal'}`;
    const existingIndex = cartItems.findIndex((item) => item.cartId === customId);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      saveCartToStorage(updated);
    } else {
      const billingCycleLabel = billingCycle === 'weekly' ? 'Weekly' : 'Monthly';
      const slotLabel = slot === 'lunch' ? 'Lunch' : slot === 'dinner' ? 'Dinner' : 'Lunch & Dinner';
      const daysLabel = days === 'weekdays' ? 'Mon-Fri' : '7 Days';
      const satvikLabel = noOnionGarlic ? '(Satvik - No Onion/Garlic)' : '';

      const subscriptionName = `${plan.name} Subscription - ${billingCycleLabel} [${slotLabel}, ${daysLabel}] ${satvikLabel}`;

      const newItem: CartItem = {
        cartId: customId,
        mealId: plan.id,
        name: subscriptionName,
        price: price,
        quantity: 1,
        isVeg: plan.diet !== 'non-veg',
        isTiffin: true,
        customization: {
          spiceLevel: 'Medium',
          extraGhee: plan.diet !== 'keto',
          instructions: `${billingCycleLabel} tiffin delivery slot: ${slotLabel}. Days: ${daysLabel}.`,
        },
      };
      saveCartToStorage([...cartItems, newItem]);
    }
    triggerToast(`🎉 Subscription added: ${plan.name}!`);
    setCartOpen(true);
  };

  // Update cart item quantity
  const handleUpdateQuantity = (cartId: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.cartId === cartId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);
    saveCartToStorage(updated);
  };

  // Delete cart item
  const handleRemoveItem = (cartId: string) => {
    const updated = cartItems.filter((item) => item.cartId !== cartId);
    saveCartToStorage(updated);
  };

  // Place active order
  const handlePlaceOrder = (order: Order) => {
    setActiveOrder(order);
    localStorage.setItem(`gharbhojan_active_order_${userToken}`, JSON.stringify(order));
    // Clear cart upon order placement
    saveCartToStorage([]);
    triggerToast("🚀 Your home meal order has been successfully placed!", "success");
    // Switch to tracker tab immediately
    setActiveTab('tracker');

    // Post order to live backend store
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    }).catch(err => console.error("Failed to post order to server log", err));

    // Automatically trigger WhatsApp redirect with the complete order receipt details
    try {
      const bName = visitorInfo?.businessName || "GharBhojan Mom's Kitchen";
      const recipientPhone = order.customerPhone || visitorInfo?.phone || '9876543210';
      const cleanPhoneDigits = recipientPhone.replace(/\D/g, '');
      const finalWhatsAppNumber = cleanPhoneDigits.length === 10 ? `91${cleanPhoneDigits}` : cleanPhoneDigits;

      let itemsText = '';
      order.items.forEach((item) => {
        itemsText += `\n🔸 *${item.quantity}x ${item.name}* - ₹${item.price * item.quantity}`;
        if (item.customization) {
          const cust = item.customization;
          const parts = [];
          if (cust.spiceLevel) parts.push(`Spice: ${cust.spiceLevel}`);
          if (cust.extraGhee !== undefined) parts.push(cust.extraGhee ? 'With Extra Ghee' : 'No Ghee');
          if (cust.instructions) parts.push(`Note: "${cust.instructions}"`);
          if (parts.length > 0) {
            itemsText += `\n   _(${parts.join(', ')})_`;
          }
        }
      });

      const paymentLabel = order.paymentMethod === 'upi' ? '⚡ UPI / Google Pay' :
                           order.paymentMethod === 'card' ? '💳 Debit/Credit Card' : '💵 Cash on Delivery (COD)';

      const upiId = `${bName.toLowerCase().replace(/\s+/g, '')}@okaxis`;
      const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(bName)}&am=${order.total}&cu=INR`;
      const upiDetailsMsg = order.paymentMethod === 'upi'
        ? `\n*💸 UPI ID (Demo):* ${upiId}\n*🔗 Tap to Pay (UPI App):* ${upiLink}\n`
        : '';

      const buyerName = order.customerName || visitorInfo?.name || 'Valued Guest';

      const text = `🍱 *ORDER PLACED - ${bName}*

Namaste *${buyerName}*, your order has been successfully placed with love! We are preparing it fresh in small batches.

*🆔 Order ID:* ${order.id}
*🕒 Placed At:* ${order.orderTime}
*💰 Total Amount:* ₹${order.total}
*💳 Payment Method:* ${paymentLabel}${upiDetailsMsg}

*🛒 ITEMS ORDERED:*${itemsText}

*📍 DELIVERY TO:*
• *Address:* ${order.deliveryAddress}
• *Landmark:* ${order.apartment || 'None'}
• *Rider Instructions:* ${order.deliveryInstructions || 'None'}
${order.chefNote ? `\n*👩‍🍳 CHEF NOTE:* "${order.chefNote}"` : ''}

Thank you for supporting talented Home Chefs! Enjoy your hot, fresh Ghar Ka Khana. ❤️`;

      const whatsappUrl = `https://wa.me/${finalWhatsAppNumber}?text=${encodeURIComponent(text)}`;
      
      // Delay slightly to let the tab state update and let the user see the success screen, then open WhatsApp
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 500);
    } catch (err) {
      console.error('Failed to trigger automatic WhatsApp redirect', err);
    }
  };

  // Update tracking status
  const handleUpdateOrderStatus = (newStatus: OrderStatus) => {
    if (activeOrder) {
      const updated = { ...activeOrder, status: newStatus };
      if (newStatus === 'arrived') {
        updated.etaMinutes = 0;
      } else if (newStatus === 'out_for_delivery') {
        updated.etaMinutes = 12;
      } else if (newStatus === 'packed') {
        updated.etaMinutes = 20;
      } else if (newStatus === 'cooking') {
        updated.etaMinutes = 28;
      }
      setActiveOrder(updated);
      localStorage.setItem(`gharbhojan_active_order_${userToken}`, JSON.stringify(updated));
    }
  };

  // Cancel order / Reset
  const handleCancelOrder = () => {
    setActiveOrder(null);
    localStorage.removeItem(`gharbhojan_active_order_${userToken}`);
    setActiveTab('menu');
  };

  const handleOpenChefModal = (chefId: string) => {
    setSelectedChefId(chefId);
    setActiveTab('chefs');
    // Scroll smoothly to chefs section
    setTimeout(() => {
      document.getElementById('chefs-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const brandColorHex = visitorInfo?.brandColor || '#C2593F';
  
  // Convert hex to rgb string for CSS custom properties
  const getBrandRgb = (hex: string): string => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '194, 89, 63';
  };
  
  const brandRgb = getBrandRgb(brandColorHex);

  if (isAdminMode) {
    return (
      <AdminDashboard
        onExitAdmin={() => {
          if (typeof window !== 'undefined') {
            window.location.hash = '';
            setIsAdminMode(false);
          }
        }}
        triggerToast={triggerToast}
        onRefreshContents={fetchContents}
        meals={meals}
        chefs={chefs}
        tiffinPlans={tiffinPlans}
        businessName={businessName}
      />
    );
  }

  if (isLoadingContents) {
    return (
      <div className="min-h-screen bg-[#FFFDF6] flex flex-col justify-center items-center">
        <div className="p-4 flex flex-col items-center space-y-2">
          <svg className="animate-spin h-8 w-8 text-[#C2593F]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            LOADING KITCHEN ENGINE...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-[#2D2727] flex flex-col justify-between selection:bg-[var(--brand-color,#C2593F)]/10" id="app-root">
      <style>{`
        :root {
          --brand-color: ${brandColorHex};
          --brand-color-light: ${brandColorHex}15;
          --brand-color-rgb: ${brandRgb};
        }

        /* Dynamic Tailwind Overrides for Primary Theme Color (#C2593F) */
        
        /* Background Colors */
        .bg-\\[\\#C2593F\\] {
          background-color: var(--brand-color) !important;
        }
        .hover\\:bg-\\[\\#C2593F\\/90\\]:hover {
          background-color: var(--brand-color) !important;
          opacity: 0.9 !important;
        }
        .bg-\\[\\#C2593F\\/5\\] {
          background-color: rgba(var(--brand-color-rgb), 0.05) !important;
        }
        .bg-\\[\\#C2593F\\/10\\] {
          background-color: rgba(var(--brand-color-rgb), 0.1) !important;
        }
        .bg-\\[\\#C2593F\\/15\\] {
          background-color: rgba(var(--brand-color-rgb), 0.15) !important;
        }
        .bg-\\[\\#C2593F\\/20\\] {
          background-color: rgba(var(--brand-color-rgb), 0.2) !important;
        }
        .hover\\:bg-\\[\\#C2593F\\/5\\]:hover {
          background-color: rgba(var(--brand-color-rgb), 0.05) !important;
        }
        .hover\\:bg-\\[\\#C2593F\\/10\\]:hover {
          background-color: rgba(var(--brand-color-rgb), 0.1) !important;
        }
        .hover\\:bg-\\[\\#C2593F\\/15\\]:hover {
          background-color: rgba(var(--brand-color-rgb), 0.15) !important;
        }
        
        /* Text Colors */
        .text-\\[\\#C2593F\\] {
          color: var(--brand-color) !important;
        }
        .text-\\[\\#C2593F\\/40\\] {
          color: rgba(var(--brand-color-rgb), 0.4) !important;
        }
        .hover\\:text-\\[\\#C2593F\\]:hover {
          color: var(--brand-color) !important;
        }
        .group-hover\\:underline {
          text-decoration-color: var(--brand-color) !important;
        }
        
        /* Border Colors */
        .border-\\[\\|C2593F\\] {
          border-color: var(--brand-color) !important;
        }
        .border-\\[\\#C2593F\\] {
          border-color: var(--brand-color) !important;
        }
        .border-\\[\\#C2593F\\/5\\] {
          border-color: rgba(var(--brand-color-rgb), 0.05) !important;
        }
        .border-\\[\\#C2593F\\/10\\] {
          border-color: rgba(var(--brand-color-rgb), 0.1) !important;
        }
        .border-\\[\\#C2593F\\/15\\] {
          border-color: rgba(var(--brand-color-rgb), 0.15) !important;
        }
        .border-\\[\\#C2593F\\/20\\] {
          border-color: rgba(var(--brand-color-rgb), 0.2) !important;
        }
        .border-\\[\\#C2593F\\/30\\] {
          border-color: rgba(var(--brand-color-rgb), 0.3) !important;
        }
        .hover\\:border-\\[\\#C2593F\\/30\\]:hover {
          border-color: rgba(var(--brand-color-rgb), 0.3) !important;
        }
        
        /* Focus Rings */
        .focus\\:ring-\\[\\#C2593F\\]:focus {
          --tw-ring-color: var(--brand-color) !important;
        }
        .focus\\:ring-\\[\\#C2593F\\/20\\]:focus {
          --tw-ring-color: rgba(var(--brand-color-rgb), 0.2) !important;
        }
        .focus\\:ring-\\[\\#C2593F\\/30\\]:focus {
          --tw-ring-color: rgba(var(--brand-color-rgb), 0.3) !important;
        }
        .focus\\:ring-\\[\\#C2593F\\/40\\]:focus {
          --tw-ring-color: rgba(var(--brand-color-rgb), 0.4) !important;
        }
        .focus\\:border-\\[\\#C2593F\\]:focus {
          border-color: var(--brand-color) !important;
        }
        
        /* Shadows */
        .shadow-\\[\\#C2593F\\/10\\] {
          --tw-shadow-color: rgba(var(--brand-color-rgb), 0.1) !important;
        }
        
        /* SVGs & Fills */
        svg[stroke="#C2593F"] {
          stroke: var(--brand-color) !important;
        }
        circle[fill="#C2593F"] {
          fill: var(--brand-color) !important;
        }
      `}</style>
      
      {/* 1. Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Auto scroll to top on tab change
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        hasActiveOrder={activeOrder !== null}
        onOpenTracker={() => {
          setActiveTab('tracker');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        visitorInfo={visitorInfo}
        onOpenOnboarding={() => setShowVisitorModal(true)}
        onResetVisitor={handleResetVisitorInfo}
      />

      {/* 2. Main Tab Body */}
      <main className="flex-1 pb-20 md:pb-0">
        
        {/* Tab 1: Menu & Home Hero */}
        {activeTab === 'menu' && (
          <div id="tab-menu-content">
            <Hero
              onBrowseMenu={() => {
                document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreTiffin={() => {
                setActiveTab('tiffin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              visitorInfo={visitorInfo}
              onOpenOnboarding={() => setShowVisitorModal(true)}
            />
            <MenuSection
              onAddToCart={handleAddToCart}
              onOpenChefModal={handleOpenChefModal}
              meals={meals}
              chefs={chefs}
            />
          </div>
        )}

        {/* Tab 2: Tiffin Subscriptions */}
        {activeTab === 'tiffin' && (
          <div id="tab-tiffin-content">
            <TiffinSubscriptions onAddTiffinToCart={handleAddTiffinToCart} triggerToast={triggerToast} tiffinPlans={tiffinPlans} />
          </div>
        )}

        {/* Tab 3: Interactive Thali Builder */}
        {activeTab === 'thali' && (
          <div id="tab-thali-content">
            <ThaliBuilder onAddThaliToCart={handleAddThaliToCart} triggerToast={triggerToast} />
          </div>
        )}

        {/* Tab 4: Our Home Chefs & Reviews */}
        {activeTab === 'chefs' && (
          <div id="tab-chefs-content">
            <ChefProfiles
              selectedChefId={selectedChefId}
              onCloseChefModal={() => setSelectedChefId(null)}
              onOpenChefModal={(chefId) => setSelectedChefId(chefId)}
              chefs={chefs}
            />
          </div>
        )}

        {/* Tab 5: Real-time Order Tracker */}
        {activeTab === 'tracker' && (
          <div id="tab-tracker-content">
            {activeOrder ? (
              <OrderTracker
                order={activeOrder}
                onUpdateStatus={handleUpdateOrderStatus}
                onCancelOrder={handleCancelOrder}
                triggerToast={triggerToast}
                userToken={userToken}
                chefs={chefs}
              />
            ) : (
              <div className="py-20 text-center max-w-sm mx-auto p-4" id="tracker-fallback">
                <p className="text-gray-400 text-sm">No active order currently placed.</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-4 px-4 py-2 bg-[#C2593F] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Order delicious food now!
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* 3. Sliding Cart Drawer Overlay */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handlePlaceOrder}
        userToken={userToken}
      />

      {/* 4. Brand Footer */}
      <Footer 
        visitorInfo={visitorInfo} 
        userToken={userToken} 
        triggerToast={triggerToast} 
      />

      {/* 5. Custom Non-Blocking Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            id="toast-notification"
            className="fixed top-4 right-4 md:top-6 md:right-6 z-[100] max-w-sm w-[calc(100vw-2rem)] bg-[#2D2727] text-white rounded-2xl shadow-2xl border border-white/10 p-4 flex items-start space-x-3"
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
              {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-[#E28743]" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/40 hover:text-white text-xs font-bold shrink-0 pl-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Visitor Onboarding Personalization Overlay */}
      <AnimatePresence>
        {showVisitorModal && (
          <VisitorOnboarding
            onSave={handleSaveVisitorInfo}
            initialInfo={visitorInfo}
            onClose={() => setShowVisitorModal(false)}
            isDismissable={true}
            userToken={userToken}
            submittedAt={visitorSubmittedAt}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
