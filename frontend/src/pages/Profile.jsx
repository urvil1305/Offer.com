import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [userData, setUserData] = useState(null);
  
  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Form State
  const [editForm, setEditForm] = useState({ name: '', location: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [editLogo, setEditLogo] = useState(null);

  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'user';

  // --- 1. FETCH PROFILE FROM DATABASE ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`http://localhost:5000/api/auth/profile?role=${role}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load profile from database');
        return res.json();
      })
      .then(data => setUserData(data))
      .catch(err => {
        console.error(err);
        // Fallback data just in case the backend route isn't ready yet!
        setUserData({
          name: role === 'shop_owner' ? 'Vijay Sales' : 'Uru',
          email: 'contact@offer.com',
          location: 'Ahmedabad, Gujarat',
          joined: 'March 2026'
        });
      });
  }, [navigate, role]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // --- 2. EDIT PROFILE LOGIC ---
  const openEditProfile = () => {
    setEditForm({ name: userData.name, location: userData.location });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // NEW: Use FormData for profile edits too!
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('location', editForm.location);
    formData.append('role', role);
    if (editLogo) formData.append('logo', editLogo);

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }, // NO content-type
        body: formData
      });
      
      if (response.ok) {
        // Force a page reload to fetch the new image from DB
        window.location.reload(); 
      } else {
        alert('❌ Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- 3. CHANGE PASSWORD LOGIC ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('❌ New passwords do not match!');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/auth/password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          currentPassword: passwordForm.currentPassword, 
          newPassword: passwordForm.newPassword, 
          role 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsPasswordModalOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('✅ ' + data.message);
      } else {
        alert('❌ ' + data.message); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!userData) {
    return <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-red-500 font-bold text-xl tracking-widest">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#09090b] p-8 pt-12">
      <div className="max-w-3xl mx-auto">
        
        <h1 className="text-3xl font-extrabold text-white mb-8 tracking-tight border-b border-[#27272a] pb-4">
          My Account
        </h1>

        <div className="bg-[#18181b] rounded-2xl shadow-2xl border border-[#27272a] overflow-hidden">
          
          {/* Top Banner Area */}
          <div className="h-32 bg-gradient-to-r from-red-950 to-[#09090b] relative border-b border-[#27272a]">
            <div className="absolute -bottom-12 left-8 w-24 h-24 bg-[#09090b] border-4 border-[#18181b] rounded-full flex items-center justify-center text-4xl font-extrabold text-red-500 shadow-lg shadow-red-900/40 overflow-hidden">
              {/* NEW: Render logo if it exists! */}
              {userData.logo_url ? (
                <img src={`http://localhost:5000${userData.logo_url}`} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                userData.name ? userData.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
          </div>

          <div className="p-8 pt-16">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">{userData.name}</h2>
                <p className="text-red-500 font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  {role === 'shop_owner' ? 'Verified Business Account' : 'Verified Customer'}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-[#27272a] text-gray-300 hover:bg-red-600 hover:text-white font-bold py-2 px-6 rounded-xl transition duration-300 border border-[#3f3f46] hover:border-transparent shadow-md"
              >
                Log Out
              </button>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#09090b] p-5 rounded-xl border border-[#27272a]">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-gray-200 font-medium">{userData.email}</p>
              </div>
              <div className="bg-[#09090b] p-5 rounded-xl border border-[#27272a]">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Location</p>
                <p className="text-gray-200 font-medium">{userData.location}</p>
              </div>
              <div className="bg-[#09090b] p-5 rounded-xl border border-[#27272a]">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-gray-200 font-medium">{userData.joined}</p>
              </div>
              <div className="bg-[#09090b] p-5 rounded-xl border border-[#27272a]">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Account Status</p>
                <p className="text-green-500 font-medium">Active</p>
              </div>
            </div>

            <div className="border-t border-[#27272a] pt-6 flex gap-4">
              <button 
                onClick={openEditProfile}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-red-600/20 w-full sm:w-auto"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-[#09090b] text-gray-400 hover:text-white font-bold py-3 px-6 rounded-xl transition duration-200 border border-[#27272a] hover:border-gray-500 w-full sm:w-auto"
              >
                Change Password
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#18181b] rounded-2xl shadow-2xl border border-[#27272a] w-full max-w-md p-8 relative animate-fade-in-up">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold transition">&times;</button>
            <h2 className="text-2xl font-extrabold mb-6 text-white tracking-tight">Edit Profile</h2>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Display Name / Shop Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Location</label>
                <input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required />
              </div>
              {role === 'shop_owner' && (
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Update Shop Logo</label>
                  <input 
                    type="file" accept="image/*" onChange={(e) => setEditLogo(e.target.files[0])}
                    className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-950 file:text-red-400 cursor-pointer" 
                  />
                </div>
              )}
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-red-600/20 mt-4">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- CHANGE PASSWORD MODAL --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#18181b] rounded-2xl shadow-2xl border border-[#27272a] w-full max-w-md p-8 relative animate-fade-in-up">
            <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold transition">&times;</button>
            <h2 className="text-2xl font-extrabold mb-6 text-white tracking-tight">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Current Password</label>
                <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">New Password</label>
                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required minLength="6" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Confirm New Password</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required minLength="6" />
              </div>
              <button type="submit" className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md border border-[#3f3f46] mt-4">
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;