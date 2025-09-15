import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-6xl font-bold text-white mb-4">
          Loyalty Platform API
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Generic loyalty system for any business vertical
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Link
            href="/admin"
            className="p-6 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-colors"
          >
            <h2 className="text-2xl font-semibold text-white mb-2">
              Admin Panel
            </h2>
            <p className="text-gray-300">
              Manage programs, missions, rewards and analytics
            </p>
          </Link>
          
          <Link
            href="/api-docs"
            className="p-6 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-colors"
          >
            <h2 className="text-2xl font-semibold text-white mb-2">
              API Documentation
            </h2>
            <p className="text-gray-300">
              REST API endpoints and integration guide
            </p>
          </Link>
          
          <Link
            href="/demo"
            className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            <h2 className="text-2xl font-semibold text-white mb-2">
              🎮 Sistema Modular Demo
            </h2>
            <p className="text-gray-100">
              Demonstração da arquitetura modular iGaming
            </p>
          </Link>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-colors"
          >
            <h2 className="text-2xl font-semibold text-white mb-2">
              SDKs & Examples
            </h2>
            <p className="text-gray-300">
              Client libraries and implementation examples
            </p>
          </a>
        </div>

        <div className="mt-16 p-8 bg-white/5 backdrop-blur rounded-lg">
          <h3 className="text-2xl font-semibold text-white mb-4">
            Quick Start
          </h3>
          <div className="text-left text-gray-300 space-y-2">
            <p>1. Login to the Admin Panel with your credentials</p>
            <p>2. Create or configure your loyalty program</p>
            <p>3. Set up missions, rewards and tiers</p>
            <p>4. Generate API keys for integration</p>
            <p>5. Use our SDKs or REST API to integrate</p>
          </div>
        </div>

        <div className="mt-8 text-gray-400 text-sm">
          <p>Default admin: admin@loyalty.com / admin123</p>
        </div>
      </div>
    </main>
  )
}