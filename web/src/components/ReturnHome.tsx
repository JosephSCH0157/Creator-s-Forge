import { Link } from "react-router-dom";

export default function ReturnHome() {
  return (
    <Link to="/" className="return-home">
      ⬅ Return to Home
    </Link>
  );
}
