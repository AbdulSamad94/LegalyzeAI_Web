"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { User, LogOut, Settings } from "lucide-react";
import { useRef, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
  },
};

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut({ callbackUrl: "/" });
      onClose();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [onClose]);

  const handleSettingsClick = useCallback(() => {
    console.log("Navigate to settings");
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        variants={dropdownVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
      >
        {/* User Info Section */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Image
              src={session?.user?.image || "/default-profile.jpg"}
              alt={`${session?.user?.name || "User"}'s profile`}
              className="h-10 w-10 rounded-full ring-2 ring-gray-200"
              width={40}
              height={40}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <Link
            href="/dashboard"
            className="cursor-pointer w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 focus:outline-none focus:bg-gray-50"
          >
            <User className="h-4 w-4 mr-3 text-gray-400" />
            <span>View Profile</span>
          </Link>

          <button
            onClick={handleSettingsClick}
            className="cursor-pointer w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 focus:outline-none focus:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-3 text-gray-400" />
            <span>Settings</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-1" />

        {/* Sign Out Section */}
        <div className="py-1">
          <button
            onClick={handleSignOut}
            className="cursor-pointer w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 focus:outline-none focus:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileDropdown;
