import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-primary">Lahore Travel Companion</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Your AI-powered guide to exploring the heart of Lahore.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4>Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="text-muted-foreground text-sm hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("explore")}
                  className="text-muted-foreground text-sm hover:text-primary transition-colors"
                >
                  Explore
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("dashboard")}
                  className="text-muted-foreground text-sm hover:text-primary transition-colors"
                >
                  Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4>Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" />
                info@lahoretravel.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4" />
                +92 300 1234567
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4>Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© 2025 Lahore Travel Companion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
