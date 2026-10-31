// EPISODIO 1 — "En este mundo, cada 'ya voy' te quita un año de vida"
// Tiempos en frames a 30 fps. La voz real se graba aparte y se monta encima.

export type Personaje = 'NARRADOR' | 'MAMÁ' | 'CHATO' | 'AMIGO' | 'JEFE' | 'CHICA';

export type Linea = {
  id: number;
  quien: Personaje;
  texto: string;
  desde: number; // frame de inicio
  hasta: number; // frame de fin
  emocion: string;
  velocidad: string;
};

export const GUION: Linea[] = [
  {id: 1, quien: 'NARRADOR', texto: "En este mundo, cada 'ya voy' te quita un año de vida.", desde: 4, hasta: 74, emocion: 'Misterioso, de tráiler, con media sonrisa', velocidad: 'Rápida'},
  {id: 2, quien: 'MAMÁ', texto: '¡Chato, a almorzar!', desde: 82, hasta: 140, emocion: 'Grito cariñoso desde la cocina', velocidad: 'Normal'},
  {id: 3, quien: 'CHATO', texto: '¡Ya voy!', desde: 158, hasta: 195, emocion: 'Flojo, sin despegar la vista del celular', velocidad: 'Normal'},
  {id: 4, quien: 'MAMÁ', texto: '¡Se enfría!', desde: 220, hasta: 275, emocion: 'Impaciente, golpeando la olla', velocidad: 'Rápida'},
  {id: 5, quien: 'CHATO', texto: '¡Ya voooy!', desde: 289, hasta: 326, emocion: 'Fastidiado, estirando la "o"', velocidad: 'Lenta en la "o"'},
  {id: 6, quien: 'NARRADOR', texto: 'El Chato tenía diecinueve años.', desde: 336, hasta: 388, emocion: 'Serio, de documental', velocidad: 'Normal'},
  {id: 7, quien: 'AMIGO', texto: '¿Vienes al partido?', desde: 392, hasta: 414, emocion: 'Animado', velocidad: 'Rápida'},
  {id: 8, quien: 'CHATO', texto: 'Ya voy.', desde: 415, hasta: 440, emocion: 'Distraído', velocidad: 'Rápida'},
  {id: 9, quien: 'JEFE', texto: '¿Y el informe?', desde: 444, hasta: 466, emocion: 'Impaciente', velocidad: 'Rápida'},
  {id: 10, quien: 'CHATO', texto: 'Ya voy.', desde: 467, hasta: 492, emocion: 'Distraído', velocidad: 'Rápida'},
  {id: 11, quien: 'CHICA', texto: '¿Vamos al cine?', desde: 496, hasta: 518, emocion: 'Ilusionada', velocidad: 'Rápida'},
  {id: 12, quien: 'CHATO', texto: 'Ya voy.', desde: 519, hasta: 544, emocion: 'Distraído (voz ya más madura)', velocidad: 'Rápida'},
  {id: 13, quien: 'MAMÁ', texto: '¡Chato!', desde: 548, hasta: 566, emocion: 'Grito corto', velocidad: 'Rápida'},
  {id: 14, quien: 'CHATO', texto: 'Ya voooy…', desde: 568, hasta: 598, emocion: 'Cansado, voz de señor', velocidad: 'Lenta'},
  {id: 15, quien: 'NARRADOR', texto: '…Y así se le fue la vida.', desde: 612, hasta: 700, emocion: 'Dramático, exagerado', velocidad: 'Lenta'},
  {id: 16, quien: 'CHATO', texto: 'Ya… ya fui.', desde: 790, hasta: 838, emocion: 'Anciano, emocionado, voz temblorosa', velocidad: 'Muy lenta'},
  {id: 17, quien: 'NARRADOR', texto: 'Pero en este mundo hay algo que nadie sabe…', desde: 846, hasta: 985, emocion: 'Misterio, en voz baja', velocidad: 'Lenta'},
  {id: 18, quien: 'NARRADOR', texto: "Las mamás nunca dicen 'ya voy'… por eso no envejecen.", desde: 992, hasta: 1076, emocion: 'Revelación, cómplice', velocidad: 'Normal'},
];
