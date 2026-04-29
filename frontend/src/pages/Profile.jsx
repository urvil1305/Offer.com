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
  
  // --- NEW: Category Edit State ---
  const [editCategoryId, setEditCategoryId] = useState('1'); 

  // ---> State to toggle password visibility in the modal
  const [showPasswords, setShowPasswords] = useState(false);

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
    // NEW: Set the dropdown to match their current category!
    setEditCategoryId(userData.category_name === 'Food & Beverage' ? '2' : '1');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('location', editForm.location);
    formData.append('role', role);
    
    // --- NEW: Send category to backend ---
    if (role === 'shop_owner') {
      formData.append('category_id', editCategoryId); 
    }
    
    if (editLogo) formData.append('logo', editLogo);

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }, 
        body: formData
      });
      
      if (response.ok) {
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
          
          <div className="h-32 bg-gradient-to-r from-red-950 to-[#09090b] relative border-b border-[#27272a]">
            <div className="absolute -bottom-12 left-8 w-24 h-24 bg-[#09090b] border-4 border-[#18181b] rounded-full flex items-center justify-center text-4xl font-extrabold text-red-500 shadow-lg shadow-red-900/40 overflow-hidden">
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

            {/* --- UPDATED: User Details Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#09090b] p-5 rounded-xl border border-[#27272a]">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-gray-200 font-medium">{userData.email}</p>
              </div>
              
              {/* --- NEW: Display Category if Shop Owner --- */}
              {role === 'shop_owner' && (
                 <div className="bg-[#09090b] p-5 rounded-xl border border-[#27272a]">
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Business Category</p>
                   <p className="text-gray-200 font-medium">{userData.category_name || 'Uncategorized'}</p>
                 </div>
              )}

              <div className="bg-[#09090b] p-5 rounded-xl border border-[#27272a]">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Location</p>
                <p className="text-gray-200 font-medium">{userData.location}</p>
              </div>
              <div className="bg-[#09090b] p-5 rounded-xl border border-[#27272a]">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-gray-200 font-medium">{userData.joined}</p>
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
                <>
                  {/* --- NEW: CATEGORY DROPDOWN --- */}
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Business Category</label>
                    <select 
                      value={editCategoryId} 
                      onChange={(e) => setEditCategoryId(e.target.value)} 
                      className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition appearance-none cursor-pointer"
                    >
                      <option value="1">Electronics</option>
                      <option value="2">Food & Beverage</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Update Shop Logo</label>
                    <input 
                      type="file" accept="image/*" onChange={(e) => setEditLogo(e.target.files[0])}
                      className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-950 file:text-red-400 cursor-pointer" 
                    />
                  </div>
                </>
              )}
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-red-600/20 mt-4">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ... (Keep your existing Change Password Modal) ... */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#18181b] rounded-2xl shadow-2xl border border-[#27272a] w-full max-w-md p-8 relative animate-fade-in-up">
            <button onClick={() => setIsPasswordModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold transition">&times;</button>
            <h2 className="text-2xl font-extrabold mb-6 text-white tracking-tight">Change Password</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Current Password</label>
                <div className="relative">
                  <input type={showPasswords ? "text" : "password"} value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full px-4 py-3 pr-12 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required />
                  <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500 transition-colors">
                    {showPasswords ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              {/* 2. New Password */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">New Password</label>
                <div className="relative">
                  <input type={showPasswords ? "text" : "password"} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-4 py-3 pr-12 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required minLength="6" />
                  <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500 transition-colors">
                    {showPasswords ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 3. Confirm New Password */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Confirm New Password</label>
                <div className="relative">
                  <input type={showPasswords ? "text" : "password"} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-4 py-3 pr-12 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition" required minLength="6" />
                  <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-red-500 transition-colors">
                    {showPasswords ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
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