import { useEffect, useState } from "react";
import { Utensils, Calendar, MapPin, Cloud, Heart, MessageCircle, User, TrendingUp, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Place {
  _id: string;
  name: string;
  description: string;
  category: string;
  mood: string;
  topicName: string;
  source: string;
  comment: string;
  sentimentScore: number;
}

interface Stats {
  topics: { _id: string; count: number }[];
  moods: { _id: string; count: number }[];
  sources: { _id: string; count: number }[];
}

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const MoodIcon = ({ mood }: { mood: string }) => {
  if (mood === "Positive") return <ThumbsUp className="h-3.5 w-3.5 text-green-600" />;
  if (mood === "Negative") return <ThumbsDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
};

const moodColor = (mood: string) => {
  if (mood === "Positive") return "bg-green-100 text-green-800 border-green-200";
  if (mood === "Negative") return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [foodData, setFoodData] = useState<Place[]>([]);
  const [lifestyleData, setLifestyleData] = useState<Place[]>([]);
  const [socialData, setSocialData] = useState<Place[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [food, lifestyle, social, statsRes] = await Promise.all([
          axios.get(`${API_URL}/api/places/recommendations`, {
            params: { topic: "Food & Dining", mood: "Positive", limit: 5 },
          }),
          axios.get(`${API_URL}/api/places/recommendations`, {
            params: { topic: "General/Lifestyle", mood: "Positive", limit: 5 },
          }),
          axios.get(`${API_URL}/api/places/recommendations`, {
            params: { topic: "Social/Personal", mood: "Positive", limit: 5 },
          }),
          axios.get(`${API_URL}/api/places/stats`),
        ]);

        setFoodData(food.data.data || []);
        setLifestyleData(lifestyle.data.data || []);
        setSocialData(social.data.data || []);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const truncate = (text: string, len = 120) =>
    text && text.length > len ? text.substring(0, len) + "..." : text;

  const renderPlaceCard = (item: Place, index: number) => (
    <div key={item._id || index} className="flex items-start justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex-1 min-w-0">
        <h4 className="mb-1 truncate">{truncate(item.name, 80)}</h4>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {truncate(item.comment || item.description)}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{item.category}</Badge>
          <Badge className={`text-xs ${moodColor(item.mood)}`}>
            <MoodIcon mood={item.mood} />
            <span className="ml-1">{item.mood}</span>
          </Badge>
          {item.source && item.source !== "Unknown" && (
            <span className="text-xs text-muted-foreground">via {item.source}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2">Welcome back, {user?.username || "Guest"}!</h1>
          <p className="text-muted-foreground">
            Here are your personalized recommendations for exploring Lahore
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("favorites")}>
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p>Favorites</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("profile")}>
            <CardContent className="p-6 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p>Profile</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("explore")}>
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

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">
                  {stats.topics.reduce((a, t) => a + t.count, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Analyzed Posts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <ThumbsUp className="h-6 w-6 mx-auto mb-1 text-green-600" />
                <p className="text-2xl font-bold">
                  {stats.moods.find((m) => m._id === "Positive")?.count.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">Positive Reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Utensils className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                <p className="text-2xl font-bold">
                  {stats.topics.find((t) => t._id === "Food & Dining")?.count.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">Food Mentions</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Weather Widget */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Cloud className="h-12 w-12 text-primary" />
                <div>
                  <h3>Today in Lahore</h3>
                  <p className="text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-4xl mb-1">28°C</div>
                <p className="text-muted-foreground">Partly Cloudy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Tabs — Now powered by real NLP data */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Recommendations</CardTitle>
            <CardDescription>
              Based on sentiment analysis of {stats ? stats.topics.reduce((a, t) => a + t.count, 0).toLocaleString() : "..."} social media posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading recommendations...</div>
            ) : (
              <Tabs defaultValue="food" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="food">
                    <Utensils className="h-4 w-4 mr-2" />
                    Food
                  </TabsTrigger>
                  <TabsTrigger value="lifestyle">
                    <Calendar className="h-4 w-4 mr-2" />
                    Lifestyle
                  </TabsTrigger>
                  <TabsTrigger value="social">
                    <MapPin className="h-4 w-4 mr-2" />
                    Culture
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="food" className="space-y-4 mt-4">
                  {foodData.length > 0 ? foodData.map(renderPlaceCard) : (
                    <p className="text-center text-muted-foreground py-6">No food recommendations yet</p>
                  )}
                </TabsContent>

                <TabsContent value="lifestyle" className="space-y-4 mt-4">
                  {lifestyleData.length > 0 ? lifestyleData.map(renderPlaceCard) : (
                    <p className="text-center text-muted-foreground py-6">No lifestyle recommendations yet</p>
                  )}
                </TabsContent>

                <TabsContent value="social" className="space-y-4 mt-4">
                  {socialData.length > 0 ? socialData.map(renderPlaceCard) : (
                    <p className="text-center text-muted-foreground py-6">No culture recommendations yet</p>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

