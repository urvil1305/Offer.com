import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('user'); 
  const [logo, setLogo] = useState(null); // NEW: Logo state

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const signupUrl = role === 'user' 
      ? 'http://localhost:5000/api/auth/register/user' 
      : 'http://localhost:5000/api/auth/register/shop';

    let bodyData;
    let headersConfig = {};

    // NEW: If shop owner, use FormData to send the image!
    if (role === 'shop_owner') {
      const formData = new FormData();
      formData.append('shop_name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('location', location);
      if (logo) formData.append('logo', logo); 
      bodyData = formData;
      // Do NOT set Content-Type, the browser does it automatically for files!
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
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#18181b] rounded-2xl shadow-2xl p-10 border border-[#27272a]">
        
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required minLength="6"/>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Location / City</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required />
          </div>

          {/* NEW: Shop Logo Input */}
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