import { Composition } from 'remotion';
import { BarberAd } from './BarberAd';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BarberAd"
        component={BarberAd}
        durationInFrames={450} // 15 seconds at 30fps
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
