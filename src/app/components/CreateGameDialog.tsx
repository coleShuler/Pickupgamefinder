import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { GameLocation, Game } from "../types";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { gamesAPI } from "../api";
import { toast } from "sonner";

interface CreateGameDialogProps {
  location: GameLocation;
  onClose: () => void;
  onCreateGame: (game: Partial<Game>) => void;
}

export function CreateGameDialog({ location, onClose, onCreateGame }: CreateGameDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("18:00");
  const [maxPlayers, setMaxPlayers] = useState("10");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!date) return;
    
    setIsLoading(true);
    try {
      const gameData = {
        locationId: location.id,
        sport: location.sport,
        date: format(date, "yyyy-MM-dd"),
        time,
        maxPlayers: parseInt(maxPlayers),
        status: "scheduled" as const,
        teamAScore: 0,
        teamBScore: 0,
      };
      
      await gamesAPI.create(gameData);
      toast.success("Game created successfully!");
      onCreateGame(gameData);
    } catch (error: any) {
      toast.error(error.message || "Failed to create game");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Game</DialogTitle>
          <DialogDescription>
            Schedule a {location.sport} game at {location.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPlayers">Max Players</Label>
            <Input
              id="maxPlayers"
              type="number"
              min="2"
              max="30"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Game"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}