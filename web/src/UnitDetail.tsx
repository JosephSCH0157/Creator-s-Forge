import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Badge({ children }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 999, fontSize: 12,
      background: "#111827", color: "white"
    }}>{children}</span>
  );
}

export default function UnitDetail() {
  const { id } = useParams();
  const [unit, setUnit] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5177/units/${id}`).then(r => r.json()).then(setUnit);
  }, [id]);

  if (!unit) return <div style={{ padding: 24 }}>Loading…</div>;
  return (
    <div style={{ padding: 24 }}>
      <h1>{unit.title}</h1>
      <div><b>Status:</b> <Badge>{unit.status}</Badge></div>
      <div><b>Id:</b> <code>{id}</code></div>
    </div>
  );
}
