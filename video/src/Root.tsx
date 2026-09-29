import "./index.css";
import { Composition } from "remotion";
import { VerdexDemo } from "./VerdexDemo";
import { VerdexA } from "./VariantA";
import { VerdexB } from "./VariantB";
import { VerdexC } from "./VariantC";
import { VerdexD } from "./VariantD";

const conf = { durationInFrames: 2700, fps: 30, width: 1920, height: 1080 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="VerdexDemo" component={VerdexDemo} {...conf} />
      <Composition id="VerdexA-SlamCut" component={VerdexA} {...conf} />
      <Composition id="VerdexB-EvidenceTape" component={VerdexB} {...conf} />
      <Composition id="VerdexC-VerdictField" component={VerdexC} {...conf} />
      <Composition id="VerdexD-Dossier" component={VerdexD} {...conf} />
    </>
  );
};
