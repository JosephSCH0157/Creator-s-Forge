import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";

type Unit = { id: string; title: string; status: string };

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="unit-detail-badge">
      {children}
    </span>
  );
}

import "./UnitDetail.css";

export default function UnitDetail() {
  const { id } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);

  useEffect(() => {
    if (!id) return;
    void fetch(`http://127.0.0.1:5177/units/${id}`)
      .then((r) => r.json() as Promise<Unit>)
      .then(setUnit)
      .catch((err) => {
        // optional: show a friendly error state
        console.error(err);
        setUnit(null);
      });
  }, [id]);

  if (!unit) return <div className="unit-detail-loading">Loading…</div>;

  return (
    <div className="unit-detail-container">
      <h1>{unit.title}</h1>
      <div>
        <b>Status:</b> <Badge>{unit.status}</Badge>
      </div>
      <div>
        <b>Id:</b> <code>{id}</code>
      </div>
    </div>
  );
}

