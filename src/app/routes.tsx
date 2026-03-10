import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { MapView } from "./components/MapView";
import { ProfilePage } from "./components/ProfilePage";
import { GameHistoryPage } from "./components/GameHistoryPage";

// Error boundary component
function ErrorBoundary() {
  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">Please refresh the page to try again.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { 
        index: true, 
        element: <MapView />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "profile", 
        element: <ProfilePage />,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "history", 
        element: <GameHistoryPage />,
        errorElement: <ErrorBoundary />
      },
    ],
  },
]);