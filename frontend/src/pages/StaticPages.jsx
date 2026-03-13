export function AboutUs() {
  return (
    <div className="min-h-screen bg-[#09090b] p-10 pt-16">
      <div className="max-w-3xl mx-auto bg-[#18181b] p-10 rounded-2xl shadow-2xl border border-[#27272a]">
        <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
          About <span className="text-red-600">Offer.com</span>
        </h1>
        <div className="space-y-6 text-gray-400 leading-relaxed text-lg">
          <p>
            Welcome to Offer.com, your elite destination for discovering the best local discounts and deals. Our mission is to seamlessly connect savvy shoppers with amazing local businesses.
          </p>
          <p>
            Whether you are looking for 50% off a new laptop or a free item with your morning coffee, we bring the savings directly to your screen with a premium, distraction-free experience. Shop local, save big!
          </p>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <div className="min-h-screen bg-[#09090b] p-10 pt-16">
      <div className="max-w-3xl mx-auto bg-[#18181b] p-10 rounded-2xl shadow-2xl border border-[#27272a]">
        <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Contact Us</h1>
        <p className="text-gray-400 mb-8 text-lg">Have a question or want to feature your business? Reach out to our support team.</p>
        
        <div className="bg-[#09090b] p-6 rounded-xl border border-[#27272a]">
          <ul className="space-y-4 text-lg text-gray-300 font-medium">
            <li className="flex items-center gap-3"><span className="text-red-500 text-2xl">📧</span> support@offer.com</li>
            <li className="flex items-center gap-3"><span className="text-red-500 text-2xl">📞</span> +91 98765 43210</li>
            <li className="flex items-center gap-3"><span className="text-red-500 text-2xl">📍</span> Ahmedabad, Gujarat, India</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#09090b] p-10 pt-16">
      <div className="max-w-3xl mx-auto bg-[#18181b] p-10 rounded-2xl shadow-2xl border border-[#27272a]">
        <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Privacy Policy</h1>
        <div className="space-y-6 text-gray-400 leading-relaxed text-lg">
          <p>
            At Offer.com, we take your privacy seriously. We only collect the necessary information required to provide you with the best deals and securely manage your account.
          </p>
          <p>
            We do not sell your personal data to third parties. All passwords are encrypted using industry-standard hashing, and your claiming history is kept strictly confidential within our secure database.
          </p>
        </div>
      </div>
    </div>
  );
}