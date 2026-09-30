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
import { VerdexDelta, TL_DELTA_TOTAL } from "./VerdexDelta";
import { VerdexEpsilon, TL_EPSILON_TOTAL } from "./VerdexEpsilon";
import { VerdexZeta, TL_ZETA_TOTAL } from "./VerdexZeta";
import { VerdexEta, TL_ETA_TOTAL } from "./VerdexEta";
import { VerdexTheta, TL_THETA_TOTAL } from "./VerdexTheta";
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
      <Composition id="VerdexGamma" component={VerdexGamma} {...conf} durationInFrames={TL_GAMMA_TOTAL_FRAMES} />
      <Composition id="VerdexDelta-ReceiptTicker" component={VerdexDelta} {...conf} durationInFrames={TL_DELTA_TOTAL} />
      <Composition id="VerdexEpsilon-CaseFile" component={VerdexEpsilon} {...conf} durationInFrames={TL_EPSILON_TOTAL} />
      <Composition id="VerdexZeta-TheScan" component={VerdexZeta} {...conf} durationInFrames={TL_ZETA_TOTAL} />
      <Composition id="VerdexEta-MarketTape" component={VerdexEta} {...conf} durationInFrames={TL_ETA_TOTAL} />
      <Composition id="VerdexTheta-BeforeAfter" component={VerdexTheta} {...conf} durationInFrames={TL_THETA_TOTAL} />
    </>
  );
};
