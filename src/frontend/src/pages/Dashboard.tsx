import { useEffect, useState } from "react";
import { Utensils, Calendar, MapPin, Cloud, Sun, Heart, MessageCircle, User, TrendingUp, ThumbsUp, ThumbsDown, Minus, Sparkles, Loader2, ArrowUpRight, BarChart3, Globe, Compass } from "lucide-react";
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
  if (mood === "Positive") return <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />;
  if (mood === "Negative") return <ThumbsDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
};

const moodColor = (mood: string) => {
  if (mood === "Positive") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (mood === "Negative") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
    <div
      key={item._id || index}
      className="group relative flex items-start gap-4 p-4 rounded-xl border border-zinc-100 bg-white hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer"
    >
      {/* Left accent */}
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
        item.mood === "Positive" ? "bg-emerald-400" : item.mood === "Negative" ? "bg-red-400" : "bg-zinc-200"
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors leading-snug">
            {truncate(item.name, 80)}
          </h4>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-muted-foreground mt-1 mb-2.5 line-clamp-2 leading-relaxed">
          {truncate(item.comment || item.description)}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 h-5">{item.category}</Badge>
          <Badge className={`text-[10px] rounded-full px-2 py-0 h-5 ${moodColor(item.mood)}`}>
            <MoodIcon mood={item.mood} />
            <span className="ml-1">{item.mood}</span>
          </Badge>
          {item.source && item.source !== "Unknown" && (
            <span className="text-[10px] text-muted-foreground/70">via {item.source}</span>
          )}
        </div>
      </div>
    </div>
  );

  const totalPosts = stats ? stats.topics.reduce((a, t) => a + t.count, 0) : 0;
  const positivePosts = stats?.moods.find((m) => m._id === "Positive")?.count || 0;
  const negativePosts = stats?.moods.find((m) => m._id === "Negative")?.count || 0;
  const foodMentions = stats?.topics.find((t) => t._id === "Food & Dining")?.count || 0;
  const positivePercent = totalPosts > 0 ? Math.round((positivePosts / totalPosts) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* ═══ HERO HEADER ═══ */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px'}} />
        <div className="relative container mx-auto px-4 md:px-6 py-10 pb-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-blue-200 text-sm mb-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {getGreeting()}, {user?.username || "Explorer"} 👋
              </h1>
              <p className="text-blue-100/70 max-w-md">
                Your personalized travel intelligence dashboard, powered by AI analysis of real social media conversations.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => onNavigate("explore")} variant="secondary" className="rounded-xl shadow-lg">
                <Compass className="h-4 w-4 mr-2" /> Explore
              </Button>
              <Button onClick={() => onNavigate("favorites")} variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10">
                <Heart className="h-4 w-4 mr-2" /> Favorites
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 -mt-12 pb-12">
        {/* ═══ STAT CARDS (overlapping header) ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Posts Analyzed",
              value: totalPosts.toLocaleString(),
              icon: BarChart3,
              gradient: "from-blue-500 to-indigo-600",
              desc: "Social media posts",
            },
            {
              label: "Positive Sentiment",
              value: `${positivePercent}%`,
              icon: ThumbsUp,
              gradient: "from-emerald-500 to-green-600",
              desc: `${positivePosts.toLocaleString()} positive reviews`,
            },
            {
              label: "Food Mentions",
              value: foodMentions.toLocaleString(),
              icon: Utensils,
              gradient: "from-orange-500 to-red-500",
              desc: "Dining & cuisine posts",
            },
            {
              label: "Data Sources",
              value: stats?.sources?.length?.toString() || "3",
              icon: Globe,
              gradient: "from-purple-500 to-pink-500",
              desc: "Verified platforms",
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-0 shadow-lg bg-white overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs font-medium text-foreground/80 mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ═══ MAIN CONTENT GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Recommendations (2/3 width) */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white overflow-hidden">
              <CardHeader className="pb-3 border-b border-zinc-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI Recommendations</CardTitle>
                      <CardDescription className="text-xs">
                        Based on {totalPosts.toLocaleString()} analyzed posts
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate("explore")} className="text-xs text-primary">
                    View All <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {loading ? (
                  <div className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Analyzing recommendations...</p>
                  </div>
                ) : (
                  <Tabs defaultValue="food" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-50 p-1 rounded-xl mb-4 h-10">
                      <TabsTrigger value="food" className="rounded-lg text-xs data-[state=active]:shadow-sm">
                        <Utensils className="h-3.5 w-3.5 mr-1.5" />
                        Food & Dining
                      </TabsTrigger>
                      <TabsTrigger value="lifestyle" className="rounded-lg text-xs data-[state=active]:shadow-sm">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        Lifestyle
                      </TabsTrigger>
                      <TabsTrigger value="social" className="rounded-lg text-xs data-[state=active]:shadow-sm">
                        <MapPin className="h-3.5 w-3.5 mr-1.5" />
                        Culture
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="food" className="space-y-2 mt-0">
                      {foodData.length > 0 ? foodData.map(renderPlaceCard) : (
                        <div className="text-center py-12">
                          <Utensils className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">No food recommendations yet</p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="lifestyle" className="space-y-2 mt-0">
                      {lifestyleData.length > 0 ? lifestyleData.map(renderPlaceCard) : (
                        <div className="text-center py-12">
                          <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">No lifestyle recommendations yet</p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="social" className="space-y-2 mt-0">
                      {socialData.length > 0 ? socialData.map(renderPlaceCard) : (
                        <div className="text-center py-12">
                          <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-muted-foreground text-sm">No culture recommendations yet</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Weather Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="absolute top-2 right-2 opacity-10">
                  <Sun className="h-24 w-24" />
                </div>
                <div className="relative z-10">
                  <p className="text-blue-100 text-xs font-medium mb-1">TODAY IN LAHORE</p>
                  <div className="flex items-end gap-3 mb-3">
                    <span className="text-5xl font-bold tracking-tighter">37°C</span>
                    <div className="mb-1.5">
                      <Cloud className="h-6 w-6 text-blue-100" />
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm">Partly Cloudy</p>
                  <p className="text-blue-200/70 text-xs mt-1">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-1">
                  {[
                    { icon: Compass, label: "Explore Landmarks", page: "explore", color: "text-emerald-500", bg: "bg-emerald-50" },
                    { icon: Heart, label: "My Favorites", page: "favorites", color: "text-red-500", bg: "bg-red-50" },
                    { icon: User, label: "Edit Profile", page: "profile", color: "text-blue-500", bg: "bg-blue-50" },
                    { icon: MessageCircle, label: "Chat with AI", page: "", color: "text-purple-500", bg: "bg-purple-50" },
                  ].map((link) => (
                    <button
                      key={link.label}
                      onClick={() => link.page && onNavigate(link.page)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors group text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg ${link.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <link.icon className={`h-4 w-4 ${link.color}`} />
                      </div>
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{link.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Breakdown */}
            {stats && (
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Sentiment Overview</CardTitle>
                  <CardDescription className="text-xs">How people feel about Lahore</CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-0">
                  {/* Visual bar */}
                  <div className="flex rounded-full h-3 overflow-hidden mb-4 bg-zinc-100">
                    <div className="bg-emerald-500 transition-all duration-1000" style={{ width: `${positivePercent}%` }} />
                    <div className="bg-red-400 transition-all duration-1000" style={{ width: `${totalPosts > 0 ? Math.round((negativePosts / totalPosts) * 100) : 0}%` }} />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-foreground/70">Positive</span>
                      </div>
                      <span className="text-xs font-semibold">{positivePosts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <span className="text-xs text-foreground/70">Negative</span>
                      </div>
                      <span className="text-xs font-semibold">{negativePosts.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                        <span className="text-xs text-foreground/70">Neutral</span>
                      </div>
                      <span className="text-xs font-semibold">{(totalPosts - positivePosts - negativePosts).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
