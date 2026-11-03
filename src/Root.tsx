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
import {Gancho as Gancho03, DURACION_GANCHO as DURACION_GANCHO_03} from './porquepaso/p03/Gancho';
import {Holograma as Holograma03, H as H03} from './porquepaso/p03/Holograma';
import {Video03, DURACION_P03} from './porquepaso/p03/Video03';
import {Gancho as Gancho04, DURACION_GANCHO as DURACION_GANCHO_04} from './porquepaso/p04/Gancho';
import {Holograma as Holograma04, H as H04} from './porquepaso/p04/Holograma';
import {Video04, DURACION_P04} from './porquepaso/p04/Video04';
import {Banner, Logo, MarcaAgua} from './porquepaso/canal/Marca';
import {MiniA, MiniB, MiniC, MiniH} from './porquepaso/canal/Miniaturas02';
import * as M01 from './porquepaso/canal/Miniaturas01';
import * as M34 from './porquepaso/canal/Miniaturas34';
import {PrototipoEstilo, DURACION_PROTO} from './mente/PrototipoEstilo';
import {DemoMaterial, DURACION_DEMO_MATERIAL} from './mente/DemoMaterial';
import {GaleriaPiezas, DURACION_GALERIA} from './mente/GaleriaPiezas';
import {Minuto01, DURACION_MINUTO01} from './mente/v01/Minuto01';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="MenteV01Minuto1" component={Minuto01} durationInFrames={DURACION_MINUTO01} fps={30} width={1920} height={1080} />
      <Composition id="MenteGaleria" component={GaleriaPiezas} durationInFrames={DURACION_GALERIA} fps={30} width={1920} height={1080} />
      <Composition id="MenteDemoMaterial" component={DemoMaterial} durationInFrames={DURACION_DEMO_MATERIAL} fps={30} width={1920} height={1080} />
      <Composition id="MenteProtoEstilo" component={PrototipoEstilo} durationInFrames={DURACION_PROTO} fps={30} width={1920} height={1080} />
      <Composition id="Ep01" component={Ep01} durationInFrames={DURACION} fps={FPS} width={1080} height={1920} defaultProps={{conAudio: true}} />
      <Still id="HojaPersonajes" component={HojaPersonajes} width={3000} height={2000} />
      <Composition id="P01" component={Piloto01} durationInFrames={DURACION_P01} fps={30} width={1080} height={1920} />
      <Composition id="P01Holograma" component={Holograma} durationInFrames={H_HOLO.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P01Gancho" component={Gancho} durationInFrames={DURACION_GANCHO} fps={30} width={1080} height={1920} />
      <Still id="CanalLogo" component={Logo} width={800} height={800} />
      <Still id="CanalBanner" component={Banner} width={2560} height={1440} />
      <Still id="P03MiniA" component={M34.M3A} width={1080} height={1920} />
      <Still id="P03MiniB" component={M34.M3B} width={1080} height={1920} />
      <Still id="P03MiniC" component={M34.M3C} width={1080} height={1920} />
      <Still id="P03MiniH" component={M34.M3H} width={1280} height={720} />
      <Still id="P04MiniA" component={M34.M4A} width={1080} height={1920} />
      <Still id="P04MiniB" component={M34.M4B} width={1080} height={1920} />
      <Still id="P04MiniC" component={M34.M4C} width={1080} height={1920} />
      <Still id="P04MiniH" component={M34.M4H} width={1280} height={720} />
      <Still id="P01MiniA" component={M01.MiniA} width={1080} height={1920} />
      <Still id="P01MiniB" component={M01.MiniB} width={1080} height={1920} />
      <Still id="P01MiniC" component={M01.MiniC} width={1080} height={1920} />
      <Still id="P01MiniH" component={M01.MiniH} width={1280} height={720} />
      <Still id="P02MiniA" component={MiniA} width={1080} height={1920} />
      <Still id="P02MiniB" component={MiniB} width={1080} height={1920} />
      <Still id="P02MiniC" component={MiniC} width={1080} height={1920} />
      <Still id="P02MiniH" component={MiniH} width={1280} height={720} />
      <Still id="CanalMarcaAgua" component={MarcaAgua} width={150} height={150} />
      <Composition id="P04" component={Video04} durationInFrames={DURACION_P04} fps={30} width={1080} height={1920} />
      <Composition id="P04Holograma" component={Holograma04} durationInFrames={H04.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P04Gancho" component={Gancho04} durationInFrames={DURACION_GANCHO_04} fps={30} width={1080} height={1920} />
      <Composition id="P03" component={Video03} durationInFrames={DURACION_P03} fps={30} width={1080} height={1920} />
      <Composition id="P03Holograma" component={Holograma03} durationInFrames={H03.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P03Gancho" component={Gancho03} durationInFrames={DURACION_GANCHO_03} fps={30} width={1080} height={1920} />
      <Composition id="P02" component={Video02} durationInFrames={DURACION_P02} fps={30} width={1080} height={1920} />
      <Composition id="P02Holograma" component={Holograma02} durationInFrames={H02.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P02Gancho" component={Gancho02} durationInFrames={DURACION_GANCHO_02} fps={30} width={1080} height={1920} />
    </>
  );
};
