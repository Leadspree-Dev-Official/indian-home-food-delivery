import { useState } from 'react';
import { Meal, CuisineCategory, ChefProfile } from '../types';
import { MEALS, CHEFS } from '../data';
import { Search, Flame, Sparkles, Filter, Leaf, Shield, User, Soup } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuSectionProps {
  onAddToCart: (meal: Meal, spiceLevel: 'Mild' | 'Medium' | 'Hot', extraGhee: boolean, instructions: string) => void;
  onOpenChefModal: (chefId: string) => void;
  meals?: Meal[];
  chefs?: ChefProfile[];
}

export default function MenuSection({ onAddToCart, onOpenChefModal, meals = MEALS, chefs = CHEFS }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<CuisineCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [jainOnly, setJainOnly] = useState(false);
  const [ketoOnly, setKetoOnly] = useState(false);
  
  // Customization modal state
  const [selectedMealForCustomization, setSelectedMealForCustomization] = useState<Meal | null>(null);
  const [customSpice, setCustomSpice] = useState<'Mild' | 'Medium' | 'Hot'>('Medium');
  const [customGhee, setCustomGhee] = useState(true);
  const [customNotes, setCustomNotes] = useState('');

  // Categories list
  const categories: { id: CuisineCategory | 'all'; name: string }[] = [
    { id: 'all', name: 'All Specialties' },
    { id: 'north', name: 'North Indian' },
    { id: 'south', name: 'South Indian' },
    { id: 'east', name: 'East Bengali' },
    { id: 'west', name: 'West Indian' },
    { id: 'healthy', name: 'Vedic & Healthy' },
    { id: 'desserts', name: 'Mithai / Sweets' },
  ];

  // Filtering meals
  const filteredMeals = meals.filter((meal) => {
    const matchesCategory = activeCategory === 'all' || meal.category === activeCategory;
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          meal.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !vegOnly || meal.isVeg;
    const matchesJain = !jainOnly || meal.isJain;
    const matchesKeto = !ketoOnly || meal.isKeto;

    return matchesCategory && matchesSearch && matchesVeg && matchesJain && matchesKeto;
  });

  const handleOpenCustomizer = (meal: Meal) => {
    setSelectedMealForCustomization(meal);
    // Initialize default customizations based on meal properties
    setCustomSpice(meal.spicyLevel === 1 ? 'Mild' : meal.spicyLevel === 3 ? 'Hot' : 'Medium');
    setCustomGhee(meal.isVeg && meal.category !== 'healthy'); // default ghee for veg curries, no ghee for healthy/non-veg by default
    setCustomNotes('');
  };

  const handleConfirmAdd = () => {
    if (selectedMealForCustomization) {
      onAddToCart(selectedMealForCustomization, customSpice, customGhee, customNotes);
      setSelectedMealForCustomization(null);
    }
  };

  return (
    <section className="py-12 bg-[#FFFDF6]" id="menu-section">
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10" id="menu-header-text">
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-[#2D2727] tracking-tight">
            Today's Fresh <span className="text-[#C2593F]">Home Specials</span>
          </h2>
          <p className="text-sm sm:text-base text-[#2D2727]/60 mt-2">
            Dishes are hand-cooked in small batches on request. Savor authentic recipes seasoned with aromatic spices roasted right in home kitchens.
          </p>
        </div>

        {/* Search, Filter Toggles and Category Tabs */}
        <div className="space-y-6 mb-10" id="filters-container">
          
          {/* Top Bar: Search and Quick Dietary Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D2727]/40" />
              <input
                id="search-input"
                type="text"
                placeholder="Search home food (e.g. paneer, dal, luchi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C2593F]/15 bg-white text-sm text-[#2D2727] focus:outline-none focus:ring-2 focus:ring-[#C2593F]/30"
              />
            </div>

            {/* Quick Dietary Filter Tags */}
            <div className="flex flex-wrap items-center gap-2" id="dietary-filters">
              <span className="text-xs font-mono font-bold text-[#2D2727]/50 uppercase tracking-wider flex items-center mr-1">
                <Filter className="h-3 w-3 mr-1" /> Preferences:
              </span>
              
              {/* Veg Only */}
              <button
                id="filter-veg"
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  vegOnly
                    ? 'bg-[#557A46]/10 text-[#557A46] border-[#557A46]/30'
                    : 'bg-white text-[#2D2727]/70 border-[#C2593F]/15 hover:border-[#C2593F]/30'
                }`}
              >
                <Leaf className="h-3.5 w-3.5" />
                <span>Pure Veg</span>
              </button>

              {/* Jain Friendly */}
              <button
                id="filter-jain"
                onClick={() => setJainOnly(!jainOnly)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  jainOnly
                    ? 'bg-[#E28743]/10 text-[#E28743] border-[#E28743]/30'
                    : 'bg-white text-[#2D2727]/70 border-[#C2593F]/15 hover:border-[#C2593F]/30'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>No Onion & Garlic</span>
              </button>

              {/* Keto Friendly */}
              <button
                id="filter-keto"
                onClick={() => setKetoOnly(!ketoOnly)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  ketoOnly
                    ? 'bg-[#C2593F]/10 text-[#C2593F] border-[#C2593F]/30'
                    : 'bg-white text-[#2D2727]/70 border-[#C2593F]/15 hover:border-[#C2593F]/30'
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>High Protein / Keto</span>
              </button>
            </div>

          </div>

          {/* Regional Cuisine Category Scrollable Tabs */}
          <div className="flex space-x-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#C2593F]/5" id="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#C2593F] text-white shadow-sm'
                    : 'bg-[#C2593F]/5 text-[#2D2727]/80 hover:bg-[#C2593F]/10 hover:text-[#C2593F]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

        </div>

        {/* Empty state when no items match filters */}
        {filteredMeals.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-3xl border border-[#C2593F]/10 p-8"
            id="menu-empty-state"
          >
            <Soup className="h-12 w-12 text-[#C2593F]/40 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#2D2727]">No Home Dishes Found</h3>
            <p className="text-sm text-[#2D2727]/50 mt-1 max-w-sm mx-auto">
              Our home cooks prepare specific custom items on different days. Try adjusting your search query or removing some dietary tags!
            </p>
            <button
              id="clear-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setVegOnly(false);
                setJainOnly(false);
                setKetoOnly(false);
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-[#C2593F]/10 text-[#C2593F] hover:bg-[#C2593F]/15 font-semibold text-xs rounded-xl transition-all"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}

        {/* Meals Grid Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 xs:gap-4 sm:gap-8" id="meals-grid">
          <AnimatePresence>
            {filteredMeals.map((meal) => {
              const chef = chefs.find(c => c.id === meal.chefId);
              return (
                <motion.div
                  key={meal.id}
                  id={`meal-card-${meal.id}`}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl xs:rounded-2xl border border-[#C2593F]/10 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full"
                >
                  
                  {/* Image and Food Category Badges */}
                  <div className="relative w-full aspect-[4/3] bg-amber-50 flex-none overflow-hidden">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Floating indicators (Veg/NonVeg) & popular */}
                    <div className="absolute top-2 left-2 xs:top-3 xs:left-3 flex items-center space-x-1.5 xs:space-x-2">
                      {/* Veg / Non-Veg Indicator Dot inside Box */}
                      <span className={`p-1 xs:p-1.5 rounded bg-white shadow-sm flex items-center justify-center border ${
                        meal.isVeg ? 'border-green-600' : 'border-red-600'
                      }`}>
                        <span className={`h-1.5 w-1.5 xs:h-2.5 xs:w-2.5 rounded-full ${
                          meal.isVeg ? 'bg-green-600' : 'bg-red-600'
                        }`} />
                      </span>

                      {/* Calorie badge */}
                      {meal.calories && (
                        <span className="bg-[#2D2727]/80 backdrop-blur-sm text-white text-[8px] xs:text-[10px] font-mono px-1.5 xs:px-2 py-0.5 xs:py-1 rounded font-semibold shadow-sm">
                          {meal.calories} kcal
                        </span>
                      )}
                    </div>

                    {/* Regional category sticker */}
                    <div className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 flex space-x-1">
                      {meal.isPopular && (
                        <span className="bg-[#E28743] text-white text-[8px] xs:text-[10px] font-bold px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md xs:rounded-lg shadow-sm uppercase tracking-wide flex items-center">
                          🔥 Best Seller
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-2.5 xs:p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    
                    <div>
                      {/* Title & Spice Level with consistent height */}
                      <div className="flex items-start justify-between min-h-[32px] xs:min-h-[40px] sm:min-h-[44px]">
                        <h3 className="font-sans font-bold text-xs xs:text-sm sm:text-base text-[#2D2727] tracking-tight leading-tight sm:leading-snug line-clamp-2">
                          {meal.name}
                        </h3>
                        <div className="flex items-center text-[#C2593F] ml-1 xs:ml-2 shrink-0 mt-0.5" title={`Spice level: ${meal.spicyLevel}`}>
                          {Array.from({ length: meal.spicyLevel }).map((_, i) => (
                            <Flame key={i} className="h-2.5 w-2.5 xs:h-3.5 xs:w-3.5 fill-current" />
                          ))}
                        </div>
                      </div>

                      {/* Chef Tag with consistent spacing and height */}
                      {chef && (
                        <div 
                          className="flex items-center space-x-1 xs:space-x-1.5 mt-1 xs:mt-2 h-5 xs:h-6 cursor-pointer group"
                          onClick={() => onOpenChefModal(chef.id)}
                          title="View Chef Profile"
                        >
                          <img
                            src={chef.avatar}
                            alt={chef.name}
                            className="h-4 w-4 xs:h-5 xs:w-5 rounded-full object-cover border border-[#C2593F]/20"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[9px] xs:text-[11px] font-semibold text-[#C2593F] group-hover:underline flex items-center truncate">
                            By {chef.name.split(' ')[0]} <span className="text-gray-400 font-normal ml-0.5">★ {chef.rating}</span>
                          </span>
                        </div>
                      )}

                      {/* Description with consistent height */}
                      <div className="min-h-[28px] xs:min-h-[34px] sm:min-h-[38px] mt-1.5 xs:mt-3">
                        <p className="text-[10px] xs:text-xs text-[#2D2727]/60 leading-tight xs:leading-relaxed line-clamp-2">
                          {meal.description}
                        </p>
                      </div>

                      {/* Tag indicators with consistent height and gray uniform styling to match screenshot */}
                      <div className="flex flex-wrap gap-1 xs:gap-1.5 mt-2 xs:mt-3.5 min-h-[16px] xs:min-h-[22px]">
                        {meal.isJain && (
                          <span className="bg-[#2D2727]/5 text-[#2D2727]/50 text-[8px] xs:text-[9px] font-bold px-1.5 xs:px-2 py-0.5 rounded font-mono uppercase tracking-wide">
                            Satvik
                          </span>
                        )}
                        {meal.isKeto && (
                          <span className="bg-[#2D2727]/5 text-[#2D2727]/50 text-[8px] xs:text-[9px] font-bold px-1.5 xs:px-2 py-0.5 rounded font-mono uppercase tracking-wide">
                            Keto
                          </span>
                        )}
                        <span className="bg-[#2D2727]/5 text-[#2D2727]/50 text-[8px] xs:text-[9px] font-bold px-1.5 xs:px-2 py-0.5 rounded font-mono uppercase tracking-wide truncate max-w-full">
                          {meal.category === 'north' ? 'North' :
                           meal.category === 'south' ? 'South' :
                           meal.category === 'east' ? 'Bengali' :
                           meal.category === 'west' ? 'West' :
                           meal.category === 'healthy' ? 'Healthy' :
                           meal.category === 'desserts' ? 'Mithai' : `${(meal.category as string).toUpperCase()}`}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & CTA - Clean layout matching screenshot */}
                    <div className="flex items-center justify-between mt-3 xs:mt-5">
                      <div>
                        <span className="text-[8px] xs:text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5 leading-none">Price</span>
                        <span className="text-sm xs:text-base sm:text-xl font-extrabold text-[#2D2727] leading-none">
                          ₹{meal.price}
                        </span>
                      </div>

                      <button
                        id={`add-meal-btn-${meal.id}`}
                        onClick={() => handleOpenCustomizer(meal)}
                        className="px-2 xs:px-4 sm:px-5 py-1.5 xs:py-2 sm:py-2.5 bg-[#C2593F] hover:bg-[#C2593F]/90 text-white rounded-lg xs:rounded-xl text-[10px] xs:text-xs font-bold transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        <span className="xs:hidden">+ Add</span>
                        <span className="hidden xs:inline">Add & Customize</span>
                      </button>
                    </div>

                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* Interactive Customization Overlay Modal */}
      <AnimatePresence>
        {selectedMealForCustomization && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="customization-modal-container">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMealForCustomization(null)}
              className="absolute inset-0 bg-[#2D2727]/60 backdrop-blur-sm"
              id="customization-backdrop"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md bg-[#FFFDF6] rounded-3xl border border-[#C2593F]/10 overflow-hidden shadow-2xl p-5 sm:p-6"
              id="customization-content"
            >
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#C2593F]/10 pb-4 mb-4">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      selectedMealForCustomization.isVeg ? 'bg-green-600' : 'bg-red-600'
                    }`} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Homestyle Food Customizer</span>
                  </div>
                  <h3 className="font-sans font-extrabold text-xl text-[#2D2727] mt-1 tracking-tight">
                    {selectedMealForCustomization.name}
                  </h3>
                </div>
                <button
                  id="close-customizer-btn"
                  onClick={() => setSelectedMealForCustomization(null)}
                  className="text-[#2D2727]/40 hover:text-[#2D2727] text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-5">
                
                {/* 1. Spice Level Selection */}
                <div>
                  <label className="text-xs font-bold text-[#2D2727] uppercase tracking-wider block mb-2 font-mono">
                    🌶️ Adjust Spice Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Mild', 'Medium', 'Hot'] as const).map((level) => (
                      <button
                        key={level}
                        id={`spice-btn-${level.toLowerCase()}`}
                        onClick={() => setCustomSpice(level)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          customSpice === level
                            ? 'bg-[#C2593F] text-white border-transparent shadow-sm'
                            : 'bg-white text-[#2D2727]/70 border-[#C2593F]/15 hover:border-[#C2593F]/30'
                        }`}
                      >
                        {level === 'Mild' ? 'Mild 🌶️' : level === 'Medium' ? 'Medium 🌶️🌶️' : 'Indian Hot 🌶️🌶️🌶️'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#2D2727]/50 mt-1.5">
                    {customSpice === 'Mild' && 'Kid friendly. Cooked with very low chilli and light spices.'}
                    {customSpice === 'Medium' && 'Default homestyle spice levels using fresh green chillies.'}
                    {customSpice === 'Hot' && 'Rich and hot, seasoned with stone-ground red chilli powder.'}
                  </p>
                </div>

                {/* 2. Ghee / Cooking Oil Preference */}
                {selectedMealForCustomization.isVeg && (
                  <div className="bg-[#FFFDF6] border border-[#C2593F]/10 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#2D2727] flex items-center">
                        <Leaf className="h-3.5 w-3.5 text-[#557A46] mr-1" />
                        Ghee Tempering
                      </h4>
                      <p className="text-[10px] text-[#2D2727]/60 mt-0.5">
                        Finish curry with a dollop of pure aroma Desi Cow Ghee.
                      </p>
                    </div>
                    <button
                      id="ghee-toggle-btn"
                      onClick={() => setCustomGhee(!customGhee)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        customGhee ? 'bg-[#557A46]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          customGhee ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* 3. Special Mom Chef Instructions */}
                <div>
                  <label className="text-xs font-bold text-[#2D2727] uppercase tracking-wider block mb-2 font-mono">
                    ✍️ Mom Chef Special Request
                  </label>
                  <textarea
                    id="custom-instructions-text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="E.g., Make it very low-salt, or don't add coriander..."
                    maxLength={140}
                    className="w-full h-20 p-3 rounded-2xl border border-[#C2593F]/15 bg-white text-xs text-[#2D2727] placeholder-[#2D2727]/30 focus:outline-none focus:ring-2 focus:ring-[#C2593F]/20 resize-none"
                  />
                  <div className="flex justify-between text-[10px] text-[#2D2727]/40 mt-1">
                    <span>Just like telling your mother!</span>
                    <span>{customNotes.length}/140</span>
                  </div>
                </div>

              </div>

              {/* Confirm Bottom Bar */}
              <div className="flex items-center justify-between border-t border-[#C2593F]/10 pt-4 mt-6">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Final Price</span>
                  <span className="text-2xl font-extrabold text-[#2D2727]">
                    ₹{selectedMealForCustomization.price}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    id="cancel-customizer-btn"
                    onClick={() => setSelectedMealForCustomization(null)}
                    className="px-4 py-2 border border-[#C2593F]/20 text-[#2D2727]/80 rounded-xl text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-customizer-btn"
                    onClick={handleConfirmAdd}
                    className="px-6 py-2 bg-[#C2593F] hover:bg-[#C2593F]/90 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Add to Cart
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
