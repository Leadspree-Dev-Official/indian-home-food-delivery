import { useState, FormEvent } from 'react';
import { User, Phone, MapPin, Sparkles, CheckCircle2, Store, Palette } from 'lucide-react';
import { motion } from 'motion/react';
import { VisitorInfo } from '../types';

interface VisitorOnboardingProps {
  onSave: (info: VisitorInfo) => void;
  initialInfo?: VisitorInfo | null;
  onClose?: () => void;
  isDismissable?: boolean;
  userToken?: string;
  submittedAt?: number | null;
}

const COLOR_PRESETS = [
  { hex: '#C2593F', label: 'Classic Terracotta', desc: 'Warm & home-style' },
  { hex: '#557A46', label: 'Garden Green', desc: 'Healthy & organic' },
  { hex: '#E28743', label: 'Orange Saffron', desc: 'Spiced & energetic' },
  { hex: '#7A3E5D', label: 'Beet Burgundy', desc: 'Exotic & gourmet' },
  { hex: '#1E4E54', label: 'Coastal Teal', desc: 'Modern & refreshing' },
  { hex: '#2D2727', label: 'Charcoal Black', desc: 'Premium bistro look' },
];

export default function VisitorOnboarding({
  onSave,
  initialInfo,
  onClose,
  isDismissable = false,
  userToken,
  submittedAt,
}: VisitorOnboardingProps) {
  const [name, setName] = useState(initialInfo?.name || '');
  const [businessName, setBusinessName] = useState(initialInfo?.businessName || '');
  const [phone, setPhone] = useState(initialInfo?.phone || '');
  const [address, setAddress] = useState(initialInfo?.address || '');
  const [brandColor, setBrandColor] = useState(initialInfo?.brandColor || '#C2593F');
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const getRemainingTimeString = () => {
    if (!submittedAt) return null;
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const elapsed = Date.now() - submittedAt;
    const remaining = THREE_HOURS_MS - elapsed;
    if (remaining <= 0) return 'Resetting...';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const remainingTimeStr = getRemainingTimeString();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('🍳 Please enter your name as the owner/chef!');
      return;
    }
    if (!businessName.trim()) {
      setError('🏢 Please enter your Business/Kitchen Name to brand your website!');
      return;
    }
    if (!phone.trim()) {
      setError('📞 A mobile number is required so clients can contact your kitchen!');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('📞 Please enter a valid 10-digit contact number.');
      return;
    }
    if (!address.trim()) {
      setError('📍 Please share your kitchen location/address for delivery simulation.');
      return;
    }

    setError('');
    onSave({
      name: name.trim(),
      businessName: businessName.trim(),
      phone: cleanPhone,
      address: address.trim(),
      brandColor,
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-[#2D2727]/80 backdrop-blur-md"
      id="visitor-onboarding-overlay"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 180 }}
        className="relative w-full max-w-xl bg-[#FFFDF6] border border-[#C2593F]/15 rounded-3xl p-6 sm:p-8 shadow-2xl my-8"
        id="visitor-onboarding-card"
      >
        {/* Close Button if dismissable */}
        {isDismissable && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#2D2727]/40 hover:text-[#2D2727] font-bold text-sm w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            id="visitor-onboarding-close"
          >
            ✕
          </button>
        )}

        {/* Decorative Header */}
        <div className="text-center space-y-3 mb-6">
          <div 
            className="inline-flex items-center justify-center p-3 rounded-2xl shadow-inner mb-1 transition-colors"
            style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
          >
            <Store className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-[#2D2727] tracking-tight">
            Design Your Brand Demo! ✨
          </h2>
          <p className="text-xs sm:text-sm text-[#2D2727]/70 leading-relaxed max-w-md mx-auto">
            Are you a <span className="font-semibold text-[#2D2727]">home kitchen or food delivery owner</span>? Enter your details below to instantly transform this entire platform into your fully customized online brand!
          </p>
        </div>

        {/* 3-Hour Auto-Reset Information Notice */}
        <div className="mb-5 p-3 rounded-2xl bg-[#E28743]/10 border border-[#E28743]/25 text-xs font-medium text-[#2D2727] flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="shrink-0 text-base">⏱️</span>
            <span className="truncate">
              {initialInfo ? (
                <span>
                  <strong className="text-[#2D2727] font-bold">Form Active:</strong> Opens on every visit & resets every 3 hours.
                </span>
              ) : (
                <span>
                  <strong className="text-[#2D2727] font-bold">Session Policy:</strong> Form opens on visit and auto-resets after 3 hours.
                </span>
              )}
            </span>
          </div>
          {remainingTimeStr && (
            <span className="px-2 py-0.5 rounded-lg bg-[#E28743] text-white font-mono font-bold text-[10px] shrink-0 shadow-xs">
              Resets in {remainingTimeStr}
            </span>
          )}
        </div>

        {/* Error notification block */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-start space-x-2"
            id="onboarding-error-banner"
          >
            <span className="shrink-0">⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}

        {/* Personalization Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="visitor-form">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Owner Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2727]/75 uppercase tracking-wider block">
                Owner / Head Chef Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D2727]/40" />
                <input
                  type="text"
                  id="visitor-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Chef Preeti Das"
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color,#C2593F)]/20 focus:border-[var(--brand-color,#C2593F)] transition-all text-[#2D2727]"
                />
              </div>
            </div>

            {/* Business / Brand Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2727]/75 uppercase tracking-wider block">
                Your Business / Kitchen Name *
              </label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D2727]/40" />
                <input
                  type="text"
                  id="visitor-business-name-input"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Preeti's Kitchen"
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color,#C2593F)]/20 focus:border-[var(--brand-color,#C2593F)] transition-all text-[#2D2727]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Owner Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2727]/75 uppercase tracking-wider block">
                Mobile / WhatsApp Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D2727]/40" />
                <input
                  type="tel"
                  id="visitor-phone-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 9876543210"
                  maxLength={15}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color,#C2593F)]/20 focus:border-[var(--brand-color,#C2593F)] transition-all text-[#2D2727]"
                />
              </div>
            </div>

            {/* Owner Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D2727]/75 uppercase tracking-wider block">
                Kitchen Address / Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D2727]/40" />
                <input
                  type="text"
                  id="visitor-address-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., Sector 15, Dwarka, New Delhi"
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-color,#C2593F)]/20 focus:border-[var(--brand-color,#C2593F)] transition-all text-[#2D2727]"
                />
              </div>
            </div>
          </div>

          {/* Color Presets & Custom Color Wheel */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center space-x-1.5">
              <Palette className="h-4 w-4 text-[#2D2727]/60" />
              <label className="text-xs font-bold text-[#2D2727]/75 uppercase tracking-wider block">
                Choose Your Brand Theme Color *
              </label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = brandColor === preset.hex;
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setBrandColor(preset.hex)}
                    className={`p-2.5 text-left rounded-2xl border transition-all flex items-center space-x-2.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-white shadow-md scale-[1.02]' 
                        : 'bg-white/50 border-gray-100 hover:border-gray-200'
                    }`}
                    style={{ borderColor: isSelected ? preset.hex : undefined }}
                  >
                    <div 
                      className="h-5 w-5 rounded-lg shrink-0 border border-black/5"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-[#2D2727] truncate">
                        {preset.label}
                      </div>
                      <div className="text-[9px] text-[#2D2727]/55 leading-none mt-0.5 truncate">
                        {preset.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Wheel Selector */}
            <div 
              className={`p-3 rounded-2xl border bg-white/70 flex items-center justify-between gap-3 transition-all mt-2.5 ${
                !COLOR_PRESETS.some(p => p.hex === brandColor) 
                  ? 'border-[var(--brand-color,#C2593F)] bg-white shadow-md' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
              style={{ borderColor: !COLOR_PRESETS.some(p => p.hex === brandColor) ? brandColor : undefined }}
              id="custom-color-wheel-card"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {/* Conic Gradient Color Wheel Circle */}
                <div 
                  className="relative h-9 w-9 rounded-full shrink-0 border border-black/10 shadow-sm flex items-center justify-center overflow-hidden"
                  style={{ background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)' }}
                >
                  {/* Inner ring displaying selected custom brand color */}
                  <div className="absolute inset-1 rounded-full bg-[#FFFDF6] flex items-center justify-center">
                    <div 
                      className="h-5 w-5 rounded-full border border-black/5 transition-colors duration-150"
                      style={{ backgroundColor: brandColor }}
                    />
                  </div>
                  {/* Invisible Native Color Input overlaying the wheel */}
                  <input 
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Click the color wheel to select any custom color!"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-[#2D2727] flex items-center space-x-1.5">
                    <span>Custom Color Wheel</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/10 text-amber-700">Any Color</span>
                  </div>
                  <div className="text-[10px] text-[#2D2727]/55 leading-none mt-1 font-mono uppercase tracking-wider">
                    Selected: {brandColor}
                  </div>
                </div>
              </div>
              
              <div className="relative shrink-0">
                <button
                  type="button"
                  className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#2D2727]/70 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center space-x-1 shadow-sm relative pointer-events-none"
                >
                  <span>Select Color</span>
                </button>
                {/* Overlay input for button click as well */}
                <input 
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Click to open full-spectrum color picker"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
            <button
              type="submit"
              id="save-visitor-details-btn"
              className="flex-1 w-full py-3.5 text-white rounded-2xl font-bold text-sm shadow-lg transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer hover:brightness-95"
              style={{ 
                backgroundColor: brandColor,
                shadowColor: `${brandColor}30`
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Launch My Customized Brand! ✨</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                id="skip-onboarding-btn"
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-gray-100 text-[#2D2727]/70 hover:text-[#2D2727] font-bold text-sm rounded-2xl border border-gray-200 transition-all flex items-center justify-center cursor-pointer"
              >
                <span>Skip & View Default</span>
              </button>
            )}
          </div>
        </form>

        {/* Footer Trust Brand message */}
        <div className="mt-5 pt-4 border-t border-[#2D2727]/5 flex items-center justify-center space-x-2 text-[10px] text-[#2D2727]/50 font-medium">
          <span>🔒 Works in sandbox / demo mode</span>
          <span>•</span>
          <span>🎨 Real-time color & brand visualizer</span>
        </div>
      </motion.div>
    </div>
  );
}
