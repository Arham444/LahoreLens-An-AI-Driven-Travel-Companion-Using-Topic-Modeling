import { useState } from "react";
import { Heart, Trash2, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface FavoritesPageProps {
  onNavigate: (page: string) => void;
}

const initialFavorites = [
  {
    id: 1,
    name: "Badshahi Mosque",
    category: "Culture",
    image: "https://images.unsplash.com/photo-1626303298621-984f671f8a82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJc2xhbWljJTIwYXJjaGl0ZWN0dXJlJTIwbW9zcXVlfGVufDF8fHx8MTc2MDI4NTIzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    location: "Walled City",
  },
  {
    id: 2,
    name: "Cooco's Den",
    category: "Food",
    image: "https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYWtpc3RhbmklMjBmb29kJTIwYmlyeWFuaXxlbnwxfHx8fDE3NjAyODUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    location: "Old City",
  },
  {
    id: 3,
    name: "Lahore Fort",
    category: "Culture",
    image: "https://images.unsplash.com/photo-1663745425508-e37953bd9180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMYWhvcmUlMjBQYWtpc3RhbiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjAyODUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.7,
    location: "Walled City",
  },
  {
    id: 4,
    name: "Basant Festival",
    category: "Event",
    image: "https://images.unsplash.com/photo-1672477179695-7276b0602fa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMFBha2lzdGFuaSUyMGN1aXNpbmV8ZW58MXx8fHwxNzYwMjg1MjMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.6,
    location: "Minar-e-Pakistan",
  },
  {
    id: 5,
    name: "Butt Karahi",
    category: "Food",
    image: "https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYWtpc3RhbmklMjBmb29kJTIwYmlyeWFuaXxlbnwxfHx8fDE3NjAyODUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    location: "Lakshmi Chowk",
  },
  {
    id: 6,
    name: "Art Exhibition",
    category: "Event",
    image: "https://images.unsplash.com/photo-1626303298621-984f671f8a82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJc2xhbWljJTIwYXJjaGl0ZWN0dXJlJTIwbW9zcXVlfGVufDF8fHx8MTc2MDI4NTIzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.5,
    location: "Alhamra Arts",
  },
];

export function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [activeFilter, setActiveFilter] = useState("all");

  const removeFavorite = (id: number) => {
    setFavorites(favorites.filter((item) => item.id !== id));
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

        {favorites.length === 0 ? (
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
                  Food ({favorites.filter((f) => f.category === "Food").length})
                </TabsTrigger>
                <TabsTrigger value="event">
                  Events ({favorites.filter((f) => f.category === "Event").length})
                </TabsTrigger>
                <TabsTrigger value="culture">
                  Culture ({favorites.filter((f) => f.category === "Culture").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFavorites.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="flex-1">{item.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{item.category}</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        {item.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeFavorite(item.id)}
                        className="text-destructive hover:text-destructive"
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
