import { useState, useEffect } from "react";
import {
  Search, MapPin, Loader2, ThumbsUp, ThumbsDown, Minus, ArrowLeft,
  Clock, Tag, MessageSquare, TrendingUp, ChevronRight, Sparkles,
  BookOpen, Star, Lightbulb, Navigation, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Images for famous Lahore landmarks (reliable Unsplash CDN)
const LANDMARK_IMAGES: Record<string, string> = {
  // Historical / Monuments
  "badshahi-mosque": "https://images.unsplash.com/photo-1626303298621-984f671f8a82?w=640&q=80",
  "lahore-fort": "https://images.unsplash.com/photo-1663745425508-e37953bd9180?w=640&q=80",
  "shalimar-gardens": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=640&q=80",
  "minar-e-pakistan": "https://images.unsplash.com/photo-1587974928442-77dc3e0748b9?w=640&q=80",
  "heera-mandi": "https://images.unsplash.com/photo-1590577976322-3d2d6e2130d5?w=640&q=80",
  "walled-city": "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=640&q=80",
  "gurdwara-dera-sahib": "https://images.unsplash.com/photo-1609947017136-9daf32a15c5c?w=640&q=80",
  "hazuri-bagh": "https://images.unsplash.com/photo-1548013146-72479768bada?w=640&q=80",
  "tomb-of-jahangir": "https://images.unsplash.com/photo-1564769625392-651b89c75b90?w=640&q=80",
  "data-darbar": "https://images.unsplash.com/photo-1591018653367-6413aba63587?w=640&q=80",
  "lahore-museum": "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=640&q=80",
  // Food & Dining
  "food-street": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80",
  "coocos-den": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=640&q=80",
  "gawalmandi": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=640&q=80",
  "lakshmi-chowk": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=640&q=80",
  // Shopping & Markets
  "anarkali": "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=640&q=80",
  "liberty-market": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=640&q=80",
  "packages-mall": "https://images.unsplash.com/photo-1519567241046-7f570f529a5e?w=640&q=80",
  "fortress-stadium": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=640&q=80",
  // Residential & Lifestyle
  "gulberg": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=640&q=80",
  "dha": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=640&q=80",
  "johar-town": "https://images.unsplash.com/photo-1559827291-bac2cab37e8a?w=640&q=80",
  "mall-road": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=640&q=80",
  // Parks & Recreation
  "jilani-park": "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=640&q=80",
  "jallo-park": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&q=80",
  "lahore-canal": "https://images.unsplash.com/photo-1504714146340-959ca07e1f38?w=640&q=80",
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

interface PlaceGuide {
  placeId: string;
  name: string;
  history: string;
  attractions: { name: string; description: string }[];
  tips: string[];
  bestTimeToVisit: string;
  nearbyPlaces: string[];
  generatedAt: string;
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
    "Parks": "bg-green-100 text-green-800",
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
  const [guide, setGuide] = useState<PlaceGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideLoading, setGuideLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch NLP insights
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/analyze/landmarks/${placeId}/insights`);
        setInsight(res.data);
      } catch (err: any) {
        console.error("Failed to fetch insights:", err);
        setError(err.response?.data?.message || "Failed to load insights.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch Gemini place guide (independent, non-blocking)
    const fetchGuide = async () => {
      setGuideLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/gemini/place/${placeId}`);
        setGuide(res.data);
      } catch (err) {
        console.error("Gemini guide unavailable:", err);
      } finally {
        setGuideLoading(false);
      }
    };

    fetchInsights();
    fetchGuide();
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

      {/* ═══ GEMINI-GENERATED CONTENT ═══ */}
      {guideLoading ? (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">LahoreLens is generating your detailed guide...</p>
          </CardContent>
        </Card>
      ) : guide ? (
        <>
          {/* About / History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" /> About {insight.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{guide.history}</p>
            </CardContent>
          </Card>

          {/* Key Attractions */}
          {guide.attractions && guide.attractions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-amber-500" /> Key Attractions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guide.attractions.map((a, i) => (
                    <div key={i} className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <h4 className="font-semibold text-sm text-amber-900 mb-1">{a.name}</h4>
                      <p className="text-xs text-amber-800/80 leading-relaxed">{a.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Best Time + Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.bestTimeToVisit && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" /> Best Time to Visit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{guide.bestTimeToVisit}</p>
                </CardContent>
              </Card>
            )}
            {guide.nearbyPlaces && guide.nearbyPlaces.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-indigo-500" /> Nearby Places
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.nearbyPlaces.map((p, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Visitor Tips */}
          {guide.tips && guide.tips.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" /> Visitor Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      {/* ═══ NLP MODEL INSIGHTS ═══ */}

      {/* AI Summary from our trained model */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            What Our NLP Model Found
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
    <div className="min-h-screen bg-zinc-50">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-primary to-blue-700 text-white py-10">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-2 text-white">Explore Lahore</h1>
          <p className="text-white/70 mb-6">
            Click on any landmark to see what our AI learned from thousands of social media posts
          </p>

          {/* Search */}
          <div className="flex items-center gap-2 px-4 border border-white/20 rounded-xl bg-white/10 backdrop-blur-md max-w-xl">
            <Search className="h-5 w-5 text-white/60" />
            <Input
              placeholder="Search landmarks... (e.g. 'mosque', 'food')"
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/50 bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">

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
                  className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-0 shadow-md"
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
