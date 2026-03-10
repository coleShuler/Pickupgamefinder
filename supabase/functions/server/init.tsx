import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize database with default locations
app.post("/make-server-7718d69f/init-data", async (c) => {
  try {
    // Check if locations already exist
    const existingLocations = await kv.getByPrefix("location:");
    
    if (existingLocations.length > 0) {
      return c.json({ message: "Data already initialized", count: existingLocations.length });
    }

    // Create default locations
    const defaultLocations = [
      {
        id: "location:1",
        name: "Golden Gate Park Courts",
        sport: "basketball",
        lat: 37.7694,
        lng: -122.4862,
        totalGames: 0,
        address: "Golden Gate Park, San Francisco, CA",
      },
      {
        id: "location:2",
        name: "Mission Dolores Park",
        sport: "soccer",
        lat: 37.7596,
        lng: -122.4269,
        totalGames: 0,
        address: "Mission Dolores Park, San Francisco, CA",
      },
      {
        id: "location:3",
        name: "Marina Green",
        sport: "volleyball",
        lat: 37.8028,
        lng: -122.4381,
        totalGames: 0,
        address: "Marina Green, San Francisco, CA",
      },
      {
        id: "location:4",
        name: "Presidio Sports Complex",
        sport: "basketball",
        lat: 37.7989,
        lng: -122.4662,
        totalGames: 0,
        address: "Presidio of San Francisco, CA",
      },
      {
        id: "location:5",
        name: "Potrero Hill Rec Center",
        sport: "soccer",
        lat: 37.7565,
        lng: -122.4065,
        totalGames: 0,
        address: "Arkansas St & 22nd St, San Francisco, CA",
      },
      {
        id: "location:6",
        name: "Ocean Beach Courts",
        sport: "volleyball",
        lat: 37.7577,
        lng: -122.5108,
        totalGames: 0,
        address: "Ocean Beach, San Francisco, CA",
      },
    ];

    for (const location of defaultLocations) {
      await kv.set(location.id, location);
    }

    return c.json({ 
      message: "Data initialized successfully", 
      count: defaultLocations.length 
    });
  } catch (error) {
    console.log(`Init data error: ${error}`);
    return c.json({ error: "Failed to initialize data" }, 500);
  }
});

Deno.serve(app.fetch);
