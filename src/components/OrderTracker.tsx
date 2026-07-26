import { useState, useEffect } from 'react';
import { Order, OrderStatus, ChefProfile } from '../types';
import { CHEFS } from '../data';
import { 
  CheckCircle2, 
  ArrowLeft, 
  MessageSquare, 
  QrCode, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  Phone, 
  Edit2, 
  Check, 
  Send 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderTrackerProps {
  order: Order;
  onUpdateStatus: (newStatus: OrderStatus) => void;
  onCancelOrder: () => void;
  triggerToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
  userToken: string;
  chefs?: ChefProfile[];
}

export default function OrderTracker({ order, onUpdateStatus, onCancelOrder, triggerToast, userToken, chefs = CHEFS }: OrderTrackerProps) {
  const chef = chefs.find((c) => c.id === order.chefId) || chefs[0];
  
  // Local guest details retrieved from localStorage
  const [visitorName, setVisitorName] = useState('Valued Guest');
  const [businessName, setBusinessName] = useState('GharBhojan Mom\'s Kitchen');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');

  // Read guest information on mount or when token changes
  useEffect(() => {
    // Start with order details if available
    if (order.customerName) {
      setVisitorName(order.customerName);
    }
    if (order.customerPhone) {
      setWhatsappPhone(order.customerPhone);
      setTempPhone(order.customerPhone);
    }

    try {
      const stored = localStorage.getItem(`gharbhojan_visitor_info_${userToken}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!order.customerName && parsed.name) setVisitorName(parsed.name);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (!order.customerPhone && parsed.phone) {
          setWhatsappPhone(parsed.phone);
          setTempPhone(parsed.phone);
        }
      } else {
        // Fallback from independent localStorage keys
        const savedPhone = localStorage.getItem(`gharbhojan_visitor_phone_${userToken}`) || '';
        const savedName = localStorage.getItem(`gharbhojan_visitor_name_${userToken}`) || 'Valued Guest';
        if (!order.customerName) setVisitorName(savedName);
        if (!order.customerPhone && savedPhone) {
          setWhatsappPhone(savedPhone);
          setTempPhone(savedPhone);
        }
      }
    } catch (e) {
      console.error('Failed to parse visitor details in OrderTracker', e);
    }
  }, [userToken, order]);

  const handleSavePhone = () => {
    const clean = tempPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      if (triggerToast) triggerToast('⚠️ Please enter a valid 10-digit mobile number.', 'warning');
      return;
    }
    setWhatsappPhone(clean);
    setIsEditingPhone(false);
    
    // Sync with localStorage
    try {
      const stored = localStorage.getItem(`gharbhojan_visitor_info_${userToken}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.phone = clean;
        localStorage.setItem(`gharbhojan_visitor_info_${userToken}`, JSON.stringify(parsed));
      }
      localStorage.setItem(`gharbhojan_visitor_phone_${userToken}`, clean);
    } catch (e) {
      console.error(e);
    }
    
    if (triggerToast) triggerToast('✅ WhatsApp number updated successfully!', 'success');
  };

  // Generate beautiful WhatsApp summary message
  const generateWhatsAppMessage = () => {
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

    const upiId = `${businessName.toLowerCase().replace(/\s+/g, '')}@okaxis`;
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${order.total}&cu=INR`;
    const upiDetailsMsg = order.paymentMethod === 'upi'
      ? `\n*💸 UPI ID (Demo):* ${upiId}\n*🔗 Tap to Pay (UPI App):* ${upiLink}\n`
      : '';

    const text = `🍱 *ORDER PLACED - ${businessName}*

Namaste *${visitorName}*, your order has been successfully placed with love! We are preparing it fresh in small batches.

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

    return encodeURIComponent(text);
  };

  // Direct WhatsApp link construction with dynamic guest phone
  const cleanPhoneForWhatsApp = whatsappPhone || order.deliveryAddress; // fallback or registered guest phone
  const cleanPhoneDigits = cleanPhoneForWhatsApp.replace(/\D/g, '');
  const finalWhatsAppNumber = cleanPhoneDigits.length === 10 ? `91${cleanPhoneDigits}` : cleanPhoneDigits;
  const whatsappUrl = `https://wa.me/${finalWhatsAppNumber}?text=${generateWhatsAppMessage()}`;

  return (
    <section className="py-10 bg-[#FFFDF6]" id="tracker-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Main Success Container */}
        <div className="bg-white rounded-3xl border border-[#C2593F]/15 shadow-xl overflow-hidden" id="tracker-card">
          
          {/* Success Header Banner */}
          <div className="p-6 bg-gradient-to-r from-[#C2593F] to-[#E28743] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-white/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono">
                  Order ID: {order.id}
                </span>
                <span className="bg-green-500/30 text-green-200 border border-green-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" /> Received
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight mt-2 flex items-center">
                🎉 Order Placed Successfully!
              </h2>
              <p className="text-white/80 text-xs mt-1">
                Your order is accepted. We are custom preparing your fresh home-cooked meal now.
              </p>
            </div>
            
            {/* Total display on Banner */}
            <div className="flex items-center bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
              <div className="text-right sm:text-left">
                <span className="text-[10px] text-white/70 uppercase font-bold block leading-none">Amount Due</span>
                <span className="text-2xl font-extrabold">₹{order.total}</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-8">
            
            {/* 1. Payment Method Options & Sandbox */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#C2593F]/10 shadow-sm" id="payment-details-sandbox">
              <h3 className="text-sm font-extrabold text-[#2D2727] uppercase tracking-wide font-mono flex items-center pb-3 border-b border-gray-100">
                <ShieldCheck className="h-5 w-5 text-[#557A46] mr-2 shrink-0" />
                Payment Options & Details
              </h3>
              
              <div className="mt-4">
                {order.paymentMethod === 'upi' && (
                  <div className="flex flex-col md:flex-row items-center gap-6" id="upi-sandbox">
                    
                    {/* High Fidelity Mock QR Code */}
                    <div className="relative p-4 bg-[#FFFDF6] border border-[#C2593F]/10 rounded-2xl shadow-inner shrink-0 flex flex-col items-center justify-center">
                      <div className="w-40 h-40 flex items-center justify-center bg-white border border-gray-100 rounded-xl p-2">
                        {/* High fidelity inline SVG representing QR Code with brand accent */}
                        <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="0" y="0" width="25" height="25" />
                          <rect x="5" y="5" width="15" height="15" fill="white" />
                          <rect x="9" y="9" width="7" height="7" />
                          
                          <rect x="75" y="0" width="25" height="25" />
                          <rect x="80" y="5" width="15" height="15" fill="white" />
                          <rect x="84" y="9" width="7" height="7" />
                          
                          <rect x="0" y="75" width="25" height="25" />
                          <rect x="5" y="80" width="15" height="15" fill="white" />
                          <rect x="9" y="84" width="7" height="7" />
                          
                          {/* Inner randomized scanning patterns */}
                          <rect x="35" y="0" width="5" height="15" />
                          <rect x="45" y="5" width="10" height="5" />
                          <rect x="35" y="20" width="15" height="5" />
                          <rect x="60" y="0" width="5" height="25" />
                          <rect x="65" y="15" width="5" height="10" />
                          
                          <rect x="0" y="35" width="15" height="5" />
                          <rect x="10" y="45" width="20" height="5" />
                          <rect x="0" y="55" width="5" height="15" />
                          <rect x="15" y="55" width="15" height="10" />
                          
                          <rect x="35" y="35" width="30" height="30" fill="#C2593F" />
                          <rect x="40" y="40" width="20" height="20" fill="white" />
                          <rect x="45" y="45" width="10" height="10" fill="#C2593F" />
                          
                          <rect x="75" y="35" width="25" height="5" />
                          <rect x="85" y="45" width="10" height="15" />
                          <rect x="75" y="65" width="15" height="5" />
                          
                          <rect x="35" y="75" width="10" height="5" />
                          <rect x="40" y="85" width="15" height="10" />
                          <rect x="35" y="90" width="5" height="10" />
                          
                          <rect x="60" y="75" width="5" height="25" />
                          <rect x="70" y="85" width="25" height="5" />
                          <rect x="85" y="95" width="15" height="5" />
                        </svg>
                      </div>
                      
                      {/* Dynamic Scan Info */}
                      <span className="text-[9px] font-bold font-mono text-[#2D2727]/40 uppercase mt-2">
                        Scan to Pay with any UPI App
                      </span>
                      <span className="text-xs font-extrabold text-[#C2593F] font-mono mt-0.5">
                        ₹{order.total}
                      </span>
                    </div>

                    {/* UPI Details & Instructions */}
                    <div className="flex-1 space-y-3">
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#C2593F]/10 text-[#C2593F] rounded-lg text-[10px] font-bold font-mono uppercase">
                        <span>⚡ UPI / GPay Mode</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2D2727]">
                        Scan the QR Code to complete payment
                      </h4>
                      <p className="text-xs text-[#2D2727]/60 leading-relaxed">
                        Alternatively, you can send exactly <strong className="text-[#2D2727]">₹{order.total}</strong> to our merchant UPI address:
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                          <code className="text-xs font-bold text-[#C2593F] font-mono">
                            {businessName.toLowerCase().replace(/\s+/g, '')}@okaxis
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${businessName.toLowerCase().replace(/\s+/g, '')}@okaxis`);
                              if (triggerToast) triggerToast('📋 UPI ID copied to clipboard!', 'success');
                            }}
                            className="text-[10px] font-bold text-[#557A46] hover:underline cursor-pointer"
                          >
                            Copy ID
                          </button>
                        </div>
                        <a
                          href={`upi://pay?pa=${businessName.toLowerCase().replace(/\s+/g, '')}@okaxis&pn=${encodeURIComponent(businessName)}&am=${order.total}&cu=INR`}
                          className="px-4 py-2.5 bg-gradient-to-r from-[#557A46] to-[#6A9C5A] hover:from-[#405D33] hover:to-[#557A46] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all text-center select-none cursor-pointer border border-[#557A46]/10 shrink-0"
                          id="upi-click-to-pay-btn"
                          title="Click here to pay directly using any UPI App on your phone!"
                        >
                          <span>⚡ Click to Pay</span>
                        </a>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-normal">
                        🛡️ Secure sandbox payment. Food preparation begins immediately once your order details are shared via WhatsApp below.
                      </p>
                    </div>

                  </div>
                )}

                {order.paymentMethod === 'card' && (
                  <div className="p-4 bg-green-50/50 border border-green-200/50 rounded-2xl flex items-start space-x-4" id="card-sandbox">
                    <div className="p-3 bg-green-500/10 text-green-600 rounded-xl shrink-0">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-green-700 font-mono font-bold uppercase block">Card Transaction Status</span>
                      <h4 className="text-sm font-bold text-[#2D2727] mt-0.5">Payment Authorized Successfully!</h4>
                      <p className="text-xs text-[#2D2727]/60 leading-relaxed mt-1">
                        Amount of <strong className="text-[#2D2727]">₹{order.total}</strong> has been secured from your card. Safe & encrypted by GharBhojan gateway.
                      </p>
                    </div>
                  </div>
                )}

                {order.paymentMethod === 'cod' && (
                  <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex items-start space-x-4" id="cod-sandbox">
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
                      <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-700 font-mono font-bold uppercase block">Cash On Delivery instructions</span>
                      <h4 className="text-sm font-bold text-[#2D2727] mt-0.5">Please keep cash ready</h4>
                      <p className="text-xs text-[#2D2727]/60 leading-relaxed mt-1">
                        Please pay exactly <strong className="text-[#2D2727]">₹{order.total}</strong> in cash or show a UPI screenshot to our kitchen associate when they arrive with your warm meal.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Critical WhatsApp Receipt Sender Block */}
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/40 border border-emerald-500/20 shadow-sm" id="whatsapp-sender-block">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-emerald-500/10">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-emerald-600 mr-2 shrink-0" />
                  <h3 className="text-sm font-extrabold text-[#2D2727] uppercase tracking-wide font-mono">
                    WhatsApp Order Confirmation
                  </h3>
                </div>
                
                {/* Guest Phone Number Sync Status & Inline Editing */}
                <div className="flex items-center text-xs text-[#2D2727]/70 font-mono">
                  {isEditingPhone ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="tel"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        className="px-2 py-0.5 border border-emerald-500/30 rounded bg-white text-xs w-32 focus:outline-none"
                        placeholder="10-digit number"
                      />
                      <button
                        onClick={handleSavePhone}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        title="Save Number"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center bg-white border border-emerald-500/10 rounded-lg px-2 py-1 space-x-2">
                      <Phone className="h-3 w-3 text-emerald-600" />
                      <span className="font-bold text-[11px] text-emerald-800">
                        {whatsappPhone ? `+91 ${whatsappPhone}` : 'No phone specified'}
                      </span>
                      <button
                        onClick={() => setIsEditingPhone(true)}
                        className="p-0.5 text-gray-400 hover:text-emerald-600 cursor-pointer"
                        title="Edit WhatsApp Number"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-xs text-[#2D2727]/70 leading-relaxed">
                  Send your full order receipt with item specifications, prices, and address instructions directly to your registered WhatsApp number for tracking, updates, and direct chat support with Home Chef <strong>{chef.name}</strong>.
                </p>
                
                {/* Large call-to-action green WhatsApp Link Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 text-center"
                  onClick={() => {
                    if (triggerToast) triggerToast('💬 Opening WhatsApp conversation with order details!', 'success');
                  }}
                >
                  <Send className="h-4 w-4" />
                  <span>Send Order Receipt to WhatsApp 💬</span>
                </a>
                
                <p className="text-[10px] text-emerald-700/60 text-center font-mono font-bold">
                  Clicking will open WhatsApp with your prefilled order summary receipt ready to send.
                </p>
              </div>
            </div>

            {/* 3. Simple Visual Order Items & Basket Summary */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#C2593F]/10 shadow-sm" id="basket-details-box">
              <h3 className="text-xs font-extrabold text-[#2D2727] uppercase tracking-wider font-mono text-gray-400 mb-3">
                Order Items & Basket Summary
              </h3>
              
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-2 scrollbar-none">
                {order.items.map((item, index) => (
                  <div key={index} className="py-3 flex items-start justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        <span className="font-bold text-[#2D2727]">
                          {item.quantity}x {item.name}
                        </span>
                      </div>
                      {item.customization && (
                        <div className="text-[10px] text-gray-400 mt-1 pl-4 space-x-2 font-mono">
                          <span>🌶️ {item.customization.spiceLevel || 'Medium'}</span>
                          {item.customization.extraGhee !== undefined && (
                            <span>🧈 {item.customization.extraGhee ? 'Extra Ghee' : 'No Ghee'}</span>
                          )}
                          {item.customization.instructions && (
                            <span className="block italic mt-0.5">Note: "{item.customization.instructions}"</span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="font-extrabold text-[#2D2727] shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Precise Bill Breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs space-y-1.5 text-gray-500">
                <div className="flex justify-between">
                  <span>Basket Subtotal</span>
                  <span className="font-bold text-[#2D2727]">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-bold text-[#2D2727]">₹{order.gst}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-[#2D2727]">
                    {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Applied Coupon Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-3 border-t border-dashed border-[#C2593F]/10 font-extrabold text-[#C2593F] text-sm">
                  <span>Paid Total Amount</span>
                  <span>₹{order.total}</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-[#2D2727]/70">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block font-mono">📍 Delivery Address</span>
                  <p className="font-bold text-[#2D2727] leading-tight">{order.deliveryAddress}</p>
                  {order.apartment && <p className="text-[10px] text-gray-400">Landmark: {order.apartment}</p>}
                </div>
                
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block font-mono">👩‍🍳 Kitchen Notes</span>
                  <p className="italic">Chef Note: "{order.chefNote || 'No special note'}"</p>
                  <p className="italic mt-1">Rider Note: "{order.deliveryInstructions || 'None'}"</p>
                </div>
              </div>

            </div>

            {/* 4. Action CTA Buttons to navigate back */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4" id="tracker-navigation-ctas">
              <button
                id="tracker-return-menu-btn"
                onClick={onCancelOrder} // triggers clean of order state & redirects to menu
                className="w-full sm:flex-1 py-3 bg-[#C2593F] hover:bg-[#C2593F]/90 text-white font-extrabold text-sm rounded-xl shadow-md cursor-pointer transition-all duration-150 text-center flex items-center justify-center space-x-2"
              >
                <span>Return to Main Menu 🍛</span>
              </button>
              
              <button
                id="tracker-cancel-order-direct"
                onClick={() => {
                  if (confirm('Are you sure you want to cancel this order? This will clear current session data.')) {
                    onCancelOrder();
                    if (triggerToast) triggerToast('🗑️ Order cleared from active session!', 'info');
                  }
                }}
                className="w-full sm:w-auto px-6 py-3 border border-red-200 hover:bg-red-50 text-red-600 font-extrabold text-xs rounded-xl cursor-pointer transition-all duration-150"
              >
                Cancel / Reset Order
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

