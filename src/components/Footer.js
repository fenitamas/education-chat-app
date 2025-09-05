import Link from 'next/link'
import { FaGraduationCap, FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-2">
              <FaGraduationCap className="h-6 w-6 text-primary-400" />
              <span className="text-2xl font-bold text-white">EduChat</span>
            </div>
            <p className="text-gray-400 mb-3 max-w-md text-sm md:text-base">
              Empowering students and educators to connect, collaborate, and learn together through our modern educational chat platform.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors"><FaGithub className="h-4 w-4" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors"><FaTwitter className="h-4 w-4" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors"><FaLinkedin className="h-4 w-4" /></a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors"><FaEnvelope className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-2 text-sm md:text-base">Quick Links</h3>
            <ul className="space-y-1 text-sm md:text-base">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/resources" className="text-gray-400 hover:text-white transition-colors">Resources</Link></li>
              <li><Link href="/qna" className="text-gray-400 hover:text-white transition-colors">Q&A Forum</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-2 text-sm md:text-base">Support</h3>
            <ul className="space-y-1 text-sm md:text-base">
              <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} EduChat. All rights reserved.</p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">Built with ❤️ for the educational community</p>
        </div>
      </div>
    </footer>
  )
}
