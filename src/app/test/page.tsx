export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          BodyKey Test Page
        </h1>
        <p className="text-gray-600 mb-8">
          If you can see this, the website is working!
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Next Steps:</h2>
          <ol className="text-left space-y-2">
            <li>1. ✅ Website is loading</li>
            <li>2. 🔄 Check navigation links</li>
            <li>3. 🎯 Test login functionality</li>
          </ol>
        </div>
      </div>
    </div>
  )
}