import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('user'); 
  const [logo, setLogo] = useState(null); 
  
  // NEW: State for the Category Dropdown
  const [categoryId, setCategoryId] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // These exactly match the IDs we just put in your MySQL database!
  const shopCategories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Food & Beverage' },
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const signupUrl = role === 'user' 
      ? 'http://localhost:5000/api/auth/register/user' 
      : 'http://localhost:5000/api/auth/register/shop';

    let bodyData;
    let headersConfig = {};

    if (role === 'shop_owner') {
      const formData = new FormData();
      formData.append('shop_name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('location', location);
      
      // NEW: Send the selected category ID to the backend
      formData.append('category_id', categoryId); 
      
      if (logo) formData.append('logo', logo); 
      bodyData = formData;
    } else {
      bodyData = JSON.stringify({ name, email, password, location });
      headersConfig = { 'Content-Type': 'application/json' };
    }

    try {
      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: headersConfig,
        body: bodyData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{ 
        backgroundImage: "url('/auth-bg.png')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="max-w-md w-full bg-[#18181b]/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 border border-[#27272a]/50 relative z-10">
        
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-extrabold text-red-600 tracking-tight hover:text-red-500 transition">Offer.com</Link>
          <p className="text-gray-400 mt-2 text-sm">Join the platform. Start saving today.</p>
        </div>

        <div className="flex bg-[#09090b] p-1 rounded-xl mb-8 border border-[#27272a]">
          <button type="button" onClick={() => setRole('user')} className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-300 ${role === 'user' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>Personal Account</button>
          <button type="button" onClick={() => setRole('shop_owner')} className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-300 ${role === 'shop_owner' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>Business Account</button>
        </div>

        {error && <div className="mb-6 p-3 bg-red-950/50 text-red-400 text-sm rounded-lg text-center font-medium border border-red-900/50">{error}</div>}
        {success && <div className="mb-6 p-3 bg-green-950/50 text-green-400 text-sm rounded-lg text-center font-medium border border-green-900/50">{success}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">{role === 'user' ? 'Full Name' : 'Shop Name'}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 pr-12 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" 
                required 
                minLength="6"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Location / City</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required />
          </div>

          {/* NEW: Category Dropdown for Shop Owners */}
          {role === 'shop_owner' && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Business Category</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)} 
                className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition appearance-none" 
                required
              >
                <option value="" disabled>Select a category...</option>
                {shopCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Shop Logo Input */}
          {role === 'shop_owner' && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1">Shop Logo (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setLogo(e.target.files[0])} 
                className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 hover:file:text-white cursor-pointer" 
              />
            </div>
          )}

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg mt-6">Create Account</button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-red-500 font-bold hover:text-red-400 hover:underline transition">Sign in</Link></p>
      </div>
    </div>
  );
}

export default Signup;