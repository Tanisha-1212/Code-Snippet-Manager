// pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Layers, 
  Share2, 
  Lock, 
  Search, 
  Zap,
  ArrowRight,
  Check,
  Star,
  Users,
  FileCode,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Code2,
      title: 'Syntax Highlighting',
      description: 'Beautiful code highlighting for 50+ programming languages with multiple themes.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Layers,
      title: 'Smart Collections',
      description: 'Group related snippets into collections. Organize by project, technology, or any way you prefer.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Share2,
      title: 'Share & Collaborate',
      description: 'Share your code snippets with the community or keep them private.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Your private snippets are encrypted and accessible only by you.',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: Search,
      title: 'Powerful Search',
      description: 'Find any snippet instantly with tags, languages, and full-text search.',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance ensures your snippets load instantly, every time.',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up for free in seconds and start organizing your code.',
      icon: Users
    },
    {
      number: '02',
      title: 'Add Snippets',
      description: 'Save your favorite code snippets with syntax highlighting and tags.',
      icon: Code2
    },
    {
      number: '03',
      title: 'Access Anywhere',
      description: 'Access your snippets from any device, anytime, anywhere.',
      icon: Sparkles
    }
  ];

  const stats = [
    { icon: Users, label: 'Community Driven' },
    { icon: FileCode, label: 'Unlimited Snippets' },
    { icon: Star, label: '50+ Languages' }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8 animate-bounce-slow">
              <Star className="w-4 h-4 mr-2 animate-spin-slow" />
              100% Free Forever
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Organize Your Code
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-linear">
                Snippets Effortlessly
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              Save, organize, and share your favorite code snippets. 
              Access them from anywhere, anytime. Completely free!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="group inline-flex items-center px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center px-8 py-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold text-lg transition-all border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl"
              >
                Explore Snippets
              </Link>
            </div>

            {/* Features Highlight */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center transform hover:scale-110 transition-transform duration-300"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features to help you manage your code snippets like a pro
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-sm hover:shadow-xl transform hover:-translate-y-2 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-linear-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="relative group">
                  <div className="text-center transform hover:scale-105 transition-all duration-300">
                    {/* Animated Circle */}
                    <div className="relative inline-flex items-center justify-center mb-6">
                      <div className="absolute w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-purple-600 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow">
                        {step.number}
                      </div>
                    </div>
                    
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                        <StepIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-linear-to-r from-blue-500 to-purple-600 -z-10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-soft-light filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full mix-blend-soft-light filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join developers worldwide who trust Snippet Manager to organize their code. Completely free, forever!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white hover:bg-gray-50 text-blue-600 font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-blue-100">
            <div className="flex items-center animate-fade-in">
              <Check className="w-5 h-5 mr-2" />
              <span>100% Free Forever</span>
            </div>
            <div className="flex items-center animate-fade-in animation-delay-400">
              <Check className="w-5 h-5 mr-2" />
              <span>Unlimited Snippets</span>
            </div>
          </div>
        </div>
      </section>


      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 30px) scale(1.05); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;