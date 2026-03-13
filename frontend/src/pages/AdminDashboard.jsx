import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [data, setData] = useState({ users: [], shops: [], offers: [] });
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Admin Header */}
        <div className="bg-red-600 text-white p-6 rounded-xl shadow-md mb-8 flex justify-between items-center border-b-4 border-red-800">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              🛡️ Super Admin Control Panel
            </h1>
            <p className="opacity-90 mt-1">Manage all users, shop owners, and active offers across the platform.</p>
          </div>
        </div>

        {/* The 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Users Column */}
          <div className="bg-white rounded-xl shadow-md border-t-4 border-blue-500 overflow-hidden flex flex-col max-h-[700px]">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Standard Users ({data.users.length})</h2>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-grow">
              {data.users.map(user => (
                <div key={user.id} className={`border p-3 rounded-lg flex flex-col gap-3 transition ${user.status === 'pending' ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">{user.name} 
                        {user.status === 'pending' && <span className="ml-2 text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded uppercase">Pending</span>}
                        {user.status === 'rejected' && <span className="ml-2 text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded uppercase">Rejected</span>}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button onClick={() => handleDelete('user', user.id)} className="text-gray-400 hover:text-red-600 font-bold text-xs transition">Delete</button>
                  </div>
                  
                  {/* Action Buttons for Pending Users */}
                  {user.status === 'pending' && (
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => handleStatusUpdate('user', user.id, 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 rounded transition">Approve</button>
                      <button onClick={() => handleStatusUpdate('user', user.id, 'rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded transition">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shops Column */}
          <div className="bg-white rounded-xl shadow-md border-t-4 border-purple-500 overflow-hidden flex flex-col max-h-[700px]">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Shop Owners ({data.shops.length})</h2>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-grow">
              {data.shops.map(shop => (
                <div key={shop.id} className={`border p-3 rounded-lg flex flex-col gap-3 transition ${shop.status === 'pending' ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">{shop.name} 
                        {shop.status === 'pending' && <span className="ml-2 text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded uppercase">Pending</span>}
                        {shop.status === 'rejected' && <span className="ml-2 text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded uppercase">Rejected</span>}
                      </p>
                      <p className="text-xs text-gray-500">{shop.email}</p>
                    </div>
                    <button onClick={() => handleDelete('shop', shop.id)} className="text-gray-400 hover:text-red-600 font-bold text-xs transition">Delete</button>
                  </div>
                  
                  {/* Action Buttons for Pending Users */}
                  {shop.status === 'pending' && (
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => handleStatusUpdate('shop', shop.id, 'approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 rounded transition">Approve</button>
                      <button onClick={() => handleStatusUpdate('shop', shop.id, 'rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded transition">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Offers Column */}
          <div className="bg-white rounded-xl shadow-md border-t-4 border-green-500 overflow-hidden flex flex-col max-h-[700px]">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Live Offers ({data.offers.length})</h2>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-grow">
              {data.offers.map(offer => (
                <div key={offer.id} className="border border-gray-200 p-3 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-white transition">
                  <div>
                    <p className="font-bold text-gray-900">{offer.title}</p>
                    <p className="text-xs text-gray-500">🏪 {offer.shop_name}</p>
                  </div>
                  <button onClick={() => handleDelete('offer', offer.id)} className="text-red-600 hover:bg-red-600 hover:text-white font-bold text-xs border border-red-200 px-3 py-1.5 rounded transition">Delete</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;