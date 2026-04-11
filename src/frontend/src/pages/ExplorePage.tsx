import { useState, useEffect } from "react";
import {
  Search, MapPin, Loader2, ThumbsUp, ThumbsDown, Minus, ArrowLeft,
  Clock, Tag, MessageSquare, TrendingUp, ChevronRight, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Images for famous Lahore landmarks (Wikimedia Commons + Unsplash fallbacks)
const LANDMARK_IMAGES: Record<string, string> = {
  "badshahi-mosque": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Badshahi_Mosque_Sunset.jpg/640px-Badshahi_Mosque_Sunset.jpg",
  "lahore-fort": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Alamgiri_Gate%2C_Lahore_Fort.jpg/640px-Alamgiri_Gate%2C_Lahore_Fort.jpg",
  "shalimar-gardens": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Shalimar_Garden_July_14_2005-Terrace_2_outer_southeastern_pavilion_with_red_sandstone_carved_inner_walls.jpg/640px-Shalimar_Garden_July_14_2005-Terrace_2_outer_southeastern_pavilion_with_red_sandstone_carved_inner_walls.jpg",
  "minar-e-pakistan": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Minar-e-Pakistan_by_Usman_Ghani.jpg/640px-Minar-e-Pakistan_by_Usman_Ghani.jpg",
  "food-street": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
  "anarkali": "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80",
  "heera-mandi": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Lahore_old_area.jpg/640px-Lahore_old_area.jpg",
  "liberty-market": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
  "gulberg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  "dha": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
  "johar-town": "https://images.unsplash.com/photo-1559827291-bac2cab37e8a?w=600&q=80",
  "data-darbar": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/The_Shrine_of_Data_Ganj_Bakhsh%2C_Apr_2012.jpg/640px-The_Shrine_of_Data_Ganj_Bakhsh%2C_Apr_2012.jpg",
  "mall-road": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
  "walled-city": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Walled_City_of_Lahore.jpg/640px-Walled_City_of_Lahore.jpg",
};

// Fallback handler for broken images
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  target.style.display = "none";
  if (target.parentElement) {
    target.parentElement.style.background = "linear-gradient(135deg, #7c3a2e 0%, #c4956a 100%)";
  }
};


interface ExplorePageProps {
  onNavigate: (page: string) => void;
}

interface Landmark {
  id: string;
  name: string;
  category: string;
  description: string;
  visitDuration: string;
  mentionCount: number;
  positivePercent: number;
  dominantMood: string;
  topTopic: string;
}

interface PlaceInsight {
  id: string;
  name: string;
  category: string;
  description: string;
  visitDuration: string;
  mentionCount: number;
  sentimentBreakdown: { Positive: number; Negative: number; Neutral: number };
  aiSummary: string;
  topKeywords: string[];
  topPositiveComments: { text: string; mood: string; topicName: string }[];
  topNegativeComments: { text: string; mood: string; topicName: string }[];
  topicDistribution: { topic: string; count: number }[];
}

const MoodIcon = ({ mood }: { mood: string }) => {
  if (mood === "Positive") return <ThumbsUp className="h-4 w-4 text-green-600" />;
  if (mood === "Negative") return <ThumbsDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
};

const moodColor = (mood: string) => {
  if (mood === "Positive") return "bg-green-100 text-green-800 border-green-200";
  if (mood === "Negative") return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
};

const categoryColor = (cat: string) => {
  const map: Record<string, string> = {
    "Historical": "bg-amber-100 text-amber-800",
    "Monument": "bg-indigo-100 text-indigo-800",
    "Food & Dining": "bg-orange-100 text-orange-800",
    "Shopping": "bg-pink-100 text-pink-800",
    "Cultural": "bg-purple-100 text-purple-800",
    "Lifestyle": "bg-cyan-100 text-cyan-800",
    "Residential": "bg-teal-100 text-teal-800",
    "Religious": "bg-emerald-100 text-emerald-800",
  };
  return map[cat] || "bg-gray-100 text-gray-800";
};

