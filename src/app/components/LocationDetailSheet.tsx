import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { GameLocation, Game } from "../types";
import { Calendar, Clock, Users, Trophy, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";

interface LocationDetailSheetProps {
  location: GameLocation;
  games: Game[];
  onClose: () => void;
  onCreateGame: () => void;
  onJoinGame: (gameId: string) => void;
}

export function LocationDetailSheet({ 
  location, 
  games, 
  onClose, 
  onCreateGame,
  onJoinGame 
}: LocationDetailSheetProps) {
  const upcomingGames = games.filter(g => g.status === "scheduled" || g.status === "in-progress");
  const completedGames = games.filter(g => g.status === "completed");

  const getSportEmoji = (sport: string) => {
    switch (sport) {
      case "basketball": return "🏀";
      case "soccer": return "⚽";
      case "volleyball": return "🏐";
      default: return "🏃";
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-[90vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="text-2xl">{getSportEmoji(location.sport)}</span>
            {location.name}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {location.address}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Games</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{location.totalGames}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Upcoming</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="text-2xl font-bold">{upcomingGames.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create game button */}
          <Button className="w-full" onClick={onCreateGame}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Game
          </Button>

          {/* Upcoming games */}
          <div>
            <h3 className="font-semibold mb-3">Upcoming Games</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {upcomingGames.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming games. Create one!
                  </p>
                ) : (
                  upcomingGames.map((game) => (
                    <Card key={game.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {getSportEmoji(game.sport)}
                              {game.sport.charAt(0).toUpperCase() + game.sport.slice(1)}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(game.date), "MMM d, yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {game.time}
                              </span>
                            </CardDescription>
                          </div>
                          <Badge variant={game.status === "in-progress" ? "default" : "secondary"}>
                            {game.status === "in-progress" ? "Live" : "Scheduled"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {Array.isArray(game.players) ? game.players.length : 0}/{game.maxPlayers} players
                            </span>
                          </div>
                          {Array.isArray(game.players) && game.players.length > 0 && (
                            <div className="flex -space-x-2">
                              {game.players.slice(0, 3).map((player, idx) => {
                                // Handle both player objects and player IDs
                                const playerId = typeof player === 'string' ? player : player.id;
                                const playerName = typeof player === 'string' ? 'Player' : player.name;
                                
                                return (
                                  <Avatar key={playerId || idx} className="w-8 h-8 border-2 border-background">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playerId}`} alt={playerName} />
                                    <AvatarFallback>{playerName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                );
                              })}
                              {game.players.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                  <span className="text-xs">+{game.players.length - 3}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => onJoinGame(game.id)}
                          disabled={game.players.length >= game.maxPlayers}
                        >
                          {game.players.length >= game.maxPlayers ? "Full" : "Join Game"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Recent games */}
          <div>
            <h3 className="font-semibold mb-3">Recent Games</h3>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {completedGames.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No completed games yet
                  </p>
                ) : (
                  completedGames.slice(0, 5).map((game) => (
                    <Card key={game.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {format(new Date(game.date), "MMM d")} • {game.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {game.players.length} players
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {game.teamAScore} - {game.teamBScore}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}