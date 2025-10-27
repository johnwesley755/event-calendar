'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, Zap, Shield, Bell, Sparkles, CheckCircle, ArrowRight, Star } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/calendar');
    }
  }, [user, router]);

  const features = [
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Effortlessly manage your events with an intuitive drag-and-drop interface',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: Clock,
      title: 'Time Management',
      description: 'AI-powered suggestions to optimize your daily schedule',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share calendars and coordinate seamlessly with your team',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Zap,
      title: 'Quick Actions',
      description: 'Create and edit events instantly with keyboard shortcuts',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with Firebase Authentication',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Never miss important events with intelligent notifications',
      gradient: 'from-cyan-500 to-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Calendar
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 to-white pt-20 pb-28">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full mb-6">
                <Star className="w-4 h-4 text-violet-600 fill-violet-600" />
                <span className="text-sm font-medium text-violet-900">
                  Modern Calendar Management
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Organize Your Time,
                <span className="block bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Elevate Your Life
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                A powerful, intuitive calendar application that helps you manage events, 
                collaborate with teams, and never miss what matters most.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-base group"
                >
                  <Link href="/signup">
                    Start Free Today
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="text-base border-gray-300"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Secure</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Calendar Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">October 2025</h3>
                    <p className="text-sm text-gray-500">Sunday, 26th</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
                
                {/* Calendar Grid */}
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-xs font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 2;
                      const isToday = day === 26;
                      const hasEvent = [5, 12, 18, 26].includes(day);
                      
                      return (
                        <div
                          key={i}
                          className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-colors
                            ${day < 1 || day > 31 ? 'text-gray-300' : 'text-gray-700'}
                            ${isToday ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-semibold' : ''}
                            ${hasEvent && !isToday ? 'bg-violet-50 font-medium' : ''}
                            ${!hasEvent && !isToday && day >= 1 && day <= 31 ? 'hover:bg-gray-50' : ''}
                          `}
                        >
                          {day >= 1 && day <= 31 ? day : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Events List */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Team Meeting</p>
                      <p className="text-xs text-gray-500">2:00 PM - 3:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Project Review</p>
                      <p className="text-xs text-gray-500">4:30 PM - 5:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg font-medium text-sm"
              >
                ✨ Smart & Simple
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Everyone
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your time effectively in one beautiful interface
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Background */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/90 via-purple-900/90 to-indigo-900/90"></div>
          
          {/* Animated Gradient Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-3xl"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.15, 0.25, 0.15]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-3xl"
          ></motion.div>
        </div>

        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 text-white mx-auto mb-6" />
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Take Control of Your Time?
            </h2>
            
            <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
              Join thousands of users who have transformed the way they manage their calendars and events.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild 
                className="bg-white text-violet-600 hover:bg-gray-100 font-semibold text-base group"
              >
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="border-2 border-white text-violet-600 hover:bg-gray-100 font-semibold text-base group"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            
            
          </motion.div>
        </div>
      </section>
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}