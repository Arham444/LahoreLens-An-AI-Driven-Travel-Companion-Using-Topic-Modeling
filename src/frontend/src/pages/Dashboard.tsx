import { useEffect, useState } from "react";
import { Utensils, Calendar, MapPin, Cloud, Heart, MessageCircle, User, TrendingUp, ThumbsUp, ThumbsDown, Minus, Sparkles, ArrowRight, Loader2 } from "lucide-react";
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
    <div key={item._id || index} className="flex items-start justify-between p-4 border rounded-xl hover:shadow-md transition-all hover:border-primary/20 bg-white group cursor-pointer">
      <div className="flex-1 min-w-0">
        <h4 className="mb-1 truncate font-semibold group-hover:text-primary transition-colors">{truncate(item.name, 80)}</h4>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {truncate(item.comment || item.description)}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="rounded-md">{item.category}</Badge>
          <Badge className={`text-xs rounded-md ${moodColor(item.mood)}`}>
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

  const totalPosts = stats ? stats.topics.reduce((a, t) => a + t.count, 0) : 0;
  const positivePosts = stats?.moods.find((m) => m._id === "Positive")?.count || 0;
  const foodMentions = stats?.topics.find((t) => t._id === "Food & Dining")?.count || 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* ═══ WELCOME HEADER ═══ */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1 text-white">Welcome back, {user?.username || "Explorer"}! 👋</h1>
              <p className="text-white/70">
                Here are your personalized recommendations powered by AI analysis
              </p>
            </div>
            <Button onClick={() => onNavigate("explore")} variant="secondary" className="rounded-xl shadow-md w-fit">
              <MapPin className="h-4 w-4 mr-2" /> Explore Landmarks
            </Button>
          </div>
        </div>

        {/* ═══ QUICK ACTIONS ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Heart, label: "Favorites", page: "favorites", color: "text-red-500" },
            { icon: User, label: "Profile", page: "profile", color: "text-blue-500" },
            { icon: MapPin, label: "Explore", page: "explore", color: "text-emerald-500" },
            { icon: MessageCircle, label: "AI Chat", page: "", color: "text-purple-500" },
          ].map((action) => (
            <Card
              key={action.label}
              className="cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm"
              onClick={() => action.page && onNavigate(action.page)}
            >
              <CardContent className="p-5 text-center">
                <action.icon className={`h-7 w-7 mx-auto mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                <p className="font-medium text-sm">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ═══ STATS OVERVIEW ═══ */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-blue-500" />
              <CardContent className="p-5 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold text-foreground">
                  {totalPosts.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Analyzed Posts</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
              <CardContent className="p-5 text-center">
                <ThumbsUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold text-foreground">
                  {positivePosts.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Positive Reviews</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-orange-400 to-red-500" />
              <CardContent className="p-5 text-center">
                <Utensils className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-3xl font-bold text-foreground">
                  {foodMentions.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Food Mentions</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══ WEATHER ═══ */}
        <Card className="mb-8 border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                  <Cloud className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Today in Lahore</h3>
                  <p className="text-muted-foreground text-sm">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-4xl font-bold mb-0.5">28°C</div>
                <p className="text-muted-foreground text-sm">Partly Cloudy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══ RECOMMENDATIONS ═══ */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI-Powered Recommendations</CardTitle>
            </div>
            <CardDescription>
              Based on sentiment analysis of {totalPosts.toLocaleString()} social media posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Loading recommendations...</p>
              </div>
            ) : (
              <Tabs defaultValue="food" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-zinc-100 p-1 rounded-xl mb-4">
                  <TabsTrigger value="food" className="rounded-lg data-[state=active]:shadow-sm">
                    <Utensils className="h-4 w-4 mr-2" />
                    Food
                  </TabsTrigger>
                  <TabsTrigger value="lifestyle" className="rounded-lg data-[state=active]:shadow-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Lifestyle
                  </TabsTrigger>
                  <TabsTrigger value="social" className="rounded-lg data-[state=active]:shadow-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Culture
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="food" className="space-y-3 mt-2">
                  {foodData.length > 0 ? foodData.map(renderPlaceCard) : (
                    <p className="text-center text-muted-foreground py-8">No food recommendations yet</p>
                  )}
                </TabsContent>

                <TabsContent value="lifestyle" className="space-y-3 mt-2">
                  {lifestyleData.length > 0 ? lifestyleData.map(renderPlaceCard) : (
                    <p className="text-center text-muted-foreground py-8">No lifestyle recommendations yet</p>
                  )}
                </TabsContent>

                <TabsContent value="social" className="space-y-3 mt-2">
                  {socialData.length > 0 ? socialData.map(renderPlaceCard) : (
                    <p className="text-center text-muted-foreground py-8">No culture recommendations yet</p>
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
