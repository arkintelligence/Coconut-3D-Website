/**
 * Central asset registry. Components never import image files directly —
 * they read from here. To swap in real photography, drop files into the
 * matching folder and change the import paths below (keep the same keys).
 * Each raster scene ships a large (1600w) and small (800w) version for srcSet.
 */
import harvest from './story/harvest.webp';
import harvestSm from './story/harvest-sm.webp';
import cluster from './story/cluster.webp';
import clusterSm from './story/cluster-sm.webp';
import canopy from './story/canopy.webp';
import canopySm from './story/canopy-sm.webp';
import craft from './story/craft.webp';
import craftSm from './story/craft-sm.webp';
import grove from './story/grove.webp';
import groveSm from './story/grove-sm.webp';
import hold from './story/hold.webp';
import holdSm from './story/hold-sm.webp';

import husk from './textures/husk.webp';
import huskSm from './textures/husk-sm.webp';
import water from './textures/water.webp';
import waterSm from './textures/water-sm.webp';
import leaves from './textures/leaves.webp';
import leavesSm from './textures/leaves-sm.webp';

import coconutWhole from './coconuts/whole.svg';
import coconutHalf from './coconuts/half.svg';
import coconutBrown from './coconuts/brown.svg';

import pineapple from './fruits/pineapple.svg';
import watermelon from './fruits/watermelon.svg';
import mango from './fruits/mango.svg';
import guava from './fruits/guava.svg';
import lychee from './fruits/lychee.svg';
import coconutFruit from './fruits/coconut.svg';

import logoMark from './logo/palmo-mark.svg';

const scene = (lg, sm) => ({ src: lg, srcSet: `${sm} 800w, ${lg} 1600w`, width: 1600, height: 1100 });

export const images = {
  story: {
    harvest: scene(harvest, harvestSm),
    cluster: scene(cluster, clusterSm),
    canopy: scene(canopy, canopySm),
    craft: scene(craft, craftSm),
    grove: scene(grove, groveSm),
    hold: scene(hold, holdSm),
  },
  textures: {
    husk: scene(husk, huskSm),
    water: scene(water, waterSm),
    leaves: scene(leaves, leavesSm),
  },
  coconuts: {
    whole: { src: coconutWhole, width: 800, height: 800 },
    half: { src: coconutHalf, width: 800, height: 760 },
    brown: { src: coconutBrown, width: 800, height: 800 },
  },
  fruits: { pineapple, watermelon, mango, guava, lychee, coconut: coconutFruit },
  logo: { mark: logoMark },
};
