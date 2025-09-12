import React from "react";
import { useLocation } from "react-router-dom";

export default function Tongs() {
  const { pathname } = useLocation();
  console.log("Tongs pathname:", pathname);
  return (
    <div style={{ padding: 24 }}>
      <h1>Tongs</h1>
      <p>This is the Tongs tool page.</p>
    </div>
  );
}
