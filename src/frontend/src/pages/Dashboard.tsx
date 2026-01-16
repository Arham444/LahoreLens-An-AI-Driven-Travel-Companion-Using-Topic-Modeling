import { Utensils, Calendar, MapPin, Cloud, Heart, MessageCircle, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const foodRecommendations = [
  { name: "Cooco's Den", type: "Traditional", rating: 4.8, price: "$$" },
  { name: "Cafe Aylanto", type: "Continental", rating: 4.7, price: "$$$" },
  { name: "Butt Karahi", type: "Street Food", rating: 4.9, price: "$" },
];

const eventRecommendations = [
  { name: "Basant Festival", date: "March 15", location: "Minar-e-Pakistan" },
  { name: "Art Exhibition", date: "March 18", location: "Alhamra Arts" },
  { name: "Food Festival", date: "March 28", location: "Fortress Stadium" },
];

const cultureRecommendations = [
  { name: "Badshahi Mosque", type: "Historical", visiting: "1-2 hours" },
  { name: "Lahore Museum", type: "Museum", visiting: "2-3 hours" },
  { name: "Shalimar Gardens", type: "Historical", visiting: "2-3 hours" },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2">Welcome back, Ahmed!</h1>
          <p className="text-muted-foreground">
            Here are your personalized recommendations for exploring Lahore
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onNavigate("favorites")}
          >
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p>Favorites</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onNavigate("profile")}
          >
            <CardContent className="p-6 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p>Profile</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onNavigate("explore")}
          >
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p>Explore</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p>AI Chat</p>
            </CardContent>
          </Card>
        </div>

        {/* Weather Widget */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Cloud className="h-12 w-12 text-primary" />
                <div>
                  <h3>Today in Lahore</h3>
                  <p className="text-muted-foreground">Sunday, October 12, 2025</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-4xl mb-1">28°C</div>
                <p className="text-muted-foreground">Partly Cloudy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
            <CardDescription>
              Based on your interests and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="food" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="food">
                  <Utensils className="h-4 w-4 mr-2" />
                  Food
                </TabsTrigger>
                <TabsTrigger value="events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="culture">
                  <MapPin className="h-4 w-4 mr-2" />
                  Culture
                </TabsTrigger>
              </TabsList>

              <TabsContent value="food" className="space-y-4 mt-4">
                {foodRecommendations.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="mb-1">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.type}</Badge>
                        <span className="text-sm text-muted-foreground">★ {item.rating}</span>
                        <span className="text-sm text-muted-foreground">{item.price}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="events" className="space-y-4 mt-4">
                {eventRecommendations.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="mb-1">{item.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="culture" className="space-y-4 mt-4">
                {cultureRecommendations.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="mb-1">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{item.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Visit duration: {item.visiting}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Get Directions
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
