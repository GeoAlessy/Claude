import React from 'react';
import {Composition, Still} from 'remotion';
import {HojaPersonajes} from './sheets/HojaPersonajes';
import {Ep01} from './episodes/ep01/Ep01';
import {DURACION, FPS} from './episodes/ep01/tiempos';
import {Gancho, DURACION_GANCHO} from './porquepaso/p01/Gancho';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Ep01" component={Ep01} durationInFrames={DURACION} fps={FPS} width={1080} height={1920} defaultProps={{conAudio: true}} />
      <Still id="HojaPersonajes" component={HojaPersonajes} width={3000} height={2000} />
      <Composition id="P01Gancho" component={Gancho} durationInFrames={DURACION_GANCHO} fps={30} width={1080} height={1920} />
    </>
  );
};
