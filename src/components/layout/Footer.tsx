"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Github, Linkedin, Globe, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const links = [
    { name: "About", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const socials = [
    { name: "GitHub", icon: Github, href: "https://github.com/AbdulSamad94" },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/abdul-samad-siddiqui-0183012b5/",
    },
    { name: "X", icon: Twitter, href: "https://x.com/abdulsamad77870" },
    {
      name: "Portfolio",
      icon: Globe,
      href: "https://abdulsamadsiddiqui.vercel.app/",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Divider Line */}
        <div className="border-t border-gray-700" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-center py-10 gap-6"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center space-x-2"
          >
            <Image
              src="/logo.png"
              alt="Legalyze AI Logo"
              width={100}
              height={100}
              className="w-auto h-auto"
            />
          </motion.div>

          {/* Links */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 text-sm"
          >
            {links.map((link, index) => (
              <motion.a
                key={link.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                {link.name}
              </motion.a>
            ))}
          </motion.nav>

          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex space-x-5"
          >
            {socials.map((social, index) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <p className="text-center text-gray-500 text-xs md:text-sm pb-6">
          © 2025 Legalyze AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
