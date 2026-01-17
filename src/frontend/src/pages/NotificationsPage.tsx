import { Bell, Calendar, Cloud, MapPin, Utensils, Check } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useState } from "react";

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

interface Notification {
  id: number;
  type: "event" | "weather" | "food" | "culture";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "event",
    title: "Basant Festival Tomorrow",
    message: "Don't miss the annual Basant Festival at Minar-e-Pakistan starting at 10 AM!",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "weather",
    title: "Weather Alert",
    message: "Temperature expected to drop to 15°C tonight. Plan accordingly!",
    time: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "food",
    title: "New Restaurant Added",
    message: "Check out 'Spice Garden' - a new authentic Lahori restaurant in Gulberg.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    type: "culture",
    title: "Museum Exhibition",
    message: "New art exhibition opening at Lahore Museum this weekend.",
    time: "2 days ago",
    read: true,
  },
  {
    id: 5,
    type: "event",
    title: "Lahore Literary Festival",
    message: "Registration is now open for the annual literary festival (March 20-22).",
    time: "3 days ago",
    read: true,
  },
  {
    id: 6,
    type: "weather",
    title: "Pleasant Weather Ahead",
    message: "Perfect weather for outdoor activities this weekend - 25°C and sunny!",
    time: "4 days ago",
    read: true,
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "event":
      return Calendar;
    case "weather":
      return Cloud;
    case "food":
      return Utensils;
    case "culture":
      return MapPin;
    default:
      return Bell;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case "event":
      return "text-purple-500";
    case "weather":
      return "text-blue-500";
    case "food":
      return "text-orange-500";
    case "culture":
      return "text-green-500";
    default:
      return "text-primary";
  }
};

export function NotificationsPage({ onNavigate }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const toggleRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary" />
                <h1>Notifications</h1>
              </div>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`
                : "All caught up!"}
            </p>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);

              return (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? "border-primary/50 bg-primary/5" : ""
                  }`}
                  onClick={() => toggleRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className={`mt-1 ${iconColor}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="flex-1">{notification.title}</h4>
                          {!notification.read && (
                            <Badge variant="default" className="shrink-0">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRead(notification.id);
                            }}
                          >
                            {notification.read ? "Mark as unread" : "Mark as read"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {notifications.length === 0 && (
            <Card className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                We'll notify you when there's something new
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
