import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyClaims() {
  const [claims, setClaims] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:5000/api/claims/my-claims', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setClaims(data))
      .catch((err) => console.error("Error fetching claims:", err));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#09090b] p-8 pt-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-8 border-b border-[#27272a] pb-4 tracking-tight">
          My Claimed Offers
        </h1>

        {claims.length === 0 ? (
          <div className="bg-[#18181b] p-8 rounded-2xl shadow-lg border border-[#27272a] text-center text-gray-500 font-medium">
            You haven't claimed any offers yet. Go check out the Home page!
          </div>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <div 
                key={claim.claim_id} 
                className="bg-[#18181b] rounded-2xl shadow-lg border border-[#27272a] border-l-4 border-l-green-500 p-6 flex flex-col md:flex-row justify-between items-center group hover:shadow-green-900/10 transition"
              >
                <div className="mb-4 md:mb-0">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition">
                    {claim.title}
                  </h3>
                  <p className="text-gray-400 font-medium flex items-center gap-2 mb-2">
                    <span className="text-lg">🏪</span> {claim.shop_name}
                  </p>
                  <p className="text-sm text-gray-500 bg-[#09090b] inline-block px-3 py-1 rounded-lg border border-[#27272a]">
                    ⏰ Expires: {new Date(claim.valid_until).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="bg-[#09090b] p-4 rounded-xl border border-green-900/30 text-center min-w-[200px] shadow-inner">
                  <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-2">
                    Coupon Code
                  </p>
                  <p className="text-3xl font-mono font-extrabold text-white tracking-widest">
                    {claim.coupon_code}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyClaims;