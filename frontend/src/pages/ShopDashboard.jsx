import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ShopDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountDetails, setDiscountDetails] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [image, setImage] = useState(null); 
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in as a shop owner to post an offer.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('discount_details', discountDetails);
    formData.append('valid_until', validUntil);
    if (image) {
      formData.append('image', image); 
    }

    try {
      const response = await fetch('http://localhost:5000/api/offers/create', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData 
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Offer published successfully!');
        setTitle(''); setDescription(''); setDiscountDetails(''); setValidUntil(''); setImage(null);
        setTimeout(() => navigate('/my-offers'), 2000);
      } else {
        setError(data.message || 'Failed to create offer.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while connecting to the server.');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] p-8 flex justify-center items-start pt-12">
      <div className="bg-[#18181b] p-8 rounded-2xl shadow-2xl border border-[#27272a] border-t-4 border-t-red-600 w-full max-w-2xl">
        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Post a New Offer</h2>
        <p className="text-gray-400 mb-8 font-medium">Create a new discount for your customers.</p>
        
        {error && <div className="bg-red-950/50 border border-red-900/50 text-red-400 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}
        {success && <div className="bg-green-950/50 border border-green-900/50 text-green-400 p-3 rounded-lg mb-6 text-sm font-medium text-center">{success}</div>}
        
        <form onSubmit={handleCreateOffer} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Offer Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Free Coffee on Fridays" className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition placeholder-gray-600" required />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Discount Details (Short Tag)</label>
            <input type="text" value={discountDetails} onChange={(e) => setDiscountDetails(e.target.value)} placeholder="e.g., 20% OFF, BOGO" className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition placeholder-gray-600" required />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Full Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explain the rules or details of the discount..." className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition placeholder-gray-600 min-h-[120px]" required />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Product Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setImage(e.target.files[0])} 
              className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition
                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-red-950 file:text-red-400 hover:file:bg-red-900 hover:file:text-white cursor-pointer" 
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Valid Until</label>
            <input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition [color-scheme:dark]" required />
          </div>
          
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-red-600/20 mt-4">
            Publish Offer
          </button>
        </form>
      </div>
    </div>
  );
}

export default ShopDashboard;