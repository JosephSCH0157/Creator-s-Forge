import ReturnHome from "../components/ReturnHome";

interface PlaceholderProps {
  name: string;
}

export default function Placeholder({ name }: PlaceholderProps) {
  return (
  <div className="placeholder-container">
      <h1>{name}</h1>
      <ReturnHome />
      <p>This is the {name} module — coming soon.</p>
    </div>
  );
}
