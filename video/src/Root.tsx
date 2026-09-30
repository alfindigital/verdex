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
import {
  EL_TL_DELTA, EL_TL_DELTA_TOTAL,
  EL_TL_EPSILON, EL_TL_EPSILON_TOTAL,
  EL_TL_ZETA, EL_TL_ZETA_TOTAL,
  EL_TL_ETA, EL_TL_ETA_TOTAL,
  EL_TL_THETA, EL_TL_THETA_TOTAL,
} from "./el-timing";

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
      {/* ElevenLabs v4 two-voice cuts (Brian + Sarah) — same scenes, EL-paced timelines */}
      <Composition id="VerdexDelta-EL" component={VerdexDelta} {...conf} durationInFrames={EL_TL_DELTA_TOTAL} defaultProps={{ voDir: "vo-delta-el", tl: EL_TL_DELTA }} />
      <Composition id="VerdexEpsilon-EL" component={VerdexEpsilon} {...conf} durationInFrames={EL_TL_EPSILON_TOTAL} defaultProps={{ voDir: "vo-epsilon-el", tl: EL_TL_EPSILON }} />
      <Composition id="VerdexZeta-EL" component={VerdexZeta} {...conf} durationInFrames={EL_TL_ZETA_TOTAL} defaultProps={{ voDir: "vo-zeta-el", tl: EL_TL_ZETA }} />
      <Composition id="VerdexEta-EL" component={VerdexEta} {...conf} durationInFrames={EL_TL_ETA_TOTAL} defaultProps={{ voDir: "vo-eta-el", tl: EL_TL_ETA }} />
      <Composition id="VerdexTheta-EL" component={VerdexTheta} {...conf} durationInFrames={EL_TL_THETA_TOTAL} defaultProps={{ voDir: "vo-theta-el", tl: EL_TL_THETA }} />
    </>
  );
};
