import { MapPin, Home, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <MapPin className="h-32 w-32 text-primary opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">404</span>
              </div>
            </div>
          </div>

          <h1 className="mb-4">Lost in Lahore?</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            The page you're looking for doesn't exist. Let's get you back on track!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => onNavigate("home")}>
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate("explore")}>
              <Search className="mr-2 h-5 w-5" />
              Explore Lahore
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-muted-foreground text-sm mb-4">
              Popular destinations:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("favorites")}
              >
                Favorites
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("profile")}
              >
                Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("settings")}
              >
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
