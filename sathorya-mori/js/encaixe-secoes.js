/* Encaixe suave de secao — so no desktop com mouse/touchpad de verdade
   (celular ja rola suave por conta propria) e fora de
   prefers-reduced-motion.

   Diferenca do scroll-snap nativo do CSS: aquele decide sozinho, a cada
   evento de rolagem, se encaixa — o que lia como um "pulo" mecanico no
   meio do gesto da pessoa. Aqui a rolagem fica 100% livre e nativa
   enquanto a pessoa rola; so DEPOIS que ela para (PARADA ms sem evento
   de roda) e so SE ja estiver perto o bastante de uma secao (LIMIAR) e
   que um empurrãozinho, animado devagar (DURACAO, com easing), termina
   o alinhamento. Longe de uma secao, ou ainda rolando, nada acontece. */
(function () {
  var podeHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!podeHover.matches || reduzido.matches) return;

  var LIMIAR = 0.28;   // fracao da altura da janela: so encaixa se estiver mais perto que isso
  var DURACAO = 700;   // ms da animacao de encaixe — quanto maior, mais "organico"
  var PARADA = 150;    // ms sem evento de roda pra considerar que a pessoa parou

  var secoes = Array.prototype.slice.call(document.querySelectorAll('.hero, .secao'));
  var timerParada = null;
  var quadro = null;

  function maisProxima() {
    var y = window.scrollY;
    var alvo = null;
    var menorDist = Infinity;
    secoes.forEach(function (el) {
      var dist = Math.abs(el.offsetTop - y);
      if (dist < menorDist) { menorDist = dist; alvo = el; }
    });
    return { alvo: alvo, dist: menorDist };
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animarPara(destino) {
    var inicio = window.scrollY;
    var distancia = destino - inicio;
    if (Math.abs(distancia) < 1) return;
    var t0 = performance.now();

    function passo(agora) {
      var t = Math.min(1, (agora - t0) / DURACAO);
      window.scrollTo(0, inicio + distancia * easeOutCubic(t));
      quadro = t < 1 ? requestAnimationFrame(passo) : null;
    }
    if (quadro) cancelAnimationFrame(quadro);
    quadro = requestAnimationFrame(passo);
  }

  function aoParar() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY <= 0 || window.scrollY >= max) return; // extremos da pagina: nao mexe
    var proxima = maisProxima();
    if (proxima.alvo && proxima.dist < window.innerHeight * LIMIAR) {
      animarPara(proxima.alvo.offsetTop);
    }
  }

  // So 'wheel' (nao 'scroll'): a propria animacao chama scrollTo, que
  // dispara 'scroll' — se escutassemos 'scroll' aqui, a animacao
  // cancelaria a si mesma a cada quadro.
  function aoRolar() {
    if (quadro) { cancelAnimationFrame(quadro); quadro = null; }
    clearTimeout(timerParada);
    timerParada = setTimeout(aoParar, PARADA);
  }

  window.addEventListener('wheel', aoRolar, { passive: true });
})();
