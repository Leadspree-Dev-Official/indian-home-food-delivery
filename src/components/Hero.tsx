import { useState, useEffect, MouseEvent } from 'react';
import { Sparkles, ShieldCheck, Soup, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VisitorInfo } from '../types';

interface HeroProps {
  onBrowseMenu: () => void;
  onExploreTiffin: () => void;
  visitorInfo: VisitorInfo | null;
  onOpenOnboarding: () => void;
}

const CAROUSEL_SLIDES = [
  {
    title: "Authentic North Indian Thali",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800",
    status: "Hot Delivery Active",
    quote: "Tadka dal is simmering!",
    orders: "Cooking 24 orders today",
    chefName: "Chef Anita S.",
    chefImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    title: "Slow-cooked Kashmiri Rogan Josh",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800",
    status: "Fresh Batch Ready",
    quote: "Aromatic spices fully infused.",
    orders: "18 orders in progress",
    chefName: "Chef Meenakshi",
    chefImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    title: "Handcrafted Hyderabadi Biryani",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800",
    status: "Highly Requested",
    quote: "Dum-cooked with saffron layers.",
    orders: "35 orders delivered today",
    chefName: "Chef Farida",
    chefImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=100&h=100",
  },
  {
    title: "Stuffed Paneer Paratha & Chole",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=800",
    status: "Lunch Special",
    quote: "Served with homemade butter!",
    orders: "40+ active subscriptions",
    chefName: "Chef Preeti Das",
    chefImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
  }
];

export default function Hero({ onBrowseMenu, onExploreTiffin, visitorInfo, onOpenOnboarding }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = (e: MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const handleNext = (e: MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#C2593F]/5 to-[#FFFDF6] py-12 sm:py-20" id="hero-section">
      {/* Decorative organic shapes */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#E28743]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 rounded-full bg-[#557A46]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content Area */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left" id="hero-text-content">
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#C2593F]/10 border border-[#C2593F]/20 text-[#C2593F] text-xs font-semibold uppercase tracking-wider"
              id="hero-badge"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>100% Authentic Indian Homestyle Cooked</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold text-[#2D2727] tracking-tight leading-none"
              id="hero-title"
            >
              Ghar ka Swaad,<br />
              <span className="text-[#C2593F]">Mother's Love</span>, <br className="sm:hidden" />
              Delivered Fresh.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#2D2727]/75 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              id="hero-description"
            >
              Ditch the commercial restaurant oils and heavy preservatives. Relish nutritious, hygienic, slow-cooked meals made by certified local home chefs in your neighborhood.
            </motion.p>

            {/* Call to Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4"
              id="hero-ctas"
            >
              <button
                id="hero-view-menu-btn"
                onClick={onBrowseMenu}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-white bg-[#C2593F] hover:bg-[#C2593F]/90 font-semibold text-base shadow-lg shadow-[#C2593F]/20 hover:shadow-xl transition-all duration-200 cursor-pointer text-center"
              >
                Order Today's Specials
              </button>
              <button
                id="hero-view-tiffin-btn"
                onClick={onExploreTiffin}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-[#2D2727] bg-[#FFFDF6] border-2 border-[#C2593F]/20 hover:bg-[#C2593F]/5 font-semibold text-base transition-colors duration-200 cursor-pointer text-center"
              >
                Subscribe to Daily Tiffins
              </button>
            </motion.div>

            {/* Trust Factors / Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-4 border-t border-[#C2593F]/10 text-left"
              id="hero-trust-factors"
            >
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 rounded-lg bg-[#557A46]/10 text-[#557A46] mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D2727]">FSSAI Approved</h4>
                  <p className="text-[10px] text-[#2D2727]/60">100% Home Sanitized</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 rounded-lg bg-[#E28743]/10 text-[#E28743] mt-0.5">
                  <Leaf className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D2727]">Pure & Simple</h4>
                  <p className="text-[10px] text-[#2D2727]/60">No Preservatives / MSG</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 rounded-lg bg-[#C2593F]/10 text-[#C2593F] mt-0.5">
                  <Soup className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D2727]">Small Batches</h4>
                  <p className="text-[10px] text-[#2D2727]/60">Cooked to order</p>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Graphics / Image Area */}
          <div className="lg:col-span-5 flex justify-center pt-8 lg:pt-0" id="hero-graphic-area">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[420px] aspect-square"
            >
              {/* Spinning background decorative ring */}
              <div className="absolute inset-0 border-2 border-dashed border-[#E28743]/20 rounded-full animate-spin [animation-duration:80s] pointer-events-none" />
              
              {/* Main Rounded Image Carousel */}
              <div className="absolute inset-4 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#FFFDF6] bg-amber-50 group/carousel">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    src={CAROUSEL_SLIDES[currentSlide].image}
                    alt={CAROUSEL_SLIDES[currentSlide].title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    id="hero-main-img"
                  />
                </AnimatePresence>

                {/* Carousel Navigation Overlay */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#2D2727] shadow-md border border-[#C2593F]/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 cursor-pointer"
                  title="Previous food specialty"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#2D2727] shadow-md border border-[#C2593F]/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 cursor-pointer"
                  title="Next food specialty"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                  {CAROUSEL_SLIDES.map((_, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentSlide ? 'w-4 bg-[var(--brand-color,#C2593F)]' : 'w-1.5 bg-white/50 hover:bg-white'
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Chef Note Card */}
              <motion.div
                key={`chef-${currentSlide}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute -bottom-2 -left-4 sm:-left-8 bg-[#FFFDF6] p-3 sm:p-3.5 rounded-2xl border border-[var(--brand-color,#C2593F)]/10 shadow-lg flex items-center space-x-3 max-w-[190px] sm:max-w-[230px]"
                id="hero-floating-card-1"
              >
                <div className="relative shrink-0">
                  <img
                    src={CAROUSEL_SLIDES[currentSlide].chefImage}
                    alt={CAROUSEL_SLIDES[currentSlide].chefName}
                    className="w-9 h-9 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[11px] font-bold text-[#2D2727] truncate">{CAROUSEL_SLIDES[currentSlide].chefName}</h5>
                  <p className="text-[9px] text-[#557A46] font-semibold truncate">{CAROUSEL_SLIDES[currentSlide].orders}</p>
                  <p className="text-[9px] text-[#2D2727]/60 italic truncate">"{CAROUSEL_SLIDES[currentSlide].quote}"</p>
                </div>
              </motion.div>

              {/* Floating Trust Badge */}
              <motion.div
                key={`status-${currentSlide}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute -top-2 -right-4 bg-[#FFFDF6] px-3 py-1.5 rounded-xl border border-[#557A46]/20 shadow-md flex items-center space-x-1.5 text-[11px] font-semibold text-[#557A46]"
                id="hero-floating-card-2"
              >
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping" />
                <span>{CAROUSEL_SLIDES[currentSlide].status}</span>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
