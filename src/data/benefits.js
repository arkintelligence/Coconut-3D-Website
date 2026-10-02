import { images } from '../assets';

export const benefits = [
  { id: 'electrolytes', kicker: 'Electrolytes', title: 'Nature’s own sports drink.', body: 'Coconut water carries potassium, magnesium and sodium in the balance your body already uses — so you replace what you sweat out, without the neon.', stat: '500', unit: 'mg potassium', image: images.coconuts.half },
  { id: 'hydration', kicker: 'Hydration', title: 'Water, with a head start.', body: 'Naturally isotonic and gentle on the stomach, it rehydrates fast and goes down easier than a bottle of plain water ever will.', stat: '9.8', unit: 'hydration index', image: images.textures.water },
  { id: 'natural', kicker: '100% Natural', title: 'One ingredient you can pronounce.', body: 'Our Natural Pure is exactly one thing: coconut water. The flavours add real pressed fruit, and that is where the list ends.', stat: '1', unit: 'ingredient', image: images.coconuts.whole },
  { id: 'sugar', kicker: 'Zero added sugar', title: 'Sweet because it grew that way.', body: 'Any sweetness comes from the coconut and the fruit. Nothing is added, so a can stays around 45 kcal.', stat: '0', unit: 'g added sugar', image: images.textures.husk },
  { id: 'fresh', kicker: 'Freshness', title: 'Within a day of the palm.', body: 'Coconuts are opened and pressed within 24 hours of harvest and cold-filtered — never boiled down, never reconstituted.', stat: '24', unit: 'hours palm to can', image: images.story.grove },
  { id: 'everyday', kicker: 'Everyday', title: 'For the ordinary hours too.', body: 'Not a recovery product, not a treat. A clean, cold can that fits a desk, a gym bag or a picnic equally well.', stat: '330', unit: 'ml, one easy can', image: images.story.craft },
];

export const ritual = [
  { time: '07:00', title: 'Wake up', body: 'Before coffee. Replace what the night took.' },
  { time: '11:30', title: 'Desk slump', body: 'A cold can instead of a third espresso.' },
  { time: '18:00', title: 'After a run', body: 'Electrolytes back where they belong.' },
  { time: '21:00', title: 'Wind down', body: 'Light, low-calorie, nothing keeping you up.' },
];
