import React from 'react';
import {Composition, Still} from 'remotion';
import {HojaPersonajes} from './sheets/HojaPersonajes';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Still id="HojaPersonajes" component={HojaPersonajes} width={3000} height={2000} />
    </>
  );
};
