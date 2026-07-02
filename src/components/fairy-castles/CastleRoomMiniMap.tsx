import { Card } from "@/components/ui/card";
import { Check, Lock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Room {
  id: string;
  room_name: string;
  order_index: number;
  panorama_url: string;
}

interface CastleRoomMiniMapProps {
  rooms: Room[];
  currentRoomIndex: number;
  visitedRoomIds: string[];
  onRoomSelect: (index: number) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const CastleRoomMiniMap = ({
  rooms,
  currentRoomIndex,
  visitedRoomIds,
  onRoomSelect,
  isVisible,
  onClose,
}: CastleRoomMiniMapProps) => {
  if (!isVisible) return null;

  return (
    <>
      <FloatingHowItWorks title={"Castle Room Mini Map - How it works"} steps={[{ title: 'Open', desc: 'Access the Castle Room Mini Map section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Castle Room Mini Map.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Mini Map Panel */}
      <Card className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[80vh] overflow-y-auto z-50 p-6 bg-background/95 backdrop-blur-md animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Castle Room Map
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select any room to jump directly to it
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {rooms.map((room, index) => {
            const isCurrentRoom = index === currentRoomIndex;
            const isVisited = visitedRoomIds.includes(room.id);
            const isLocked = index > currentRoomIndex && !isVisited;

            return (
              <button
                key={room.id}
                onClick={() => {
                  if (!isLocked) {
                    onRoomSelect(index);
                    onClose();
                  }
                }}
                disabled={isLocked}
                className={cn(
                  "relative group rounded-lg overflow-hidden transition-all duration-300",
                  "border-2 hover:scale-105 active:scale-95",
                  isCurrentRoom && "border-primary ring-2 ring-primary/50",
                  !isCurrentRoom && isVisited && "border-green-500/50",
                  !isCurrentRoom && !isVisited && !isLocked && "border-border hover:border-primary/50",
                  isLocked && "border-border opacity-50 cursor-not-allowed hover:scale-100"
                )}
              >
                {/* Room Preview - using gradient as placeholder */}
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Room Number */}
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Status Icons */}
                  <div className="absolute top-2 right-2">
                    {isCurrentRoom && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1.5 animate-pulse">
                        <MapPin className="h-4 w-4" />
                      </div>
                    )}
                    {!isCurrentRoom && isVisited && (
                      <div className="bg-green-500 text-white rounded-full p-1.5">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    {isLocked && (
                      <div className="bg-muted text-muted-foreground rounded-full p-1.5">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Room Icon */}
                  <div className="text-4xl opacity-50">
                    {getRoomIcon(room.room_name)}
                  </div>
                </div>

                {/* Room Name */}
                <div className="p-2 bg-card">
                  <p className={cn(
                    "text-xs font-medium line-clamp-2 text-center",
                    isCurrentRoom && "text-primary",
                    isLocked && "text-muted-foreground"
                  )}>
                    {room.room_name}
                  </p>
                </div>

                {/* Hover Overlay */}
                {!isLocked && (
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary rounded" />
            <span className="text-muted-foreground">Current Room</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-500/50 rounded bg-green-500/10" />
            <span className="text-muted-foreground">Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-border rounded opacity-50" />
            <span className="text-muted-foreground">Locked</span>
          </div>
        </div>
      </Card>
    </>
    </>
  );
};

// Helper function to get emoji icon based on room name
function getRoomIcon(roomName: string): string {
  const name = roomName.toLowerCase();
  
  if (name.includes('throne') || name.includes('royal')) return '👑';
  if (name.includes('ballroom') || name.includes('dance')) return '💃';
  if (name.includes('library') || name.includes('book')) return '📚';
  if (name.includes('garden') || name.includes('enchanted')) return '🌸';
  if (name.includes('tower') || name.includes('turret')) return '🗼';
  if (name.includes('treasury') || name.includes('vault')) return '💎';
  if (name.includes('kitchen') || name.includes('dining')) return '🍽️';
  if (name.includes('chapel') || name.includes('sanctuary')) return '⛪';
  if (name.includes('gallery') || name.includes('art')) return '🖼️';
  if (name.includes('chamber') || name.includes('bedroom')) return '🛏️';
  
  return '🏰';
}
