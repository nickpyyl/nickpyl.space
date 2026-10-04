// Integrate a damped angular velocity in seconds, independently of frame rate.
export function advanceSpin(velocity, target, seconds, damping = 1.65) {
  const decay = Math.exp(-damping * seconds);
  return {
    velocity: target + (velocity - target) * decay,
    angle: target * seconds + (velocity - target) * (1 - decay) / damping,
  };
}
