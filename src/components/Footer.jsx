import { FloatingDock } from "./ui/floating-dock";

const Footer = () => {
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

  return (
    <footer className="relative z-20 w-full px-4 py-8 overflow-hidden text-white bg-slate-800">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap justify-center">
          <div className="w-full mb-6 text-center md:w-1/2 lg:w-1/3 md:mb-0">
            <h3 className="mb-3 text-lg font-bold">Algorithm Visualizer</h3>
            <p className="text-sm text-gray-300">
              An interactive platform to visualize and understand algorithms
              through animations and step-by-step explanations.
            </p>
          </div>

          <div className="w-full text-center md:w-1/2 lg:w-1/3">
            <div className="flex justify-center">
              <FloatingDock
                items={socialLinks}
                desktopClassName="h-20 flex"
                mobileClassName="hidden"
              />
            </div>
            <h3 className="mt-3 text-lg font-bold">Connect</h3>
          </div>
        </div>

        <div className="pt-6 mt-8 text-sm text-center text-gray-400 border-t border-gray-700">
          <p>
            © {new Date().getFullYear()} Algorithm Visualizer. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
