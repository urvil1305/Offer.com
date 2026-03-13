import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

function Dashboard() {
  const [offers, setOffers] = useState([]);
  const [directoryShops, setDirectoryShops] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null); 
  const [claimResult, setClaimResult] = useState(null);     
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || ''; 

  // --- FETCH OFFERS ON LOAD ---
  useEffect(() => {
    fetch('http://localhost:5000/api/offers/all')
      .then((res) => res.json())
      .then((data) => setOffers(data))
      .catch((err) => console.error("Error fetching offers:", err));

    // NEW: FETCH THE STORE DIRECTORY
    fetch('http://localhost:5000/api/offers/directory')
      .then((res) => res.json())
      .then((data) => setDirectoryShops(data))
      .catch((err) => console.error("Error fetching directory:", err));
  }, []);

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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
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

  const closePopup = () => {
    setSelectedOffer(null);
    setClaimResult(null); 
  };

  const filteredOffers = offers.filter((offer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      offer.title.toLowerCase().includes(searchLower) ||
      offer.shop_name.toLowerCase().includes(searchLower)
    );
  });

  // Grab the Top 5 newest offers for the sliding banner!
  const topSliderOffers = [...filteredOffers].reverse().slice(0, 5);
  
  const latestOffers = [...filteredOffers].reverse().slice(0, 5); 
  const expiringSoon = [...filteredOffers].sort((a, b) => new Date(a.valid_until) - new Date(b.valid_until)).slice(0, 5);

  

  // --- REAL DATABASE AUTO-SLIDING CAROUSEL ---
  const HeroCarousel = ({ slideOffers }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-slide effect
    useEffect(() => {
      if (!slideOffers || slideOffers.length === 0) return;
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === slideOffers.length - 1 ? 0 : prev + 1));
      }, 4000); 
      return () => clearInterval(timer);
    }, [slideOffers.length]);

    if (!slideOffers || slideOffers.length === 0) return null;

    return (
      <div className="w-full h-80 md:h-[400px] rounded-2xl overflow-hidden relative mb-12 shadow-2xl border border-[#27272a] group bg-[#09090b]">
        
        {/* Images Track */}
        <div 
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slideOffers.map((offer) => (
            <div 
              key={offer.offer_id} 
              className="min-w-full h-full relative cursor-pointer"
              onClick={() => setSelectedOffer(offer)}
            >
              {/* Premium Background Blur Effect */}
              {offer.image_url && (
                <>
                  <img src={`http://localhost:5000${offer.image_url}`} alt="blur" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl scale-110" />
                  <div className="absolute inset-y-0 right-0 w-full md:w-1/2 flex justify-end">
                     <img src={`http://localhost:5000${offer.image_url}`} alt={offer.title} className="h-full w-full object-cover object-center md:object-right mask-image-gradient z-0" style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }} />
                  </div>
                </>
              )}
              
              {/* Dark Gradients to ensure text is readable */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/90 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10"></div>

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16 items-start text-left w-full md:w-2/3 z-20">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 shadow-lg shadow-red-900/50 uppercase tracking-widest border border-red-500">
                  🔥 TOP DEAL: {offer.discount_details}
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg line-clamp-2">
                  {offer.title}
                </h2>
                <p className="text-gray-400 font-medium mb-8 text-lg drop-shadow-md">
                  Offered by <span className="text-gray-200">{offer.shop_name}</span> in {offer.location}
                </p>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 shadow-lg shadow-red-600/30 border border-red-500 hover:border-transparent">
                  CLAIM NOW
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
          {slideOffers.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-red-500 w-8 shadow-md shadow-red-900/50' : 'bg-gray-600 w-2 hover:bg-gray-400'}`}
            ></button>
          ))}
        </div>
      </div>
    );
  };

  // --- DARK MODE OFFER CARD ---
  const OfferCard = ({ offer, badgeText }) => (
    <div 
      onClick={() => setSelectedOffer(offer)}
      className="bg-[#18181b] rounded-xl shadow-lg hover:shadow-red-900/20 transition duration-300 border border-[#27272a] hover:border-red-900/50 overflow-hidden cursor-pointer flex flex-col relative group"
    >
      <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg z-10 shadow-sm">
        {badgeText}
      </div>

      <div className="h-36 bg-[#09090b] flex items-center justify-center relative border-b border-[#27272a] overflow-hidden">
        {offer.image_url ? (
          <img 
            src={`http://localhost:5000${offer.image_url}`} 
            alt={offer.title} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
          />
        ) : (
          <h3 className="text-3xl font-extrabold text-[#27272a] tracking-widest uppercase">
            {offer.shop_name.substring(0, 3)}
          </h3>
        )}
        <div className="absolute -bottom-4 right-4 bg-[#18181b] border border-[#27272a] shadow-lg rounded-full px-4 py-1 text-xs font-bold text-red-500 z-10">
          {offer.discount_details}
        </div>
      </div>

      <div className="p-5 pt-6 flex-grow flex flex-col">
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{offer.shop_name}</p>
        <h4 className="text-gray-200 font-medium text-sm leading-snug line-clamp-2 group-hover:text-white transition">{offer.title}</h4>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b]">
      <main className="max-w-7xl mx-auto p-8 pt-6">
        
        {searchTerm ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Search Results for "{searchTerm}"</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredOffers.map(offer => <OfferCard key={offer.offer_id} offer={offer} badgeText="SEARCH RESULT" />)}
            </div>
          </div>
        ) : (
          <>
            {/* --- REAL DATABASE CAROUSEL --- */}
            <HeroCarousel slideOffers={topSliderOffers} />

            {/* --- FEATURED DEALS GRID --- */}
            <div className="mb-14">
              <div className="flex justify-between items-end mb-6 border-b border-[#27272a] pb-2">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Featured Deals</h2>
                <Link to="/all-deals" className="text-red-500 hover:text-red-400 font-bold text-sm transition">
                  View All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {latestOffers.map(offer => <OfferCard key={offer.offer_id} offer={offer} badgeText="NEW ARRIVAL" />)}
              </div>
            </div>

            {/* --- EXPIRING SOON GRID --- */}
            <div className="mb-16">
              <div className="flex justify-between items-end mb-6 border-b border-[#27272a] pb-2">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Expiring Soon</h2>
                <Link to="/all-deals" className="text-red-500 hover:text-red-400 font-bold text-sm transition">
                  View All &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {expiringSoon.map(offer => <OfferCard key={offer.offer_id} offer={offer} badgeText="LIMITED TIME" />)}
              </div>
            </div>

            {/* --- POPULAR STORES DIRECTORY --- */}
            <div className="mb-10 border-t border-[#27272a] pt-10">
              <h2 className="text-lg font-bold text-white mb-6">Popular Stores Directory</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-6">
                
                {/* Dynamically mapped from your database! */}
                {directoryShops.map((shop) => (
                  <Link 
                    key={shop.id} 
                    to={`/shop/${shop.id}`} 
                    className="text-gray-500 hover:text-red-400 font-medium text-sm transition flex items-center gap-2 group"
                  >
                    <span className="text-xs opacity-0 group-hover:opacity-100 text-red-600 transition-opacity">➤</span>
                    {shop.name}
                  </Link>
                ))}
                
              </div>
            </div>
          </>
        )}
      </main>

      {/* --- DARK MODE FOOTER --- */}
      <footer className="bg-[#18181b] text-gray-400 py-12 mt-10 border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-extrabold text-red-600 mb-4 tracking-tight">Offer.com</h3>
            <p className="text-sm leading-relaxed">
              Your elite destination for discovering the best local discounts. Shop local, save big.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-red-400 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-red-400 transition">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-red-400 transition">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">For Businesses</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/signup" className="hover:text-red-400 transition">Partner With Us</Link></li>
              <li><Link to="/login" className="hover:text-red-400 transition">Shop Owner Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#27272a] mt-10 pt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Offer.com. All rights reserved.
        </div>
      </footer>

      {/* --- DARK MODE MODAL POPUP --- */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl shadow-red-900/10 w-full max-w-lg overflow-hidden relative animate-fade-in-up">
            <button onClick={closePopup} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold z-10 transition">&times;</button>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-950 text-red-400 border border-red-900/50 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{selectedOffer.discount_details}</span>
                <span className="text-sm text-gray-400 font-medium">⏰ Expires: {new Date(selectedOffer.valid_until).toLocaleDateString()}</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mb-2">{selectedOffer.title}</h2>
              <p className="text-gray-500 font-medium mb-6">Offered by: <span className="text-gray-300">{selectedOffer.shop_name}</span> - {selectedOffer.location}</p>
              
              {selectedOffer.image_url && (
                <img src={`http://localhost:5000${selectedOffer.image_url}`} alt="Offer" className="w-full h-48 object-cover rounded-xl mb-6 shadow-md border border-[#27272a]" />
              )}
              
              <div className="bg-[#09090b] rounded-xl p-5 mb-8 border border-[#27272a] text-gray-400 leading-relaxed">{selectedOffer.description}</div>

              {claimResult ? (
                <div className={`p-6 rounded-xl text-center border ${claimResult.success ? 'bg-green-950/30 border-green-900/50' : 'bg-red-950/30 border-red-900/50'}`}>
                  <p className={`font-bold mb-2 ${claimResult.success ? 'text-green-400' : 'text-red-400'}`}>{claimResult.message}</p>
                  {claimResult.success && (
                    <><p className="text-xs text-green-500 uppercase tracking-widest mb-1 mt-4">Your Coupon Code</p><p className="text-3xl font-mono font-extrabold text-white tracking-widest bg-[#09090b] py-2 rounded-lg border border-green-900/50 inline-block px-6 shadow-inner">{claimResult.code}</p></>
                  )}
                </div>
              ) : (
                <button onClick={() => handleClaim(selectedOffer.offer_id)} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 text-lg shadow-lg shadow-red-600/20">Claim This Deal Now</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;