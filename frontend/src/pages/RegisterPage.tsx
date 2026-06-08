import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building, User, Truck, Users, ArrowLeft, ArrowRight, 
  Mail, Lock, Phone, Loader2 
} from 'lucide-react';

type RegisterRole = 'ORGANIZATION_DONOR' | 'INDIVIDUAL_DONOR' | 'VOLUNTEER' | 'NGO';

const TIRUPATI_LANDMARKS = [
  'Ramanuja Circle, Tirupati, Andhra Pradesh 517501',
  'Bairagipatteda, Tirupati, Andhra Pradesh 517501',
  'MR Palli, Tirupati, Andhra Pradesh 517502',
  'Balaji Colony, Tirupati, Andhra Pradesh 517501',
  'RUIA Hospital, Alipiri Road, Tirupati, Andhra Pradesh 517507',
  'SVIMS Hospital, Tirupati, Andhra Pradesh 517507',
  'Tirumala Bypass Road, Tirupati, Andhra Pradesh 517501',
  'Korlagunta, Tirupati, Andhra Pradesh 517501'
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<RegisterRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Unified Registration Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    
    // Org fields
    name: '',
    contactPerson: '',
    mobile: '',
    address: 'Ramanuja Circle, Tirupati, Andhra Pradesh 517501',
    orgType: 'Hotel', // default org type
    openingTime: '08:00',
    closingTime: '22:00',
    logoUrl: '',

    // Individual / general fields
    fullName: '',
    profilePhoto: '',

    // Volunteer fields
    city: 'Tirupati',
    district: 'Chittoor',
    state: 'Andhra Pradesh',
    pincode: '517501',
    gender: 'Male',
    dob: '',
    govIdNumber: '',
    idProofUrl: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    availability: 'Morning',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      // Package payload dynamically based on selected role
      const payload: any = {
        email: formData.email,
        password: formData.password,
        role: role,
      };

      if (role === 'ORGANIZATION_DONOR') {
        payload.name = formData.name;
        payload.contactPerson = formData.contactPerson;
        payload.mobile = formData.mobile;
        payload.address = formData.address;
        payload.orgType = formData.orgType;
        payload.openingTime = formData.openingTime;
        payload.closingTime = formData.closingTime;
        payload.logoUrl = formData.logoUrl;
      } else if (role === 'INDIVIDUAL_DONOR') {
        payload.fullName = formData.fullName;
        payload.mobile = formData.mobile;
        payload.address = formData.address;
        payload.profilePhoto = formData.profilePhoto;
      } else if (role === 'VOLUNTEER') {
        payload.fullName = formData.fullName;
        payload.mobile = formData.mobile;
        payload.address = formData.address;
        payload.city = formData.city;
        payload.district = formData.district;
        payload.state = formData.state;
        payload.pincode = formData.pincode;
        payload.gender = formData.gender;
        payload.dob = formData.dob;
        payload.govIdNumber = formData.govIdNumber;
        payload.idProofUrl = formData.idProofUrl;
        payload.profilePhoto = formData.profilePhoto;
        payload.vehicleType = formData.vehicleType;
        payload.vehicleNumber = formData.vehicleNumber;
        payload.availability = formData.availability;
      } else if (role === 'NGO') {
        payload.name = formData.name;
        payload.contactPerson = formData.contactPerson;
        payload.mobile = formData.mobile;
        payload.address = formData.address;
        payload.logoUrl = formData.logoUrl;
      }

      await registerUser(payload);
      
      // Route after registration
      if (role === 'ORGANIZATION_DONOR' || role === 'NGO' || role === 'VOLUNTEER') {
        // Accounts are PENDING, so direct to landing or profile showing status
        alert('Registration request submitted! An admin will review and approve your account shortly.');
        navigate('/login');
      } else {
        navigate('/donor');
      }
    } catch (err: any) {
      console.error('Registration error page:', err);
      setError(err.message || 'Registration failed. Please review fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectRoleCategory = (selectedRole: RegisterRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-950 dark:text-dark-50 flex items-center justify-center p-6 relative overflow-hidden grid-bg">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl w-full glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl relative z-10">
        
        {/* Step Header */}
        <div className="text-center flex flex-col gap-2 mb-8">
          <Link to="/" className="text-3xl justify-center flex items-center gap-2">
            <span>🤝</span>
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              FoodBridge
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight mt-3">
            {step === 1 ? 'Create Partner Account' : `Register as ${role?.replace('_DONOR', '').replace(/_/g, ' ')}`}
          </h2>
          <p className="text-xs text-slate-400">
            {step === 1 
              ? 'Select your user category to begin registering.' 
              : 'Fill in your profile details to submit your registration request.'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold text-center mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'ORGANIZATION_DONOR' as RegisterRole,
                title: 'Hotel / Caterer Donor',
                desc: 'Hotels, restaurants, marriage halls, caterers, or company mess.',
                icon: <Building className="text-emerald-500" size={24} />,
              },
              {
                id: 'INDIVIDUAL_DONOR' as RegisterRole,
                title: 'Individual Donor',
                desc: 'Individuals wishing to share surplus cooked meals or groceries.',
                icon: <User className="text-blue-500" size={24} />,
              },
              {
                id: 'VOLUNTEER' as RegisterRole,
                title: 'Volunteer Rider',
                desc: 'Riders with bikes, cars, or walking who can deliver food.',
                icon: <Truck className="text-purple-500" size={24} />,
              },
              {
                id: 'NGO' as RegisterRole,
                title: 'NGO / Charity Agent',
                desc: 'Organisations distributing food to hospitals, shelters, and slum areas.',
                icon: <Users className="text-teal-500" size={24} />,
              },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectRoleCategory(cat.id)}
                className="p-6 text-left border border-slate-200 dark:border-slate-800 hover:bg-emerald-500/5 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 flex flex-col gap-3 group"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:bg-emerald-500/10">
                  {cat.icon}
                </div>
                <h4 className="font-bold text-sm group-hover:text-emerald-500 transition-colors">{cat.title}</h4>
                <p className="text-[11px] text-slate-400 leading-normal">{cat.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Input Details Form */}
        {step === 2 && role && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            
            {/* Back button */}
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); }}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center gap-1.5 self-start mb-2"
            >
              <ArrowLeft size={14} /> Back to Role Selection
            </button>

            {/* General Credentials Section */}
            <div className="bg-slate-550/5 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+1 555 0199"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Role Profile Form Section */}
            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* Hotel / Organization Fields */}
              {role === 'ORGANIZATION_DONOR' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hotel / Org Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grand Plaza Hotel"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Person</label>
                    <input
                      type="text"
                      required
                      placeholder="Owner / Manager name"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Organization Type</label>
                    <select
                      value={formData.orgType}
                      onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      {['Hotel', 'Restaurant', 'Event Organizer', 'Marriage Hall', 'Catering Service', 'Bakery', 'College Mess', 'Corporate Office', 'Religious Organization'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Open Time</label>
                      <input
                        type="time"
                        value={formData.openingTime}
                        onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Close Time</label>
                      <input
                        type="time"
                        value={formData.closingTime}
                        onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Address (Tirupati Region)</label>
                    <select
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      {TIRUPATI_LANDMARKS.map((landmark) => (
                        <option key={landmark} value={landmark}>{landmark}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Logo / Profile Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logoUrl')}
                      className="text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Individual Donor Fields */}
              {role === 'INDIVIDUAL_DONOR' && (
                <>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Address (Tirupati Region)</label>
                    <select
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      {TIRUPATI_LANDMARKS.map((landmark) => (
                        <option key={landmark} value={landmark}>{landmark}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Profile Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profilePhoto')}
                      className="text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Volunteer Fields */}
              {role === 'VOLUNTEER' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Govt ID Number (DL / Passport / SSN)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ID-87654321"
                      value={formData.govIdNumber}
                      onChange={(e) => setFormData({ ...formData, govIdNumber: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  
                  {/* Vehicle details */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      {['Bike', 'Scooter', 'Bicycle', 'Car', 'Walking'].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. IL-56-AB-1234"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Shift Availability</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Pincode</label>
                    <input
                      type="text"
                      required
                      placeholder="62701"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Springfield"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">District & State</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="District"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Home Address (Tirupati Region)</label>
                    <select
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      {TIRUPATI_LANDMARKS.map((landmark) => (
                        <option key={landmark} value={landmark}>{landmark}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">ID Proof Document (PDF/Photo)</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(e, 'idProofUrl')}
                      className="text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Profile Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profilePhoto')}
                      className="text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* NGO Fields */}
              {role === 'NGO' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">NGO Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hope Foundation"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Agent Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Primary contact person"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">NGO Address (Tirupati Region)</label>
                    <select
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      {TIRUPATI_LANDMARKS.map((landmark) => (
                        <option key={landmark} value={landmark}>{landmark}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">NGO Logo / Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logoUrl')}
                      className="text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900 cursor-pointer"
                    />
                  </div>
                </>
              )}

            </div>

            {/* Submit Register */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-bold py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl hover-scale shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting Request...
                </>
              ) : (
                <>
                  Submit Registration <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-bold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
