'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaFacebookF, 
  FaInstagram, 
  FaLinkedinIn, 
  FaTwitter,
  FaSearch,
  FaUserCircle
} from 'react-icons/fa'
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi'
// import TranslateBody from '../user/TranslateBody'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  // { label: 'Our Team', href: '/team' },
  { label: 'Investment Plans', href: '/plans' },
  { label: 'Resources', href: '/team' },
  { label: 'Contact', href: '/contact' },
]

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const toggleSearch = () => setSearchOpen(!searchOpen)

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-teal-700 text-white text-sm py-2 px-4 text-center">
        <p className="truncate">Get 5% bonus on your first investment - Limited time offer</p>
      </div>

      {/* Main Navigation */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-sm py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center"
              >
                <span className="text-2xl sm:text-3xl font-bold text-teal-600">C</span>
                <span className="text-lg sm:text-xl font-bold text-gray-800 ml-1">RYPTAURA</span>
                <span className="hidden xs:inline text-xs font-medium bg-teal-100 text-teal-800 px-2 py-1 rounded-full ml-2">
                  INVESTSPHERE
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    pathname === link.href 
                      ? 'text-teal-600 font-semibold' 
                      : 'text-gray-700 hover:text-teal-600'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.span 
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 bottom-0 h-0.5 bg-teal-600"
                      transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Button */}
              <button 
                onClick={toggleSearch}
                className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
                aria-label="Search"
              >
                <FaSearch className="text-base sm:text-lg" />
              </button>

              {/* User/Login - Hidden on mobile */}
              <Link 
                href="/signin" 
                className="hidden sm:flex items-center space-x-2 p-2 text-gray-600 hover:text-teal-600 transition-colors"
              >
                <FaUserCircle className="text-lg sm:text-xl" />
                <span className="text-sm font-medium hidden md:inline">Login</span>
              </Link>

              {/* Social Icons - Desktop */}
              <div className="hidden md:flex items-center space-x-2 ml-2">
                <a href="#" className="p-2 text-gray-500 hover:text-teal-600 transition-colors" aria-label="Facebook">
                  <FaFacebookF className="text-sm" />
                </a>
                <a href="#" className="p-2 text-gray-500 hover:text-teal-600 transition-colors" aria-label="Twitter">
                  <FaTwitter className="text-sm" />
                </a>
                <a href="#" className="p-2 text-gray-500 hover:text-teal-600 transition-colors" aria-label="LinkedIn">
                  <FaLinkedinIn className="text-sm" />
                </a>
                <a href="#" className="p-2 text-gray-500 hover:text-teal-600 transition-colors" aria-label="Instagram">
                  <FaInstagram className="text-sm" />
                </a>
              </div>

              {/* Language Selector - Desktop */}
              {/* <div className="hidden md:block ml-2">
                <TranslateBody />
              </div> */}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="lg:hidden p-2 text-gray-600 hover:text-teal-600 transition-colors"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? (
                  <HiX className="text-xl sm:text-2xl" />
                ) : (
                  <HiOutlineMenuAlt3 className="text-xl sm:text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Panel */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white shadow-md z-40 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search for investments, plans..."
                    className="flex-1 border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleSearch}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleMenu}
            />
            
            {/* Menu Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-4 sm:p-6 border-b">
                  <Link href="/" className="flex items-center">
                    <span className="text-xl font-bold text-teal-600">CRYPTAURA</span>
                    <span className="text-xs font-medium bg-teal-100 text-teal-800 px-2 py-1 rounded-full ml-2">
                      INVESTSPHERE
                    </span>
                  </Link>
                  <button 
                    onClick={toggleMenu}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close menu"
                  >
                    <HiX className="text-2xl text-gray-500" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 sm:p-6">
                  <ul className="space-y-2">
                    {navLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={toggleMenu}
                          className={`block py-3 px-4 text-base font-medium transition-colors rounded-lg ${
                            pathname === link.href
                              ? 'text-teal-600 bg-teal-50 border-l-4 border-teal-600'
                              : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Footer Section */}
                <div className="p-4 sm:p-6 border-t bg-gray-50">
                  {/* Login Button */}
                  <div className="mb-6">
                    <Link 
                      href="/signin" 
                      className="flex items-center justify-center w-full py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                      onClick={toggleMenu}
                    >
                      <FaUserCircle className="mr-2 text-lg" />
                      Login to Account
                    </Link>
                  </div>

                  {/* Social Links */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3 text-center">Follow us</p>
                    <div className="flex justify-center space-x-4">
                      <a href="#" className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-teal-600 hover:shadow-md transition-all" aria-label="Facebook">
                        <FaFacebookF />
                      </a>
                      <a href="#" className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-teal-600 hover:shadow-md transition-all" aria-label="Twitter">
                        <FaTwitter />
                      </a>
                      <a href="#" className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-teal-600 hover:shadow-md transition-all" aria-label="LinkedIn">
                        <FaLinkedinIn />
                      </a>
                      <a href="#" className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-teal-600 hover:shadow-md transition-all" aria-label="Instagram">
                        <FaInstagram />
                      </a>
                    </div>
                  </div>

                  {/* Additional mobile-only login link */}
                  <div className="sm:hidden text-center">
                    <Link 
                      href="/signin" 
                      className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 font-medium"
                      onClick={toggleMenu}
                    >
                      <FaUserCircle className="mr-2" />
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Add padding to prevent content from being hidden under fixed header */}
      <div className="h-16 sm:h-20"></div>
    </>
  )
}