import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockLocations } from "../mockData";
import { locationsAPI, gamesAPI } from "../api";
import { GameLocation, Game } from "../types";
import { Button } from "./ui/button";
import { CreateGameDialog } from "./CreateGameDialog";
import { LocationDetailSheet } from "./LocationDetailSheet";
import { toast } from "sonner";

// Fix default icon paths for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState<GameLocation | null>(null);
  const [createGameLocation, setCreateGameLocation] = useState<GameLocation | null>(null);
  const [mapCenter] = useState<[number, number]>([37.7749, -122.4194]); // San Francisco
  const [filterSport, setFilterSport] = useState<"all" | "basketball" | "soccer" | "volleyball">("all");
  const [locations, setLocations] = useState<GameLocation[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || isLoading) return;

    try {
      // Create map
      const map = L.map(mapContainerRef.current).setView(mapCenter, 13);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapRef.current = map;
      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapCenter, isLoading]);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter locations
    const filteredLocations = locations.filter(loc => 
      filterSport === "all" || loc.sport === filterSport
    );

    // Add new markers
    filteredLocations.forEach(location => {
      const marker = L.marker([location.lat, location.lng])
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${location.name}</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 8px;">${location.address}</p>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="padding: 2px 8px; border-radius: 4px; border: 1px solid #ddd; font-size: 12px;">
                ${location.sport}
              </span>
              <span style="font-size: 14px;">${location.totalGames} games played</span>
            </div>
          </div>
        `)
        .on('click', () => {
          console.log('Marker clicked:', location.name);
          setSelectedLocation(location);
        });

      markersRef.current.push(marker);
    });
  }, [locations, filterSport]);

  const loadData = async () => {
    try {
      const [locationsResult, gamesResult] = await Promise.all([
        locationsAPI.getAll(),
        gamesAPI.getAll()
      ]);
      
      const fetchedLocations = locationsResult?.locations || [];
      const fetchedGames = gamesResult?.games || [];
      
      console.log('Loaded locations:', fetchedLocations.length, 'games:', fetchedGames.length);
      
      setLocations(fetchedLocations.length > 0 ? fetchedLocations : mockLocations);
      setGames(fetchedGames);
    } catch (error: any) {
      console.error("Error loading data:", error);
      
      if (error.message?.includes("Unable to connect") || error.message?.includes("initializing")) {
        toast.warning("Using demo data. Backend is initializing...");
      } else {
        toast.error("Failed to load live data, showing demo data");
      }
      
      setLocations(mockLocations);
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationGames = (locationId: string) => {
    return games.filter(game => game.locationId === locationId);
  };

  const handleCreateGame = async (gameData: any) => {
    try {
      await gamesAPI.create(gameData);
      toast.success("Game created successfully!");
      setCreateGameLocation(null);
      await loadData();
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game. Please try again.");
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      await gamesAPI.join(gameId);
      toast.success("Joined game successfully!");
      await loadData();
    } catch (error) {
      console.error("Error joining game:", error);
      toast.error("Failed to join game. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Filter buttons */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-2 rounded-lg shadow-lg">
        <Button
          variant={filterSport === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterSport("all")}
        >
          All Sports
        </Button>
        <Button
          variant={filterSport === "basketball" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterSport("basketball")}
          className="whitespace-nowrap"
        >
          🏀 Basketball
        </Button>
        <Button
          variant={filterSport === "soccer" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterSport("soccer")}
          className="whitespace-nowrap"
        >
          ⚽ Soccer
        </Button>
        <Button
          variant={filterSport === "volleyball" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterSport("volleyball")}
          className="whitespace-nowrap"
        >
          🏐 Volleyball
        </Button>
      </div>

      {/* Map */}
      <div 
        ref={mapContainerRef} 
        style={{ height: "100%", width: "100%" }}
      />

      {/* Location detail sheet */}
      {selectedLocation && (
        <LocationDetailSheet
          location={selectedLocation}
          games={getLocationGames(selectedLocation.id)}
          onClose={() => setSelectedLocation(null)}
          onCreateGame={() => {
            setCreateGameLocation(selectedLocation);
            setSelectedLocation(null);
          }}
          onJoinGame={handleJoinGame}
        />
      )}

      {/* Create game dialog */}
      {createGameLocation && (
        <CreateGameDialog
          location={createGameLocation}
          onClose={() => setCreateGameLocation(null)}
          onSubmit={handleCreateGame}
        />
      )}
    </div>
  );
}