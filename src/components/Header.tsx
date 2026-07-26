import { ShoppingBag, Utensils, CalendarDays, Compass, Award, User, Clock, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { VisitorInfo } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  hasActiveOrder: boolean;
  onOpenTracker: () => void;
  visitorInfo: VisitorInfo | null;
  onOpenOnboarding: () => void;
  onResetVisitor?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  hasActiveOrder,
  onOpenTracker,
  visitorInfo,
  onOpenOnboarding,
  onResetVisitor,
}: HeaderProps) {

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#FFFDF6]/95 backdrop-blur-md border-b border-[var(--brand-color,#C2593F)]/10 shadow-sm" id="main-header">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center cursor-pointer min-w-0 mr-1.5 sm:mr-4" onClick={() => setActiveTab('menu')} id="logo-container">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="h-9 w-9 sm:h-12 sm:w-12 flex items-center justify-center bg-[var(--brand-color,#C2593F)] text-white rounded-xl shadow-md mr-2 sm:mr-3 shrink-0"
            >
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
            <div className="min-w-0 flex flex-col justify-center">
              <span className="font-sans font-extrabold text-[14px] xs:text-base sm:text-2xl tracking-tight text-[#2D2727] block leading-tight" id="header-brand-title">
                {visitorInfo?.businessName ? (
                  <>
                    {visitorInfo.businessName.split(' ')[0]}
                    <span className="text-[var(--brand-color,#C2593F)]">
                      {visitorInfo.businessName.split(' ').slice(1).join(' ') ? ' ' + visitorInfo.businessName.split(' ').slice(1).join(' ') : ''}
                    </span>
                  </>
                ) : (
                  <>
                    Ghar<span className="text-[var(--brand-color,#C2593F)]">Bhojan</span>
                  </>
                )}
              </span>
              <span className="text-[7px] xs:text-[9px] sm:text-[10px] font-mono tracking-wider sm:tracking-widest text-[#E28743] uppercase block font-bold -mt-0.5 sm:-mt-1 whitespace-nowrap">
                {"MOM'S KITCHEN TO YOUR TABLE"}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2" id="desktop-nav">
            <button
              id="nav-menu"
              onClick={() => setActiveTab('menu')}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'menu'
                  ? 'bg-[var(--brand-color,#C2593F)] text-white shadow-sm'
                  : 'text-[#2D2727]/80 hover:text-[var(--brand-color,#C2593F)] hover:bg-[var(--brand-color,#C2593F)]/5'
              }`}
            >
              <Compass className="h-4 w-4 mr-1.5" />
              Daily Menu
            </button>
            <button
              id="nav-tiffin"
              onClick={() => setActiveTab('tiffin')}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'tiffin'
                  ? 'bg-[var(--brand-color,#C2593F)] text-white shadow-sm'
                  : 'text-[#2D2727]/80 hover:text-[var(--brand-color,#C2593F)] hover:bg-[var(--brand-color,#C2593F)]/5'
              }`}
            >
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Tiffin Subscriptions
            </button>
            <button
              id="nav-thali"
              onClick={() => setActiveTab('thali')}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'thali'
                  ? 'bg-[var(--brand-color,#C2593F)] text-white shadow-sm'
                  : 'text-[#2D2727]/80 hover:text-[var(--brand-color,#C2593F)] hover:bg-[var(--brand-color,#C2593F)]/5'
              }`}
            >
              <Utensils className="h-4 w-4 mr-1.5" />
              Build a Thali
            </button>
            <button
              id="nav-chefs"
              onClick={() => setActiveTab('chefs')}
              className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === 'chefs'
                  ? 'bg-[var(--brand-color,#C2593F)] text-white shadow-sm'
                  : 'text-[#2D2727]/80 hover:text-[var(--brand-color,#C2593F)] hover:bg-[var(--brand-color,#C2593F)]/5'
              }`}
            >
              <Award className="h-4 w-4 mr-1.5" />
              Our Home Chefs
            </button>
          </nav>

          {/* Action Area */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0" id="header-actions">
            {/* Active Order Tracker Button */}
            {hasActiveOrder && (
              <motion.button
                id="header-tracker-btn"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenTracker}
                className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-auto sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#557A46] text-white hover:bg-[#557A46]/90 shadow-md animate-pulse shrink-0"
                title="Track Active Order"
              >
                <Clock className="h-4 w-4 sm:mr-1.5 shrink-0" />
                <span className="hidden sm:inline">Track Order</span>
              </motion.button>
            )}

            {/* Cart Button */}
            <motion.button
              id="header-cart-btn"
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCart}
              className="relative h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center bg-[#FFFDF6] border border-[var(--brand-color,#C2593F)]/20 text-[#2D2727] rounded-xl hover:bg-[var(--brand-color,#C2593F)]/5 transition-colors cursor-pointer shadow-sm shrink-0"
              title="View Cart"
            >
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--brand-color,#C2593F)]" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-[var(--brand-color,#C2593F)] text-white font-mono text-[9px] sm:text-[10px] font-bold h-4 w-4 sm:h-5 sm:w-5 rounded-full flex items-center justify-center border-2 border-[#FFFDF6]"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* Reset to default website */}
            {visitorInfo && onResetVisitor && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onResetVisitor}
                className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/50 rounded-xl transition-colors cursor-pointer shadow-sm shrink-0"
                title="Reset to default brand (GharBhojan)"
                id="header-reset-brand-btn"
              >
                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </motion.button>
            )}

            {/* Profile Badge */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenOnboarding}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-[#E28743]/10 border border-[#E28743]/20 flex items-center justify-center text-[#E28743] hover:bg-[#E28743]/15 transition-colors cursor-pointer shrink-0"
              id="header-profile-anonymous"
              title={visitorInfo ? `Customize your brand: ${visitorInfo.businessName}` : "Design your brand"}
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.button>
          </div>

        </div>
      </div>

      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF6]/95 backdrop-blur-lg border-t border-[var(--brand-color,#C2593F)]/10 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] flex justify-around items-center h-[68px] md:hidden px-4 pb-1" id="mobile-bottom-nav">
        {[
          { id: 'menu', label: 'Daily Menu', icon: Compass },
          { id: 'tiffin', label: 'Tiffins', icon: CalendarDays },
          { id: 'thali', label: 'Thali Builder', icon: Utensils },
          { id: 'chefs', label: 'Our Chefs', icon: Award },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              id={`mobile-nav-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.92 }}
              className="relative flex flex-col items-center justify-center py-2 px-3.5 rounded-2xl h-[48px] min-w-[72px] transition-all duration-200 cursor-pointer overflow-hidden"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-active-tab-indicator"
                  className="absolute inset-0 bg-[var(--brand-color,#C2593F)]/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              
              <div className={`relative z-10 flex flex-col items-center justify-center ${isActive ? 'text-[var(--brand-color,#C2593F)]' : 'text-[#2D2727]/50'}`}>
                <IconComponent className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className="text-[9px] font-bold tracking-tight mt-1">{tab.label}</span>
              </div>
            </motion.button>
          );
        })}
      </nav>
    </>
  );
}
