import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); 
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const loginUrl = role === 'user' 
      ? 'http://localhost:5000/api/auth/login/user' 
      : role === 'shop_owner'
      ? 'http://localhost:5000/api/auth/login/shop'
      : 'http://localhost:5000/api/auth/login/admin';

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', role);
        if (role === 'admin') navigate('/admin');
        else navigate('/');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#18181b] rounded-2xl shadow-2xl p-10 border border-[#27272a]">
        
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-extrabold text-red-600 tracking-tight hover:text-red-500 transition">
            Offer.com
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Welcome back. Enter your credentials.</p>
        </div>

        {/* Role Toggles - Dark Mode */}
        <div className="flex bg-[#09090b] p-1 rounded-xl mb-8 border border-[#27272a]">
          {['user', 'shop_owner', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all duration-300 ${
                role === r ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {error && <div className="mb-6 p-3 bg-red-950/50 text-red-400 text-sm rounded-lg text-center font-medium border border-red-900/50">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition placeholder-gray-600" 
              placeholder="you@example.com"
              required 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-gray-300">Password</label>
              <a href="#" className="text-xs text-red-500 hover:text-red-400 font-medium transition">Forgot password?</a>
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition placeholder-gray-600" 
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-red-600/20 mt-4"
          >
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