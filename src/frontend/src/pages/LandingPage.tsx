import { Search, Utensils, Calendar, Cloud, MapPin, Star, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const categories = [
  { icon: Utensils, title: "Food", description: "Discover authentic Lahori cuisine", color: "bg-orange-500" },
  { icon: Calendar, title: "Events", description: "Find cultural festivals & concerts", color: "bg-purple-500" },
  { icon: Cloud, title: "Weather", description: "Check current conditions", color: "bg-blue-500" },
  { icon: MapPin, title: "Cultural Sites", description: "Explore historical landmarks", color: "bg-green-500" },
];

const topPlaces = [
  {
    id: 1,
    name: "Badshahi Mosque",
    image: "https://images.unsplash.com/photo-1626303298621-984f671f8a82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJc2xhbWljJTIwYXJjaGl0ZWN0dXJlJTIwbW9zcXVlfGVufDF8fHx8MTc2MDI4NTIzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    type: "Historical",
  },
  {
    id: 2,
    name: "Food Street",
    image: "https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYWtpc3RhbmklMjBmb29kJTIwYmlyeWFuaXxlbnwxfHx8fDE3NjAyODUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    type: "Dining",
  },
  {
    id: 3,
    name: "Lahore Fort",
    image: "https://images.unsplash.com/photo-1663745425508-e37953bd9180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMYWhvcmUlMjBQYWtpc3RhbiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjAyODUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.7,
    type: "Historical",
  },
  {
    id: 4,
    name: "Anarkali Bazaar",
    image: "https://images.unsplash.com/photo-1672477179695-7276b0602fa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMFBha2lzdGFuaSUyMGN1aXNpbmV8ZW58MXx8fHwxNzYwMjg1MjMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.6,
    type: "Shopping",
  },
];

const upcomingEvents = [
  { title: "Basant Festival", date: "March 15, 2025", location: "Minar-e-Pakistan" },
  { title: "Lahore Literary Festival", date: "March 20-22, 2025", location: "Alhamra Arts Council" },
  { title: "Food Carnival", date: "March 28, 2025", location: "Fortress Stadium" },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1663745425508-e37953bd9180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMYWhvcmUlMjBQYWtpc3RhbiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjAyODUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Lahore"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center text-white">
          <h1 className="text-white mb-4">Discover the Heart of Lahore</h1>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Your AI-powered companion for exploring food, culture, weather, and events in Lahore
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white rounded-lg p-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="What do you want to explore today?"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button onClick={() => onNavigate("explore")}>
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-center mb-12">Explore Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card
                key={category.title}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onNavigate("explore")}
              >
                <CardContent className="p-6 text-center">
                  <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2">{category.title}</h3>
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Weather Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="mb-2">Today's Weather in Lahore</h3>
                    <p className="text-muted-foreground">Sunday, October 12, 2025</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Cloud className="h-16 w-16 text-primary" />
                    <div>
                      <div className="text-5xl">28°C</div>
                      <p className="text-muted-foreground">Partly Cloudy</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Top Places */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2>Top Places to Visit</h2>
            <Button variant="ghost" onClick={() => onNavigate("explore")}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topPlaces.map((place) => (
              <Card key={place.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4>{place.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm">{place.rating}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{place.type}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="mb-8">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Calendar className="h-10 w-10 text-primary mb-4" />
                  <h3 className="mb-2">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mb-1">{event.date}</p>
                  <p className="text-muted-foreground text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
