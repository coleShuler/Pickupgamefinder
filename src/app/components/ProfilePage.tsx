import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trophy, TrendingUp, CheckCircle, Settings, Share2, LogOut } from "lucide-react";
import { Progress } from "./ui/progress";
import { useAuth } from "../AuthContext";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, signOut } = useAuth();
  
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarFallback>
                <Trophy className="w-10 h-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mb-2">Sign In to View Profile</h2>
            <p className="text-muted-foreground mb-4">
              Create an account to track your stats, view achievements, and connect with other players.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winRate = user.stats.totalGames > 0 
    ? Math.round((user.stats.wins / user.stats.totalGames) * 100)
    : 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {user.verified && (
                  <CheckCircle className="w-5 h-5 text-blue-500" fill="currentColor" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Active player since 2024
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-3xl font-bold">{user.stats.totalGames}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-3xl font-bold">{winRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wins/Losses */}
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
          <CardDescription>Your overall game record</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Wins</span>
            <span className="text-sm font-semibold text-green-600">{user.stats.wins}</span>
          </div>
          <Progress value={winRate} className="h-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm">Losses</span>
            <span className="text-sm font-semibold text-red-600">
              {user.stats.totalGames - user.stats.wins}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Sport Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Sports Breakdown</CardTitle>
          <CardDescription>Games played by sport</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏀</span>
                <span className="text-sm">Basketball</span>
              </div>
              <Badge variant="secondary">{user.stats.sportBreakdown.basketball} games</Badge>
            </div>
            <Progress 
              value={(user.stats.sportBreakdown.basketball / user.stats.totalGames) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚽</span>
                <span className="text-sm">Soccer</span>
              </div>
              <Badge variant="secondary">{user.stats.sportBreakdown.soccer} games</Badge>
            </div>
            <Progress 
              value={(user.stats.sportBreakdown.soccer / user.stats.totalGames) * 100} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏐</span>
                <span className="text-sm">Volleyball</span>
              </div>
              <Badge variant="secondary">{user.stats.sportBreakdown.volleyball} games</Badge>
            </div>
            <Progress 
              value={(user.stats.sportBreakdown.volleyball / user.stats.totalGames) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Unlock more by playing games</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-lg p-3 text-center">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-xs font-semibold">First Win</p>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <div className="text-3xl mb-1">🔥</div>
              <p className="text-xs font-semibold">10 Game Streak</p>
            </div>
            <div className="border rounded-lg p-3 text-center">
              <div className="text-3xl mb-1">⭐</div>
              <p className="text-xs font-semibold">25 Games</p>
            </div>
            <div className="border rounded-lg p-3 text-center opacity-50">
              <div className="text-3xl mb-1">👑</div>
              <p className="text-xs font-semibold">50 Games</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}