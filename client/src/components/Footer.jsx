import { FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="font-bold text-lg text-white">TourMate</span>
            </div>
            <p className="text-sm text-gray-400">
              Your ultimate travel companion for planning amazing tours and discovering new places.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-blue-400 transition">Home</a></li>
              <li><a href="/plan" className="hover:text-blue-400 transition">Plan Tour</a></li>
              <li><a href="/dashboard" className="hover:text-blue-400 transition">Dashboard</a></li>
              <li><a href="/owner/dashboard" className="hover:text-blue-400 transition">For Owners</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400 transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <FiMail size={16} />
                <a href="mailto:info@tourmate.com" className="hover:text-blue-400 transition">
                  info@tourmate.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={16} />
                <a href="tel:+1234567890" className="hover:text-blue-400 transition">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FiMapPin size={16} />
                <span>123 Travel St, World</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {currentYear} TourMate. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-blue-400 transition">
              <FaFacebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition">
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
