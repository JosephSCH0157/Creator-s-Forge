// web/src/App.jsx
import Splash from "./routes/Splash.tsx";
import { useForgeBus } from "./forgeBus";

export default function App() {
  useForgeBus(); // boots the message handler
  return <Splash />;
}
