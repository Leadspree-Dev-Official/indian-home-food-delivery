import { useState, useEffect } from 'react';
import { CartItem, Order } from '../types';
import { ShoppingBag, Trash2, Tag, Percent, ArrowRight, ShieldCheck, Heart, MapPin, Phone, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onPlaceOrder: (order: Order) => void;
  userToken: string;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  userToken,
}: CartSidebarProps) {
  // Coupon state
  const [coupon, setCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState('');

  // Checkout Phase state
  const [isCheckoutPhase, setIsCheckoutPhase] = useState(false);
  
  // Checkout Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [chefNote, setChefNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Form error simulation
  const [formError, setFormError] = useState('');

  // Calculate prices
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.05); // 5% GST for standard food delivery
  
  // Delivery fee rules: free delivery for orders containing tiffin subscriptions OR over ₹250
  const hasSubscription = cartItems.some(item => item.isTiffin);
  const deliveryFee = (subtotal === 0 || subtotal > 250 || hasSubscription) ? 0 : 35;

  const finalTotal = Math.max(0, subtotal + gst + deliveryFee - appliedDiscount);

  // Auto reset checkout phase on open/close
  useEffect(() => {
    if (!isOpen) {
      setIsCheckoutPhase(false);
      setFormError('');
    }
  }, [isOpen]);

  // Load visitor details from localStorage on open to personalize the checkout experience
  useEffect(() => {
    if (isOpen) {
      const savedVisitor = localStorage.getItem(`gharbhojan_visitor_info_${userToken}`);
      if (savedVisitor) {
        try {
          const parsed = JSON.parse(savedVisitor);
          if (parsed.name) setFullName(parsed.name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.address) setAddress(parsed.address);
        } catch (e) {
          console.error('Failed to parse visitor details in cart sidebar', e);
        }
      }
    }
  }, [isOpen, userToken]);

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === 'MOMSLOVE') {
      const discount = Math.round(subtotal * 0.15); // 15% off
      setAppliedDiscount(discount);
      setDiscountMessage('🎉 Promo "MOMSLOVE" applied: 15% motherly discount!');
    } else if (code === 'FIRSTTIFFIN' && hasSubscription) {
      setAppliedDiscount(100); // Flat ₹100 off subscriptions
      setDiscountMessage('🎉 Promo "FIRSTTIFFIN" applied: Flat ₹100 off your subscription!');
    } else {
      setAppliedDiscount(0);
      setDiscountMessage('❌ Invalid discount coupon. Try "MOMSLOVE"!');
    }
  };

  const handleStartCheckout = () => {
    if (cartItems.length === 0) return;
    setIsCheckoutPhase(true);
  };

  const handlePlaceOrderSubmit = () => {
    if (!fullName || !phone || !address) {
      setFormError('⚠️ Please fill in all required fields (Name, Phone, Address).');
      return;
    }
    
    if (phone.replace(/\D/g, '').length < 10) {
      setFormError('⚠️ Please enter a valid 10-digit mobile number.');
      return;
    }

    // Prepare simulated Order object
    const simulatedOrder: Order = {
      id: `GB-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...cartItems],
      subtotal,
      gst,
      deliveryFee,
      discount: appliedDiscount,
      total: finalTotal,
      deliveryAddress: address,
      apartment,
      deliveryInstructions: instructions,
      chefNote: chefNote,
      paymentMethod,
      status: 'received',
      orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      etaMinutes: 35, // average ETA for fresh home cooked meals
      chefId: cartItems[0]?.mealId ? 'chef-anita' : 'chef-meenakshi', // fallback assignment
      customerName: fullName,
      customerPhone: phone
    };

    onPlaceOrder(simulatedOrder);
    setIsCheckoutPhase(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" id="cart-sidebar-container">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2D2727]/60 backdrop-blur-sm"
            id="cart-backdrop"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="relative w-full max-w-md h-full bg-[#FFFDF6] border-l border-[#C2593F]/15 shadow-2xl flex flex-col justify-between"
            id="cart-drawer"
          >
            
            {/* Header */}
            <div className="p-5 border-b border-[#C2593F]/10 flex items-center justify-between bg-[#FFFDF6]">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-[#C2593F]" />
                <h2 className="font-sans font-extrabold text-lg text-[#2D2727]">
                  {isCheckoutPhase ? 'Secure Checkout' : 'Your Kitchen Cart'}
                </h2>
                <span className="bg-[#C2593F]/10 text-[#C2593F] text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              </div>
              <button
                id="close-cart-sidebar-btn"
                onClick={onClose}
                className="text-[#2D2727]/40 hover:text-[#2D2727] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content (Either Cart list OR Checkout Form) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6" id="cart-drawer-scrollable">
              
              {!isCheckoutPhase ? (
                /* PHASE 1: CART ITEMS LIST */
                <>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-16" id="cart-empty-visual">
                      <ShoppingBag className="h-12 w-12 text-[#C2593F]/30 mx-auto mb-3" />
                      <h3 className="font-bold text-[#2D2727]">Your Cart is Empty</h3>
                      <p className="text-xs text-[#2D2727]/50 mt-1 max-w-xs mx-auto">
                        Add some delicious regional dishes or set up a healthy tiffin subscription to get started.
                      </p>
                      <button
                        id="start-browsing-empty-cart-btn"
                        onClick={onClose}
                        className="mt-5 px-5 py-2.5 bg-[#C2593F] text-white rounded-xl text-xs font-bold shadow hover:bg-[#C2593F]/90 transition-all cursor-pointer"
                      >
                        Browse Home specials
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4" id="cart-items-stack">
                      {cartItems.map((item) => (
                        <div
                          key={item.cartId}
                          id={`cart-item-${item.cartId}`}
                          className="p-3 rounded-2xl bg-white border border-[#C2593F]/5 shadow-sm flex items-start justify-between"
                        >
                          {/* Item Details */}
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center space-x-1.5">
                              <span className={`h-2 w-2 rounded-full shrink-0 ${
                                item.isVeg ? 'bg-green-600' : 'bg-red-600'
                              }`} />
                              <span className="font-sans font-bold text-sm text-[#2D2727] truncate block">
                                {item.name}
                              </span>
                            </div>

                            {/* Subtitle properties */}
                            <div className="text-[10px] text-[#2D2727]/60 mt-1 space-y-0.5">
                              {item.isTiffin ? (
                                <p className="text-[#E28743] font-semibold">★ Daily Tiffin Subscription</p>
                              ) : item.isCustomThali ? (
                                <p className="text-[#C2593F] font-semibold">🍽️ Customized Royal Platter</p>
                              ) : (
                                <p>🌶️ Spice: {item.customization.spiceLevel} • Ghee: {item.customization.extraGhee ? 'Yes' : 'No'}</p>
                              )}
                              
                              {item.customization.instructions && (
                                <p className="italic text-gray-400 truncate">💬 Note: "{item.customization.instructions}"</p>
                              )}

                              {item.customization.thaliComponents && (
                                <div className="bg-gray-50 p-2 rounded-lg text-[9px] text-[#2D2727]/70 mt-1 leading-snug">
                                  <strong>Dal:</strong> {item.customization.thaliComponents.dal} <br />
                                  <strong>Curries:</strong> {item.customization.thaliComponents.curry1}, {item.customization.thaliComponents.curry2} <br />
                                  <strong>Rice/Bread:</strong> {item.customization.thaliComponents.rice} / {item.customization.thaliComponents.bread} <br />
                                  <strong>Dessert:</strong> {item.customization.thaliComponents.sweet}
                                </div>
                              )}
                            </div>

                            <div className="mt-2 text-xs font-bold text-[#C2593F]">
                              ₹{item.price} each
                            </div>
                          </div>

                          {/* Controls (Qty & Delete) */}
                          <div className="flex flex-col items-end justify-between h-full space-y-3">
                            <button
                              id={`delete-cart-item-${item.cartId}`}
                              onClick={() => onRemoveItem(item.cartId)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                            <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 rounded-lg p-1">
                              <button
                                id={`qty-minus-${item.cartId}`}
                                onClick={() => onUpdateQuantity(item.cartId, -1)}
                                className="h-5 w-5 rounded bg-white border border-gray-200 text-[#2D2727] text-xs font-bold flex items-center justify-center hover:bg-gray-100 active:scale-95"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-[#2D2727] w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                id={`qty-plus-${item.cartId}`}
                                onClick={() => onUpdateQuantity(item.cartId, 1)}
                                className="h-5 w-5 rounded bg-white border border-gray-200 text-[#2D2727] text-xs font-bold flex items-center justify-center hover:bg-gray-100 active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* PHASE 2: SECURE CHECKOUT FORM */
                <div className="space-y-4" id="checkout-form-container">
                  <h3 className="text-xs font-bold text-[#2D2727]/50 uppercase tracking-widest font-mono border-b border-[#C2593F]/5 pb-1 mb-2">
                    Delivery & Chef Info
                  </h3>

                  {formError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold" id="form-error-banner">
                      {formError}
                    </div>
                  )}

                  {/* 1. Recipient Name */}
                  <div>
                    <label className="text-[10px] font-bold text-[#2D2727] uppercase tracking-wider block mb-1.5 font-mono">
                      👤 Recipient Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        id="checkout-name"
                        type="text"
                        required
                        placeholder="E.g., Preeti Das"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-[#C2593F]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C2593F]/40"
                      />
                    </div>
                  </div>

                  {/* 2. Phone Number */}
                  <div>
                    <label className="text-[10px] font-bold text-[#2D2727] uppercase tracking-wider block mb-1.5 font-mono">
                      📞 Mobile Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        id="checkout-phone"
                        type="tel"
                        required
                        placeholder="10-digit Indian Mobile No."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-[#C2593F]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C2593F]/40"
                      />
                    </div>
                  </div>

                  {/* 3. Delivery Address */}
                  <div>
                    <label className="text-[10px] font-bold text-[#2D2727] uppercase tracking-wider block mb-1.5 font-mono">
                      📍 Complete Street Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <textarea
                        id="checkout-address"
                        required
                        placeholder="House / Flat No., Street, Sector/Block name"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-16 pl-9 pr-3 py-2 border border-[#C2593F]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C2593F]/40 resize-none"
                      />
                    </div>
                  </div>

                  {/* 4. Apt / Landmark */}
                  <div>
                    <label className="text-[10px] font-bold text-[#2D2727] uppercase tracking-wider block mb-1.5 font-mono">
                      🏢 Apartment Name / Office / Landmark
                    </label>
                    <input
                      id="checkout-landmark"
                      type="text"
                      placeholder="E.g., Near Dwarka Metro Pillar 114"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="w-full px-3 py-2 border border-[#C2593F]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C2593F]/40"
                    />
                  </div>

                  {/* 5. Delivery instructions */}
                  <div>
                    <label className="text-[10px] font-bold text-[#2D2727] uppercase tracking-wider block mb-1.5 font-mono">
                      🚪 Instructions for Delivery Rider
                    </label>
                    <input
                      id="checkout-instructions"
                      type="text"
                      placeholder="E.g., Leave with security, ring bell, etc."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-3 py-2 border border-[#C2593F]/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C2593F]/40"
                    />
                  </div>

                  {/* 6. Note to Home Chef */}
                  <div className="p-3 bg-[#FFFDF6] border border-[#557A46]/20 rounded-2xl">
                    <label className="text-[10px] font-bold text-[#557A46] uppercase tracking-wider block mb-1 font-mono flex items-center">
                      <Heart className="h-3 w-3 mr-1 fill-current" /> Note for the Home Chef
                    </label>
                    <input
                      id="checkout-chef-note"
                      type="text"
                      placeholder="E.g., Keep spices low in Dal, wrap rotis tightly."
                      value={chefNote}
                      onChange={(e) => setChefNote(e.target.value)}
                      className="w-full px-3 py-2 border border-[#557A46]/10 rounded-xl text-xs bg-white text-[#2D2727] placeholder-[#2D2727]/30 focus:outline-none"
                    />
                  </div>

                  {/* 7. Payment Options */}
                  <div>
                    <label className="text-[10px] font-bold text-[#2D2727] uppercase tracking-wider block mb-2 font-mono">
                      💳 Select Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        id="pay-upi"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          paymentMethod === 'upi'
                            ? 'bg-[#C2593F] text-white border-transparent'
                            : 'bg-white text-[#2D2727]/70 border-gray-200'
                        }`}
                      >
                        ⚡ UPI / GPay
                      </button>
                      <button
                        id="pay-card"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          paymentMethod === 'card'
                            ? 'bg-[#C2593F] text-white border-transparent'
                            : 'bg-white text-[#2D2727]/70 border-gray-200'
                        }`}
                      >
                        💳 Card
                      </button>
                      <button
                        id="pay-cod"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          paymentMethod === 'cod'
                            ? 'bg-[#C2593F] text-white border-transparent'
                            : 'bg-white text-[#2D2727]/70 border-gray-200'
                        }`}
                      >
                        💵 Cash (COD)
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Billing & CTA Sheet */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-[#C2593F]/10 bg-white space-y-4" id="cart-billing-footer">
                
                {/* Promo Code Apply section (ONLY in Cart list phase) */}
                {!isCheckoutPhase && (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        id="coupon-input"
                        type="text"
                        placeholder="COUPON (e.g. MOMSLOVE)"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#C2593F]/15 rounded-xl text-xs bg-white text-[#2D2727] focus:outline-none uppercase tracking-wide font-mono font-bold"
                      />
                      <button
                        id="apply-coupon-btn"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-[#2D2727] hover:bg-[#2D2727]/95 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <Tag className="h-3 w-3" />
                        <span>Apply</span>
                      </button>
                    </div>
                    {discountMessage && (
                      <p className={`text-[10px] font-semibold ${
                        appliedDiscount > 0 ? 'text-[#557A46]' : 'text-red-500'
                      }`}>
                        {discountMessage}
                      </p>
                    )}
                  </div>
                )}

                {/* Billing Summary rows */}
                <div className="space-y-2" id="cart-price-ledger">
                  <div className="flex justify-between text-xs text-[#2D2727]/60">
                    <span>Items Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#2D2727]/60">
                    <span className="flex items-center">
                      GST / Food Tax (5%) <Percent className="h-3 w-3 ml-0.5 text-gray-400" />
                    </span>
                    <span>+₹{gst}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#2D2727]/60">
                    <span>Hygienic Home Delivery</span>
                    <span>{deliveryFee === 0 ? <span className="text-[#557A46] font-bold">FREE</span> : `₹${deliveryFee}`}</span>
                  </div>
                  
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-xs text-[#557A46] font-bold">
                      <span>Promo Savings</span>
                      <span>-₹{appliedDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-extrabold text-[#2D2727] pt-2 border-t border-[#C2593F]/10">
                    <span>To Pay</span>
                    <span className="text-[#C2593F]">₹{finalTotal}</span>
                  </div>
                </div>

                {/* Action CTA Trigger */}
                <div className="pt-2">
                  {!isCheckoutPhase ? (
                    <button
                      id="proceed-checkout-btn"
                      onClick={handleStartCheckout}
                      className="w-full py-3 bg-[#C2593F] hover:bg-[#C2593F]/90 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#C2593F]/10 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <span>Proceed to Delivery</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        id="back-to-cart-btn"
                        onClick={() => setIsCheckoutPhase(false)}
                        className="py-3 border border-[#C2593F]/20 text-[#2D2727]/70 font-bold text-xs rounded-xl hover:bg-gray-50 text-center cursor-pointer"
                      >
                        Back to Cart
                      </button>
                      <button
                        id="place-order-confirm-btn"
                        onClick={handlePlaceOrderSubmit}
                        className="col-span-2 py-3 bg-[#557A46] hover:bg-[#557A46]/90 text-white font-bold text-xs rounded-xl shadow-md text-center flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Place Simulated Order (₹{finalTotal})</span>
                      </button>
                    </div>
                  )}
                  <p className="text-[9px] text-[#2D2727]/40 text-center mt-3 flex items-center justify-center">
                    🔒 Safe & secure home food logistics • Verified by FSSAI Delhi
                  </p>
                </div>

              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
