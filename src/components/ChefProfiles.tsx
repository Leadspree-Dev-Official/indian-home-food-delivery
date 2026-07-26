import { useState } from 'react';
import { ChefProfile } from '../types';
import { CHEFS, USER_REVIEWS } from '../data';
import { Award, ShieldCheck, Heart, MapPin, Sparkles, Star, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChefProfilesProps {
  selectedChefId: string | null;
  onCloseChefModal: () => void;
  onOpenChefModal: (chefId: string) => void;
  chefs?: ChefProfile[];
}

export default function ChefProfiles({
  selectedChefId,
  onCloseChefModal,
  onOpenChefModal,
  chefs = CHEFS,
}: ChefProfilesProps) {
  const selectedChef = chefs.find((c) => c.id === selectedChefId);

  return (
    <section className="py-12 bg-[#FFFDF6]" id="chefs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12" id="chefs-header">
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-[#2D2727] tracking-tight">
            Our Neighborhood <span className="text-[#C2593F]">Home Makers</span>
          </h2>
          <p className="text-sm sm:text-base text-[#2D2727]/60 mt-2">
            Meet the culinary experts and mothers preparing meals in clean domestic kitchens. Every chef is fully certified, medically inspected, and cooks in micro-batches with pure love.
          </p>
        </div>

        {/* FSSAI Hygiene Guidelines Banner */}
        <div className="p-4 rounded-2xl bg-[#557A46]/10 border border-[#557A46]/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12" id="hygiene-banner">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-[#557A46] text-white rounded-xl mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2D2727]">FSSAI Kitchen Registration & Medically Tested Chefs</h4>
              <p className="text-[11px] text-[#2D2727]/70 mt-0.5 leading-relaxed">
                All home kitchens undergo quarterly physical sanitation checks by our quality inspectors. Chefs are medically vaccinated and food is tested dynamically for shelf-life and nutrient indexes.
              </p>
            </div>
          </div>
          <span className="bg-[#557A46] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide font-mono self-start md:self-auto shrink-0 shadow-sm">
            🛡️ 100% Home Sanitized
          </span>
        </div>

        {/* Chefs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="chefs-grid">
          {chefs.map((chef) => (
            <motion.div
              key={chef.id}
              id={`chef-profile-card-${chef.id}`}
              whileHover={{ y: -5 }}
              onClick={() => onOpenChefModal(chef.id)}
              className="bg-white rounded-2xl border border-[#C2593F]/10 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 p-4 flex flex-col justify-between h-full"
            >
              <div>
                {/* Avatar and score */}
                <div className="flex items-center space-x-3.5 mb-3">
                  <div className="relative">
                    <img
                      src={chef.avatar}
                      alt={chef.name}
                      className="h-14 w-14 rounded-2xl object-cover border-2 border-[#C2593F]/15"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold" title="FSSAI Verified">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-base text-[#2D2727] tracking-tight hover:text-[#C2593F] transition-colors">
                      {chef.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-gray-400 block uppercase">
                      ⭐ {chef.rating} ({chef.reviewsCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Specialty and Location */}
                <div className="space-y-1.5">
                  <div className="flex items-start text-xs text-[#2D2727]/75">
                    <Award className="h-4 w-4 text-[#C2593F] shrink-0 mr-1.5 mt-0.5" />
                    <div>
                      <strong>Specialty:</strong> {chef.specialty}
                    </div>
                  </div>
                  <div className="flex items-start text-xs text-[#2D2727]/75">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0 mr-1.5 mt-0.5" />
                    <div className="truncate">
                      <strong>Location:</strong> {chef.location.split(',')[0]}
                    </div>
                  </div>
                </div>

                {/* Snippet Bio */}
                <p className="text-xs text-[#2D2727]/60 mt-3 leading-relaxed line-clamp-3">
                  "{chef.bio}"
                </p>
              </div>

              {/* Read full story CTA button */}
              <button
                id={`read-story-btn-${chef.id}`}
                className="mt-4 w-full py-2 bg-[#C2593F]/10 hover:bg-[#C2593F]/15 text-[#C2593F] font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center space-x-1"
              >
                <Heart className="h-3.5 w-3.5 fill-current" />
                <span>Read Motherly Story</span>
              </button>

            </motion.div>
          ))}
        </div>

        {/* Mom's Kitchen Stories & Community Reviews Section */}
        <div className="mt-16 pt-12 border-t border-[#C2593F]/10" id="community-reviews-section">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h3 className="font-sans font-extrabold text-2xl text-[#2D2727] tracking-tight flex items-center justify-center">
              <Quote className="h-5 w-5 mr-1.5 text-[#C2593F]" />
              Mom's Kitchen Stories & Love
            </h3>
            <p className="text-xs sm:text-sm text-[#2D2727]/60 mt-1">
              Read how home meals are changing daily health and lifestyles for our neighborhood community members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="reviews-grid">
            {USER_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-2xl bg-white border border-[#C2593F]/5 shadow-sm space-y-3 relative"
              >
                <Quote className="absolute top-4 right-4 h-8 w-8 text-gray-100 -z-0 pointer-events-none" />
                
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#2D2727]">
                      {review.userName}
                    </span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-[#2D2727]/70 italic leading-relaxed">
                    "{review.comment}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                    <span>Dish ordered: <strong>{review.mealName}</strong></span>
                    <span>{review.date}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Chef Details Modal (Story Board!) */}
      <AnimatePresence>
        {selectedChefId && selectedChef && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="chef-story-modal-container">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseChefModal}
              className="absolute inset-0 bg-[#2D2727]/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-[#FFFDF6] rounded-3xl border border-[#C2593F]/10 overflow-hidden shadow-2xl p-6"
              id="chef-story-content"
            >
              
              {/* Header with image */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-5 border-b border-[#C2593F]/10 pb-5 mb-5">
                <img
                  src={selectedChef.avatar}
                  alt={selectedChef.name}
                  className="h-20 w-20 rounded-2xl object-cover border-4 border-white shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <h3 className="font-sans font-extrabold text-2xl text-[#2D2727] tracking-tight">
                      {selectedChef.name}
                    </h3>
                    <span className="bg-[#557A46]/10 text-[#557A46] text-[10px] font-bold px-2 py-0.5 rounded uppercase self-center sm:self-auto mt-1 sm:mt-0">
                      ★ {selectedChef.rating} (FSSAI registered)
                    </span>
                  </div>
                  <span className="text-[#C2593F] font-semibold text-xs block">{selectedChef.specialty}</span>
                  <p className="text-[11px] text-gray-400 flex items-center justify-center sm:justify-start">
                    <MapPin className="h-3 w-3 mr-1" /> {selectedChef.location}
                  </p>
                </div>
              </div>

              {/* Biography details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-[#2D2727] uppercase tracking-wider block mb-1.5 font-mono">
                    👵 The Motherly Culinary Story
                  </h4>
                  <p className="text-xs text-[#2D2727]/85 leading-relaxed bg-white p-4 rounded-2xl border border-[#C2593F]/5">
                    "{selectedChef.bio}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-amber-50 rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 block">Experience</span>
                    <span className="font-bold text-xs text-[#2D2727] block mt-0.5">{selectedChef.experience}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 block">Hygiene Rating</span>
                    <span className="font-extrabold text-xs text-[#557A46] block mt-0.5">🌟 {selectedChef.hygieneRating} / 5.0</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 text-[10px] text-[#2D2727]/50 italic">
                  <Sparkles className="h-3.5 w-3.5 text-[#E28743]" />
                  <span>"I cook every order in my small home copper vessel just like I feed my grandkids."</span>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-6 border-t border-[#C2593F]/10 mt-6 flex justify-end">
                <button
                  id="close-chef-modal-btn"
                  onClick={onCloseChefModal}
                  className="px-6 py-2 bg-[#C2593F] text-white font-bold text-xs rounded-xl hover:bg-[#C2593F]/90 transition-all cursor-pointer shadow"
                >
                  Close Story Panel
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
