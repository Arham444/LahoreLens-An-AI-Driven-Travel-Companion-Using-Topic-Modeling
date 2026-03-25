import { useState, useEffect } from "react";
import { Heart, Trash2, Star, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { auth } from "../config/firebase";

interface Place {
  _id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  location: string;
}

interface FavoritesPageProps {
  onNavigate: (page: string) => void;
}

export function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to view favorites.");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch("http://localhost:5000/api/users/favorites", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch favorites");

      const data = await response.json();
      setFavorites(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load your favorite locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (placeId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:5000/api/users/favorites/${placeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((place) => place._id !== placeId));
      }
    } catch (err) {
      console.error("Failed to remove favorite", err);
    }
  };

  const filteredFavorites =
    activeFilter === "all"
      ? favorites
      : favorites.filter((item) => item.category.toLowerCase() === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1>My Favorites</h1>
          </div>
          <p className="text-muted-foreground">
            {favorites.length} saved {favorites.length === 1 ? "item" : "items"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="p-12 text-center border-red-200 bg-red-50/50">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="mb-2 text-red-700">Oops!</h3>
            <p className="text-red-600 mb-6">{error}</p>
          </Card>
        ) : favorites.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring and save your favorite places, events, and restaurants
            </p>
            <Button onClick={() => onNavigate("explore")}>
              Explore Lahore
            </Button>
          </Card>
        ) : (
          <>
            {/* Filter Tabs */}
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All ({favorites.length})</TabsTrigger>
                <TabsTrigger value="food">
                  Food ({favorites.filter((f: Place) => f.category === "Food").length})
                </TabsTrigger>
                <TabsTrigger value="event">
                  Events ({favorites.filter((f: Place) => f.category === "Event").length})
                </TabsTrigger>
                <TabsTrigger value="culture">
                  Culture ({favorites.filter((f: Place) => f.category === "Culture").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((item: Place) => (
                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                       <h4 className="flex-1 line-clamp-1">{item.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{item.category}</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {item.rating || "4.8"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{item.location || "Lahore, Pakistan"}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFavorite(item._id)}
                        className="text-destructive hover:text-destructive hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFavorites.length === 0 && activeFilter !== "all" && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No {activeFilter} favorites yet
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
