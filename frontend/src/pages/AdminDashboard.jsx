import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [data, setData] = useState({ users: [], shops: [], offers: [] });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ---> NEW: State to track which sidebar tab is clicked <---
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Access Denied');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError('You do not have permission to view this page.');
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [navigate]);

  const handleDelete = async (type, id) => {
    // A scary warning prompt to make sure the admin doesn't delete by accident!
    if (!window.confirm(`⚠️ Are you SURE you want to delete this ${type}? This action cannot be undone and will delete all related data!`)) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ ${result.message}`);
        fetchAdminData(); // Instantly refresh the data on the screen
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during deletion.');
    }
  };

  // NEW: Function to approve or reject
  const handleStatusUpdate = async (type, id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/admin/${type}/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (response.ok) {
        fetchAdminData(); // Refresh list to show new status
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating status.');
    }
  };

  

  if (error) return <div className="text-center mt-20 text-red-600 font-extrabold text-2xl">{error}</div>;

 return (
    <div className="flex min-h-screen bg-[#09090b] text-white font-sans overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-[#18181b] border-r border-[#27272a] flex flex-col sticky top-0 h-screen flex-shrink-0">
        
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-center border-b border-[#27272a] bg-[#09090b]">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-tight">Offer.com</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Admin Controls</p>
          
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-gray-400 hover:bg-[#27272a] hover:text-white'}`}>
            <span>📊</span> Dashboard
          </button>
          
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'users' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-gray-400 hover:bg-[#27272a] hover:text-white'}`}>
            <span>👤</span> Standard Users
          </button>
          
          <button onClick={() => setActiveTab('shops')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'shops' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-gray-400 hover:bg-[#27272a] hover:text-white'}`}>
            <span>🏪</span> Shop Owners
          </button>
          
          <button onClick={() => setActiveTab('offers')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'offers' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-gray-400 hover:bg-[#27272a] hover:text-white'}`}>
            <span>🏷️</span> Live Offers
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-[#27272a] bg-[#09090b]">
          <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="w-full bg-[#27272a] hover:bg-red-600 text-white font-bold py-4 rounded-xl transition duration-300 shadow-md">
            LOGOUT
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 p-10 h-screen overflow-y-auto">
        
        {/* --- TAB 1: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-extrabold mb-8">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Summary Cards (Like your friend's top row) */}
              <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-1">Total Users</p>
                  <p className="text-4xl font-extrabold text-white">{data.users?.length || 0}</p>
                </div>
                <div className="w-16 h-16 bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center text-3xl border border-blue-900/50">👤</div>
              </div>
              <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-1">Registered Shops</p>
                  <p className="text-4xl font-extrabold text-white">{data.shops?.length || 0}</p>
                </div>
                <div className="w-16 h-16 bg-green-900/30 text-green-500 rounded-2xl flex items-center justify-center text-3xl border border-green-900/50">🏪</div>
              </div>
              <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-2xl shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-1">Active Offers</p>
                  <p className="text-4xl font-extrabold text-white">{data.offers?.length || 0}</p>
                </div>
                <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-2xl flex items-center justify-center text-3xl border border-red-900/50">🏷️</div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: STANDARD USERS TABLE --- */}
        {activeTab === 'users' && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-extrabold mb-8">Standard Users List</h2>
            <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-red-600 text-white text-sm uppercase tracking-wider">
                    <th className="p-5 font-extrabold">Name</th>
                    <th className="p-5 font-extrabold">Email Address</th>
                    <th className="p-5 font-extrabold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {data.users?.map(user => (
                    <tr key={user.id} className="hover:bg-[#27272a]/50 transition duration-200">
                      <td className="p-5 font-bold text-gray-200">{user.name}</td>
                      <td className="p-5 text-gray-400">{user.email}</td>
                      <td className="p-5 text-center">
                        <button onClick={() => handleDelete('user', user.id)} className="bg-red-950/50 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition">DELETE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: SHOP OWNERS TABLE --- */}
        {activeTab === 'shops' && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-extrabold mb-8">Shop Owners List</h2>
            <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-red-600 text-white text-sm uppercase tracking-wider">
                    <th className="p-5 font-extrabold">Shop Name</th>
                    <th className="p-5 font-extrabold">Email Address</th>
                    <th className="p-5 font-extrabold text-center">Status</th>
                    <th className="p-5 font-extrabold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {data.shops?.map(shop => (
                    <tr key={shop.id} className="hover:bg-[#27272a]/50 transition duration-200">
                      <td className="p-5 font-bold text-gray-200">{shop.shop_name || shop.name}</td>
                      <td className="p-5 text-gray-400">{shop.email}</td>
                      <td className="p-5 text-center">
                        {shop.status === 'pending' ? (
                           <div className="flex gap-2 justify-center">
                             <button onClick={() => handleStatusUpdate('shop', shop.id, 'approved')} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Approve</button>
                             <button onClick={() => handleStatusUpdate('shop', shop.id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">Reject</button>
                           </div>
                        ) : (
                           <span className="text-green-500 font-bold text-xs uppercase bg-green-950/30 px-3 py-1 border border-green-900/50 rounded-full">Active</span>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        <button onClick={() => handleDelete('shop', shop.id)} className="bg-red-950/50 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition">DELETE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 4: OFFERS TABLE --- */}
        {activeTab === 'offers' && (
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-extrabold mb-8">Live Offers List</h2>
            <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-red-600 text-white text-sm uppercase tracking-wider">
                    <th className="p-5 font-extrabold">Offer Title</th>
                    <th className="p-5 font-extrabold">Shop Name</th>
                    <th className="p-5 font-extrabold">Discount</th>
                    <th className="p-5 font-extrabold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {data.offers?.map(offer => (
                    <tr key={offer.offer_id} className="hover:bg-[#27272a]/50 transition duration-200">
                      <td className="p-5 font-bold text-gray-200">{offer.title}</td>
                      <td className="p-5 text-gray-400">{offer.shop_name}</td>
                      <td className="p-5 text-red-500 font-bold">{offer.discount_details}</td>
                      <td className="p-5 text-center">
                        <button onClick={() => handleDelete('offer', offer.offer_id)} className="bg-red-950/50 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition">DELETE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;