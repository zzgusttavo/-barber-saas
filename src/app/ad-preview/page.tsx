'use client';

import { Player } from '@remotion/player';
import { BarberAd } from '../../remotion/BarberAd';

export default function AdPreviewPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-5 font-sans">
      <h1 className="text-white text-3xl mb-8 font-bold">Pré-visualização do Anúncio (Remotion)</h1>
      
      <div className="w-full max-w-[400px] shadow-[0_0_30px_rgba(243,156,18,0.3)] rounded-[20px] overflow-hidden border border-gray-800">
        <Player
          component={BarberAd}
          durationInFrames={300} // 10 seconds at 30 fps
          compositionWidth={1080}
          compositionHeight={1920}
          fps={30}
          controls
          style={{
            width: '100%',
            aspectRatio: '1080 / 1920',
          }}
        />
      </div>

      <div className="text-gray-400 mt-6 text-sm text-center max-w-md">
        <p>Este vídeo é renderizado em tempo real com React e Remotion. Você pode exportá-lo mais tarde em MP4 usando a CLI do Remotion.</p>
      </div>
    </div>
  );
}
