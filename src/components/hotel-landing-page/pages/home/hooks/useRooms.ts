import { useState, useEffect } from "react";
import { RoomData } from "../types/room.types";

export function useRooms() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/hotel-landing-page/rooms")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<RoomData[]>;
      })
      .then((data) => {
        if (isMounted) {
          setRooms(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch rooms:", error);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return { rooms, loading };
}