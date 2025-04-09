import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vgskyyihyqkpxjhsngzb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const supabase = createClient(supabaseUrl, supabaseKey);

const rooms = ["102", "103", "105", "106", "107", "201", "202", "203", "205", "206", "207", "208"];
const statusOrder = ["비어있음", "대실 중", "숙박 중", "예약됨"];

export default function RoomStatusBoard() {
  const [status, setStatus] = useState({});

  useEffect(() => {
    supabase.from("rooms").select("room, status").then(({ data }) => {
      const state = {};
      data?.forEach(({ room, status }) => state[room] = status);
      setStatus(state);
    });
  }, []);

  const cycle = async (room) => {
    const next = statusOrder[(statusOrder.indexOf(status[room]) + 1) % statusOrder.length];
    setStatus({ ...status, [room]: next });
    await supabase.from("rooms").upsert({ room, status: next, updated_at: new Date().toISOString() });
  };

  return (
    <div style={{ padding: 20 }}>
      {rooms.map(r => (
        <button key={r} onClick={() => cycle(r)} style={{ margin: 8, padding: 12 }}>
          {r}호 - {status[r] || "불러오는 중..."}
        </button>
      ))}
    </div>
  );
}
