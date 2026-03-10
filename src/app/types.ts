export interface GameLocation {
  id: string;
  name: string;
  sport: "basketball" | "soccer" | "volleyball";
  lat: number;
  lng: number;
  totalGames: number;
  address: string;
}

export interface Game {
  id: string;
  locationId: string;
  sport: "basketball" | "soccer" | "volleyball";
  date: string;
  time: string;
  players: Player[] | string[]; // Can be either Player objects or player IDs
  teamAScore: number;
  teamBScore: number;
  status: "scheduled" | "completed" | "in-progress";
  maxPlayers: number;
  createdBy: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  stats: PlayerStats;
  verified: boolean;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  sportBreakdown: {
    basketball: number;
    soccer: number;
    volleyball: number;
  };
}

export interface Notification {
  id: string;
  type: "game-invite" | "player-joined" | "game-starting";
  gameId: string;
  message: string;
  timestamp: string;
  read: boolean;
}