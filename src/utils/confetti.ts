import confetti from 'canvas-confetti';

export const triggerRewardConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
};

export const triggerBadgeConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 0 };

  const fire = (particleRatio: number, opts: confetti.Options) => { confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio) });
  };

  fire(0.25, { spread: 26,
    startVelocity: 55 });

  fire(0.2, { spread: 60 });

  fire(0.35, { spread: 100,
    decay: 0.91,
    scalar: 0.8 });

  fire(0.1, { spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2 });

  fire(0.1, { spread: 120,
    startVelocity: 45 });
};

export const triggerLevelUpConfetti = () => {
  const duration = 5000;
  const animationEnd = Date.now() + duration;
  
  const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'];

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
      zIndex: 9999 });

    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
      zIndex: 9999 });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
  
  // Big burst in the center
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      zIndex: 9999 });
  }, 250);
};

// Gold confetti for TOP Premium subscription
export const triggerTopPremiumConfetti = () => {
  const duration = 4000;
  const animationEnd = Date.now() + duration;
  
  // Gold and premium colors
  const goldColors = ['#FFD700', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FFECB3'];

  // Initial burst
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.5 },
    colors: goldColors,
    zIndex: 9999,
    shapes: ['circle', 'square'],
    scalar: 1.2 });

  // Side cannons
  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 40,
      origin: { x: 0, y: 0.7 },
      colors: goldColors,
      zIndex: 9999,
      ticks: 200 });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 40,
      origin: { x: 1, y: 0.7 },
      colors: goldColors,
      zIndex: 9999,
      ticks: 200 });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();

  // Additional bursts
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.4, x: 0.3 },
      colors: goldColors,
      zIndex: 9999 });
  }, 500);

  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.4, x: 0.7 },
      colors: goldColors,
      zIndex: 9999 });
  }, 1000);
};
