"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { Menu, X, LogOut, Languages } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useLanguage } from "@/contexts/LanguageContext";

const headerVariants: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const logoVariants: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] },
  },
};

const mobileMenuVariants: Variants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

const DesktopHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  // isTranslating state is no longer in the context, so we remove it here
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
    setIsProfileDropdownOpen(false);
  }, []);

  const toggleProfileDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileDropdownOpen((prev) => !prev);
  }, []);

  const closeProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen(false);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "ur" : "en");
  }, [language, setLanguage]);

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            variants={logoVariants}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Veridict AI"
                width={110}
                height={110}
                className="h-full w-full"
              />
            </Link>
          </motion.div>

          {/* Desktop CTA */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="hidden md:flex items-center space-x-4"
          >
            {/* Language Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                language === "ur"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title={`Switch to ${language === "en" ? "Urdu" : "English"}`}
            >
              <Languages className={`h-4 w-4`} />
              <span className="text-sm font-medium">
                {language === "en" ? "EN" : "اردو"}
              </span>
            </motion.button>

            {status === "loading" ? (
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Open profile menu"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <div className="relative">
                    <Image
                      src={session.user?.image || "/default-profile.jpg"}
                      alt={`${session.user?.name || "User"}'s profile`}
                      className="h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-blue-500 transition-all duration-200"
                      width={32}
                      height={32}
                      priority
                    />
                    {/* Online status indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full" />
                  </div>
                </button>

                {/* Profile Dropdown */}
                <ProfileDropdown
                  isOpen={isProfileDropdownOpen}
                  onClose={closeProfileDropdown}
                />
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
              >
                Login
              </Link>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={toggleMobileMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="py-4 space-y-2">
                {/* Mobile Language Toggle */}
                <div className="px-4 pb-4 border-b border-gray-200">
                  <button
                    onClick={toggleLanguage}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      language === "ur"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Languages className={`h-5 w-5`} />
                    <span className="font-medium">
                      {language === "en"
                        ? "Switch to Urdu"
                        : "Switch to English"}
                    </span>
                  </button>
                </div>

                {/* Mobile Profile Section */}
                <div className="pt-4 border-t border-gray-200 mx-4">
                  {status === "loading" ? (
                    <div className="flex items-center space-x-3 px-2 py-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                    </div>
                  ) : session ? (
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-center space-x-3 px-2 py-2">
                        <Image
                          src={session.user?.image || "/default-profile.jpg"}
                          alt={`${session.user?.name || "User"}'s profile`}
                          className="h-8 w-8 rounded-full"
                          width={32}
                          height={32}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>

                      {/* Sign Out Button */}
                      <button
                        onClick={async () => {
                          await signOut({ callbackUrl: "/" });
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-2 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left px-2 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default DesktopHeader;
