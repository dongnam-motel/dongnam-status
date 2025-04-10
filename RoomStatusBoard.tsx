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
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("rooms").select("room, status").then(({ data }) => {
      const state = {};
      data?.forEach(({ room, status }) => state[room] = status);
      setStatus(state);
      setLoading(false);
    });
  }, []);

  const cycle = async (room) => {
    if (!editMode || loading) return;
    const next = statusOrder[(statusOrder.indexOf(status[room]) + 1) % statusOrder.length];
    setStatus({ ...status, [room]: next });
    await supabase.from("rooms").upsert({ room, status: next, updated_at: new Date().toISOString() });
  };

  const resetAll = async () => {
    if (!editMode || loading) return;
    const updates = rooms.map((room) => ({ room, status: "비어있음", updated_at: new Date().toISOString() }));
    setStatus(Object.fromEntries(rooms.map(r => [r, "비어있음"])));
    await supabase.from("rooms").upsert(updates);
  };

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          disabled={loading}
          onClick={() => setEditMode(!editMode)}
          style={{
            padding: 16,
            minWidth: 100,
            borderRadius: 12,
            fontWeight: "bold",
            backgroundColor: editMode ? "#2196f3" : "#eeeeee",
            color: editMode ? "white" : "#333",
            border: "1px solid #ccc",
            fontSize: 16
          }}>
          {editMode ? "편집 중" : "편집"}
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
          <button key={r} onClick={() => cycle(r)} disabled={loading}
            style={{
              padding: 16,
              minWidth: 100,
              borderRadius: 12,
              fontWeight: "bold",
              backgroundColor: statusColors[status[r]] || "#bdbdbd",
              color: "white",
              border: "none",
              fontSize: 16,
              opacity: editMode ? 1 : 0.6,
              cursor: editMode ? "pointer" : "not-allowed"
            }}>
            {r}호<br />{status[r] || "불러오는 중..."}
          </button>
        ))}
      </div>
    </div>
  );
}
