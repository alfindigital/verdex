import "./index.css";
import React from "react";
import { Composition } from "remotion";
import { VerdexDemo } from "./VerdexDemo";
import { VerdexA } from "./VariantA";
import { VerdexB } from "./VariantB";
import { VerdexC } from "./VariantC";
import { VerdexD } from "./VariantD";
import { VerdexAlpha } from "./VerdexAlpha";
import { VerdexBeta } from "./VerdexBeta";
import { VerdexGamma } from "./VerdexGamma";
import { TL_GAMMA_TOTAL_FRAMES } from "./timeline";

const conf = { durationInFrames: 2700, fps: 30, width: 1920, height: 1080 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="VerdexDemo" component={VerdexDemo} {...conf} />
      <Composition id="VerdexA-SlamCut" component={VerdexA} {...conf} />
      <Composition id="VerdexB-EvidenceTape" component={VerdexB} {...conf} />
      <Composition id="VerdexC-VerdictField" component={VerdexC} {...conf} />
      <Composition id="VerdexD-Dossier" component={VerdexD} {...conf} />
      <Composition id="VerdexAlpha" component={VerdexAlpha} {...conf} />
      <Composition id="VerdexBeta" component={VerdexBeta} {...conf} />
      <Composition
        id="VerdexGamma"
        component={VerdexGamma}
        {...conf}
        durationInFrames={TL_GAMMA_TOTAL_FRAMES}
      />
    </>
  );
};
