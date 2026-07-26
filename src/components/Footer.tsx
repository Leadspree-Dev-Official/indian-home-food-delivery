import { Utensils, Heart, Mail, Phone, ShieldCheck } from 'lucide-react';
import { VisitorInfo } from '../types';

interface FooterProps {
  visitorInfo: VisitorInfo | null;
  userToken?: string;
  triggerToast?: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function Footer({ visitorInfo, userToken, triggerToast }: FooterProps) {
  const brandName = visitorInfo?.businessName || 'GharBhojan';
  const ownerName = visitorInfo?.name || 'GharBhojan team';

  return (
    <footer className="bg-[#2D2727] text-white/90 border-t border-white/5 py-12" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12" id="footer-grid">
          
          {/* Brand block (md:col-span-5) */}
          <div className="md:col-span-5 space-y-4" id="footer-brand-info">
            <div className="flex items-center">
              <div className="p-2 bg-[var(--brand-color,#C2593F)] text-white rounded-xl mr-3 shadow">
                <Utensils className="h-5 w-5" />
              </div>
              <span className="font-sans font-extrabold text-xl tracking-tight text-white">
                {visitorInfo?.businessName ? (
                  <>
                    {visitorInfo.businessName.split(' ')[0]}
                    <span className="text-[var(--brand-color,#E28743)]">
                      {visitorInfo.businessName.split(' ').slice(1).join(' ') ? ' ' + visitorInfo.businessName.split(' ').slice(1).join(' ') : ''}
                    </span>
                  </>
                ) : (
                  <>
                    Ghar<span className="text-[#E28743]">Bhojan</span>
                  </>
                )}
              </span>
            </div>
            
            <p className="text-xs text-white/60 leading-relaxed max-w-sm">
              We empower local home makers, retired seniors, and regional culinary experts to host micro-home kitchens. We manage strict hygiene compliance, medical testing, and hot thermal logistics.
            </p>

            <div className="flex items-center space-x-2.5 text-xs text-white/55">
              <Heart className="h-4 w-4 text-[var(--brand-color,#C2593F)] fill-current" />
              <span>Supporting 40+ local women entrepreneurs under {brandName}</span>
            </div>
          </div>

          {/* Contact Details (md:col-span-4) */}
          <div className="md:col-span-4 space-y-4" id="footer-contact">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#E28743] font-mono">
              Support & Community
            </h4>
            
            <div className="space-y-2.5 text-xs text-white/70">
              <div className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-white/50" />
                <span>Customer Care: +91 {visitorInfo?.phone || '98765 43210'} (9 AM - 9 PM)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-white/50" />
                <span>Kitchen partner queries: {visitorInfo ? `demo@${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : 'partner@gharbhojan.com'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-3.5 w-3.5 text-[#557A46]" />
                <span>FSSAI License No: {visitorInfo ? `12224999${visitorInfo.phone.slice(-6)}` : '13326999401827'} (Registered Kitchen)</span>
              </div>
            </div>
          </div>

          {/* Quick links & Credits (md:col-span-3) */}
          <div className="md:col-span-3 space-y-4" id="footer-credits">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#E28743] font-mono">
              Daily Operations
            </h4>
            
            <div className="text-[11px] text-white/55 leading-relaxed space-y-1">
              <p>📍 {visitorInfo?.address ? visitorInfo.address : 'Delhi Dwarka & Gurugram Sectors active'}</p>
              <p>🍱 Daily Lunch cutoff: 10:30 AM</p>
              <p>🍲 Daily Dinner cutoff: 5:00 PM</p>
              <p className="pt-2">© 2026 {brandName} Food Logistics. Curated by {ownerName}.</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-10 pt-6 text-center text-[10px] text-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
            <p>Licensed home chef delivery portal. All materials are prepared in clean, domestic workspaces under active CCTV supervision.</p>
            {userToken && (
              <div 
                id="footer-session-token"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  if (triggerToast) {
                    triggerToast('📋 Unique session URL copied to clipboard! Share it to show your custom kitchen!', 'success');
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white rounded-lg border border-white/10 transition-all cursor-pointer select-none text-[10px] font-mono shadow-sm"
                title="Your secure active session token. Click to copy your personalized link!"
              >
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Session Token: <strong className="font-extrabold text-[#E28743]">{userToken}</strong></span>
                <span className="text-white/30 text-[9px] uppercase tracking-wider font-sans font-bold pl-1.5 border-l border-white/10 ml-1.5">Copy Link</span>
              </div>
            )}
          </div>
          <div className="flex space-x-4 shrink-0 items-center">
            <span className="hover:underline cursor-pointer">Hygiene Protocols</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span 
              onClick={() => {
                window.location.hash = '#/admin';
              }}
              className="text-[#E28743] hover:underline cursor-pointer font-extrabold flex items-center space-x-0.5"
            >
              <span>🔑 Admin Console</span>
            </span>
          </div>
        </div>
        <div className="mt-4 text-center text-[10px] text-white/40">
          <p>
            Developer: <span className="font-semibold">Aniruddha Das</span> | Developed by{" "}
            <a href="https://leadspree.in" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
              LeadSpree Business Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
