import { useState, useEffect } from 'react';
import { THALI_OPTIONS } from '../data';
import { Utensils, Check, HelpCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThaliBuilderProps {
  onAddThaliToCart: (
    name: string,
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
  ) => void;
  triggerToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function ThaliBuilder({ onAddThaliToCart, triggerToast }: ThaliBuilderProps) {
  // Selections state
  const [selectedDal, setSelectedDal] = useState(THALI_OPTIONS.dals[0]);
  const [selectedCurry1, setSelectedCurry1] = useState(THALI_OPTIONS.curries[0]); // Paneer
  const [selectedCurry2, setSelectedCurry2] = useState(THALI_OPTIONS.curries[1]); // Aloo
  const [selectedRice, setSelectedRice] = useState(THALI_OPTIONS.rices[0]);
  const [selectedBread, setSelectedBread] = useState(THALI_OPTIONS.breads[0]);
  const [selectedSweet, setSelectedSweet] = useState(THALI_OPTIONS.sweets[0]);

  // Derived properties
  const [totalPrice, setTotalPrice] = useState(250); // Base platter flat discount rate
  const [isThaliVeg, setIsThaliVeg] = useState(true);

  // Re-calculate price and veg-status when selections change
  useEffect(() => {
    const rawSum = 
      selectedDal.price + 
      selectedCurry1.price + 
      selectedCurry2.price + 
      selectedRice.price + 
      selectedBread.price + 
      selectedSweet.price;
    
    // Give a bundled platter discount (save 15%)
    const bundledPrice = Math.round(rawSum * 0.85);
    setTotalPrice(bundledPrice);

    // Is there any non-veg ingredient?
    const nonVeg = !selectedDal.isVeg || !selectedCurry1.isVeg || !selectedCurry2.isVeg || !selectedRice.isVeg || !selectedBread.isVeg || !selectedSweet.isVeg;
    setIsThaliVeg(!nonVeg);
  }, [selectedDal, selectedCurry1, selectedCurry2, selectedRice, selectedBread, selectedSweet]);

  const handleAssembleAndAdd = () => {
    const componentNames = {
      dal: selectedDal.name,
      curry1: selectedCurry1.name,
      curry2: selectedCurry2.name,
      rice: selectedRice.name,
      bread: selectedBread.name,
      sweet: selectedSweet.name,
    };
    
    const thaliName = isThaliVeg 
      ? "My Custom Grand Royal Veg Thali" 
      : "My Custom Grand Royal Non-Veg Thali";

    onAddThaliToCart(thaliName, totalPrice, componentNames, isThaliVeg);
    
    // Visual celebratory alert / toast simulation or reset
    if (triggerToast) {
      triggerToast("✨ Your custom Royal Indian Thali has been added to the cart!", "success");
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-[#FFFDF6] to-[#C2593F]/5" id="thali-builder-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10" id="thali-header">
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E28743]/10 border border-[#E28743]/20 text-[#E28743] text-xs font-semibold mb-3"
          >
            <Sparkles className="h-3 w-3" />
            <span>Interactive Platter Customizer</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-[#2D2727] tracking-tight">
            Build Your Own <span className="text-[#C2593F]">Royal Thali</span>
          </h2>
          <p className="text-sm sm:text-base text-[#2D2727]/60 mt-2">
            Pick your favorite lentils, traditional curries, aromatic rice, hand-rolled breads, and home sweets. We assemble them fresh in a beautiful multi-partition platter.
          </p>
        </div>

        {/* Builder Workstation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="builder-workstation">
          
          {/* Left Column: Visual Platter Simulation (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white p-6 rounded-3xl border border-[#C2593F]/10 shadow-sm" id="visual-platter">
            <h3 className="text-xs font-bold text-[#2D2727]/50 uppercase tracking-widest mb-4 font-mono">
              Live Platter Preview
            </h3>

            {/* Platter Circle */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-[#E28743] to-[#C2593F] p-4 shadow-xl flex items-center justify-center border-4 border-amber-100">
              {/* Inner metallic rim */}
              <div className="absolute inset-2 border border-[#FFFDF6]/30 rounded-full" />
              
              {/* Center partition (Rice bowl) */}
              <motion.div 
                layout
                className="absolute z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-md border-2 border-amber-200 flex flex-col items-center justify-center text-center relative group"
              >
                <img src={selectedRice.image} className="absolute inset-0 w-full h-full object-cover brightness-[0.45] group-hover:brightness-50 transition-all duration-300" referrerPolicy="no-referrer" alt="Rice partition" />
                <div className="relative z-10 p-1.5">
                  <span className="text-[8px] uppercase font-bold text-amber-200 font-mono tracking-wider drop-shadow">Rice</span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-white leading-tight line-clamp-2 mt-0.5 drop-shadow">
                    {selectedRice.name}
                  </span>
                </div>
              </motion.div>

              {/* Surrounding Partition Bowls (Katoris) */}
              {/* 1. Dal (Top) */}
              <div className="absolute -top-1 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow border border-amber-200/50 flex flex-col items-center justify-center text-center relative group">
                <img src={selectedDal.image} className="absolute inset-0 w-full h-full object-cover brightness-[0.45] group-hover:brightness-50 transition-all duration-300" referrerPolicy="no-referrer" alt="Dal partition" />
                <div className="relative z-10 p-1">
                  <span className="text-[8px] uppercase font-bold text-amber-200 font-mono drop-shadow">Dal/Lentil</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
                    {selectedDal.name}
                  </span>
                </div>
              </div>

              {/* 2. Curry 1 (Top Right) */}
              <div className="absolute -right-1 top-12 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow border border-amber-200/50 flex flex-col items-center justify-center text-center relative group">
                <img src={selectedCurry1.image} className="absolute inset-0 w-full h-full object-cover brightness-[0.45] group-hover:brightness-50 transition-all duration-300" referrerPolicy="no-referrer" alt="Curry 1 partition" />
                <div className="relative z-10 p-1">
                  <span className="text-[8px] uppercase font-bold text-amber-200 font-mono drop-shadow">Main Curry</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
                    {selectedCurry1.name}
                  </span>
                </div>
              </div>

              {/* 3. Curry 2 (Bottom Right) */}
              <div className="absolute -right-1 bottom-12 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow border border-amber-200/50 flex flex-col items-center justify-center text-center relative group">
                <img src={selectedCurry2.image} className="absolute inset-0 w-full h-full object-cover brightness-[0.45] group-hover:brightness-50 transition-all duration-300" referrerPolicy="no-referrer" alt="Curry 2 partition" />
                <div className="relative z-10 p-1">
                  <span className="text-[8px] uppercase font-bold text-amber-200 font-mono drop-shadow">Second Curry</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
                    {selectedCurry2.name}
                  </span>
                </div>
              </div>

              {/* 4. Sweet / Yogurt (Bottom Left) */}
              <div className="absolute -left-1 bottom-12 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow border border-amber-200/50 flex flex-col items-center justify-center text-center relative group">
                <img src={selectedSweet.image} className="absolute inset-0 w-full h-full object-cover brightness-[0.45] group-hover:brightness-50 transition-all duration-300" referrerPolicy="no-referrer" alt="Sweet partition" />
                <div className="relative z-10 p-1">
                  <span className="text-[8px] uppercase font-bold text-amber-200 font-mono drop-shadow">Dessert / Side</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
                    {selectedSweet.name}
                  </span>
                </div>
              </div>

              {/* 5. Bread (Left) */}
              <div className="absolute -left-1 top-12 w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow border border-amber-200/50 flex flex-col items-center justify-center text-center relative group">
                <img src={selectedBread.image} className="absolute inset-0 w-full h-full object-cover brightness-[0.45] group-hover:brightness-50 transition-all duration-300" referrerPolicy="no-referrer" alt="Bread partition" />
                <div className="relative z-10 p-1">
                  <span className="text-[8px] uppercase font-bold text-amber-200 font-mono drop-shadow">Bread</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-white leading-tight line-clamp-2 drop-shadow">
                    {selectedBread.name}
                  </span>
                </div>
              </div>

            </div>

            {/* Platter Meta Details */}
            <div className="w-full mt-6 space-y-3 pt-4 border-t border-[#C2593F]/10">
              
              {/* Veg / Non veg and Savings Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${isThaliVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                  <span className="text-xs font-bold text-[#2D2727]">
                    {isThaliVeg ? 'Pure Veg Royal Combo' : 'Non-Veg Royal Combo'}
                  </span>
                </div>
                <span className="bg-[#557A46]/10 text-[#557A46] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  ⭐ 15% Platter Bundle Discount Applied!
                </span>
              </div>

              {/* Summary of selections */}
              <div className="bg-[#FFFDF6] p-3 rounded-xl border border-[#C2593F]/5 text-[11px] text-[#2D2727]/70 leading-relaxed">
                <strong>Platter Includes:</strong> {selectedDal.name}, {selectedCurry1.name}, {selectedCurry2.name} with {selectedRice.name}, {selectedBread.name}, and sweet finish {selectedSweet.name}.
              </div>

              {/* Price and Add button */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Platter Total</span>
                  <span className="text-2xl font-extrabold text-[#2D2727]">₹{totalPrice}</span>
                </div>
                <button
                  id="add-custom-thali-btn"
                  onClick={handleAssembleAndAdd}
                  className="px-6 py-3 bg-[#C2593F] hover:bg-[#C2593F]/90 text-white font-bold text-sm rounded-xl transition-all duration-150 cursor-pointer shadow-md flex items-center"
                >
                  <Utensils className="h-4 w-4 mr-1.5" />
                  Assemble & Add Platter
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Custom Selections Hub (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6" id="selections-hub">
            
            {/* 1. Pick a Lentil */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2593F]/10" id="thali-select-dal">
              <span className="text-xs font-bold text-[#C2593F] font-mono uppercase tracking-wider block mb-2.5">
                🥣 Step 1: Comforting Lentil / Dal
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {THALI_OPTIONS.dals.map((dal) => (
                  <button
                    key={dal.id}
                    id={`select-dal-${dal.id}`}
                    onClick={() => setSelectedDal(dal)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                      selectedDal.id === dal.id
                        ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                        : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                    }`}
                  >
                    <img
                      src={dal.image}
                      alt={dal.name}
                      className="h-8 w-8 rounded-lg object-cover border border-[#C2593F]/15 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-sans font-bold text-xs text-[#2D2727] block leading-tight truncate">
                        {dal.name}
                      </span>
                    </div>
                    {selectedDal.id === dal.id && <Check className="h-3.5 w-3.5 text-[#C2593F] shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pick Curry 1 */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2593F]/10" id="thali-select-curry1">
              <span className="text-xs font-bold text-[#C2593F] font-mono uppercase tracking-wider block mb-2.5">
                🍛 Step 2: Primary Curry
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {THALI_OPTIONS.curries.map((curry) => (
                  <button
                    key={curry.id}
                    id={`select-curry1-${curry.id}`}
                    onClick={() => setSelectedCurry1(curry)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                      selectedCurry1.id === curry.id
                        ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                        : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                    }`}
                  >
                    <img
                      src={curry.image}
                      alt={curry.name}
                      className="h-8 w-8 rounded-lg object-cover border border-[#C2593F]/15 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-sans font-bold text-xs text-[#2D2727] block leading-tight truncate">
                        {curry.name}
                      </span>
                      <span className="text-[9px] text-[#C2593F] mt-0.5 block font-medium">
                        {curry.isVeg ? '🥬 Veg' : '🍖 Non-Veg (+₹30)'}
                      </span>
                    </div>
                    {selectedCurry1.id === curry.id && <Check className="h-3.5 w-3.5 text-[#C2593F] shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Pick Curry 2 */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2593F]/10" id="thali-select-curry2">
              <span className="text-xs font-bold text-[#C2593F] font-mono uppercase tracking-wider block mb-2.5">
                🥬 Step 3: Second Homestyle Curry / Dry Sabzi
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {THALI_OPTIONS.curries.map((curry) => (
                  <button
                    key={curry.id}
                    id={`select-curry2-${curry.id}`}
                    onClick={() => setSelectedCurry2(curry)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                      selectedCurry2.id === curry.id
                        ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                        : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                    }`}
                  >
                    <img
                      src={curry.image}
                      alt={curry.name}
                      className="h-8 w-8 rounded-lg object-cover border border-[#C2593F]/15 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-sans font-bold text-xs text-[#2D2727] block leading-tight truncate">
                        {curry.name}
                      </span>
                      <span className="text-[9px] text-gray-400 mt-0.5 block font-medium">
                        {curry.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}
                      </span>
                    </div>
                    {selectedCurry2.id === curry.id && <Check className="h-3.5 w-3.5 text-[#C2593F] shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Pick a Rice Option */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2593F]/10" id="thali-select-rice">
              <span className="text-xs font-bold text-[#C2593F] font-mono uppercase tracking-wider block mb-2.5">
                🍚 Step 4: Fragrant Rice
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {THALI_OPTIONS.rices.map((rice) => (
                  <button
                    key={rice.id}
                    id={`select-rice-${rice.id}`}
                    onClick={() => setSelectedRice(rice)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                      selectedRice.id === rice.id
                        ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                        : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                    }`}
                  >
                    <img
                      src={rice.image}
                      alt={rice.name}
                      className="h-8 w-8 rounded-lg object-cover border border-[#C2593F]/15 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-sans font-bold text-xs text-[#2D2727] block leading-tight truncate">
                        {rice.name}
                      </span>
                    </div>
                    {selectedRice.id === rice.id && <Check className="h-3.5 w-3.5 text-[#C2593F] shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Pick Breads */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2593F]/10" id="thali-select-bread">
              <span className="text-xs font-bold text-[#C2593F] font-mono uppercase tracking-wider block mb-2.5">
                🫓 Step 5: Indian Breads
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {THALI_OPTIONS.breads.map((bread) => (
                  <button
                    key={bread.id}
                    id={`select-bread-${bread.id}`}
                    onClick={() => setSelectedBread(bread)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                      selectedBread.id === bread.id
                        ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                        : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                    }`}
                  >
                    <img
                      src={bread.image}
                      alt={bread.name}
                      className="h-8 w-8 rounded-lg object-cover border border-[#C2593F]/15 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-sans font-bold text-xs text-[#2D2727] block leading-tight truncate">
                        {bread.name}
                      </span>
                    </div>
                    {selectedBread.id === bread.id && <Check className="h-3.5 w-3.5 text-[#C2593F] shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Pick Sweet Accompaniment */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2593F]/10" id="thali-select-sweet">
              <span className="text-xs font-bold text-[#C2593F] font-mono uppercase tracking-wider block mb-2.5">
                🍯 Step 6: Mithai Sweet or Salad Side
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {THALI_OPTIONS.sweets.map((sweet) => (
                  <button
                    key={sweet.id}
                    id={`select-sweet-${sweet.id}`}
                    onClick={() => setSelectedSweet(sweet)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                      selectedSweet.id === sweet.id
                        ? 'bg-[#C2593F]/10 border-[#C2593F] shadow-sm'
                        : 'bg-white border-[#C2593F]/10 hover:border-[#C2593F]/30'
                    }`}
                  >
                    <img
                      src={sweet.image}
                      alt={sweet.name}
                      className="h-8 w-8 rounded-lg object-cover border border-[#C2593F]/15 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-sans font-bold text-xs text-[#2D2727] block leading-tight truncate">
                        {sweet.name}
                      </span>
                    </div>
                    {selectedSweet.id === sweet.id && <Check className="h-3.5 w-3.5 text-[#C2593F] shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
