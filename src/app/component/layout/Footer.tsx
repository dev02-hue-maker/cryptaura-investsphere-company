"use client";

import {
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaFacebookF,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaChartLine,
  FaGlobe,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-[#001a14] text-white pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 xl:px-12 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-500 to-emerald-500 mix-blend-overlay"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 border-b border-white/10 pb-8 sm:pb-10 lg:pb-12">
          {/* Company Info */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-teal-600 rounded-lg p-1 sm:p-2">
                <FaChartLine className="text-white text-lg sm:text-xl" />
              </div>
             <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
  CRYPTAURA<span className="text-teal-400">INVESTSPHERE</span>
</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base max-w-2xl">
              CRYPTAURA INVESTSPHERE COMPANY is a premier international investment firm 
              specializing in strategic portfolio management across financial markets, 
              cryptocurrency exchanges, and emerging digital assets. Our team of qualified 
              professional traders and analysts delivers exceptional returns through 
              sophisticated investment strategies and risk-managed approaches.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 sm:gap-6 pt-3 sm:pt-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                <FaShieldAlt className="text-teal-400 flex-shrink-0" />
                <span>Secure & Regulated</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                <FaGlobe className="text-teal-400 flex-shrink-0" />
                <span>Global Operations</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-2 sm:space-x-3 pt-4 sm:pt-6">
              <a 
                href="#" 
                className="p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-teal-600 hover:scale-110 transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <FaLinkedinIn className="text-sm sm:text-base group-hover:text-white w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-pink-600 hover:scale-110 transition-all duration-300 group"
                aria-label="Instagram"
              >
                <FaInstagram className="text-sm sm:text-base group-hover:text-white w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-blue-500 hover:scale-110 transition-all duration-300 group"
                aria-label="Twitter"
              >
                <FaTwitter className="text-sm sm:text-base group-hover:text-white w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-blue-800 hover:scale-110 transition-all duration-300 group"
                aria-label="Facebook"
              >
                <FaFacebookF className="text-sm sm:text-base group-hover:text-white w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-white border-l-4 border-teal-500 pl-3">
              Investment Plans
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-gray-300">
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-1 h-1 bg-teal-400 rounded-full flex-shrink-0"></span>
                  Starter Plan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-1 h-1 bg-teal-400 rounded-full flex-shrink-0"></span>
                  Investors Plan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-1 h-1 bg-teal-400 rounded-full flex-shrink-0"></span>
                  Standard Plan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-1 h-1 bg-teal-400 rounded-full flex-shrink-0"></span>
                  Executive Plan
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 sm:space-y-6">
            <h4 className="text-base sm:text-lg font-semibold text-white border-l-4 border-teal-500 pl-3">
              Contact Us
            </h4>
            <ul className="space-y-3 sm:space-y-4 text-gray-300">
              <li className="flex items-start gap-2 sm:gap-3 group">
                <div className="bg-teal-500/20 rounded-lg p-1 sm:p-2 group-hover:bg-teal-500 transition-colors flex-shrink-0 mt-0.5">
                  <FaPhoneAlt className="text-teal-400 group-hover:text-white w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm text-gray-400">Phone</span>
                  <p className="font-medium text-sm sm:text-base truncate">+1 (555) 123-4567</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group">
                <div className="bg-teal-500/20 rounded-lg p-1 sm:p-2 group-hover:bg-teal-500 transition-colors flex-shrink-0 mt-0.5">
                  <FaEnvelope className="text-teal-400 group-hover:text-white w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm text-gray-400">Email</span>
                  <p className="font-medium text-sm sm:text-base break-words">invest@cryptaura-investsphere.com</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 group">
                <div className="bg-teal-500/20 rounded-lg p-1 sm:p-2 group-hover:bg-teal-500 transition-colors flex-shrink-0 mt-0.5">
                  <FaMapMarkerAlt className="text-teal-400 group-hover:text-white w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm text-gray-400">Headquarters</span>
                  <p className="font-medium text-xs sm:text-sm leading-tight">
                    27 Frankley Road<br />
                    New Plymouth Central<br />
                    New Zealand
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="text-gray-400 text-center lg:text-left order-2 lg:order-1">
            <p className="text-xs sm:text-sm">© 2024 CRYPTAURA INVESTSPHERE COMPANY | All Rights Reserved</p>
            <p className="text-xs mt-1 opacity-80">Registered and regulated financial services provider</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-gray-400 order-1 lg:order-2 mb-3 lg:mb-0">
            <a href="#" className="hover:text-teal-400 transition-colors text-xs sm:text-sm whitespace-nowrap">Privacy Policy</a>
            <a href="#" className="hover:text-teal-400 transition-colors text-xs sm:text-sm whitespace-nowrap">Terms of Service</a>
            <a href="#" className="hover:text-teal-400 transition-colors text-xs sm:text-sm whitespace-nowrap">Risk Disclosure</a>
            <a href="#" className="hover:text-teal-400 transition-colors text-xs sm:text-sm whitespace-nowrap">Compliance</a>
            <a href="#" className="hover:text-teal-400 transition-colors text-xs sm:text-sm whitespace-nowrap">Support</a>
          </div>
        </div>

        {/* Regulatory Notice */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/5">
          <p className="text-xs text-gray-500 text-center leading-relaxed px-2 sm:px-0">
            CRYPTAURA INVESTSPHERE COMPANY is a registered financial services provider. 
            Investments are subject to market risk. Please read our risk disclosure 
            before investing. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;