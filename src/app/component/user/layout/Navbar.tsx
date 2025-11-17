"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiChevronDown, 
  FiHome, 
  FiUser, 
  FiDollarSign, 
  FiTrendingUp, 
  FiCreditCard, 
  FiActivity, 
  FiMenu,
  FiX,
  FiLogOut
} from "react-icons/fi";
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { signOut } from '@/lib/auth';
import { FaGoogleWallet } from "react-icons/fa";

const SignOutButton = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    try {
      // First call the server action to handle server-side sign out
      const result = await signOut();
      
      if (result.error) {
        console.error('Sign out error:', result.error);
        alert('Failed to sign out. Please try again.');
        return;
      }

      // Then handle client-side sign out with Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error.message);
        alert('Failed to sign out. Please try again.');
        return;
      }

      // Redirect to home page after successful sign out
      router.push('/signin');
      router.refresh(); // Ensure the page updates with the new auth state

    } catch (err) {
      console.error('Unexpected sign out error:', err);
      alert('An unexpected error occurred during sign out.');
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center w-full py-2 sm:py-3 px-2 sm:px-3 text-gray-300 hover:text-teal-400 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
    >
      <FiLogOut className="mr-1 sm:mr-2 flex-shrink-0" />
      <span className="truncate">Sign Out</span>
    </button>
  );
};

