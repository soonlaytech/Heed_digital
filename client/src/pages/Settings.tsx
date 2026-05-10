import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Clock, User, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout } = useAuth();
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { toast } = useToast();

  const handleTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    try {
      await updateSettings.mutateAsync({ checkinTime: time });
      toast({ title: "Updated", description: "Check-in time saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update time.", variant: "destructive" });
    }
  };

  const toggleNotifications = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({ notifications: !settings.notifications });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update notifications.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8 space-y-6"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>;
  }

  return (
    <div className="max-w-md mx-auto pt-12 px-6 pb-24">
      <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>

      <div className="space-y-6">
        <section className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-foreground">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h2>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </section>

        <section className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
          <h3 className="font-display font-semibold text-lg mb-4">Preferences</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Check-in Time</p>
                <p className="text-sm text-muted-foreground">When we gently nudge you</p>
              </div>
            </div>
            <input 
              type="time" 
              className="bg-secondary px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary/50"
              value={settings?.checkinTime || "20:00"}
              onChange={handleTimeChange}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Receive daily reminders</p>
              </div>
            </div>
            <Switch 
              checked={settings?.notifications} 
              onCheckedChange={toggleNotifications}
            />
          </div>
        </section>

        <section className="text-center pt-8">
           <p className="text-xs text-muted-foreground">Heed v1.0.0 • Made with care</p>
        </section>
      </div>
    </div>
  );
}
