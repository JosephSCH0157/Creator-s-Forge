import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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
      <div><b>Status:</b> {unit.status}</div>
      <div><b>Id:</b> <code>{id}</code></div>
    </div>
  );
}
