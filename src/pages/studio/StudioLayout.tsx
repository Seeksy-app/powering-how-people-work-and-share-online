import { Outlet } from "react-router-dom";

export default function StudioLayout() {
  // Studio routes now use the unified Seeksy/My Day OS navigation
  // This layout component is now just a pass-through for nested routes
  
  return (
    <div className="flex-1 overflow-hidden bg-background">
      <Outlet />
    </div>
  );
}
