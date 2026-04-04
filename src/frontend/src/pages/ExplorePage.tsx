import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Heart, MapPin, Loader2, ThumbsUp, ThumbsDown, Minus, MessageSquare } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { auth } from "../config/firebase";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface ExplorePageProps {
  onNavigate: (page: string) => void;
}

interface Place {
  _id: string;
  name: string;
  category: string;
  description: string;
  comment: string;
  mood: string;
  topicName: string;
  source: string;
  sourceUrl: string;
  originalUser: string;
  sentimentScore: number;
  saved?: boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const MoodIcon = ({ mood }: { mood: string }) => {
  if (mood === "Positive") return <ThumbsUp className="h-3 w-3" />;
  if (mood === "Negative") return <ThumbsDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
};

const moodBadgeStyle = (mood: string) => {
  if (mood === "Positive") return "bg-green-50 text-green-700 border-green-200";
  if (mood === "Negative") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
};

const topicBadgeStyle = (topic: string) => {
  if (topic === "Food & Dining") return "bg-orange-50 text-orange-700 border-orange-200";
  if (topic === "Social/Personal") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-purple-50 text-purple-700 border-purple-200";
};

export function ExplorePage({ onNavigate }: ExplorePageProps) {
  const [items, setItems] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [mood, setMood] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, pages: 0 });
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const fetchPlaces = useCallback(async (query: string, topicFilter: string, moodFilter: string, page: number) => {
    setLoading(true);
    try {
      if (query.trim()) {
        // Search mode
        const params: Record<string, string> = { q: query };
        if (topicFilter !== "all") params.topic = topicFilter;
        if (moodFilter !== "all") params.mood = moodFilter;

        const res = await axios.get(`${API_URL}/api/places/search`, { params });
        setItems(res.data.map((p: Place) => ({ ...p, saved: false })));
        setPagination({ total: res.data.length, page: 1, limit: res.data.length, pages: 1 });
      } else {
        // Browse mode with filters + pagination
        const params: Record<string, string | number> = { limit: 12, page };
        if (topicFilter !== "all") params.topic = topicFilter;
        if (moodFilter !== "all") params.mood = moodFilter;

        const res = await axios.get(`${API_URL}/api/places/recommendations`, { params });
        setItems((res.data.data || []).map((p: Place) => ({ ...p, saved: false })));
        setPagination(res.data.pagination || { total: 0, page: 1, limit: 12, pages: 0 });
      }
    } catch (err) {
      console.error("Failed to load places:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPlaces("", "all", "all", 1);
  }, [fetchPlaces]);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      fetchPlaces(value, category, mood, 1);
    }, 400);
    setSearchTimeout(timeout);
  };

  // Filter changes
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    fetchPlaces(searchQuery, value, mood, 1);
  };

  const handleMoodChange = (value: string) => {
    setMood(value);
    fetchPlaces(searchQuery, category, value, 1);
  };

  // Pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      fetchPlaces(searchQuery, category, mood, page);
    }
  };

  const toggleSave = async (id: string, currentlySaved: boolean) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to save favorites!");
      onNavigate("login");
      return;
    }

    try {
      const token = await user.getIdToken();
      setItems(items.map((item) =>
        item._id === id ? { ...item, saved: !item.saved } : item
      ));

      const response = await fetch(`${API_URL}/api/users/favorites${currentlySaved ? `/${id}` : ''}`, {
        method: currentlySaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: currentlySaved ? null : JSON.stringify({ placeId: id })
      });

      if (!response.ok) {
        setItems(items.map((item) =>
          item._id === id ? { ...item, saved: currentlySaved } : item
        ));
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const truncate = (text: string, len = 100) =>
    text && text.length > len ? text.substring(0, len) + "..." : text;

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 font-medium">Topic</h4>
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            <SelectItem value="Food & Dining">Food & Dining</SelectItem>
            <SelectItem value="Social/Personal">Social & Personal</SelectItem>
            <SelectItem value="General/Lifestyle">General & Lifestyle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="mb-3 font-medium">Sentiment</h4>
        <Select value={mood} onValueChange={handleMoodChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Sentiments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="Positive">👍 Positive</SelectItem>
            <SelectItem value="Negative">👎 Negative</SelectItem>
            <SelectItem value="Neutral">➖ Neutral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button className="w-full" onClick={() => {
        setCategory("all");
        setMood("all");
        setSearchQuery("");
        fetchPlaces("", "all", "all", 1);
      }}>
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Explore Lahore</h1>
          <p className="text-muted-foreground mb-4">
            Search {pagination.total.toLocaleString()} AI-analyzed social media posts about Lahore
          </p>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 border rounded-lg bg-card">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search places, food, culture... (e.g. 'biryani', 'Badshahi Mosque')"
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => { setSearchQuery(""); fetchPlaces("", category, mood, 1); }}
                >
                  Clear
                </Button>
              )}
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

          {/* Active filters */}
          {(category !== "all" || mood !== "all" || searchQuery) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm text-muted-foreground">Active:</span>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {category !== "all" && (
                <Badge className={`text-xs ${topicBadgeStyle(category)}`}>
                  {category}
                </Badge>
              )}
              {mood !== "all" && (
                <Badge className={`text-xs ${moodBadgeStyle(mood)}`}>
                  <MoodIcon mood={mood} />
                  <span className="ml-1">{mood}</span>
                </Badge>
              )}
            </div>
          )}
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
              Showing {items.length} of {pagination.total.toLocaleString()} results
              {searchQuery && <span className="font-medium"> for "{searchQuery}"</span>}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="mb-2">No results found</h3>
                <p className="text-muted-foreground">Try a different search or adjust your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {/* Header: topic + mood badges + save */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge className={`text-xs ${topicBadgeStyle(item.topicName)}`}>
                            {item.topicName}
                          </Badge>
                          <Badge className={`text-xs ${moodBadgeStyle(item.mood)}`}>
                            <MoodIcon mood={item.mood} />
                            <span className="ml-1">{item.mood}</span>
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleSave(item._id, item.saved || false)}
                        >
                          <Heart className={`h-4 w-4 ${item.saved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                        </Button>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold mb-2 line-clamp-2 leading-snug">
                        {truncate(item.name, 80)}
                      </h4>

                      {/* Comment preview */}
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-3 leading-relaxed">
                        {truncate(item.comment || item.description, 150)}
                      </p>

                      {/* Footer: source + user */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{item.source || "Lahore"}</span>
                        </div>
                        {item.originalUser && (
                          <span className="truncate max-w-[120px]">by {item.originalUser}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => goToPage(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => goToPage(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

