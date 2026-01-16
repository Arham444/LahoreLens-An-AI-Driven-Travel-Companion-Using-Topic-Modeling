import { User, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Picture */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-12 w-12 text-primary-foreground" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="mb-1">Ahmed Khan</h3>
                  <p className="text-muted-foreground mb-3">Member since March 2025</p>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Ahmed" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Khan" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground mt-2" />
                  <Input id="email" type="email" defaultValue="ahmed.khan@email.com" className="flex-1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground mt-2" />
                  <Input id="phone" type="tel" defaultValue="+92 300 1234567" className="flex-1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={3}
                  defaultValue="Travel enthusiast exploring the beautiful city of Lahore"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge>Food & Dining</Badge>
                  <Badge>Historical Sites</Badge>
                  <Badge>Art & Culture</Badge>
                  <Badge>Shopping</Badge>
                  <Badge variant="outline">+ Add Interest</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Preferred Budget</Label>
                <Input id="budget" defaultValue="Moderate ($$)" />
              </div>

              <div className="space-y-2">
                <Label>Dietary Preferences</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge>Halal</Badge>
                  <Badge>Vegetarian Options</Badge>
                  <Badge variant="outline">+ Add Preference</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Input id="language" defaultValue="English" />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1">
              Save Changes
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onNavigate("home")}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
