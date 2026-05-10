import { Link, useLocation } from "wouter";
import { Home, MessageCircle, Settings, LogOut, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import heedLogoPath from "@assets/heed_(1)_1773080364173.png";

export function Navigation() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/chat", icon: MessageCircle, label: "Companion" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-border md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-md mx-auto px-6 h-16 md:max-w-5xl md:px-8 flex items-center justify-between">
        <Link href="/" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={heedLogoPath} alt="Heed" className="w-8 h-8" data-testid="img-logo" />
          <span className="font-display text-xl font-bold text-foreground">Heed</span>
        </Link>

        <div className="flex items-center justify-between w-full md:w-auto md:gap-8">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-all duration-200",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}>
                  <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                  <span className="text-[10px] font-medium md:hidden">{item.label}</span>
                  <span className="hidden md:block text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          <button 
            onClick={() => logout()}
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
