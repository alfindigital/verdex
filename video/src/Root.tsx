import "./index.css";
import { Composition } from "remotion";
import { VerdexDemo } from "./VerdexDemo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VerdexDemo"
      component={VerdexDemo}
      durationInFrames={2700}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
