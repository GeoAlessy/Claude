import React from 'react';
import {Composition, Still} from 'remotion';
import {HojaPersonajes} from './sheets/HojaPersonajes';
import {Ep01} from './episodes/ep01/Ep01';
import {DURACION, FPS} from './episodes/ep01/tiempos';
import {Gancho, DURACION_GANCHO} from './porquepaso/p01/Gancho';
import {Holograma, H as H_HOLO} from './porquepaso/p01/Holograma';
import {Piloto01, DURACION_P01} from './porquepaso/p01/Piloto01';
import {Gancho as Gancho02, DURACION_GANCHO as DURACION_GANCHO_02} from './porquepaso/p02/Gancho';
import {Holograma as Holograma02, H as H02} from './porquepaso/p02/Holograma';
import {Video02, DURACION_P02} from './porquepaso/p02/Video02';
import {Banner, Logo, MarcaAgua} from './porquepaso/canal/Marca';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Ep01" component={Ep01} durationInFrames={DURACION} fps={FPS} width={1080} height={1920} defaultProps={{conAudio: true}} />
      <Still id="HojaPersonajes" component={HojaPersonajes} width={3000} height={2000} />
      <Composition id="P01" component={Piloto01} durationInFrames={DURACION_P01} fps={30} width={1080} height={1920} />
      <Composition id="P01Holograma" component={Holograma} durationInFrames={H_HOLO.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P01Gancho" component={Gancho} durationInFrames={DURACION_GANCHO} fps={30} width={1080} height={1920} />
      <Still id="CanalLogo" component={Logo} width={800} height={800} />
      <Still id="CanalBanner" component={Banner} width={2560} height={1440} />
      <Still id="CanalMarcaAgua" component={MarcaAgua} width={150} height={150} />
      <Composition id="P02" component={Video02} durationInFrames={DURACION_P02} fps={30} width={1080} height={1920} />
      <Composition id="P02Holograma" component={Holograma02} durationInFrames={H02.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P02Gancho" component={Gancho02} durationInFrames={DURACION_GANCHO_02} fps={30} width={1080} height={1920} />
    </>
  );
};
