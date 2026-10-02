import { Lines, Reveal } from '../components/Reveal';
import Testimonials from '../components/Testimonials';
import { testimonials } from '../data/testimonials';
import './TestimonialsSection.css';

export default function TestimonialsSection() {
  return (
    <section className="tsec" aria-labelledby="tsec-title">
      <div className="wrap tsec__head">
        <Lines as="h2" id="tsec-title" className="tsec__title" lines={['Sippers Say !']} />
      </div>
      <Testimonials items={testimonials} />
    </section>
  );
}
