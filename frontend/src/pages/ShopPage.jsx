import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ShopPage() {
  const { id } = useParams(); // Gets the shop ID from the URL
  const navigate = useNavigate();
  
  const [shopData, setShopData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [claimResult, setClaimResult] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/offers/shop/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.shop) {
          setShopData(data.shop);
          setOffers(data.offers);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleClaim = async (offerId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to claim this offer!');
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/claims/${offerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setClaimResult({ success: true, message: data.message, code: data.coupon_code });
      } else {
        setClaimResult({ success: false, message: data.message });
      }
    } catch (err) {
      console.error(err);
      setClaimResult({ success: false, message: 'An error occurred.' });
    }
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center font-bold text-xl">Loading...</div>;
  if (!shopData) return <div className="min-h-screen bg-[#09090b] text-red-500 flex items-center justify-center font-bold text-xl">Shop not found.</div>;

  return (
    <div className="min-h-screen bg-[#09090b] p-8 pt-12">
      <div className="max-w-7xl mx-auto">
        
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-red-500 font-medium transition duration-200 mb-6">
          &larr; Back
        </button>

        {/* SHOP HEADER BANNER */}
        <div className="bg-[#18181b] rounded-2xl p-8 border border-[#27272a] shadow-2xl mb-12 flex items-center gap-6 relative overflow-hidden">
          <div className="w-24 h-24 rounded-full border-4 border-[#27272a] overflow-hidden bg-[#09090b] flex-shrink-0 flex items-center justify-center z-10">
            {shopData.logo_url ? (
               <img src={`http://localhost:5000${shopData.logo_url}`} alt={shopData.name} className="w-full h-full object-cover" />
            ) : (
               <span className="text-4xl font-extrabold text-red-500">{shopData.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="z-10">
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">{shopData.name}</h1>
            <p className="text-gray-400 font-medium">📍 {shopData.location}</p>
          </div>
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-red-900 rounded-full opacity-10 blur-3xl"></div>
        </div>

        {/* SHOP OFFERS GRID */}
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-[#27272a] pb-2">Active Offers from {shopData.name}</h2>
        
        {offers.length === 0 ? (
          <div className="text-gray-500 font-medium bg-[#18181b] p-8 rounded-xl border border-[#27272a] text-center">No active offers available right now.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {offers.map((offer) => (
              <div key={offer.offer_id} onClick={() => setSelectedOffer(offer)} className="bg-[#18181b] rounded-xl shadow-lg hover:shadow-red-900/20 transition duration-300 border border-[#27272a] hover:border-red-900/50 overflow-hidden cursor-pointer flex flex-col relative group">
                <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg z-10 shadow-sm">ACTIVE DEAL</div>
                <div className="h-36 bg-[#09090b] flex items-center justify-center relative border-b border-[#27272a] overflow-hidden">
                  {offer.image_url ? (
                    <img src={`http://localhost:5000${offer.image_url}`} alt={offer.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                  ) : (
                    <h3 className="text-3xl font-extrabold text-[#27272a] tracking-widest uppercase">{offer.shop_name.substring(0, 3)}</h3>
                  )}
                  <div className="absolute -bottom-4 right-4 bg-[#18181b] border border-[#27272a] shadow-lg rounded-full px-4 py-1 text-xs font-bold text-red-500 z-10">{offer.discount_details}</div>
                </div>
                <div className="p-5 pt-6 flex-grow flex flex-col">
                  <h4 className="text-gray-200 font-medium text-sm leading-snug group-hover:text-white transition">{offer.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL POPUP (Same as Dashboard) */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-fade-in-up">
            <button onClick={() => { setSelectedOffer(null); setClaimResult(null); }} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold z-10">&times;</button>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-950 text-red-400 border border-red-900/50 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{selectedOffer.discount_details}</span>
                <span className="text-sm text-gray-400 font-medium">⏰ Expires: {new Date(selectedOffer.valid_until).toLocaleDateString()}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2">{selectedOffer.title}</h2>
              <div className="bg-[#09090b] rounded-xl p-5 mb-8 border border-[#27272a] text-gray-400 leading-relaxed">{selectedOffer.description}</div>

              {claimResult ? (
                <div className={`p-6 rounded-xl text-center border ${claimResult.success ? 'bg-green-950/30 border-green-900/50' : 'bg-red-950/30 border-red-900/50'}`}>
                  <p className={`font-bold mb-2 ${claimResult.success ? 'text-green-400' : 'text-red-400'}`}>{claimResult.message}</p>
                  {claimResult.success && <><p className="text-xs text-green-500 uppercase tracking-widest mb-1 mt-4">Your Coupon Code</p><p className="text-3xl font-mono font-extrabold text-white tracking-widest bg-[#09090b] py-2 rounded-lg border border-green-900/50 inline-block px-6">{claimResult.code}</p></>}
                </div>
              ) : (
                <button onClick={() => handleClaim(selectedOffer.offer_id)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 text-lg shadow-lg">Claim This Deal Now</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopPage;