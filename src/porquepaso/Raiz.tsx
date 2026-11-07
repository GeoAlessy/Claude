import React from 'react';
import {Composition, Still} from 'remotion';
import {Gancho, DURACION_GANCHO} from './p01/Gancho';
import {Holograma, H as H_HOLO} from './p01/Holograma';
import {Piloto01, DURACION_P01} from './p01/Piloto01';
import {Gancho as Gancho02, DURACION_GANCHO as DURACION_GANCHO_02} from './p02/Gancho';
import {Holograma as Holograma02, H as H02} from './p02/Holograma';
import {Video02, DURACION_P02} from './p02/Video02';
import {Gancho as Gancho03, DURACION_GANCHO as DURACION_GANCHO_03} from './p03/Gancho';
import {Holograma as Holograma03, H as H03} from './p03/Holograma';
import {Video03, DURACION_P03} from './p03/Video03';
import {Gancho as Gancho04, DURACION_GANCHO as DURACION_GANCHO_04} from './p04/Gancho';
import {Holograma as Holograma04, H as H04} from './p04/Holograma';
import {Video04, DURACION_P04} from './p04/Video04';
import {Gancho as Gancho05, DURACION_GANCHO as DURACION_GANCHO_05} from './p05/Gancho';
import {Holograma as Holograma05, H as H05} from './p05/Holograma';
import {Video05, DURACION_P05} from './p05/Video05';
import {Gancho as Gancho06, DURACION_GANCHO as DURACION_GANCHO_06} from './p06/Gancho';
import {Holograma as Holograma06, H as H06} from './p06/Holograma';
import {Video06, DURACION_P06} from './p06/Video06';
import {Gancho as Gancho07, DURACION_GANCHO as DURACION_GANCHO_07} from './p07/Gancho';
import {Holograma as Holograma07, H as H07} from './p07/Holograma';
import {Video07, DURACION_P07} from './p07/Video07';
import {Gancho as Gancho08, DURACION_GANCHO as DURACION_GANCHO_08} from './p08/Gancho';
import {Holograma as Holograma08, H as H08} from './p08/Holograma';
import {Video08, DURACION_P08} from './p08/Video08';
import {Gancho as Gancho09, DURACION_GANCHO as DURACION_GANCHO_09} from './p09/Gancho';
import {Holograma as Holograma09, H as H09} from './p09/Holograma';
import {Video09, DURACION_P09} from './p09/Video09';
import {Gancho as Gancho10, DURACION_GANCHO as DURACION_GANCHO_10} from './p10/Gancho';
import {Holograma as Holograma10, H as H10} from './p10/Holograma';
import {Video10, DURACION_P10} from './p10/Video10';
import {Gancho as Gancho11, DURACION_GANCHO as DURACION_GANCHO_11} from './p11/Gancho';
import {Holograma as Holograma11, H as H11} from './p11/Holograma';
import {Video11, DURACION_P11} from './p11/Video11';
import {Gancho as Gancho12, DURACION_GANCHO as DURACION_GANCHO_12} from './p12/Gancho';
import {Holograma as Holograma12, H as H12} from './p12/Holograma';
import {Video12, DURACION_P12} from './p12/Video12';
import {Gancho as Gancho13, DURACION_GANCHO as DURACION_GANCHO_13} from './p13/Gancho';
import {Holograma as Holograma13, H as H13} from './p13/Holograma';
import {Video13, DURACION_P13} from './p13/Video13';
import {Banner, Logo, MarcaAgua} from './canal/Marca';
import {MiniA, MiniB, MiniC, MiniH} from './canal/Miniaturas02';
import * as M01 from './canal/Miniaturas01';
import * as M34 from './canal/Miniaturas34';
import * as M56 from './canal/Miniaturas56';
import * as M7 from './canal/Miniaturas7';
import * as M8 from './canal/Miniaturas8';
import * as M9 from './canal/Miniaturas9';
import * as M10 from './canal/Miniaturas10';
import * as M11 from './canal/Miniaturas11';
import * as M12 from './canal/Miniaturas12';
import * as M13 from './canal/Miniaturas13';

