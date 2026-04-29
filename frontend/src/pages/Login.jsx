import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    try {
      // Notice we are calling our new unified route!
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // We use the backticks ` ` to inject the user's name directly from the database!
        setSuccess(`Welcome back ${data.user.name}! Redirecting...`);
        
        // Save the token AND the dynamically assigned role from the backend
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        // Automatically route them to the correct dashboard!
        setTimeout(() => {
          if (data.role === 'admin') navigate('/admin');
          else if (data.role === 'shop_owner') navigate('/');
          else navigate('/');
        }, 1500);

      } else {
        setError(data.message || 'Login failed.');
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
      {/* Optional: A very subtle dark overlay to ensure the text stays readable */}
      {/* <div className="absolute inset-0 bg-black/20"></div> */}

      {/* Notice the added '/80' for transparency and 'backdrop-blur-md' for the glass effect! */}
      <div className="max-w-md w-full bg-[#18181b]/80 backdrop-blur-md rounded-2xl shadow-2xl p-10 border border-[#27272a]/50 relative z-10">
        
        <div className="text-center mb-10">
          <Link to="/" className="text-4xl font-extrabold text-red-600 tracking-tight hover:text-red-500 transition">Offer.com</Link>
          <p className="text-gray-400 mt-2 text-sm">Welcome back. Enter your credentials.</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-950/50 text-red-400 text-sm rounded-lg text-center font-medium border border-red-900/50">{error}</div>}
        {success && <div className="mb-6 p-3 bg-green-950/50 text-green-400 text-sm rounded-lg text-center font-medium border border-green-900/50">{success}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" 
              required 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
               <label className="block text-sm font-semibold text-gray-300">Password</label>
               <a href="#" className="text-xs font-bold text-red-600 hover:text-red-500 transition">Forgot password?</a>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 pr-12 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" 
                required 
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

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-red-600/20 mt-2">
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/signup" className="text-red-500 font-bold hover:text-red-400 hover:underline transition">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;