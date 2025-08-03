export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Muslim Marriage Referral Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connecting families through trusted referrals and comprehensive biodata sharing
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">For Families</h3>
            <p className="text-gray-600">Submit and view candidate profiles with detailed biodata</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Secure Matching</h3>
            <p className="text-gray-600">Express interest and facilitate connections privately</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Admin Approved</h3>
            <p className="text-gray-600">All profiles reviewed and approved before publication</p>
          </div>
        </div>
        <div className="mt-8 space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Sign In
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}