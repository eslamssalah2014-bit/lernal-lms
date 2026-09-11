// ============================================================================
// LERNAL FOOTER COMPONENT
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Heart, Award, CheckCircle } from 'lucide-react';
import { LernalLogo } from './LernalLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#001822] border-t border-[#00384D] pt-16 pb-12 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <LernalLogo size="md" />
            <p className="text-gray-300 text-xs leading-relaxed">
              Empowering the next generation of creative thinkers, builders, and young innovators with interactive, kid-safe technology education.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#36C7F4] font-medium bg-[#002D3D] px-3 py-1.5 rounded-lg border border-[#004D6A] w-fit">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Kid-Safe & COPPA Compliant</span>
            </div>
          </div>

          {/* Col 2: Learning Tracks */}
          <div>
            <h4 className="text-[#F5FAFC] font-display font-semibold text-sm mb-4 uppercase tracking-wider">
              Learning Tracks
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/courses?category=coding-cs" className="hover:text-[#36C7F4] transition-colors">
                  Creative Coding & Scratch (Ages 7–12)
                </Link>
              </li>
              <li>
                <Link to="/courses?category=ai-robotics" className="hover:text-[#36C7F4] transition-colors">
                  Artificial Intelligence & Robotics (Ages 9–14)
                </Link>
              </li>
              <li>
                <Link to="/courses?category=entrepreneurs-finance" className="hover:text-[#36C7F4] transition-colors">
                  Young Entrepreneurs & Money (Ages 10–16)
                </Link>
              </li>
              <li>
                <Link to="/courses?category=english-storytelling" className="hover:text-[#36C7F4] transition-colors">
                  English Storytelling Quests (Ages 4–8)
                </Link>
              </li>
              <li>
                <Link to="/courses?category=digital-art-animation" className="hover:text-[#36C7F4] transition-colors">
                  Digital Art & 2D Animation (Ages 8–13)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Why Lernal */}
          <div>
            <h4 className="text-[#F5FAFC] font-display font-semibold text-sm mb-4 uppercase tracking-wider">
              Parent Resources
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#36C7F4]" />
                <span>Weekly Parent Progress Reports</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#36C7F4]" />
                <span>Verified Mentor Background Checks</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#36C7F4]" />
                <span>Bite-Sized Screen Time Schedules</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#36C7F4]" />
                <span>Certificate of Mastery Included</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Navigation */}
          <div>
            <h4 className="text-[#F5FAFC] font-display font-semibold text-sm mb-4 uppercase tracking-wider">
              Quick Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/student/dashboard" className="text-[#8DDFFF] hover:underline flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Learning Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/parent/dashboard" className="text-[#8DDFFF] hover:underline flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Parent Monitoring Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-gray-400 hover:text-white flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin CRM & Operations</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#002D3D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 LERNAL Inc. All rights reserved. Learning built beautifully for kids.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-200 cursor-pointer">Student Safety Oath</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
