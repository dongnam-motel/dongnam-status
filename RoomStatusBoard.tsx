import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase 전체 URL 및 anon 키 (말줄임 없이 완전한 값)
const supabase = createClient(
  "https://vgskyyihyqkpxjhsngzb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2t5eWloeXFrcHhqaHNuZ3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMjI3MTEsImV4cCI6MjA1OTc5ODcxMX0.JeKYryWZbC2Fr49lHT0sp54Mcc9jjqMwme6AhNb3Gz8"
);

const rooms = ["102", "103", "105", "106", "107", "201", "202", "203", "205", "206", "207", "208"];
const statusOrder = ["비어있음", "대실 중", "숙박 중", "예약됨"];
const statusColors = {
  "비어있음": "#e0e0e0",
  "대실 중": "#42a5f5",
  "숙박 중": "#ab47bc",
  "예약됨": "#ef5350"
};

export default function RoomStatusBoard() {
  const [status, setStatus] = useState({});

  useEffect(() => {
    supabase.from("rooms").select("room, status").then(({ data, error }) => {
      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      const state = {};
      rooms.forEach((r) => {
        const found = data?.find((d) => d.room === r);
        state[r] = found ? found.status : "비어있음"; // ❗ 기본값 자동 지정
      });

      setStatus(state);
    });
  }, []);

  const cycle = async (room) => {
    const current = status[room] || "비어있음";
    const next = statusOrder[(statusOrder.indexOf(current) + 1) % statusOrder.length];
    setStatus({ ...status, [room]: next });

    await supabase.from("rooms").upsert({
      room,
      status: next,
      updated_at: new Date().toISOString()
    });
  };

  return (
    <div style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 12 }}>
      {rooms.map((r) => (
        <button
          key={r}
          onClick={() => cycle(r)}
          style={{
            padding: 16,
            minWidth: 120,
            borderRadius: 12,
            fontWeight: "bold",
            backgroundColor: statusColors[status[r]] || "#bdbdbd",
            color: "white",
            border: "none",
            fontSize: 16,
            lineHeight: "1.4em"
          }}
        >
          {r}호<br />
          {status[r] || "비어있음"}
        </button>
      ))}
    </div>
  );
}
