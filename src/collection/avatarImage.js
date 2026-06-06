// Rasteriza o Avatar (SVG React) para um HTMLImageElement, pra desenhar no canvas.
// Reaproveita o componente Avatar via renderToStaticMarkup. Cacheado por nome.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Avatar from './avatar.jsx';

const cache = new Map();

export function getAvatarImage(player) {
  if (!player) return null;
  if (cache.has(player.name)) return cache.get(player.name);
  const svg = renderToStaticMarkup(createElement(Avatar, { player, size: 100 }));
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const img = new Image();
  const rec = { img, ready: false };
  img.onload = () => {
    rec.ready = true;
  };
  img.src = url;
  cache.set(player.name, rec);
  return rec;
}