// Raíz solo del canal ¿Por qué pasó? (sin los proyectos de otras sesiones, que pueden necesitar archivos locales).
export const RaizPorQuePaso: React.FC = () => {
  return (
    <>
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
      <Still id="P05MiniA" component={M56.M5A} width={1080} height={1920} />
      <Still id="P05MiniB" component={M56.M5B} width={1080} height={1920} />
      <Still id="P05MiniC" component={M56.M5C} width={1080} height={1920} />
      <Still id="P05MiniH" component={M56.M5H} width={1280} height={720} />
      <Still id="P06MiniA" component={M56.M6A} width={1080} height={1920} />
      <Still id="P06MiniB" component={M56.M6B} width={1080} height={1920} />
      <Still id="P06MiniC" component={M56.M6C} width={1080} height={1920} />
      <Still id="P06MiniH" component={M56.M6H} width={1280} height={720} />
      <Still id="P07MiniA" component={M7.M7A} width={1080} height={1920} />
      <Still id="P07MiniB" component={M7.M7B} width={1080} height={1920} />
      <Still id="P07MiniC" component={M7.M7C} width={1080} height={1920} />
      <Still id="P07MiniH" component={M7.M7H} width={1280} height={720} />
      <Still id="P08MiniA" component={M8.M8A} width={1080} height={1920} />
      <Still id="P08MiniB" component={M8.M8B} width={1080} height={1920} />
      <Still id="P08MiniC" component={M8.M8C} width={1080} height={1920} />
      <Still id="P08MiniH" component={M8.M8H} width={1280} height={720} />
      <Still id="P09MiniA" component={M9.M9A} width={1080} height={1920} />
      <Still id="P09MiniB" component={M9.M9B} width={1080} height={1920} />
      <Still id="P09MiniC" component={M9.M9C} width={1080} height={1920} />
      <Still id="P09MiniH" component={M9.M9H} width={1280} height={720} />
      <Still id="P10MiniA" component={M10.M10A} width={1080} height={1920} />
      <Still id="P10MiniB" component={M10.M10B} width={1080} height={1920} />
      <Still id="P10MiniC" component={M10.M10C} width={1080} height={1920} />
      <Still id="P10MiniH" component={M10.M10H} width={1280} height={720} />
      <Still id="P11MiniA" component={M11.M11A} width={1080} height={1920} />
      <Still id="P11MiniB" component={M11.M11B} width={1080} height={1920} />
      <Still id="P11MiniC" component={M11.M11C} width={1080} height={1920} />
      <Still id="P11MiniH" component={M11.M11H} width={1280} height={720} />
      <Still id="P12MiniA" component={M12.M12A} width={1080} height={1920} />
      <Still id="P12MiniB" component={M12.M12B} width={1080} height={1920} />
      <Still id="P12MiniC" component={M12.M12C} width={1080} height={1920} />
      <Still id="P12MiniH" component={M12.M12H} width={1280} height={720} />
      <Still id="P13MiniA" component={M13.M13A} width={1080} height={1920} />
      <Still id="P13MiniB" component={M13.M13B} width={1080} height={1920} />
      <Still id="P13MiniC" component={M13.M13C} width={1080} height={1920} />
      <Still id="P13MiniH" component={M13.M13H} width={1280} height={720} />
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
      <Composition id="P05" component={Video05} durationInFrames={DURACION_P05} fps={30} width={1080} height={1920} />
      <Composition id="P05Holograma" component={Holograma05} durationInFrames={H05.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P05Gancho" component={Gancho05} durationInFrames={DURACION_GANCHO_05} fps={30} width={1080} height={1920} />
      <Composition id="P06" component={Video06} durationInFrames={DURACION_P06} fps={30} width={1080} height={1920} />
      <Composition id="P06Holograma" component={Holograma06} durationInFrames={H06.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P06Gancho" component={Gancho06} durationInFrames={DURACION_GANCHO_06} fps={30} width={1080} height={1920} />
      <Composition id="P07" component={Video07} durationInFrames={DURACION_P07} fps={30} width={1080} height={1920} />
      <Composition id="P07Holograma" component={Holograma07} durationInFrames={H07.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P07Gancho" component={Gancho07} durationInFrames={DURACION_GANCHO_07} fps={30} width={1080} height={1920} />
      <Composition id="P08" component={Video08} durationInFrames={DURACION_P08} fps={30} width={1080} height={1920} />
      <Composition id="P08Holograma" component={Holograma08} durationInFrames={H08.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P08Gancho" component={Gancho08} durationInFrames={DURACION_GANCHO_08} fps={30} width={1080} height={1920} />
      <Composition id="P09" component={Video09} durationInFrames={DURACION_P09} fps={30} width={1080} height={1920} />
      <Composition id="P09Holograma" component={Holograma09} durationInFrames={H09.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P09Gancho" component={Gancho09} durationInFrames={DURACION_GANCHO_09} fps={30} width={1080} height={1920} />
      <Composition id="P10" component={Video10} durationInFrames={DURACION_P10} fps={30} width={1080} height={1920} />
      <Composition id="P10Holograma" component={Holograma10} durationInFrames={H10.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P10Gancho" component={Gancho10} durationInFrames={DURACION_GANCHO_10} fps={30} width={1080} height={1920} />
      <Composition id="P11" component={Video11} durationInFrames={DURACION_P11} fps={30} width={1080} height={1920} />
      <Composition id="P11Holograma" component={Holograma11} durationInFrames={H11.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P11Gancho" component={Gancho11} durationInFrames={DURACION_GANCHO_11} fps={30} width={1080} height={1920} />
      <Composition id="P12" component={Video12} durationInFrames={DURACION_P12} fps={30} width={1080} height={1920} />
      <Composition id="P12Holograma" component={Holograma12} durationInFrames={H12.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P12Gancho" component={Gancho12} durationInFrames={DURACION_GANCHO_12} fps={30} width={1080} height={1920} />
      <Composition id="P13" component={Video13} durationInFrames={DURACION_P13} fps={30} width={1080} height={1920} />
      <Composition id="P13Holograma" component={Holograma13} durationInFrames={H13.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P13Gancho" component={Gancho13} durationInFrames={DURACION_GANCHO_13} fps={30} width={1080} height={1920} />
      <Composition id="P03" component={Video03} durationInFrames={DURACION_P03} fps={30} width={1080} height={1920} />
      <Composition id="P03Holograma" component={Holograma03} durationInFrames={H03.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P03Gancho" component={Gancho03} durationInFrames={DURACION_GANCHO_03} fps={30} width={1080} height={1920} />
      <Composition id="P02" component={Video02} durationInFrames={DURACION_P02} fps={30} width={1080} height={1920} />
      <Composition id="P02Holograma" component={Holograma02} durationInFrames={H02.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P02Gancho" component={Gancho02} durationInFrames={DURACION_GANCHO_02} fps={30} width={1080} height={1920} />
    </>
  );
};
