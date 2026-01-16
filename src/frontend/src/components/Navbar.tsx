import { Menu, MapPin, User, Bell, Heart, Settings, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn?: boolean;
}

export function Navbar({ currentPage, onNavigate, isLoggedIn = false }: NavbarProps) {
  const navItems = [
    { name: "Home", page: "home" },
    { name: "Explore", page: "explore" },
    { name: "Dashboard", page: "dashboard" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-primary">LahoreLens</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`transition-colors hover:text-primary ${
                  currentPage === item.page ? "text-primary" : "text-foreground/60"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate("favorites")}
                  className={currentPage === "favorites" ? "text-primary" : ""}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onNavigate("notifications")}
                  className={currentPage === "notifications" ? "text-primary" : ""}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onNavigate("profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onNavigate("settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate("home")}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => onNavigate("login")}>Login / Sign Up</Button>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    className={`text-left transition-colors hover:text-primary ${
                      currentPage === item.page ? "text-primary" : ""
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                {isLoggedIn && (
                  <>
                    <button
                      onClick={() => onNavigate("favorites")}
                      className="text-left transition-colors hover:text-primary"
                    >
                      Favorites
                    </button>
                    <button
                      onClick={() => onNavigate("notifications")}
                      className="text-left transition-colors hover:text-primary"
                    >
                      Notifications
                    </button>
                    <button
                      onClick={() => onNavigate("profile")}
                      className="text-left transition-colors hover:text-primary"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => onNavigate("settings")}
                      className="text-left transition-colors hover:text-primary"
                    >
                      Settings
                    </button>
                  </>
                )}
                {!isLoggedIn && (
                  <Button onClick={() => onNavigate("login")} className="mt-4">
                    Login / Sign Up
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}