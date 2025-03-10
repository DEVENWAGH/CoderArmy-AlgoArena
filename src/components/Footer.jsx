import React from "react";
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-800/50 border-t border-slate-700/50 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
              Algorithm Arena
            </h3>
            <p className="text-gray-400 text-sm">
              Visualize and understand algorithms through interactive
              experiences
            </p>
          </div>
          <div className="flex space-x-6">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/deven-wagh-5691b7271/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="text-[#0A66C2] hover:opacity-80 transition-opacity"
            >
              <FaLinkedin size={24} />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/DEVENWAGH"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="text-[#181717] hover:opacity-80 transition-opacity dark:text-white"
            >
              <FaGithub size={24} />
            </a>

            {/* Twitter/X */}
            <a
              href="https://x.com/ntMUA4ZjcI66141"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter/X Profile"
              className="text-[#1DA1F2] hover:opacity-80 transition-opacity"
            >
              <FaTwitter size={24} />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/wagh_deven/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="text-[#E1306C] hover:opacity-80 transition-opacity"
            >
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
        <div className="mt-6 border-t border-slate-700/50 pt-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Algorithm Arena. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
