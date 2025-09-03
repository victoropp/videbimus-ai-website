import Link from 'next/link'
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, MessageCircle } from 'lucide-react'

const footerLinks = {
  services: [
    { name: 'AI Discovery & Strategy', href: '/services#discovery' },
    { name: 'AI Implementation', href: '/services#implementation' },
    { name: 'Enterprise Transformation', href: '/services#transformation' },
    { name: 'Machine Learning', href: '/services#ml' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api' },
    { name: 'Tutorials', href: '/tutorials' },
    { name: 'Support', href: '/support' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Data Protection', href: '/data-protection' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
                <span className="font-bold text-white">V</span>
              </div>
              <span className="font-display text-xl font-bold">Videbimus AI</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Transforming businesses through intelligent automation, predictive analytics, 
              and data-driven decision making.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-cyan-500" />
                <span className="text-gray-400">consulting@videbimusai.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-cyan-500" />
                <span className="text-gray-400">+44 7442 852 675</span>
              </div>
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-cyan-500" />
                <span className="text-gray-400">WhatsApp: +233 248 769 377</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-cyan-500" />
                <span className="text-gray-400">Global Remote Team</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-6">
              <Link 
                href="#" 
                className="text-gray-400 hover:text-cyan-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-cyan-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-gray-400 hover:text-cyan-500 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2025 Videbimus AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}