// Sentiment bar component
function SentimentBar({ positive, negative, neutral }: { positive: number; negative: number; neutral: number }) {
  const total = positive + negative + neutral || 1;
  return (
    <div className="w-full">
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
        <div className="bg-green-500 transition-all" style={{ width: `${(positive / total) * 100}%` }} />
        <div className="bg-yellow-400 transition-all" style={{ width: `${(neutral / total) * 100}%` }} />
        <div className="bg-red-400 transition-all" style={{ width: `${(negative / total) * 100}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span className="text-green-600">👍 {positive}</span>
        <span className="text-yellow-600">➖ {neutral}</span>
        <span className="text-red-500">👎 {negative}</span>
      </div>
    </div>
  );
}

// =============================================
// DETAIL VIEW — shown when user clicks a place
// =============================================
function PlaceDetailView({ placeId, onBack }: { placeId: string; onBack: () => void }) {
  const [insight, setInsight] = useState<PlaceInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/analyze/landmarks/${placeId}/insights`);
        setInsight(res.data);
      } catch (err: any) {
        console.error("Failed to fetch insights:", err);
        setError(err.response?.data?.message || "Failed to load insights. Make sure the AI service is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [placeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">AI is analyzing comments about this place...</p>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error || "Could not load insights"}</p>
        <Button onClick={onBack} variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Go Back</Button>
      </div>
    );
  }

  const img = LANDMARK_IMAGES[insight.id] || "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button onClick={onBack} variant="ghost" className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Explore
      </Button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-64 md:h-80" style={{background: 'linear-gradient(135deg, #7c3a2e 0%, #c4956a 100%)'}}>
        <img src={img} alt={insight.name} className="w-full h-full object-cover" onError={handleImageError} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <Badge className={`mb-2 ${categoryColor(insight.category)}`}>{insight.category}</Badge>
          <h1 className="text-3xl font-bold mb-1">{insight.name}</h1>
          <p className="text-white/80 text-sm">{insight.description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {insight.visitDuration}</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {insight.mentionCount} mentions</span>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            What Our AI Learned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: insight.aiSummary
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }}
          />
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sentiment Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentBar
              positive={insight.sentimentBreakdown.Positive}
              negative={insight.sentimentBreakdown.Negative}
              neutral={insight.sentimentBreakdown.Neutral}
            />
          </CardContent>
        </Card>

        {/* Topic Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Topic Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insight.topicDistribution.map((t) => (
              <div key={t.topic} className="flex items-center justify-between">
                <span className="text-sm">{t.topic}</span>
                <Badge variant="secondary" className="text-xs">{t.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Keywords */}
      {insight.topKeywords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" /> Trending Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insight.topKeywords.map((kw) => (
                <Badge key={kw} variant="outline" className="text-sm px-3 py-1">{kw}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Positive Comments */}
      {insight.topPositiveComments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" /> What People Love
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insight.topPositiveComments.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-green-50 border border-green-100">
                <p className="text-sm text-green-900 leading-relaxed">"{c.text}"</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="text-xs bg-green-100 text-green-700">Positive</Badge>
                  <span className="text-xs text-green-600">{c.topicName}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Negative Comments */}
      {insight.topNegativeComments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-500" /> Areas of Concern
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insight.topNegativeComments.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-sm text-red-900 leading-relaxed">"{c.text}"</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="text-xs bg-red-100 text-red-700">Negative</Badge>
                  <span className="text-xs text-red-600">{c.topicName}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============================================
// MAIN EXPLORE PAGE — grid of landmarks
// =============================================
export function ExplorePage({ onNavigate }: ExplorePageProps) {
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandmarks = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/analyze/landmarks`);
        setLandmarks(res.data);
      } catch (err) {
        console.error("Failed to fetch landmarks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLandmarks();
  }, []);

  const filtered = landmarks.filter(
    (lm) =>
      lm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lm.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If a place is selected, show its detail view
  if (selectedPlace) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
          <PlaceDetailView placeId={selectedPlace} onBack={() => setSelectedPlace(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Lahore</h1>
          <p className="text-muted-foreground">
            Click on any landmark to see what our AI learned from thousands of social media posts
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 border rounded-lg bg-card mb-8 max-w-xl">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search landmarks... (e.g. 'mosque', 'food')"
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading landmarks...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">No landmarks found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((lm) => {
              const img = LANDMARK_IMAGES[lm.id] || "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80";
              return (
                <Card
                  key={lm.id}
                  className="overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 group"
                  onClick={() => setSelectedPlace(lm.id)}
                >
                  {/* Image */}
                  <div className="aspect-[16/10] relative overflow-hidden" style={{background: 'linear-gradient(135deg, #7c3a2e 0%, #c4956a 100%)'}}>
                    <img
                      src={img}
                      alt={lm.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge className={`text-xs ${categoryColor(lm.category)}`}>{lm.category}</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg leading-tight">{lm.name}</h3>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{lm.description}</p>

                    {/* Stats row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-sm">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{lm.mentionCount}</span>
                        <span className="text-muted-foreground">mentions</span>
                      </div>
                      <Badge className={`text-xs ${moodColor(lm.dominantMood)}`}>
                        <MoodIcon mood={lm.dominantMood} />
                        <span className="ml-1">{lm.positivePercent}% positive</span>
                      </Badge>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between text-sm text-primary font-medium">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> View AI Insights
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
