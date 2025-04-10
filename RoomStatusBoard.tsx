import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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
  const [editable, setEditable] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from("rooms").select("room, status").then(({ data }) => {
      const state = {};
      data?.forEach(({ room, status }) => state[room] = status);
      setStatus(state);
      setLoaded(true);
    });
  }, []);

  const cycle = async (room) => {
    if (!editable || !loaded) return;
    const next = statusOrder[(statusOrder.indexOf(status[room]) + 1) % statusOrder.length];
    setStatus({ ...status, [room]: next });
    await supabase.from("rooms").upsert({ room, status: next, updated_at: new Date().toISOString() });
  };

 const resetAll = async () => {
  if (!editable || !loaded) return;

  const confirmReset = window.confirm("정말 모든 객실 상태를 '비어있음'으로 초기화하시겠습니까?");
  if (!confirmReset) return;

  const updates = rooms.map((room) => ({
    room,
    status: "비어있음",
    updated_at: new Date().toISOString()
  }));

  setStatus(Object.fromEntries(rooms.map(r => [r, "비어있음"])));
  await supabase.from("rooms").upsert(updates);
};

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => {
            if (!loaded) return;
            setEditable(!editable);
          }}
          style={{
            padding: 16,
            minWidth: 100,
            borderRadius: 12,
            fontWeight: "bold",
            backgroundColor: loaded ? (editable ? "#4caf50" : "#9e9e9e") : "#bdbdbd",
            color: "white",
            border: "none",
            fontSize: 16,
            pointerEvents: loaded ? "auto" : "none"
          }}>
          {loaded ? (editable ? "변경 가능" : "변경 불가 (클릭)") : "접속 중..."}
        </button>

        <button
          onClick={resetAll}
          style={{
            padding: 16,
            minWidth: 100,
            borderRadius: 12,
            fontWeight: "bold",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            fontSize: 16
          }}>
          전체<br />초기화
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {rooms.map(r => (
          <button key={r} onClick={() => cycle(r)} disabled={!loaded}
            style={{
              padding: 16,
              minWidth: 100,
              borderRadius: 12,
              fontWeight: "bold",
              backgroundColor: statusColors[status[r]] || "#bdbdbd",
              color: "white",
              border: "none",
              fontSize: 16,
              opacity: editable ? 1 : 0.6,
              cursor: editable ? "pointer" : "not-allowed"
            }}>
            {r}호<br />{status[r] || "불러오는 중..."}
          </button>
        ))}
      </div>
    </div>
  );
}
