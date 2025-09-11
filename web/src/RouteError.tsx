// web/src/RouteError.tsx
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
        <a href="/">← Back to Splash</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Something went wrong</h1>
      <pre>{error instanceof Error ? error.message : String(error)}</pre>
      <a href="/">← Back to Splash</a>
    </div>
  );
}
