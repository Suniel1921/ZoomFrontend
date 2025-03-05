import type React from "react"
import { X, Globe, FileText, StampIcon as Passport, Plane, Code, Phone } from "lucide-react"
import Button from "../../components/Button"

interface AppDownloadModalProps {
  isOpen: boolean
  onClose: () => void
}

const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-4 sm:p-6 bg-gradient-to-r from-brand-yellow to-brand-black">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-black">Download Our App</h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 font-bold" strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <p className="text-foreground text-base sm:text-lg">
            Download our app now and unlock a world of convenience! Get exclusive access to our services and enjoy these benefits:
          </p>
          
          {/* Benefits list - Hidden on very small screens */}
          <ul className="hidden sm:block list-disc list-inside text-foreground space-y-2">
            <li>10% discount on all our services for app users</li>
            <li>Easy booking and management of all services</li>
            <li>Real-time updates and notifications</li>
            <li>24/7 customer support through the app</li>
          </ul>

          {/* Condensed benefits for mobile */}
          <p className="sm:hidden text-foreground">
            Get 10% off, easy booking, real-time updates, and 24/7 support!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Services Section */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-brand-black">Our Services</h3>
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:space-y-2">
                <li className="flex items-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-brand-yellow" />
                  <span className="text-foreground text-sm sm:text-base">Translation</span>
                </li>
                <li className="flex items-center">
                  <Passport className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-brand-yellow" />
                  <span className="text-foreground text-sm sm:text-base">ePassport</span>
                </li>
                <li className="flex items-center">
                  <Plane className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-brand-yellow" />
                  <span className="text-foreground text-sm sm:text-base">Tickets</span>
                </li>
                <li className="flex items-center">
                  <Code className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-brand-yellow" />
                  <span className="text-foreground text-sm sm:text-base">Development</span>
                </li>
              </ul>
            </div>

            {/* Download Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-brand-black">Download Now</h3>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="default"
                  onClick={() => window.open("https://apps.apple.com/app-store-link", "_blank")}
                  className="flex items-center justify-center w-full bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 py-2 sm:py-3"
                >
                  <svg viewBox="0 0 384 512" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 fill-current">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  App Store
                </Button>
                <Button
                  variant="default"
                  onClick={() => window.open("https://play.google.com/store/apps/details?id=com.example.app", "_blank")}
                  className="flex items-center justify-center w-full bg-brand-yellow text-brand-black hover:bg-brand-yellow/90 py-2 sm:py-3"
                >
                  <svg viewBox="0 0 512 512" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 fill-current">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                  </svg>
                  Google Play
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Section - Simplified for mobile */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
            <h3 className="text-lg sm:text-xl font-semibold text-brand-black mb-2">Need Help?</h3>
            <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
              <a 
                href="tel:090-6494-5723" 
                className="flex items-center text-foreground hover:text-brand-yellow transition-colors"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-brand-yellow" />
                <span className="text-sm sm:text-base">090-6494-5723</span>
              </a>
              <a
                href="https://www.zoomcreatives.jp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-foreground hover:text-brand-yellow transition-colors"
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-brand-yellow" />
                <span className="text-sm sm:text-base">www.zoomcreatives.jp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppDownloadModal