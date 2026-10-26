import gsap from 'gsap';
export function playBirthRitual(
  target: HTMLElement | null,
  calm = false,
  skip = false,
) {
  if (!target) return gsap.timeline();
  const timeline = gsap.timeline();
  timeline.fromTo(
    target,
    { opacity: 0, scale: 0.86, y: 24 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: calm || skip ? 0.5 : 1.8,
      ease: 'power2.out',
    },
  );
  return timeline;
}
