import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Chatbot } from "./components/Chatbot";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { ExplorePage } from "./pages/ExplorePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

type Page = 
  | "home" 
  | "login" 
  | "dashboard" 
  | "explore" 
  | "favorites" 
  | "profile" 
  | "notifications" 
  | "settings" 
  | "404";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleNavigate = (page: string) => {
    if (page === "dashboard" || page === "login") {
      setIsLoggedIn(true);
    }
    
    if (page === "home" && currentPage === "login") {
      setIsLoggedIn(false);
    }

    setCurrentPage(page as Page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <LandingPage onNavigate={handleNavigate} />;
      case "login":
        return <LoginPage onNavigate={handleNavigate} />;
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "explore":
        return <ExplorePage onNavigate={handleNavigate} />;
      case "favorites":
        return <FavoritesPage onNavigate={handleNavigate} />;
      case "profile":
        return <ProfilePage onNavigate={handleNavigate} />;
      case "notifications":
        return <NotificationsPage onNavigate={handleNavigate} />;
      case "settings":
        return <SettingsPage onNavigate={handleNavigate} />;
      case "404":
        return <NotFoundPage onNavigate={handleNavigate} />;
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  const showNavAndFooter = currentPage !== "login";

  return (
    <div className="min-h-screen flex flex-col">
      {showNavAndFooter && (
        <Navbar 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
        />
      )}
      
      <main className="flex-1">
        {renderPage()}
      </main>
      
      {showNavAndFooter && <Footer onNavigate={handleNavigate} />}
      
      {isLoggedIn && <Chatbot />}
    </div>
  );
}