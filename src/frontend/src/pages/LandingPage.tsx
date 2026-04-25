import { Search, Utensils, Calendar, Cloud, MapPin, Star, ArrowRight, Sparkles, TrendingUp, Shield, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { WeatherWidget } from "../components/WeatherWidget";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const categories = [
  {
    icon: Utensils, title: "Food & Cuisine", description: "From nihari to biryani — taste the real Lahore",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d4a?w=600&q=80",
    count: "8 Places"
  },
  {
    icon: MapPin, title: "Historical Sites", description: "Walk through centuries of Mughal grandeur",
    image: "https://images.unsplash.com/photo-1626303298621-984f671f8a82?w=600&q=80",
    count: "10 Sites"
  },
  {
    icon: Calendar, title: "Culture & Events", description: "Festivals, arts, and vibrant local life",
    image: "https://images.unsplash.com/photo-1590577976322-3d2d6e2130d5?w=600&q=80",
    count: "5 Events"
  },
  {
    icon: Cloud, title: "Parks & Nature", description: "Green escapes in the heart of the city",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    count: "3 Parks"
  },
];

const topPlaces = [
  {
    id: 1, name: "Badshahi Mosque", rating: 4.9, type: "Historical",
    image: "https://images.unsplash.com/photo-1626303298621-984f671f8a82?w=640&q=80",
    description: "Mughal-era masterpiece and one of the largest mosques in the world",
  },
  {
    id: 2, name: "Food Street", rating: 4.8, type: "Dining",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d4a?w=640&q=80",
    description: "Iconic rooftop dining with views of Badshahi Mosque",
  },
  {
    id: 3, name: "Lahore Fort", rating: 4.7, type: "Historical",
    image: "https://images.unsplash.com/photo-1663745425508-e37953bd9180?w=640&q=80",
    description: "UNESCO World Heritage Site with Sheesh Mahal",
  },
  {
    id: 4, name: "Shalimar Gardens", rating: 4.6, type: "Heritage",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=640&q=80",
    description: "17th-century Mughal gardens with terraced levels",
  },
];

const upcomingEvents = [
  { title: "Basant Festival", date: "March 15, 2026", location: "Minar-e-Pakistan", color: "from-yellow-400 to-orange-500" },
  { title: "Lahore Literary Festival", date: "March 20-22, 2026", location: "Alhamra Arts Council", color: "from-blue-400 to-indigo-500" },
  { title: "Food Carnival", date: "March 28, 2026", location: "Fortress Stadium", color: "from-red-400 to-pink-500" },
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 40%, #1a202c 100%)'}}>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1626303298621-984f671f8a82?w=1400&q=80"
            alt="Lahore"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Floating light accents */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-amber-400/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-400/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center text-white">
          <Badge className="mb-6 bg-white/15 text-white border-white/25 backdrop-blur-md px-4 py-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI-Powered Travel Intelligence
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-white leading-tight">
            Discover the Heart<br />of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Lahore</span>
          </h1>
          <p className="text-white/80 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            Your AI companion for exploring food, culture, history, and hidden gems — powered by real social media insights and Gemini AI.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20">
              <div className="flex-1 flex items-center gap-2 px-4">
                <Search className="h-5 w-5 text-zinc-400" />
                <Input
                  placeholder="Search places, food, landmarks..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-900 placeholder:text-zinc-400"
                />
              </div>
              <Button onClick={() => onNavigate("explore")} className="rounded-xl px-6 shadow-md">
                Explore
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center justify-center gap-8 mt-10 text-sm text-white/60">
            <span><strong className="text-white">26+</strong> Landmarks</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span><strong className="text-white">21K+</strong> Reviews Analyzed</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span><strong className="text-white">AI</strong> Travel Guides</span>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — dark section ═══ */}
      <section className="py-20 bg-zinc-900 text-white relative overflow-hidden">
        {/* subtle pattern */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px'}} />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-white">Powered by Real Data & AI</h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              We combine NLP analysis of social media with Gemini AI to give you the most honest travel intelligence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: "AI Travel Guides", desc: "Gemini AI generates comprehensive travel guides with history, tips, and attractions for every landmark.", num: "01", color: "from-blue-500 to-indigo-600" },
              { icon: TrendingUp, title: "Sentiment Analysis", desc: "Our NLP model analyzes 21,000+ social media posts to understand what real visitors think.", num: "02", color: "from-emerald-500 to-green-600" },
              { icon: Shield, title: "Trusted Insights", desc: "No sponsored content or fake reviews. Every insight comes from genuine public conversation.", num: "03", color: "from-amber-500 to-orange-600" },
            ].map((feat) => (
              <div key={feat.title} className="relative group">
                <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl p-8 h-full hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                  <span className="text-5xl font-black text-zinc-700/50 absolute top-4 right-6">{feat.num}</span>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feat.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-white">{feat.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES — image cards ═══ */}
      <section className="py-20 bg-zinc-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Explore by Category</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Lahore has something for everyone — what catches your eye?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="relative group cursor-pointer rounded-2xl overflow-hidden h-72 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => onNavigate("explore")}
              >
                <img src={cat.image} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/90 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon className="h-5 w-5 text-white" />
                    <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">{cat.count}</Badge>
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1">{cat.title}</h3>
                  <p className="text-white/70 text-sm">{cat.description}</p>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-2">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WEATHER ═══ */}
      <WeatherWidget />

      {/* ═══ TOP PLACES ═══ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Top Places to Visit</h2>
              <p className="text-muted-foreground mt-1">Handpicked landmarks based on traveler sentiment</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("explore")} className="hidden md:flex rounded-xl">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topPlaces.map((place) => (
              <Card
                key={place.id}
                className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
                onClick={() => onNavigate("explore")}
              >
                <div className="aspect-[4/3] relative overflow-hidden" style={{background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)'}}>
                  <ImageWithFallback
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-black/40 text-white border-0 backdrop-blur-md">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />{place.rating}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs mb-2">{place.type}</Badge>
                    <h4 className="text-white font-bold text-lg">{place.name}</h4>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" onClick={() => onNavigate("explore")} className="rounded-xl">
              View All Places <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ UPCOMING EVENTS ═══ */}
      <section className="py-20 bg-zinc-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Upcoming Events</h2>
            <p className="text-muted-foreground">Don't miss out on Lahore's vibrant cultural calendar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${event.color}`} />
                <CardContent className="p-6">
                  <Calendar className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{event.date}</p>
                  <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {event.location}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA SECTION ═══ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px'}} />
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Explore Lahore?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Sign up for free and get AI-powered travel recommendations backed by real data.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => onNavigate("login")} variant="secondary" className="rounded-xl px-8 py-3 text-base shadow-lg">
              Get Started Free
            </Button>
            <Button onClick={() => onNavigate("explore")} variant="outline" className="rounded-xl px-8 py-3 text-base border-white/30 text-white hover:bg-white/10">
              Browse Landmarks
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
