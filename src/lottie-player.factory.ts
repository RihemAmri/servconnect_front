
import player from 'lottie-web';
import type { LottiePlayer } from 'lottie-web';

// On va patcher le loader de Lottie pour forcer responseType = 'json'
const originalLoadAnimation = player.loadAnimation;

player.loadAnimation = function (params: any) {
  // Si c'est un chemin (string), on le transforme en objet avec xhr personnalisé
  if (typeof params === 'string') {
    params = { path: params };
  }

  // Forcer le responseType à 'json' pour les requêtes XHR
  if (params && !params.rendererSettings) {
    params.rendererSettings = {};
  }
  if (params.rendererSettings) {
    params.rendererSettings = {
      ...params.rendererSettings,
      // Cette propriété interne force lottie-web à utiliser responseType = 'json'
      xhr: { responseType: 'json' }
    };
  }

  return originalLoadAnimation.call(this, params);
};

export function lottiePlayerFactory(): LottiePlayer {
  return player;
}