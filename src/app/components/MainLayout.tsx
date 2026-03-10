import { Outlet, Link, useLocation } from "react-router";
import { MapPin, User, History, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function MainLayout() {
  const location = useLocation();
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold">PickupSports</h1>
            <p className="text-xs text-muted-foreground">Find games near you</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
              2
            </Badge>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="border-t bg-background px-4 py-2">
        <div className="flex items-center justify-around max-w-screen-lg mx-auto">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "default" : "ghost"} 
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-xs">Map</span>
            </Button>
          </Link>
          
          <Link to="/history">
            <Button 
              variant={location.pathname === "/history" ? "default" : "ghost"} 
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <History className="w-5 h-5" />
              <span className="text-xs">History</span>
            </Button>
          </Link>
          
          <Link to="/profile">
            <Button 
              variant={location.pathname === "/profile" ? "default" : "ghost"} 
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
