import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // NEW: State to hold the user's profile info (for the logo!)
  const [profileData, setProfileData] = useState(null);
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // NEW: Fetch the profile data when the Navbar loads so we can check for a logo!
  useEffect(() => {
    if (token && role !== 'admin') {
      fetch(`http://localhost:5000/api/auth/profile?role=${role}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => setProfileData(data))
      .catch(err => console.error(err));
    }
  }, [token, role]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/?search=${searchQuery}`);
    else navigate('/');
  };

  return (
    <nav className="bg-[#18181b] border-b border-[#27272a] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Link to={role === 'admin' ? '/admin' : '/'} className="text-3xl font-extrabold text-red-600 hover:text-red-500 transition duration-200 min-w-[120px] tracking-tight">
            Offer.com
          </Link>

          <form onSubmit={handleSearch} className="flex-grow max-w-2xl mx-8 hidden md:block">
            <div className="relative group">
              <input 
                type="text" placeholder="Search for offers, shops, or categories..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-12 py-3 bg-[#09090b] border border-[#27272a] rounded-full text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition duration-300 placeholder-gray-600 shadow-inner"
              />
              <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-red-500 transition duration-200 text-lg">🔍</button>
            </div>
          </form>

          <div className="flex items-center space-x-1">
            {!token ? (
              !isAuthPage && (
                <>
                  <Link to="/login" className="text-gray-300 hover:text-white font-bold px-4 py-2 rounded-lg transition duration-200">Log In</Link>
                  <Link to="/signup" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition duration-200 shadow-md shadow-red-600/20 ml-2">Sign Up</Link>
                </>
              )
            ) : (
              <div className="flex items-center">
                {role === 'user' && <Link to="/my-claims" className="text-gray-400 hover:text-red-500 font-bold transition duration-200 px-3 py-2 whitespace-nowrap">My Claims</Link>}
                
                {role === 'shop_owner' && (
                  <>
                    <Link to="/my-offers" className="text-gray-400 hover:text-red-500 font-bold transition duration-200 px-3 py-2 whitespace-nowrap">Manage Offers</Link>
                    <Link to="/shop-portal" className="text-gray-400 hover:text-red-500 font-bold transition duration-200 px-3 py-2 whitespace-nowrap">Post an Offer</Link>
                  </>
                )}
                
                {role === 'admin' && <Link to="/admin" className="text-red-500 hover:text-red-400 font-extrabold transition duration-200 mr-2 whitespace-nowrap bg-red-950/30 px-4 py-2 rounded-lg border border-red-900/50">Admin Panel</Link>}
                
                {/* NEW: Smart Profile Link that shows Logo if it exists! */}
                {role !== 'admin' && (
                  <Link to="/profile" className="text-gray-400 hover:text-white font-bold transition duration-200 px-3 py-2 whitespace-nowrap flex items-center gap-2">
                    {profileData && profileData.logo_url ? (
                      <img 
                        src={`http://localhost:5000${profileData.logo_url}`} 
                        alt="Profile" 
                        className="w-9 h-9 rounded-full object-cover border-2 border-[#27272a] hover:border-red-500 transition shadow-sm"
                      />
                    ) : (
                      "My Profile"
                    )}
                  </Link>
                )}

                <button onClick={handleLogout} className="bg-[#27272a] text-gray-300 hover:bg-red-600 hover:text-white font-bold py-2 px-5 rounded-full transition duration-300 whitespace-nowrap ml-4 border border-[#3f3f46] hover:border-transparent">
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;