// Auth Layout for Login/Register Pages - Split Screen Design
import React from 'react';
import { Outlet } from 'react-router-dom';
import { GraduationCap, Shield, Users, BookOpen, CheckCircle } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const features = [
    { icon: Shield, title: 'Secure Access', desc: 'Role-based access control keeps your data safe' },
    { icon: Users, title: 'Multi-Role Support', desc: 'Admin, Registrar, Instructor, and Student portals' },
    { icon: BookOpen, title: 'Academic Records', desc: 'Complete student lifecycle management' },
    { icon: CheckCircle, title: 'Real-time Updates', desc: 'Instant enrollment and grade synchronization' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white blur-3xl" />
        </div>

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 border border-white/30">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">SIMS</h1>
          <p className="text-primary-100 text-lg">Student Information Management System</p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4 group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/25 transition-colors border border-white/20">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-primary-100 mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 pt-8 border-t border-white/20">
          <p className="text-primary-200 text-center">
            Empowering education through technology
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-3 mx-auto">
              <GraduationCap className="w-7 h-7 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SIMS</h1>
            <p className="text-slate-700 mt-2">Sign in to your account</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 lg:p-10">
            <Outlet />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-slate-500 mt-6 lg:hidden">
            &copy; {new Date().getFullYear()} SIMS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Footer for desktop */}
      <div className="hidden lg:block fixed bottom-0 left-1/2 lg:left-auto lg:right-8 transform -translate-x-1/2 lg:translate-x-0 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} SIMS. All rights reserved.
      </div>
    </div>
  );
};