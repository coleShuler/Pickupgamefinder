import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

console.log("=== Supabase Edge Function Starting ===");
console.log("Environment check:", {
  hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
  hasServiceRoleKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
});

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

console.log("Supabase client initialized");

// Helper to verify user
async function verifyUser(request: Request) {
  const accessToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!accessToken) {
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  return user;
}

// Initialize default locations on startup
async function initializeDefaultData() {
  try {
    const existingLocations = await kv.getByPrefix("location:");
    
    if (existingLocations.length > 0) {
      console.log(`Database already has ${existingLocations.length} locations`);
      return;
    }

    console.log("Initializing default locations...");
    
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
    
    console.log(`Initialized ${defaultLocations.length} default locations`);
  } catch (error) {
    console.log(`Error initializing default data: ${error}`);
  }
}

// Initialize data on startup
initializeDefaultData();

// Auth routes

// Sign up
app.post("/make-server-7718d69f/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Sign up error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Sign up error: ${error}`);
    return c.json({ error: "Failed to sign up" }, 500);
  }
});

// Get locations
app.get("/make-server-7718d69f/locations", async (c) => {
  try {
    console.log("GET /locations - Headers:", c.req.header());
    const locations = await kv.getByPrefix("location:");
    console.log(`Returning ${locations.length} locations`);
    return c.json({ locations });
  } catch (error) {
    console.log(`Get locations error: ${error}`);
    return c.json({ error: "Failed to fetch locations" }, 500);
  }
});

// Create location
app.post("/make-server-7718d69f/locations", async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const location = await c.req.json();
    const locationId = `location:${crypto.randomUUID()}`;
    
    await kv.set(locationId, {
      ...location,
      id: locationId,
      totalGames: 0,
      createdAt: new Date().toISOString(),
    });

    const locationData = await kv.get(locationId);
    return c.json({ location: locationData });
  } catch (error) {
    console.log(`Create location error: ${error}`);
    return c.json({ error: "Failed to create location" }, 500);
  }
});

// Get games
app.get("/make-server-7718d69f/games", async (c) => {
  try {
    const locationId = c.req.query("locationId");
    const status = c.req.query("status");
    
    let games = await kv.getByPrefix("game:");
    
    if (locationId) {
      games = games.filter(game => game.locationId === locationId);
    }
    
    if (status) {
      games = games.filter(game => game.status === status);
    }

    return c.json({ games });
  } catch (error) {
    console.log(`Get games error: ${error}`);
    return c.json({ error: "Failed to fetch games" }, 500);
  }
});

// Create game
app.post("/make-server-7718d69f/games", async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const game = await c.req.json();
    const gameId = `game:${crypto.randomUUID()}`;
    
    await kv.set(gameId, {
      ...game,
      id: gameId,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      players: [user.id],
    });

    // Update location game count
    const location = await kv.get(game.locationId);
    if (location) {
      await kv.set(game.locationId, {
        ...location,
        totalGames: (location.totalGames || 0) + 1,
      });
    }

    const gameData = await kv.get(gameId);
    return c.json({ game: gameData });
  } catch (error) {
    console.log(`Create game error: ${error}`);
    return c.json({ error: "Failed to create game" }, 500);
  }
});

// Join game
app.post("/make-server-7718d69f/games/:id/join", async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const gameId = c.req.param("id");
    const game = await kv.get(gameId);
    
    if (!game) {
      return c.json({ error: "Game not found" }, 404);
    }

    if (game.players.includes(user.id)) {
      return c.json({ error: "Already joined" }, 400);
    }

    if (game.players.length >= game.maxPlayers) {
      return c.json({ error: "Game is full" }, 400);
    }

    await kv.set(gameId, {
      ...game,
      players: [...game.players, user.id],
    });

    const updatedGame = await kv.get(gameId);
    return c.json({ game: updatedGame });
  } catch (error) {
    console.log(`Join game error: ${error}`);
    return c.json({ error: "Failed to join game" }, 500);
  }
});

// Update game score
app.patch("/make-server-7718d69f/games/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const gameId = c.req.param("id");
    const game = await kv.get(gameId);
    
    if (!game) {
      return c.json({ error: "Game not found" }, 404);
    }

    const updates = await c.req.json();
    await kv.set(gameId, {
      ...game,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const updatedGame = await kv.get(gameId);
    return c.json({ game: updatedGame });
  } catch (error) {
    console.log(`Update game error: ${error}`);
    return c.json({ error: "Failed to update game" }, 500);
  }
});

// Get user profile
app.get("/make-server-7718d69f/profile", async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profileId = `profile:${user.id}`;
    let profile = await kv.get(profileId);

    if (!profile) {
      // Create default profile
      profile = {
        id: user.id,
        name: user.user_metadata?.name || user.email,
        email: user.email,
        verified: false,
        stats: {
          totalGames: 0,
          wins: 0,
          sportBreakdown: {
            basketball: 0,
            soccer: 0,
            volleyball: 0,
          },
        },
        createdAt: new Date().toISOString(),
      };
      await kv.set(profileId, profile);
    }

    return c.json({ profile });
  } catch (error) {
    console.log(`Get profile error: ${error}`);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Update user profile
app.patch("/make-server-7718d69f/profile", async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profileId = `profile:${user.id}`;
    const profile = await kv.get(profileId);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const updates = await c.req.json();
    await kv.set(profileId, {
      ...profile,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const updatedProfile = await kv.get(profileId);
    return c.json({ profile: updatedProfile });
  } catch (error) {
    console.log(`Update profile error: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Get user's games
app.get("/make-server-7718d69f/my-games", async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allGames = await kv.getByPrefix("game:");
    const userGames = allGames.filter(game => game.players?.includes(user.id));

    return c.json({ games: userGames });
  } catch (error) {
    console.log(`Get user games error: ${error}`);
    return c.json({ error: "Failed to fetch games" }, 500);
  }
});

// Health check
app.get("/make-server-7718d69f/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

console.log("=== Server routes configured, starting Deno.serve ===");

Deno.serve(app.fetch);