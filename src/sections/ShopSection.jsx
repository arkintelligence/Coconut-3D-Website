import { Lines, Reveal } from '../components/Reveal';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { featuredIds, getProduct } from '../data/products';
import './ShopSection.css';

export default function ShopSection() {
  const list = featuredIds.map(getProduct);
  return (
    <section className="shop" aria-labelledby="shop-title">
      <div className="wrap shop__head">
        <div>
          <Reveal as="p" className="eyebrow">04 — Stock the fridge</Reveal>
          <Lines as="h2" id="shop-title" className="shop__title display" lines={['Pick your', <em key="e" className="serif-it">pour.</em>]} />
        </div>
        <Reveal className="shop__aside">
          <p>Singles for a moment, sixes for the week, twelves if you’ve already decided. Free shipping over $40.</p>
          <Button to="/flavours" variant="ghost">All six flavours</Button>
        </Reveal>
      </div>
      <div className="shop__row">
        {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} layout="panel" />)}
      </div>
    </section>
  );
}
