import { Composition } from 'remotion';
import { BarberAd } from './BarberAd';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BarberAd"
        component={BarberAd}
        durationInFrames={1500} // 25 seconds at 60fps
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};
