import { useState } from "react";
import { FloatingDock } from "./ui/floating-dock";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import PropTypes from "prop-types"; // Add PropTypes import

const Footer = () => {
  // Add state for modals
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };

  // Social media links for FloatingDock
  const socialLinks = [
    {
      title: "GitHub",
      href: "https://github.com/DEVENWAGH",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
          aria-hidden="true"
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
      ),
    },
    {
      title: "X",
      href: "https://x.com/ntMUA4ZjcI66141",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
      ),
    },
    {
      title: "LinkedIn",
      href: "https://www.linkedin.com/in/deven-wagh-5691b7271/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      ),
    },
    {
      title: "Instagram",
      href: "https://www.instagram.com/wagh_deven/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ),
    },
  ];

  // Resources links for Footer - add FAQ to the list
  const resourceLinks = [
    { name: "Sorting Algorithms", path: "/sorting/bubble" },
    { name: "Searching Algorithms", path: "/searching/linear" },
    { name: "Graph Algorithms", path: "/graph/bfs" },
    { name: "Dynamic Programming", path: "/dynamic-programming/fibonacci" },
    { name: "Greedy Algorithms", path: "/greedy-algorithm/activity-selection" },
    { name: "Backtracking", path: "/backtracking/n-queens" },
    { name: "Tree Algorithms", path: "/tree-algorithms/binary-search-tree" },
    {
      name: "Mathematical Algorithms",
      path: "/mathematical-algorithms/gcd-euclidean",
    },
    { name: "Race Mode", path: "/race-mode" },
    { name: "FAQ", path: "/faq" },
  ];

  // Split the resource links into two columns for better layout
  const resourceLinksColumnOne = resourceLinks.slice(
    0,
    Math.ceil(resourceLinks.length / 2)
  );
  const resourceLinksColumnTwo = resourceLinks.slice(
    Math.ceil(resourceLinks.length / 2)
  );

  return (
    <motion.footer
      className="relative z-20 w-full px-4 py-8 overflow-hidden text-white bg-slate-800"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1, y: [50, 0] }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ amount: 0.1 }}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.1 }}
        >
          {/* Company Info */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-3 text-lg font-bold">Algorithm Arena</h3>
            <p className="text-sm text-gray-300">
              An interactive platform to visualize and understand algorithms
              through animations and step-by-step explanations.
            </p>
          </motion.div>

          {/* Resources Links - Fix the h3 tag closing issue */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-3 text-lg font-bold">Resources</h3>
            <nav
              aria-label="Footer Navigation"
              className="grid grid-cols-1 md:grid-cols-2 gap-x-4"
            >
              {/* First Column */}
              <ul className="space-y-2">
                {resourceLinksColumnOne.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    viewport={{ margin: "-50px" }}
                  >
                    <Link
                      to={link.path}
                      className="text-sm text-gray-300 transition-colors hover:text-blue-400"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Second Column */}
              <ul className="space-y-2">
                {resourceLinksColumnTwo.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                    viewport={{ margin: "-50px" }}
                  >
                    <Link
                      to={link.path}
                      className="text-sm text-gray-300 transition-colors hover:text-blue-400"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-3 text-lg font-bold">Connect</h3>
            <motion.div
              className="flex justify-start md:justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ margin: "-50px" }}
            >
              <FloatingDock
                items={socialLinks}
                desktopClassName="h-20 flex"
                mobileClassName="hidden"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="pt-6 mt-8 text-sm text-center text-gray-400 border-t border-gray-700"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          viewport={{ margin: "-50px" }}
        >
          <p>
            © {new Date().getFullYear()} Algorithm Visualizer. All rights
            reserved.
          </p>
          <div className="mt-2 space-x-4">
            <motion.button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
            >
              Privacy Policy
            </motion.button>
            <motion.button
              onClick={() => setShowTermsModal(true)}
              className="hover:text-blue-400"
              whileHover={{ scale: 1.05 }}
            >
              Terms of Service
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Add modal components */}
      <AnimatePresence>
        {showPrivacyModal && (
          <PolicyModal
            title="Privacy Policy"
            content={privacyContent}
            onClose={() => setShowPrivacyModal(false)}
          />
        )}

        {showTermsModal && (
          <PolicyModal
            title="Terms of Service"
            content={termsContent}
            onClose={() => setShowTermsModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.footer>
  );
};

// Create a reusable modal component with PropTypes validation
const PolicyModal = ({ title, content, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-11/12 max-w-2xl max-h-[80vh] bg-slate-800 rounded-xl p-5 overflow-y-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-blue-400">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="text-gray-300">{content}</div>
      </motion.div>
    </motion.div>
  );
};

// Add PropTypes validation for PolicyModal
PolicyModal.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

// Add placeholder content - Fix unescaped entities
const privacyContent = (
  <div className="space-y-4">
    <p>
      This Privacy Policy describes how your personal information is collected,
      used, and shared when you visit Algorithm Arena.
    </p>

    <h4 className="font-semibold text-white">Information We Collect</h4>
    <p>
      We do not collect any personal information from users. This platform is
      designed for educational purposes only.
    </p>

    <h4 className="font-semibold text-white">How We Use Your Information</h4>
    <p>
      Since we don&apos;t collect personal information, we don&apos;t use your
      information in any way.
    </p>

    <h4 className="font-semibold text-white">Sharing Your Information</h4>
    <p>
      We do not share, sell, or otherwise disclose your personal information for
      purposes other than those outlined in this Privacy Policy.
    </p>

    <h4 className="font-semibold text-white">Contact Us</h4>
    <p>
      If you have questions or concerns about this Privacy Policy, please
      contact us through GitHub.
    </p>
  </div>
);

const termsContent = (
  <div className="space-y-4">
    <p>By using Algorithm Arena, you agree to these Terms of Service.</p>

    <h4 className="font-semibold text-white">Use License</h4>
    <p>
      Permission is granted to use this platform for educational purposes. This
      is the grant of a license, not a transfer of title.
    </p>

    <h4 className="font-semibold text-white">Disclaimer</h4>
    <p>
      The materials on Algorithm Arena are provided on an &apos;as is&apos;
      basis. Algorithm Arena makes no warranties, expressed or implied, and
      hereby disclaims and negates all other warranties.
    </p>

    <h4 className="font-semibold text-white">Limitations</h4>
    <p>
      In no event shall Algorithm Arena or its suppliers be liable for any
      damages arising out of the use or inability to use the materials on
      Algorithm Arena.
    </p>

    <h4 className="font-semibold text-white">Revisions</h4>
    <p>
      The materials appearing on Algorithm Arena could include technical,
      typographical, or photographic errors. Algorithm Arena does not warrant
      that any of the materials on its website are accurate, complete, or
      current.
    </p>
  </div>
);

export default Footer;
