import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Shuffle, X } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface BreakoutRoomsProps {
  lessonId: string;
  participants: any[];
}

interface Room {
  id: string;
  name: string;
  participants: any[];
}

export function BreakoutRooms({ lessonId, participants }: BreakoutRoomsProps) {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomCount, setRoomCount] = useState(3);

  const createRooms = () => {
    const newRooms: Room[] = [];
    for (let i = 0; i < roomCount; i++) {
      newRooms.push({
        id: crypto.randomUUID(),
        name: `Room ${i + 1}`,
        participants: [],
      });
    }
    setRooms(newRooms);
  };

  const assignRandomly = () => {
    if (rooms.length === 0) {
      createRooms();
      return;
    }

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newRooms = rooms.map((room, index) => ({
      ...room,
      participants: [],
    }));

    shuffled.forEach((participant, index) => {
      const roomIndex = index % rooms.length;
      newRooms[roomIndex].participants.push(participant);
    });

    setRooms(newRooms);
    toast({
      title: "Participants Assigned",
      description: "Participants have been randomly distributed to breakout rooms",
    });
  };

  const moveParticipant = (participantId: string, fromRoomId: string, toRoomId: string) => {
    const newRooms = rooms.map((room) => {
      if (room.id === fromRoomId) {
        return {
          ...room,
          participants: room.participants.filter((p) => p.id !== participantId),
        };
      }
      if (room.id === toRoomId) {
        const participant = rooms
          .find((r) => r.id === fromRoomId)
          ?.participants.find((p) => p.id === participantId);
        if (participant) {
          return {
            ...room,
            participants: [...room.participants, participant],
          };
        }
      }
      return room;
    });
    setRooms(newRooms);
  };

  const startBreakoutSessions = async () => {
    // Update all participants with their breakout room assignments
    for (const room of rooms) {
      for (const participant of room.participants) {
        await supabase
          .from("live_lesson_participants")
          .update({ breakout_room_id: room.id })
          .eq("id", participant.id);
      }
    }

    toast({
      title: "Breakout Sessions Started",
      description: "Participants have been moved to their breakout rooms",
    });
  };

  const endBreakoutSessions = async () => {
    // Clear all breakout room assignments
    await supabase
      .from("live_lesson_participants")
      .update({ breakout_room_id: null })
      .eq("lesson_id", lessonId);

    setRooms([]);
    toast({
      title: "Breakout Sessions Ended",
      description: "All participants have returned to the main room",
    });
  };

  const unassignedParticipants = participants.filter(
    (p) => !rooms.some((r) => r.participants.some((rp) => rp.id === p.id))
  );

  return (
    <>
      <FloatingHowItWorks title="How Breakout Rooms works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Breakout Rooms</h3>
        <div className="flex gap-2">
          {rooms.length === 0 ? (
            <>
              <Input
                type="number"
                min="2"
                max="10"
                value={roomCount}
                onChange={(e) => setRoomCount(parseInt(e.target.value))}
                className="w-20"
              />
              <Button onClick={createRooms}>
                <Plus className="w-4 h-4 mr-2" />
                Create Rooms
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={assignRandomly}>
                <Shuffle className="w-4 h-4 mr-2" />
                Assign Randomly
              </Button>
              <Button onClick={startBreakoutSessions}>Start Sessions</Button>
              <Button variant="destructive" onClick={endBreakoutSessions}>
                End Sessions
              </Button>
            </>
          )}
        </div>
      </div>

      {rooms.length > 0 && (
        <>
          {/* Unassigned Participants */}
          {unassignedParticipants.length > 0 && (
            <Card className="p-4 mb-4 bg-muted">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Unassigned ({unassignedParticipants.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {unassignedParticipants.map((participant) => (
                  <Badge key={participant.id} variant="secondary">
                    {participant.profiles?.full_name || "Unknown"}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Breakout Rooms */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{room.name}</h4>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {room.participants.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {room.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm">
                        {participant.profiles?.full_name || "Unknown"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const otherRoom = rooms.find((r) => r.id !== room.id);
                          if (otherRoom) {
                            moveParticipant(participant.id, room.id, otherRoom.id);
                          }
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Card>
    </>
    );
}
