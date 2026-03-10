import { GameLocation, Game, Player } from "./types";

// Mock current user
export const currentUser: Player = {
  id: "user-1",
  name: "Alex Johnson",
  avatar: "https://images.unsplash.com/photo-1659523585860-c349407e512d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwcGxheWVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyMDcwNzk3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  verified: true,
  stats: {
    totalGames: 47,
    wins: 29,
    sportBreakdown: {
      basketball: 23,
      soccer: 15,
      volleyball: 9,
    },
  },
};

// Mock players
export const mockPlayers: Player[] = [
  currentUser,
  {
    id: "player-2",
    name: "Sarah Martinez",
    avatar: "https://images.unsplash.com/photo-1583485767110-23ca3eefaac9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2NjZXIlMjBwbGF5ZXIlMjB3b21hbnxlbnwxfHx8fDE3NzIwNzA3OTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    stats: {
      totalGames: 32,
      wins: 18,
      sportBreakdown: {
        basketball: 8,
        soccer: 20,
        volleyball: 4,
      },
    },
  },
  {
    id: "player-3",
    name: "Marcus Chen",
    avatar: "https://images.unsplash.com/photo-1662013606299-b8ff0a34efc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2b2xsZXliYWxsJTIwYXRobGV0ZSUyMG1hbGV8ZW58MXx8fHwxNzcyMDcwNzk3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    stats: {
      totalGames: 28,
      wins: 14,
      sportBreakdown: {
        basketball: 5,
        soccer: 8,
        volleyball: 15,
      },
    },
  },
  {
    id: "player-4",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1560073743-0a45c01b68c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMG1hbiUyMHNtaWxpbmd8ZW58MXx8fHwxNzcyMDcwNzk4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    stats: {
      totalGames: 51,
      wins: 33,
      sportBreakdown: {
        basketball: 35,
        soccer: 10,
        volleyball: 6,
      },
    },
  },
  {
    id: "player-5",
    name: "Emma Wilson",
    avatar: "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjA3MDc5OHww&ixlib=rb-4.1.0&q=80&w=1080",
    verified: false,
    stats: {
      totalGames: 12,
      wins: 7,
      sportBreakdown: {
        basketball: 4,
        soccer: 3,
        volleyball: 5,
      },
    },
  },
  {
    id: "player-6",
    name: "Jordan Lee",
    avatar: "https://images.unsplash.com/photo-1761358531981-4064d22bb03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGF0aGxldGUlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzIwNzA3OTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    verified: true,
    stats: {
      totalGames: 38,
      wins: 22,
      sportBreakdown: {
        basketball: 12,
        soccer: 14,
        volleyball: 12,
      },
    },
  },
];

// Mock game locations in San Francisco area
export const mockLocations: GameLocation[] = [
  {
    id: "loc-1",
    name: "Golden Gate Park Courts",
    sport: "basketball",
    lat: 37.7694,
    lng: -122.4862,
    totalGames: 234,
    address: "Golden Gate Park, San Francisco, CA",
  },
  {
    id: "loc-2",
    name: "Mission Dolores Park",
    sport: "soccer",
    lat: 37.7596,
    lng: -122.4269,
    totalGames: 189,
    address: "Mission Dolores Park, San Francisco, CA",
  },
  {
    id: "loc-3",
    name: "Marina Green",
    sport: "volleyball",
    lat: 37.8028,
    lng: -122.4381,
    totalGames: 156,
    address: "Marina Green, San Francisco, CA",
  },
  {
    id: "loc-4",
    name: "Presidio Sports Complex",
    sport: "basketball",
    lat: 37.7989,
    lng: -122.4662,
    totalGames: 178,
    address: "Presidio of San Francisco, CA",
  },
  {
    id: "loc-5",
    name: "Potrero Hill Rec Center",
    sport: "soccer",
    lat: 37.7565,
    lng: -122.4065,
    totalGames: 143,
    address: "Arkansas St & 22nd St, San Francisco, CA",
  },
  {
    id: "loc-6",
    name: "Ocean Beach Courts",
    sport: "volleyball",
    lat: 37.7577,
    lng: -122.5108,
    totalGames: 98,
    address: "Ocean Beach, San Francisco, CA",
  },
];

// Mock games
export const mockGames: Game[] = [
  {
    id: "game-1",
    locationId: "loc-1",
    sport: "basketball",
    date: "2026-02-27",
    time: "18:00",
    players: [mockPlayers[0], mockPlayers[1], mockPlayers[3]],
    teamAScore: 0,
    teamBScore: 0,
    status: "scheduled",
    maxPlayers: 10,
    createdBy: mockPlayers[0].id,
  },
  {
    id: "game-2",
    locationId: "loc-2",
    sport: "soccer",
    date: "2026-02-26",
    time: "17:30",
    players: [mockPlayers[1], mockPlayers[2], mockPlayers[4], mockPlayers[5]],
    teamAScore: 0,
    teamBScore: 0,
    status: "in-progress",
    maxPlayers: 14,
    createdBy: mockPlayers[1].id,
  },
  {
    id: "game-3",
    locationId: "loc-3",
    sport: "volleyball",
    date: "2026-02-25",
    time: "16:00",
    players: [mockPlayers[2], mockPlayers[5]],
    teamAScore: 21,
    teamBScore: 18,
    status: "completed",
    maxPlayers: 8,
    createdBy: mockPlayers[2].id,
  },
  {
    id: "game-4",
    locationId: "loc-1",
    sport: "basketball",
    date: "2026-02-24",
    time: "19:00",
    players: [mockPlayers[0], mockPlayers[3]],
    teamAScore: 15,
    teamBScore: 21,
    status: "completed",
    maxPlayers: 10,
    createdBy: mockPlayers[3].id,
  },
  {
    id: "game-5",
    locationId: "loc-4",
    sport: "basketball",
    date: "2026-02-28",
    time: "15:00",
    players: [mockPlayers[3]],
    teamAScore: 0,
    teamBScore: 0,
    status: "scheduled",
    maxPlayers: 8,
    createdBy: mockPlayers[3].id,
  },
];
