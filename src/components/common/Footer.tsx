const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-transparent to-purple-900/20 py-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4 text-xs">
          {/* Brand Section */}
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-pink-400 text-transparent bg-clip-text">
              PUSSIO
            </h3>
            <p className="text-xs text-gray-400">
              The ultimate web3 cat rating game
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">Quick Links</h4>
            <ul className="space-y-0.5 text-xs text-gray-400">
              <li><a href="/game" className="hover:text-white transition-colors">Play Now</a></li>
              <li><a href="/staking" className="hover:text-white transition-colors">Stake NFTs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Leaderboard</a></li>
            </ul>
          </div>

          {/* Social/Community */}
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">Community</h4>
            <ul className="space-y-0.5 text-xs text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 