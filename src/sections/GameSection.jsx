import FruitGame from '../components/FruitGame';
import { Reveal } from '../components/Reveal';
import './GameSection.css';

export default function GameSection() {
  return (
    <section className="gsec" aria-labelledby="gsec-title">
      <div className="wrap">
        <div className="gsec__head">
          <Reveal as="p" className="eyebrow">07 — Take a break</Reveal>
          <Reveal as="h2" id="gsec-title" className="gsec__title serif">Before you go, <em className="serif-it">slice a few.</em></Reveal>
        </div>
        <FruitGame />
      </div>
    </section>
  );
}
