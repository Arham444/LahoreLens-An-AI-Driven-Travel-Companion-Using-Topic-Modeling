import { useEffect, useState } from "react";
import axios from "axios";
import { Cloud, MapPin, AlertCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    windSpeed: number;
    warning: string | null;
    date: string;
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/weather");
                setWeather(response.data);
            } catch (err) {
                console.error("Failed to fetch weather:", err);
                setError("Could not load weather data.");
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center">Loading weather...</div>
                </div>
            </section>
        );
    }

    if (error || !weather) {
        return (
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto text-center text-red-500">{error}</div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    <Card>
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="mb-2 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Today's Weather in {weather.location}
                                    </h3>
                                    <p className="text-muted-foreground">{weather.date}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Cloud className="h-16 w-16 text-primary" />
                                    <div>
                                        <div className="text-5xl font-bold text-gray-800">{weather.temperature}°C</div>
                                        <p className="text-muted-foreground text-right">{weather.condition}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Travel Warning Display */}
                    {weather.warning && (
                        <Alert variant={weather.warning.includes("Extreme") ? "destructive" : "default"} className="bg-primary/5 border-primary/20">
                            <AlertCircle className="h-4 w-4 text-primary" />
                            <AlertTitle className="text-primary font-bold">Travel Advisory</AlertTitle>
                            <AlertDescription className="text-gray-700">
                                {weather.warning}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </section>
    );
}
