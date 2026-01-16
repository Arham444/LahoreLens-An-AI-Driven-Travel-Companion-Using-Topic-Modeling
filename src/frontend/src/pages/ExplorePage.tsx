import { useState } from "react";
import { Search, SlidersHorizontal, Star, Heart, MapPin } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";

interface ExplorePageProps {
  onNavigate: (page: string) => void;
}

const exploreItems = [
  {
    id: 1,
    name: "Cooco's Den Restaurant",
    category: "Food",
    image: "https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYWtpc3RhbmklMjBmb29kJTIwYmlyeWFuaXxlbnwxfHx8fDE3NjAyODUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    price: "$$",
    location: "Old City",
    saved: false,
  },
  {
    id: 2,
    name: "Badshahi Mosque",
    category: "Culture",
    image: "https://images.unsplash.com/photo-1626303298621-984f671f8a82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJc2xhbWljJTIwYXJjaGl0ZWN0dXJlJTIwbW9zcXVlfGVufDF8fHx8MTc2MDI4NTIzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    price: "Free",
    location: "Walled City",
    saved: true,
  },
  {
    id: 3,
    name: "Basant Festival",
    category: "Event",
    image: "https://images.unsplash.com/photo-1663745425508-e37953bd9180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMYWhvcmUlMjBQYWtpc3RhbiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjAyODUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.7,
    price: "$$",
    location: "Minar-e-Pakistan",
    saved: false,
  },
  {
    id: 4,
    name: "Butt Karahi",
    category: "Food",
    image: "https://images.unsplash.com/photo-1672477179695-7276b0602fa9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMFBha2lzdGFuaSUyMGN1aXNpbmV8ZW58MXx8fHwxNzYwMjg1MjMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    price: "$",
    location: "Lakshmi Chowk",
    saved: false,
  },
  {
    id: 5,
    name: "Lahore Fort",
    category: "Culture",
    image: "https://images.unsplash.com/photo-1663745425508-e37953bd9180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMYWhvcmUlMjBQYWtpc3RhbiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjAyODUyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    price: "$",
    location: "Walled City",
    saved: true,
  },
  {
    id: 6,
    name: "Lahore Literary Festival",
    category: "Event",
    image: "https://images.unsplash.com/photo-1626303298621-984f671f8a82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJc2xhbWljJTIwYXJjaGl0ZWN0dXJlJTIwbW9zcXVlfGVufDF8fHx8MTc2MDI4NTIzMnww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.6,
    price: "$$",
    location: "Alhamra Arts",
    saved: false,
  },
];

export function ExplorePage({ onNavigate }: ExplorePageProps) {
  const [items, setItems] = useState(exploreItems);
  const [priceRange, setPriceRange] = useState([0]);

  const toggleSave = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, saved: !item.saved } : item
    ));
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3">Category</h4>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="culture">Culture</SelectItem>
            <SelectItem value="weather">Weather</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="mb-3">Price</h4>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Any Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Price</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="budget">$ - Budget</SelectItem>
            <SelectItem value="moderate">$$ - Moderate</SelectItem>
            <SelectItem value="expensive">$$$ - Expensive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="mb-3">Location</h4>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="old-city">Old City</SelectItem>
            <SelectItem value="walled-city">Walled City</SelectItem>
            <SelectItem value="gulberg">Gulberg</SelectItem>
            <SelectItem value="dha">DHA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="mb-3">Rating</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={5}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>0</span>
          <span>5.0</span>
        </div>
      </div>

      <Button className="w-full">Apply Filters</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4">Explore Lahore</h1>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 border rounded-lg bg-card">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search places, events, food..."
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <SlidersHorizontal className="h-5 w-5" />
                  <h3>Filters</h3>
                </div>
                <FilterSidebar />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-4 text-muted-foreground">
              Showing {items.length} results
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => toggleSave(item.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          item.saved ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
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
                      <span className="text-sm text-muted-foreground">{item.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </div>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="outline">Previous</Button>
              <Button variant="outline">1</Button>
              <Button>2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
