import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Zap, 
  Shield, 
  CheckCircle,
  Mail,
  ArrowRight,
  Star,
  Users,
  Crown,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsLoading(false);
    setEmail('');
  };

  const features = [
    {
      icon: Brain,
      title: "AI Does The Work For You",
      description: "No need to learn complex analysis - our AI studies the markets so you don't have to"
    },
    {
      icon: BarChart3,
      title: "Simple Charts & Signals",
      description: "Easy-to-read charts with clear BUY/SELL signals - perfect for weekend traders"
    },
    {
      icon: Target,
      title: "Clear Entry & Exit Points",
      description: "Know exactly when to buy, when to sell, and when to cut losses - no guesswork"
    },
    {
      icon: Zap,
      title: "Phone Notifications",
      description: "Get alerts on your phone when it's time to make a move - perfect for busy lifestyles"
    },
    {
      icon: Shield,
      title: "Built-In Safety",
      description: "Never risk more than you can afford - automatic risk management protects your money"
    },
    {
      icon: Sparkles,
      title: "Beginner-Friendly Learning",
      description: "Learn crypto patterns as you go - turn your weekend hobby into profitable trades"
    }
  ];

  const testimonials = [
    {
      name: "Mike Johnson",
      role: "Weekend Trader",
      content: "I work full-time and can only trade weekends. This AI makes it so easy - finally making consistent profits!",
      rating: 5
    },
    {
      name: "Lisa Chen",
      role: "Crypto Beginner",
      content: "Started with zero knowledge. This tool taught me everything while I was making money. Game-changer!",
      rating: 5
    },
    {
      name: "Tom Rodriguez",
      role: "Part-Time Investor",
      content: "Perfect for someone like me who can't watch charts all day. AI does the heavy lifting!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-8">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <img 
                src="/Capture.JPG" 
                alt="Crypto Booster Logo"
                className="w-12 h-12 rounded-lg"
              />
              <span className="text-white font-bold text-xl">Crypto Booster</span>
            </div>
            
            <motion.button
              onClick={onEnterApp}
              className="px-6 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 text-white rounded-xl font-medium transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter App
            </motion.button>
          </motion.div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Coming Soon - Early Access Available
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              The Future of
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Crypto Trading</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Finally, crypto trading made simple for everyone. No experience needed. 
              Let AI guide your trades with easy signals and clear entry/exit points.
            </p>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span>Multi-Timeframe Charts</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span>Precision Trading Signals</span>
              </div>
            </div>

            {/* Email Capture */}
            <div className="max-w-md mx-auto">
              {isSubmitted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl"
                >
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">You're on the list!</h3>
                  <p className="text-emerald-300 text-sm">
                    We'll notify you as soon as Crypto Booster launches. Get ready for the future of trading!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Enter your email for early access"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-900/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      required
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    whileHover={!isLoading && email ? { scale: 1.02 } : {}}
                    whileTap={!isLoading && email ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <span>Join the Waitlist</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>

            <p className="text-gray-500 text-sm mt-4">
              🔥 <strong>500+</strong> traders already signed up • No spam, ever
            </p>
            
            {/* Alternative CTA */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-gray-400 text-sm mb-4">
                Want to try it now? Access the beta version:
              </p>
              <motion.button
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 hover:border-blue-500/50 text-white rounded-xl font-medium transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="w-4 h-4" />
                <span>Try Beta Version</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <p className="text-gray-500 text-xs mt-2">
                ⚡ Live demo with real crypto data
              </p>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for Real People, Not Wall Street
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No PhD in finance required. Simple tools that actually work for everyday crypto investors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl hover:border-blue-500/30 transition-all duration-300 group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4 group-hover:bg-blue-500/30 transition-all">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Partners Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Powered by Industry Leaders
            </h2>
            <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
              We integrate with the most trusted platforms in crypto to bring you the best data and analysis
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              {/* CoinGecko */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-col items-center p-6 bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-2xl hover:border-green-500/30 transition-all duration-300 w-full"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <img 
                    src="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" 
                    alt="CoinGecko Logo" 
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://www.coingecko.com/favicon.ico';
                    }}
                  />
                </div>
                <h3 className="text-white font-semibold text-sm">CoinGecko</h3>
                <p className="text-gray-400 text-xs mt-1 text-center">Market Data</p>
              </motion.div>

              {/* Binance */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col items-center p-6 bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-2xl hover:border-yellow-500/30 transition-all duration-300 w-full"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <img 
                    src="https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" 
                    alt="Binance Logo" 
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://bin.bnbstatic.com/static/images/common/favicon.ico';
                    }}
                  />
                </div>
                <h3 className="text-white font-semibold text-sm">Binance</h3>
                <p className="text-gray-400 text-xs mt-1 text-center">Exchange Data</p>
              </motion.div>

              {/* CoinMarketCap */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col items-center p-6 bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-2xl hover:border-blue-500/30 transition-all duration-300 w-full"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <img 
                    src="https://s2.coinmarketcap.com/static/cloud/img/coinmarketcap_1.svg" 
                    alt="CoinMarketCap Logo" 
                    className="w-10 h-10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://coinmarketcap.com/favicon.ico';
                    }}
                  />
                </div>
                <h3 className="text-white font-semibold text-sm">CoinMarketCap</h3>
                <p className="text-gray-400 text-xs mt-1 text-center">Analytics</p>
              </motion.div>

              {/* OpenRouter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col items-center p-6 bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-2xl hover:border-purple-500/30 transition-all duration-300 w-full"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  <img 
                    src="https://openrouter.ai/favicon.ico" 
                    alt="OpenRouter Logo" 
                    className="w-10 h-10 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzg4NzVmZiIvPjxwYXRoIGQ9Im0xMiAxNiA4IDggOC04IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==';
                    }}
                  />
                </div>
                <h3 className="text-white font-semibold text-sm">OpenRouter</h3>
                <p className="text-gray-400 text-xs mt-1 text-center">AI Models</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <h3 className="text-white font-semibold">Enterprise-Grade Infrastructure</h3>
              </div>
              <p className="text-gray-300 text-sm text-center leading-relaxed">
                Real-time market data from CoinGecko & CoinMarketCap • Advanced AI analysis via OpenRouter • 
                Exchange integrations for live trading signals • 99.9% uptime guaranteed
              </p>
            </motion.div>
          </motion.div>
        </section>
        {/* Social Proof */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              What Early Users Are Saying
            </h2>
            <p className="text-xl text-gray-400">
              Join hundreds of everyday people already making money with crypto
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="text-white font-medium">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
          >
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
              <div className="text-gray-400">Everyday People Waiting</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-emerald-400 mb-2">50+</div>
              <div className="text-gray-400">Cryptocurrencies</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400">AI Market Watching</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-orange-400 mb-2">Zero</div>
              <div className="text-gray-400">Experience Required</div>
            </div>
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center p-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-3xl"
          >
            <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Be Among the First
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Early access members get exclusive features, priority support, and special launch pricing.
            </p>
            
            {!isSubmitted && (
              <motion.button
                onClick={() => document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-5 h-5" />
                <span>Join the Waitlist</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm border-t border-gray-800">
          <p>© 2025 Crypto Booster. Simple cryptocurrency trading powered by AI.</p>
          <p className="mt-2">Coming Soon • Built for Everyone</p>
        </footer>
      </div>
    </div>
  );
};