const navItems = [
  { name: "Dashboard", href: "/user/dashboard", icon: <FiHome className="flex-shrink-0" /> },
  {
    name: "My Account",
    icon: <FiUser className="flex-shrink-0" />,
    dropdown: [
      { name: "Profile Setting", href: "/user/profile-setting" },
      { name: "My Referral", href: "/user/my-referral" },
      { name: "All Wallet Addresses", href: "/user/all-wallets" },
      { name: "New Wallet Address", href: "/user/new-wallets" },
    ],
  },
  {
    name: "Deposit",
    icon: <FiDollarSign className="flex-shrink-0" />,
    dropdown: [
      { name: "Loan Service", href: "/user/loan" },
      { name: "All Deposit", href: "/user/deposit-all" },
      { name: "New Deposit", href: "/user/deposit-new" },
    ],
  },
  {
    name: "Investment",
    icon: <FiTrendingUp className="flex-shrink-0" />,
    dropdown: [
      { name: "All Investment", href: "/user/investment-all" },
      { name: "New Investment", href: "/user/investment-new" },
    ],
  },
  {
    name: "Withdrawal",
    icon: <FiCreditCard className="flex-shrink-0" />,
    dropdown: [
      { name: "All Withdrawals", href: "/user/withdrawal-all" },
      { name: "New Withdrawal", href: "/user/withdrawal-new" },
    ],
  },
  { name: "Wallet", href: "/user/wallet", icon: <FaGoogleWallet className="flex-shrink-0" /> },
  { name: "Transactions", href: "/user/transactions", icon: <FiActivity className="flex-shrink-0" /> },
];

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-gray-900 text-gray-100 px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center flex-1">
          {/* Mobile Menu Button (hidden on desktop) */}
          <button 
            onClick={toggleMobileMenu}
            className="lg:hidden mr-2 sm:mr-3 md:mr-4 text-gray-300 hover:text-teal-400 flex-shrink-0"
          >
            {mobileMenuOpen ? <FiX size={20} className="sm:w-6 sm:h-6" /> : <FiMenu size={20} className="sm:w-6 sm:h-6" />}
          </button>

          {/* Logo with animation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center min-w-0"
          >
            <div className="bg-teal-500 text-white rounded-lg px-2 py-1 mr-1 sm:mr-2 flex-shrink-0 text-sm sm:text-base">
              C
            </div>
            <div className="flex items-center min-w-0">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-teal-400 truncate">
                RYPTAURA
              </span>
              <span className="hidden xs:inline text-xs font-medium bg-teal-100 text-teal-800 px-1 sm:px-2 py-0.5 rounded-full ml-1 sm:ml-2 flex-shrink-0">
                INVESTSPHERE
              </span>
            </div>
          </motion.div>
        </div>

        {/* Desktop Nav Items (hidden on mobile) */}
        <div className="hidden lg:flex items-center flex-1">
          <ul className="flex items-center space-x-4 xl:space-x-6 ml-6 xl:ml-12">
            {navItems.map((item) => (
              <li 
                key={item.name} 
                className="relative"
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
              >
                {item.dropdown ? (
                  <>
                    <button className="flex items-center text-gray-300 hover:text-teal-400 font-medium transition-colors duration-200 group text-sm xl:text-base">
                      <span className="mr-1.5">{item.icon}</span>
                      <span className="truncate max-w-[100px] xl:max-w-none">{item.name}</span>
                      <motion.span
                        animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-1"
                      >
                        <FiChevronDown className="text-xs group-hover:text-teal-400" />
                      </motion.span>
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.ul
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-xl w-48 xl:w-56 z-50 overflow-hidden"
                        >
                          {item.dropdown.map((sub) => (
                            <motion.li 
                              key={sub.name}
                              whileHover={{ backgroundColor: "rgba(20, 184, 166, 0.1)" }}
                              transition={{ duration: 0.1 }}
                            >
                              <Link
                                href={sub.href}
                                className="flex items-center px-3 xl:px-4 py-2 xl:py-2.5 text-gray-300 hover:text-teal-400 transition-colors duration-200 text-xs xl:text-sm"
                              >
                                <span className="truncate">{sub.name}</span>
                              </Link>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-300 hover:text-teal-400 font-medium transition-colors duration-200 text-sm xl:text-base"
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    <span className="truncate max-w-[80px] xl:max-w-none">{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* User profile and sign out */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 ml-2 sm:ml-4 md:ml-6 lg:ml-8">
          <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gray-700 flex items-center justify-center border border-teal-400/30 flex-shrink-0">
            <FiUser className="text-teal-400 text-sm sm:text-base" />
          </div>
          <div className="hidden lg:block min-w-0">
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Mobile Menu (slides from left) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={toggleMobileMenu}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[280px] sm:w-80 bg-gray-800 z-50 overflow-y-auto"
            >
              <div className="p-3 sm:p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center min-w-0">
                  <div className="bg-teal-500 text-white rounded-lg px-2 py-1 mr-2 flex-shrink-0 text-sm sm:text-base">
                    C
                  </div>
                  <div className="flex items-center min-w-0">
                    <span className="text-lg sm:text-xl font-bold text-teal-400 truncate">
                      RYPTAURA
                    </span>
                    <span className="text-xs font-medium bg-teal-100 text-teal-800 px-1 sm:px-2 py-0.5 rounded-full ml-1 sm:ml-2 flex-shrink-0">
                      INVESTSPHERE
                    </span>
                  </div>
                </div>
                <button 
                  onClick={toggleMobileMenu}
                  className="text-gray-300 hover:text-teal-400 flex-shrink-0 ml-2"
                >
                  <FiX size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <nav className="p-3 sm:p-4">
                <ul className="space-y-1 sm:space-y-2">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      {item.dropdown ? (
                        <div className="mb-1 sm:mb-2">
                          <button 
                            onClick={() => setActiveDropdown(
                              activeDropdown === item.name ? null : item.name
                            )}
                            className="flex items-center justify-between w-full py-2 sm:py-3 px-2 sm:px-3 text-gray-300 hover:text-teal-400 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <span className="mr-2 sm:mr-3 flex-shrink-0">{item.icon}</span>
                              <span className="truncate">{item.name}</span>
                            </div>
                            <motion.span
                              animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex-shrink-0 ml-2"
                            >
                              <FiChevronDown size={14} className="sm:w-4 sm:h-4" />
                            </motion.span>
                          </button>
                          
                          <AnimatePresence>
                            {activeDropdown === item.name && (
                              <motion.ul
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden pl-6 sm:pl-8 mt-1"
                              >
                                {item.dropdown.map((sub) => (
                                  <motion.li 
                                    key={sub.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.1 }}
                                  >
                                    <Link
                                      href={sub.href}
                                      onClick={toggleMobileMenu}
                                      className="block py-2 px-2 sm:px-3 text-gray-400 hover:text-teal-400 hover:bg-gray-700 rounded-lg text-xs sm:text-sm"
                                    >
                                      <span className="truncate">{sub.name}</span>
                                    </Link>
                                  </motion.li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={toggleMobileMenu}
                          className="flex items-center py-2 sm:py-3 px-2 sm:px-3 text-gray-300 hover:text-teal-400 rounded-lg hover:bg-gray-700 text-sm sm:text-base"
                        >
                          <span className="mr-2 sm:mr-3 flex-shrink-0">{item.icon}</span>
                          <span className="truncate">{item.name}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                  {/* Mobile Sign Out Button */}
                  <li className="pt-2 border-t border-gray-700 mt-2">
                    <SignOutButton />
                  </li>
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}