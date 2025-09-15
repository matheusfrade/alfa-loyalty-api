export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Loyalty Platform API</h1>
            <p className="text-gray-600">
              RESTful API for building loyalty programs and gamification systems
            </p>
          </div>

          <div className="space-y-8">
            {/* Base URL */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Base URL</h2>
              <div className="bg-gray-100 rounded-md p-4">
                <code className="text-sm">http://localhost:3005/api</code>
              </div>
            </section>

            {/* Authentication */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-600 mb-4">
                The API uses JWT tokens for authentication. Include the token in the Authorization header or as a cookie.
              </p>
              <div className="bg-gray-100 rounded-md p-4">
                <code className="text-sm">Authorization: Bearer YOUR_TOKEN_HERE</code>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Demo Accounts</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="text-sm space-y-1">
                    <div><strong>Admin:</strong> admin@loyalty.com / admin123</div>
                    <div><strong>User:</strong> user1@test.com / user1123</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Endpoints */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">API Endpoints</h2>
              
              <div className="space-y-6">
                {/* Auth Endpoints */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Authentication</h3>
                  <div className="space-y-3">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                        <code className="text-sm">/auth/login</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Authenticate user and get JWT token</p>
                      <div className="text-xs text-gray-500">
                        Body: <code>{"{ email, password }"}</code>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                        <code className="text-sm">/auth/me</code>
                      </div>
                      <p className="text-sm text-gray-600">Get current user information</p>
                    </div>

                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                        <code className="text-sm">/auth/logout</code>
                      </div>
                      <p className="text-sm text-gray-600">Logout and clear session</p>
                    </div>
                  </div>
                </div>

                {/* Missions Endpoints */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Missions</h3>
                  <div className="space-y-3">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                        <code className="text-sm">/missions</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">List all missions with user progress</p>
                      <div className="text-xs text-gray-500">
                        Query: <code>programId, category, status, limit, offset</code>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                        <code className="text-sm">/missions</code>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Admin</span>
                      </div>
                      <p className="text-sm text-gray-600">Create new mission</p>
                    </div>

                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                        <code className="text-sm">/missions/:id/claim</code>
                      </div>
                      <p className="text-sm text-gray-600">Claim mission reward</p>
                    </div>
                  </div>
                </div>

                {/* Rewards Endpoints */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Rewards</h3>
                  <div className="space-y-3">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                        <code className="text-sm">/rewards</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">List all available rewards/products</p>
                      <div className="text-xs text-gray-500">
                        Query: <code>programId, category, tierLevel, minPrice, maxPrice, sortBy</code>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                        <code className="text-sm">/rewards</code>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Admin</span>
                      </div>
                      <p className="text-sm text-gray-600">Create new reward product</p>
                    </div>

                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                        <code className="text-sm">/rewards/:id/redeem</code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Redeem reward with coins</p>
                      <div className="text-xs text-gray-500">
                        Body: <code>{"{ quantity, deliveryInfo, notes }"}</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users Endpoints */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Users</h3>
                  <div className="space-y-3">
                    <div className="border rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                        <code className="text-sm">/users/:id</code>
                      </div>
                      <p className="text-sm text-gray-600">Get user details, programs, missions, and transaction history</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Response Format */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Format</h2>
              <p className="text-gray-600 mb-4">All API responses follow a consistent JSON format:</p>
              
              <div className="bg-gray-100 rounded-md p-4 mb-4">
                <pre className="text-sm"><code>{`{
  "success": true,
  "data": {...},
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}`}</code></pre>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h4 className="font-medium text-red-800 mb-2">Error Response:</h4>
                <pre className="text-sm text-red-700"><code>{`{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}`}</code></pre>
              </div>
            </section>

            {/* Examples */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Examples</h2>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Login Request</h4>
                  <div className="bg-gray-100 rounded-md p-4">
                    <pre className="text-sm"><code>{`curl -X POST http://localhost:3005/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user1@test.com", "password": "user1123"}'`}</code></pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Get Missions</h4>
                  <div className="bg-gray-100 rounded-md p-4">
                    <pre className="text-sm"><code>{`curl -X GET http://localhost:3005/api/missions \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -G -d "category=DAILY&limit=10"`}</code></pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Redeem Reward</h4>
                  <div className="bg-gray-100 rounded-md p-4">
                    <pre className="text-sm"><code>{`curl -X POST http://localhost:3005/api/rewards/REWARD_ID/redeem \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"quantity": 1}'`}</code></pre>
                  </div>
                </div>
              </div>
            </section>

            {/* SDKs */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Client SDKs</h2>
              <p className="text-gray-600 mb-4">
                Coming soon: Official SDKs for popular platforms and frameworks.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-md p-4 text-center">
                  <div className="text-2xl mb-2">⚛️</div>
                  <div className="text-sm font-medium">React</div>
                </div>
                <div className="border rounded-md p-4 text-center">
                  <div className="text-2xl mb-2">📱</div>
                  <div className="text-sm font-medium">React Native</div>
                </div>
                <div className="border rounded-md p-4 text-center">
                  <div className="text-2xl mb-2">🟢</div>
                  <div className="text-sm font-medium">Node.js</div>
                </div>
                <div className="border rounded-md p-4 text-center">
                  <div className="text-2xl mb-2">🐍</div>
                  <div className="text-sm font-medium">Python</div>
                </div>
              </div>
            </section>

            {/* Rate Limits */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rate Limits</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Current limits:</strong> 1000 requests per hour per user. 
                  Higher limits available for production environments.
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Loyalty Platform API v1.0.0
              </div>
              <div className="flex gap-4 text-sm">
                <a href="/admin" className="text-blue-600 hover:text-blue-800">Admin Panel</a>
                <a href="/" className="text-blue-600 hover:text-blue-800">Home</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}