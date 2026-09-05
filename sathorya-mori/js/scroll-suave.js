/* Scroll suave — inercia (velocidade + atrito) no lugar do salto seco
   padrao da roda do mouse. So no desktop com mouse de verdade (roda de
   touchpad/celular ja rola suave por conta propria — nao mexe nisso) e
   fora de prefers-reduced-motion.

   Modelo de VELOCIDADE, nao de posicao-alvo com lerp: cada evento de
   roda soma direto na velocidade, que se aplica ja no proximo quadro e
   decai por atrito. Um modelo de lerp posicao-a-alvo (tentativa
   anterior) sempre tem uma rampa de saida lenta no primeiro quadro —
   a distancia inicial ate o alvo e pequena, entao o passo tambem e, o
   que lia como "travado" antes de "deslizar". Com velocidade, o
   primeiro quadro ja recebe o impulso inteiro do evento — sem espera. */
(function () {
  var podeHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!podeHover.matches || reduzido.matches) return;

  var GANHO = 0.378;     // fracao do deltaY que vira velocidade por evento
  var VELOCIDADE_MAX = 34;
  var ATRITO = 0.88;     // decaimento por quadro (menor = para mais rapido)
  var velocidade = 0;
  var quadro = null;

  function limiteMax() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  // behavior:'instant', NAO 'auto' — 'auto' delega pro scroll-behavior
  // do CSS (base.css tem scroll-behavior:smooth pros links com #ancora),
  // entao cada chamada tentava animar sozinha e a chamada seguinte
  // interrompia a anterior antes dela terminar: o scroll quase nao saia
  // do lugar. 'instant' ignora o CSS e salta na hora — o easing manual
  // (velocidade + atrito acima) que fica responsavel pela suavizacao.
  function passo() {
    var max = limiteMax();
    var pos = window.scrollY + velocidade;

    if (pos < 0) { pos = 0; velocidade = 0; }
    else if (pos > max) { pos = max; velocidade = 0; }

    window.scrollTo({ top: pos, left: 0, behavior: 'instant' });
    velocidade *= ATRITO;

    if (Math.abs(velocidade) < 0.4) {
      quadro = null;
      return;
    }
    quadro = requestAnimationFrame(passo);
  }

  function aoRolar(e) {
    e.preventDefault();
    velocidade += e.deltaY * GANHO;
    if (velocidade > VELOCIDADE_MAX) velocidade = VELOCIDADE_MAX;
    if (velocidade < -VELOCIDADE_MAX) velocidade = -VELOCIDADE_MAX;
    if (!quadro) quadro = requestAnimationFrame(passo);
  }

  window.addEventListener('wheel', aoRolar, { passive: false });
})();
