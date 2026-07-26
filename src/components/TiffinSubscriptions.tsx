import { useState } from 'react';
import { TiffinPlan } from '../types';
import { TIFFIN_PLANS } from '../data';
import { Calendar, Clock, Star, ShieldCheck, CheckCircle, ArrowRight, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TiffinSubscriptionsProps {
  onAddTiffinToCart: (
    plan: TiffinPlan,
    billingCycle: 'weekly' | 'monthly',
    slot: 'lunch' | 'dinner' | 'both',
    days: 'weekdays' | 'everyday',
    noOnionGarlic: boolean,
    price: number
  ) => void;
  triggerToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
  tiffinPlans?: TiffinPlan[];
}

export default function TiffinSubscriptions({ onAddTiffinToCart, triggerToast, tiffinPlans = TIFFIN_PLANS }: TiffinSubscriptionsProps) {
  const [selectedPlan, setSelectedPlan] = useState<TiffinPlan | null>(null);
  
  // Interactive Customizer states
  const [billingCycle, setBillingCycle] = useState<'weekly' | 'monthly'>('monthly');
  const [deliverySlot, setDeliverySlot] = useState<'lunch' | 'dinner' | 'both'>('lunch');
  const [deliveryDays, setDeliveryDays] = useState<'weekdays' | 'everyday'>('weekdays');
  const [customSatvik, setCustomSatvik] = useState(false);

  const handleOpenConfigurator = (plan: TiffinPlan) => {
    setSelectedPlan(plan);
    setBillingCycle('monthly');
    setDeliverySlot('lunch');
    setDeliveryDays('weekdays');
    setCustomSatvik(plan.diet === 'jain');
  };

  // Dynamically calculate subscription rate
  const calculateSubscriptionRate = () => {
    if (!selectedPlan) return 0;
    
    // Base price
    let base = billingCycle === 'weekly' ? selectedPlan.pricePerWeek : selectedPlan.pricePerMonth;
    
    // Delivery slot multiplier
    let slotMultiplier = 1;
    if (deliverySlot === 'both') {
      slotMultiplier = 1.85; // 15% discount for ordering both lunch and dinner!
    }

    // Days multiplier
    let daysMultiplier = 1;
    if (deliveryDays === 'everyday') {
      daysMultiplier = 1.3; // 30% add-on for adding Saturday & Sunday meals
    }

    return Math.round(base * slotMultiplier * daysMultiplier);
  };

  const handleSubscribeConfirm = () => {
    if (selectedPlan) {
      const finalPrice = calculateSubscriptionRate();
      onAddTiffinToCart(
        selectedPlan,
        billingCycle,
        deliverySlot,
        deliveryDays,
        customSatvik,
        finalPrice
      );
      setSelectedPlan(null);
      if (triggerToast) {
        triggerToast(`🎉 Successfully subscribed to ${selectedPlan.name}! Tiffin plan added to your cart.`, "success");
      }
    }
  };

  return (
    <section className="py-12 bg-white" id="tiffin-section">
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12" id="tiffin-header">
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-[#2D2727] tracking-tight">
            Homestyle <span className="text-[#C2593F]">Daily Tiffin</span> Subscriptions
          </h2>
          <p className="text-sm sm:text-base text-[#2D2727]/60 mt-2">
            Perfect for office professionals, students, and busy families. Get nutritious, fresh, oil-controlled hot lunch & dinner boxes delivered punctually at set times daily.
          </p>
        </div>

        {/* Brand Guarantees banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#FFFDF6] border border-[#C2593F]/10 mb-12 text-center" id="tiffin-guarantees">
          <div className="flex flex-col items-center p-2">
            <Clock className="h-5 w-5 text-[#C2593F] mb-1.5" />
            <h4 className="text-xs font-bold text-[#2D2727]">Punctual Delivery</h4>
            <p className="text-[10px] text-[#2D2727]/50">Lunch by 1:30 PM, Dinner by 9:00 PM</p>
          </div>
          <div className="flex flex-col items-center p-2 border-t md:border-t-0 md:border-l border-[#C2593F]/10">
            <Star className="h-5 w-5 text-[#E28743] mb-1.5" />
            <h4 className="text-xs font-bold text-[#2D2727]">No Boredom Guarantee</h4>
            <p className="text-[10px] text-[#2D2727]/50">New daily menu rotation. Never repeat items.</p>
          </div>
          <div className="flex flex-col items-center p-2 border-t md:border-t-0 md:border-l border-[#C2593F]/10">
            <ShieldCheck className="h-5 w-5 text-[#557A46] mb-1.5" />
            <h4 className="text-xs font-bold text-[#2D2727]">Pause Anytime</h4>
            <p className="text-[10px] text-[#2D2727]/50">Going out? Pause tiffin deliveries via app chat.</p>
          </div>
          <div className="flex flex-col items-center p-2 border-t md:border-t-0 md:border-l border-[#C2593F]/10">
            <UserCheck className="h-5 w-5 text-[#C2593F] mb-1.5" />
            <h4 className="text-xs font-bold text-[#2D2727]">Eco-Friendly</h4>
            <p className="text-[10px] text-[#2D2727]/50">Reusable tiffin canisters, zero plastic waste</p>
          </div>
        </div>

        {/* Tiffin Plans Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 xs:gap-4 sm:gap-6" id="tiffin-plans-grid">
          {tiffinPlans.map((plan) => (
            <motion.div
              key={plan.id}
              id={`tiffin-card-${plan.id}`}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl xs:rounded-2xl border border-[#C2593F]/10 overflow-hidden shadow-sm flex flex-col justify-between h-full"
            >
              
              {/* Plan Header & Image */}
              <div>
                <div className="relative aspect-[4/3] bg-amber-50">
                  <img
                    src={plan.image}
                    alt={plan.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 xs:top-3 xs:left-3">
                    <span className={`px-1.5 xs:px-2.5 py-0.5 xs:py-1 text-[7px] xs:text-[9px] font-bold rounded bg-white shadow-sm uppercase tracking-wide border ${
                      plan.diet === 'veg' ? 'text-green-600 border-green-600/30' :
                      plan.diet === 'non-veg' ? 'text-red-600 border-red-600/30' :
                      plan.diet === 'keto' ? 'text-[#557A46] border-[#557A46]/30' :
                      'text-[#E28743] border-[#E28743]/30'
                    }`}>
                      🍃 {plan.diet === 'veg' ? 'Pure Veg' : plan.diet === 'non-veg' ? 'Nonveg' : plan.diet === 'keto' ? 'Keto' : 'Satvik'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 xs:p-4">
                  <h3 className="font-sans font-extrabold text-xs xs:text-sm sm:text-base md:text-lg text-[#2D2727] tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-[10px] xs:text-xs text-[#2D2727]/60 mt-1 xs:mt-1.5 leading-tight xs:leading-relaxed line-clamp-2">
                    {plan.description}
                  </p>

                  {/* Included Items checklist */}
                  <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-1.5 pt-2 sm:pt-3 border-t border-[#C2593F]/5">
                    <h4 className="text-[8px] xs:text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Included:
                    </h4>
                    {plan.includes.map((item, idx) => (
                      <div key={idx} className="flex items-start text-[9px] xs:text-[11px] text-[#2D2727]/75 leading-tight xs:leading-relaxed">
                        <CheckCircle className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-[#557A46] shrink-0 mr-1 xs:mr-1.5 mt-0.5" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Subscription Trigger */}
              <div className="p-2.5 xs:p-4 pt-0">
                <div className="bg-[#FFFDF6] p-1.5 xs:p-3 rounded-lg xs:rounded-xl border border-[#C2593F]/10 mb-2.5 xs:mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[7px] xs:text-[9px] text-gray-400 uppercase font-bold block leading-none">Weekly</span>
                    <span className="font-sans font-extrabold text-xs xs:text-sm sm:text-base text-[#2D2727] leading-none mt-0.5 block">₹{plan.pricePerWeek}</span>
                  </div>
                  <div className="h-6 xs:h-8 w-px bg-[#C2593F]/10" />
                  <div className="text-right">
                    <span className="text-[7px] xs:text-[9px] text-gray-400 uppercase font-bold block leading-none">Monthly</span>
                    <span className="font-sans font-extrabold text-xs xs:text-sm sm:text-base text-[#C2593F] leading-none mt-0.5 block">₹{plan.pricePerMonth}</span>
                  </div>
                </div>

                <button
                  id={`subscribe-btn-${plan.id}`}
                  onClick={() => handleOpenConfigurator(plan)}
                  className="w-full py-1.5 xs:py-2.5 bg-[#C2593F] hover:bg-[#C2593F]/90 text-white rounded-lg xs:rounded-xl text-[10px] xs:text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm text-center flex items-center justify-center space-x-0.5 xs:space-x-1"
                >
                  <span className="xs:hidden">Configure</span>
                  <span className="hidden xs:inline">Select & Configure</span>
                  <ArrowRight className="h-3 w-3 xs:h-3.5 xs:w-3.5" />
                </button>
              </div>

            </motion.div>
          ))}
        </div>

      </div>

      {/* Subscription Configurator Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="subscription-modal-container">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-[#2D2727]/60 backdrop-blur-sm"
            />
            
            {/* Configurator Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-[#FFFDF6] rounded-3xl border border-[#C2593F]/10 overflow-hidden shadow-2xl p-5 sm:p-6"
              id="subscription-configurator"
            >
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#C2593F]/10 pb-4 mb-4">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-4 w-4 text-[#C2593F]" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Tiffin Schedule Builder</span>
                  </div>
                  <h3 className="font-sans font-extrabold text-xl text-[#2D2727] mt-1 tracking-tight">
                    Subscribe to {selectedPlan.name}
                  </h3>
                </div>
                <button
                  id="close-subscription-btn"
                  onClick={() => setSelectedPlan(null)}
                  className="text-[#2D2727]/40 hover:text-[#2D2727] text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Configurations Fields */}
              <div className="space-y-5">
                
                {/* 1. Billing Cycle Choice */}
                <div>
                  <label className="text-xs font-bold text-[#2D2727] uppercase tracking-wider block mb-2 font-mono">
                    📆 Select Billing Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="sub-cycle-weekly"
                      onClick={() => setBillingCycle('weekly')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        billingCycle === 'weekly'
                          ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                          : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                      }`}
                    >
                      <span className="block text-xs font-bold text-[#2D2727]">Weekly Plan</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">₹{selectedPlan.pricePerWeek} per week</span>
                    </button>
                    <button
                      id="sub-cycle-monthly"
                      onClick={() => setBillingCycle('monthly')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        billingCycle === 'monthly'
                          ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                          : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span className="text-xs font-bold text-[#2D2727]">Monthly Plan</span>
                        <span className="bg-[#557A46] text-white text-[8px] font-bold px-1 rounded">SAVE 10%</span>
                      </div>
                      <span className="block text-[10px] text-gray-400 mt-0.5">₹{selectedPlan.pricePerMonth} per month</span>
                    </button>
                  </div>
                </div>

                {/* 2. Delivery Time Slot */}
                <div>
                  <label className="text-xs font-bold text-[#2D2727] uppercase tracking-wider block mb-2 font-mono">
                    🕒 Select Delivery Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      id="sub-slot-lunch"
                      onClick={() => setDeliverySlot('lunch')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        deliverySlot === 'lunch'
                          ? 'bg-[#C2593F] text-white border-transparent'
                          : 'bg-white text-[#2D2727]/70 border-[#C2593F]/10'
                      }`}
                    >
                      <span className="block text-xs font-bold">Lunch Box</span>
                      <span className="block text-[9px] opacity-85">12:00 PM - 1:30 PM</span>
                    </button>
                    <button
                      id="sub-slot-dinner"
                      onClick={() => setDeliverySlot('dinner')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        deliverySlot === 'dinner'
                          ? 'bg-[#C2593F] text-white border-transparent'
                          : 'bg-white text-[#2D2727]/70 border-[#C2593F]/10'
                      }`}
                    >
                      <span className="block text-xs font-bold">Dinner Box</span>
                      <span className="block text-[9px] opacity-85">7:30 PM - 9:00 PM</span>
                    </button>
                    <button
                      id="sub-slot-both"
                      onClick={() => setDeliverySlot('both')}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        deliverySlot === 'both'
                          ? 'bg-[#557A46] text-white border-transparent shadow'
                          : 'bg-white text-[#2D2727]/70 border-[#C2593F]/10'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-0.5">
                        <span className="text-xs font-bold">Lunch & Dinner</span>
                      </div>
                      <span className="block text-[9px] opacity-85">Combo Save 15%</span>
                    </button>
                  </div>
                </div>

                {/* 3. Delivery Days Config */}
                <div>
                  <label className="text-xs font-bold text-[#2D2727] uppercase tracking-wider block mb-2 font-mono">
                    🗓️ Select Delivery Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="sub-days-weekdays"
                      onClick={() => setDeliveryDays('weekdays')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        deliveryDays === 'weekdays'
                          ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                          : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                      }`}
                    >
                      <span className="block text-xs font-bold text-[#2D2727]">Monday to Friday</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Standard work days</span>
                    </button>
                    <button
                      id="sub-days-everyday"
                      onClick={() => setDeliveryDays('everyday')}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        deliveryDays === 'everyday'
                          ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                          : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                      }`}
                    >
                      <span className="block text-xs font-bold text-[#2D2727]">All 7 Days of the Week</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Includes weekends (+30% surcharge)</span>
                    </button>
                  </div>
                </div>

                {/* 4. Sattvik custom instructions */}
                {selectedPlan.diet !== 'jain' && (
                  <div className="bg-[#FFFDF6] border border-[#C2593F]/10 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#2D2727]">Prepare without Onion & Garlic</h4>
                      <p className="text-[10px] text-[#2D2727]/60 mt-0.5">
                        Modify curry bases to be completely Satvik for health or spiritual days.
                      </p>
                    </div>
                    <button
                      id="sub-satvik-toggle"
                      onClick={() => setCustomSatvik(!customSatvik)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        customSatvik ? 'bg-[#557A46]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          customSatvik ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

              </div>

              {/* Confirm Subscription Action Bar */}
              <div className="flex items-center justify-between border-t border-[#C2593F]/10 pt-4 mt-6">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Computed Subscription Rate</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-extrabold text-[#2D2727]">
                      ₹{calculateSubscriptionRate()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      / {billingCycle === 'weekly' ? 'week' : 'month'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    id="cancel-subscription-btn"
                    onClick={() => setSelectedPlan(null)}
                    className="px-4 py-2 border border-[#C2593F]/20 text-[#2D2727]/80 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-subscription-btn"
                    onClick={handleSubscribeConfirm}
                    className="px-6 py-2 bg-[#C2593F] hover:bg-[#C2593F]/90 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Add Subscription to Cart
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
