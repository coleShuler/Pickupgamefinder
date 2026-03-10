import { useState, useEffect } from "react";
import { mockLocations } from "../mockData";
import { gamesAPI } from "../api";
import { useAuth } from "../AuthContext";
import { Game } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Calendar, Clock, MapPin, Users, Trophy, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";

export function GameHistoryPage() {
  const { user } = useAuth();
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      // Only load games if user is authenticated
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const { games } = await gamesAPI.getMyGames();
      setUserGames(games || []);
    } catch (error) {
      console.error("Error loading games:", error);
      toast.error("Failed to load game history");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show message if user is not logged in
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Sign In to View History</h2>
            <p className="text-muted-foreground mb-4">
              Create an account to track your games, view stats, and join pickup sports events.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingGames = userGames.filter(g => g.status === "scheduled");
  const completedGames = userGames.filter(g => g.status === "completed");
  const inProgressGames = userGames.filter(g => g.status === "in-progress");

  const getLocationName = (locationId: string) => {
    return mockLocations.find(loc => loc.id === locationId)?.name || "Unknown Location";
  };

  const getSportEmoji = (sport: string) => {
    switch (sport) {
      case "basketball": return "🏀";
      case "soccer": return "⚽";
      case "volleyball": return "🏐";
      default: return "🏃";
    }
  };

  const renderGameCard = (game: any, showScore: boolean = false) => (
    <Card key={game.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {getSportEmoji(game.sport)}
              {game.sport.charAt(0).toUpperCase() + game.sport.slice(1)}
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {getLocationName(game.locationId)}
            </CardDescription>
          </div>
          <Badge variant={
            game.status === "completed" ? "secondary" : 
            game.status === "in-progress" ? "default" : 
            "outline"
          }>
            {game.status === "in-progress" ? "Live" : 
             game.status === "completed" ? "Completed" : 
             "Scheduled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(game.date), "MMM d, yyyy")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {game.time}
          </span>
        </div>

        {showScore && (
          <div className="flex items-center justify-center gap-4 py-3 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Team A</p>
              <p className="text-2xl font-bold">{game.teamAScore}</p>
            </div>
            <div className="text-muted-foreground">-</div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Team B</p>
              <p className="text-2xl font-bold">{game.teamBScore}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="w-4 h-4" />
              {Array.isArray(game.players) ? game.players.length : 0} players
            </span>
          </div>
          {Array.isArray(game.players) && game.players.length > 0 && (
            <div className="flex -space-x-2">
              {game.players.map((player: any, idx: number) => {
                // Handle both player objects and player IDs
                const playerId = typeof player === 'string' ? player : player?.id;
                const playerName = typeof player === 'string' ? 'Player' : player?.name || 'Player';
                
                return (
                  <Avatar key={playerId || idx} className="w-8 h-8 border-2 border-background">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playerId}`} alt={playerName} />
                    <AvatarFallback>{playerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full overflow-y-auto p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Game History</h1>
        <p className="text-muted-foreground">Track all your pickup games</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming {upcomingGames.length > 0 && `(${upcomingGames.length})`}
          </TabsTrigger>
          <TabsTrigger value="live">
            Live {inProgressGames.length > 0 && `(${inProgressGames.length})`}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcomingGames.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No upcoming games</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Find games on the map to join
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingGames.map(game => renderGameCard(game, false))
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-3">
          {inProgressGames.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No games in progress</p>
              </CardContent>
            </Card>
          ) : (
            inProgressGames.map(game => renderGameCard(game, true))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-3 pr-4">
              {completedGames.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No completed games yet</p>
                  </CardContent>
                </Card>
              ) : (
                completedGames.map(game => renderGameCard(game, true))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}