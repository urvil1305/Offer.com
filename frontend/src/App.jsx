import MyClaims from './pages/MyClaims';
import MyOffers from './pages/MyOffers';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import Dashboard from './pages/Dashboard'; // Import the Dashboard page
import Login from './pages/Login'; // Import the Login page
import Signup from './pages/Signup'; // Import the Signup page
import ShopDashboard from './pages/ShopDashboard'; // Import the Shop Dashboard page
import Navbar from './components/Navbar'; // Import the Navbar
import Profile from './pages/Profile'; // Import the Profile page
import AdminDashboard from './pages/AdminDashboard'; // Import the Admin Dashboard page
import AllDeals from './pages/AllDeals'; // Import the All Deals page
import ShopPage from './pages/ShopPage';

import { AboutUs, Contact, PrivacyPolicy } from './pages/StaticPages';

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* The main dashboard page */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/shop-portal" element={<ShopDashboard />} />
        <Route path="/my-claims" element={<MyClaims />} />
        <Route path="/my-offers" element={<MyOffers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/all-deals" element={<AllDeals />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/shop/:id" element={<ShopPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;