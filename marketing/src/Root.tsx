import React from 'react';
import { Composition, Still } from 'remotion';
import { FeatureGraphic, StoreShot, SHOTS, SUB_SHOTS } from './StoreShot';
import { Promo, promoDuration } from './Promo';
import { Story, storyDuration } from './Story';
import { FPS } from './theme';

export const Root: React.FC = () => (
  <>
    {SHOTS.map((_, i) => (
      <Still key={i} id={`store-${i + 1}`} component={StoreShot as any} width={1080} height={1920} defaultProps={{ index: i, set: 'store' }} />
    ))}
    {SUB_SHOTS.map((_, i) => (
      <Still key={i} id={`subscription-${i + 1}`} component={StoreShot as any} width={1080} height={1920} defaultProps={{ index: i, set: 'sub' }} />
    ))}
    <Still id="feature-graphic" component={FeatureGraphic} width={1024} height={500} />
    <Composition id="promo-vertical" component={Promo as any} width={1080} height={1920} fps={FPS} durationInFrames={promoDuration()} defaultProps={{ layout: 'v' }} />
    <Composition id="promo-horizontal" component={Promo as any} width={1920} height={1080} fps={FPS} durationInFrames={promoDuration()} defaultProps={{ layout: 'h' }} />
    <Composition id="story-vertical" component={Story} width={1080} height={1920} fps={FPS} durationInFrames={storyDuration()} />
  </>
);
