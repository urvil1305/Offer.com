import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function MyOffers() {
  const [offers, setOffers] = useState([]);
  const [editingOffer, setEditingOffer] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', discount_details: '', valid_until: '' });
  
  // NEW: State for the edit image
  const [editImage, setEditImage] = useState(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  const fetchMyOffers = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch('http://localhost:5000/api/offers/my-offers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setOffers(data))
      .catch((err) => console.error("Error fetching my offers:", err));
  };

  useEffect(() => {
    fetchMyOffers();
  }, [navigate]);

  const handleDelete = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/offers/${offerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchMyOffers();
      else alert('Error deleting offer');
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setEditImage(null); // Reset the image when opening
    const formattedDate = new Date(offer.valid_until).toISOString().slice(0, 16);
    setEditForm({
      title: offer.title,
      description: offer.description,
      discount_details: offer.discount_details,
      valid_until: formattedDate
    });
  };

  // NEW: Updated to use FormData for the image!
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('description', editForm.description);
    formData.append('discount_details', editForm.discount_details);
    formData.append('valid_until', editForm.valid_until);
    if (editImage) {
      formData.append('image', editImage);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/offers/${editingOffer.offer_id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` 
          // DO NOT set Content-Type here, the browser does it automatically for FormData!
        },
        body: formData
      });
      
      if (response.ok) {
        setEditingOffer(null); 
        fetchMyOffers();       
      } else {
        alert('Failed to update offer');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const searchLower = searchTerm.toLowerCase();
    return offer.title.toLowerCase().includes(searchLower) || offer.discount_details.toLowerCase().includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-[#09090b] p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-white mb-8 border-b border-[#27272a] pb-4 tracking-tight">
          {searchTerm ? `Searching My Offers for "${searchTerm}"` : 'Manage My Offers'}
        </h2>
        
        {offers.length === 0 ? (
          <div className="bg-[#18181b] p-8 rounded-2xl shadow-lg border border-[#27272a] text-center text-gray-500 font-medium">
            No active offers found. Expired offers are removed automatically!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              // NEW: UI Overhaul - Removed internal padding so the image goes edge-to-edge!
              <div key={offer.offer_id} className="bg-[#18181b] rounded-2xl shadow-lg border border-[#27272a] flex flex-col group hover:shadow-red-900/10 transition overflow-hidden">
                
                {/* Edge-to-Edge Banner Image */}
                {offer.image_url && (
                  <div className="h-48 w-full border-b border-[#27272a] overflow-hidden relative">
                    <img 
                      src={`http://localhost:5000${offer.image_url}`} 
                      alt="Offer" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute top-3 right-3 bg-red-950/80 backdrop-blur-sm text-red-400 border border-red-900/50 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {offer.discount_details}
                    </div>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition">{offer.title}</h3>
                    {/* Fallback if no image is used */}
                    {!offer.image_url && (
                      <span className="bg-red-950 text-red-400 border border-red-900/50 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2 shadow-inner">
                        {offer.discount_details}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mb-6 bg-[#09090b] p-3 rounded-xl border border-[#27272a] flex items-center gap-2 mt-auto">
                    ⏰ Expires: {new Date(offer.valid_until).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => openEditModal(offer)}
                      className="flex-1 bg-[#27272a] text-gray-300 hover:bg-[#3f3f46] hover:text-white font-bold py-2 px-4 rounded-xl transition duration-200 border border-[#3f3f46]"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(offer.offer_id)}
                      className="flex-1 bg-red-950/50 text-red-400 hover:bg-red-600 hover:text-white font-bold py-2 px-4 rounded-xl transition duration-200 border border-red-900/50 hover:border-transparent"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {editingOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-[#18181b] rounded-2xl shadow-2xl shadow-red-900/10 w-full max-w-lg p-8 relative border border-[#27272a] animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingOffer(null)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold transition">&times;</button>
            <h2 className="text-2xl font-extrabold mb-6 text-white tracking-tight">Edit Offer</h2>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Offer Title</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Discount Details</label>
                <input type="text" value={editForm.discount_details} onChange={e => setEditForm({...editForm, discount_details: e.target.value})} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition" required />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition min-h-[100px]" required />
              </div>
              
              {/* NEW: IMAGE EDIT FIELD */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Update Photo (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setEditImage(e.target.files[0])} 
                  className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 hover:file:text-white cursor-pointer" 
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-semibold mb-2">Valid Until</label>
                <input type="datetime-local" value={editForm.valid_until} onChange={e => setEditForm({...editForm, valid_until: e.target.value})} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition [color-scheme:dark]" required />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-red-600/20 mt-4">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOffers;