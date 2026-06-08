import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { 
  Heart, Truck, Building, ArrowRight, Gift, 
  Send, Users, CheckCircle2 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-dark-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden flex-1 grid-bg">
        {/* Decorative Blurred Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full self-center lg:self-start">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Empowering Communities to Fight Hunger
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Bridging the Gap Between <br className="hidden md:inline" />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
                Surplus Food
              </span>{' '}
              and Needy People
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              FoodBridge helps hotels, caterers, and individual donors easily distribute leftover food to NGOs and local shelters via a real-time volunteer tracking system.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto text-center font-bold px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl hover-scale shadow-xl shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 text-xs"
              >
                Join as a Partner <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto text-center font-bold px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl hover-scale transition-all text-xs"
              >
                Sign In to Platform
              </Link>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="flex-1 w-full max-w-lg">
            <div className="glass-card rounded-3xl p-6 shadow-2xl relative border border-slate-200/50 dark:border-slate-800/80 glow-green">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Delivery Feed</span>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-semibold text-slate-500">
                  Updated just now
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex gap-4 items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/20">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    🏨
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Grand Plaza Hotel</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Donated 60 meals of Veg Fried Rice & Soup</p>
                  </div>
                  <span className="ml-auto text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold uppercase">
                    Delivered
                  </span>
                </div>

                <div className="flex gap-4 items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/20">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    🚴
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Volunteer Mark</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Picked up 25 meals from Sunshine Bakery</p>
                  </div>
                  <span className="ml-auto text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold uppercase animate-pulse">
                    En Route
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/40">
        <div className="max-w-4xl mx-auto text-center flex flex-col gap-6">
          <Heart className="mx-auto text-rose-500 h-10 w-10 animate-bounce" />
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Over one-third of all food produced is wasted, while millions suffer from hunger daily. 
            FoodBridge's mission is to eliminate local food waste by routing surplus, high-quality dinners, 
            pastries, and homecooked meals to distribution nodes where they are needed most. 
            We build the tech to enable transparent, fast logistics.
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-dark-950">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { count: '15,000+', label: 'Meals Served', icon: <Gift size={20} className="text-emerald-500" /> },
            { count: '120+', label: 'Partner Organizations', icon: <Building size={20} className="text-blue-500" /> },
            { count: '350+', label: 'Active Volunteers', icon: <Truck size={20} className="text-purple-500" /> },
            { count: '50+', label: 'Verified NGOs', icon: <Users size={20} className="text-teal-500" /> },
          ].map((stat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800/60 flex flex-col items-center text-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {stat.icon}
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">{stat.count}</h3>
              <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/40">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              A synchronized, 4-step real-time cycle designed to transport surplus food quickly and safely.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Food Listing', desc: 'Hotel or Donor logs excess food availability with description, expiry time, and pickup address.', icon: <Building className="text-emerald-500" /> },
              { step: '02', title: 'NGO Allocation', desc: 'Local NGO claims the food donation, selects a needy area, and submits a volunteer pickup request.', icon: <Users className="text-blue-500" /> },
              { step: '03', title: 'Volunteer Pickup', desc: 'Volunteers accept requests, drive to the location with map tracking, and pickup the food.', icon: <Truck className="text-purple-500" /> },
              { step: '04', title: 'Verified Delivery', desc: 'Volunteers deliver, upload visual photo proofs, and NGOs confirm the safe distribution.', icon: <CheckCircle2 className="text-teal-500" /> },
            ].map((item, idx) => (
              <div key={idx} className="relative bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/40 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-md">
                    {item.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-200 dark:text-slate-800">{item.step}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-dark-950">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-xl">
          <div className="text-center flex flex-col gap-3 mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Contact Us</h2>
            <p className="text-xs text-slate-400">Questions or partnership queries? Write to us below.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. elena@ngo.org"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Message Details</label>
              <textarea
                rows={4}
                required
                placeholder="Write your questions or notes here..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
              />
            </div>
            
            {submitted && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-semibold text-center">
                Message submitted successfully! We'll reply within 24 hours.
              </div>
            )}

            <button
              type="submit"
              className="w-full font-bold py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl hover-scale transition-all flex items-center justify-center gap-2 text-xs"
            >
              Send Message <Send size={14} />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100 dark:border-slate-900 text-center text-[11px] text-slate-400">
        <p>© 2026 FoodBridge Platform. Connecting surplus foods with people in need. All rights reserved.</p>
      </footer>
    </div>
  );
};
