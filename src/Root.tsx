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
import {Gancho as Gancho05, DURACION_GANCHO as DURACION_GANCHO_05} from './porquepaso/p05/Gancho';
import {Holograma as Holograma05, H as H05} from './porquepaso/p05/Holograma';
import {Video05, DURACION_P05} from './porquepaso/p05/Video05';
import {Gancho as Gancho06, DURACION_GANCHO as DURACION_GANCHO_06} from './porquepaso/p06/Gancho';
import {Holograma as Holograma06, H as H06} from './porquepaso/p06/Holograma';
import {Video06, DURACION_P06} from './porquepaso/p06/Video06';
import {Gancho as Gancho07, DURACION_GANCHO as DURACION_GANCHO_07} from './porquepaso/p07/Gancho';
import {Holograma as Holograma07, H as H07} from './porquepaso/p07/Holograma';
import {Video07, DURACION_P07} from './porquepaso/p07/Video07';
import {Gancho as Gancho08, DURACION_GANCHO as DURACION_GANCHO_08} from './porquepaso/p08/Gancho';
import {Holograma as Holograma08, H as H08} from './porquepaso/p08/Holograma';
import {Video08, DURACION_P08} from './porquepaso/p08/Video08';
import {Gancho as Gancho09, DURACION_GANCHO as DURACION_GANCHO_09} from './porquepaso/p09/Gancho';
import {Holograma as Holograma09, H as H09} from './porquepaso/p09/Holograma';
import {Video09, DURACION_P09} from './porquepaso/p09/Video09';
import {Gancho as Gancho10, DURACION_GANCHO as DURACION_GANCHO_10} from './porquepaso/p10/Gancho';
import {Holograma as Holograma10, H as H10} from './porquepaso/p10/Holograma';
import {Video10, DURACION_P10} from './porquepaso/p10/Video10';
import {Gancho as Gancho11, DURACION_GANCHO as DURACION_GANCHO_11} from './porquepaso/p11/Gancho';
import {Holograma as Holograma11, H as H11} from './porquepaso/p11/Holograma';
import {Video11, DURACION_P11} from './porquepaso/p11/Video11';
import {Banner, Logo, MarcaAgua} from './porquepaso/canal/Marca';
import {MiniA, MiniB, MiniC, MiniH} from './porquepaso/canal/Miniaturas02';
import * as M01 from './porquepaso/canal/Miniaturas01';
import * as M34 from './porquepaso/canal/Miniaturas34';
import {Survive01, DURACION_S01} from './survive/s01/Survive01';
import {Survive01v2, DURACION_S01V2} from './survive/s01/Survive01v2';
import * as OP from './survive/opciones';
import {DemoGolpes, DUR_DEMO} from './survive/demoGolpes';
import {DemoMedidores, DUR_MEDIDORES, DemoDano, DUR_DANO} from './survive/opciones2';
import {DemoBarras3, DUR_BARRAS3} from './survive/opciones3';
import {DemoBarras4, DUR_BARRAS4} from './survive/opciones4';
import * as OP5 from './survive/opciones5';
import * as OP6 from './survive/opciones6';
import * as OP7 from './survive/opciones7';
import * as OP8 from './survive/opciones8';
import {DemoRosquillas, DUR_DEMO_ROSQ} from './survive/rosquillas';
import * as M56 from './porquepaso/canal/Miniaturas56';
import * as M7 from './porquepaso/canal/Miniaturas7';
import * as M8 from './porquepaso/canal/Miniaturas8';
import * as M9 from './porquepaso/canal/Miniaturas9';
import * as M10 from './porquepaso/canal/Miniaturas10';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((n) => (
        <React.Fragment key={n}>
          <Still id={`OpMedidor${n}`} component={(OP as any)[`Medidor${n}`]} width={1080} height={1920} />
          <Still id={`OpDano${n}`} component={(OP as any)[`Dano${n}`]} width={1080} height={1920} />
        </React.Fragment>
      ))}
      {['BS1', 'BS2', 'BS3', 'BS4', 'BS5', 'BG1', 'BG2', 'BG3', 'BG4', 'BG5'].map((id) => (
        <Still key={id} id={`Op${id}`} component={(OP5 as any)[id]} width={1080} height={1920} />
      ))}
      <Still id="HojaVeredictos" component={OP8.HojaVeredictos} width={2160} height={2400} />
      <Still id="HojaReglasA" component={OP7.HojaReglasA} width={2160} height={1536} />
      <Still id="HojaReglasB" component={OP7.HojaReglasB} width={2160} height={1536} />
      <Still id="HojaEtiquetas" component={OP7.HojaEtiquetas} width={2160} height={2100} />
      <Still id="HojaAlarmas" component={OP6.HojaAlarmas} width={1600} height={1920} />
      {OP6.AlarmaVista.map((C, i) => (
        <Still key={`v${i}`} id={`OpAlarma${i + 1}`} component={C} width={1080} height={1920} />
      ))}
      {OP6.AlarmaAnim.map((C, i) => (
        <Composition key={`a${i}`} id={`AnimAlarma${i + 1}`} component={C} durationInFrames={56} fps={30} width={1080} height={1920} />
      ))}
      <Composition id="DemoRosquillas" component={DemoRosquillas} durationInFrames={DUR_DEMO_ROSQ} fps={30} width={1080} height={1920} />
      <Composition id="DemoBarras4" component={DemoBarras4} durationInFrames={DUR_BARRAS4} fps={30} width={1080} height={1920} />
      <Composition id="DemoBarras3" component={DemoBarras3} durationInFrames={DUR_BARRAS3} fps={30} width={1080} height={1920} />
      <Composition id="DemoMedidores" component={DemoMedidores} durationInFrames={DUR_MEDIDORES} fps={30} width={1080} height={1920} />
      <Composition id="DemoDano" component={DemoDano} durationInFrames={DUR_DANO} fps={30} width={1080} height={1920} />
      <Composition id="DemoGolpes" component={DemoGolpes} durationInFrames={DUR_DEMO} fps={30} width={1080} height={1920} />
      <Composition id="S01v2" component={Survive01v2} durationInFrames={DURACION_S01V2} fps={30} width={1080} height={1920} />
      <Composition id="S01" component={Survive01} durationInFrames={DURACION_S01} fps={30} width={1080} height={1920} />
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
      <Composition id="P03" component={Video03} durationInFrames={DURACION_P03} fps={30} width={1080} height={1920} />
      <Composition id="P03Holograma" component={Holograma03} durationInFrames={H03.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P03Gancho" component={Gancho03} durationInFrames={DURACION_GANCHO_03} fps={30} width={1080} height={1920} />
      <Composition id="P02" component={Video02} durationInFrames={DURACION_P02} fps={30} width={1080} height={1920} />
      <Composition id="P02Holograma" component={Holograma02} durationInFrames={H02.DUR} fps={30} width={1080} height={1920} />
      <Composition id="P02Gancho" component={Gancho02} durationInFrames={DURACION_GANCHO_02} fps={30} width={1080} height={1920} />
    </>
  );
};
