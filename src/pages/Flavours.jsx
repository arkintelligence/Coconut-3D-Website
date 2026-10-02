import { useEffect, useRef } from 'react';
import FinalCTA from '../sections/FinalCTA';
import { FlavourCard } from '../sections/FlavourSection';
import { products } from '../data/products';
import usePageTitle from '../hooks/usePageTitle';
import './Flavours.css';

const nutritionRows = [
  ['Serving Size', '330 ml', '330 ml', '330 ml', '330 ml', '330 ml', '330 ml'],
  ['Calories', '45 Kcal', '50 Kcal', '48 Kcal', '47 Kcal', '46 Kcal', '52 Kcal'],
  ['Natural Sugar', '0g Added', '0g Added', '0g Added', '0g Added', '0g Added', '0g Added'],
  ['Potassium', '520 mg', '480 mg', '500 mg', '490 mg', '475 mg', '510 mg'],
  ['Sodium', '45 mg', '40 mg', '42 mg', '41 mg', '39 mg', '43 mg'],
  ['Magnesium', '24 mg', '22 mg', '25 mg', '23 mg', '21 mg', '26 mg'],
  ['Vitamin C', '100% DV', '120% DV', '110% DV', '140% DV', '115% DV', '125% DV'],
  ['Hydration Index', '99.8%', '98.5%', '99.2%', '98.9%', '98.7%', '99.0%'],
];

const nutritionHeadings = ['Natural Pure', 'Pineapple', 'Watermelon', 'Guava', 'Lychee', 'Mango'];

export default function Flavours() {
  usePageTitle('Our Flavours');
  const cardsRef = useRef(null);
  useEffect(() => {
    const cards = [...(cardsRef.current?.querySelectorAll('.flv__card') || [])];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
    }, { threshold: .16 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);
  return <>
    <main className="flavours-page">
      <header className="flavours-page__head"><p>Pure · Cold-Pressed · Organic Lineup</p><h1>Our Flavours</h1><span>Explore 100% pure organic coconut water infused with cold-extracted natural fruit essences. Zero added sugar, maximum natural electrolytes.</span></header>
      <section ref={cardsRef} className="flv__cards flavours-grid" aria-label="All flavours">
        {products.map((product, index) => <FlavourCard key={product.id} product={product} index={index} />)}
      </section>
      <section className="flavours-nutrition" aria-labelledby="nutrition-title">
        <div className="flavours-nutrition__inner">
          <h2 id="nutrition-title">Nutritional Facts</h2>
          <p>Compare essential electrolytes, calories, and natural fruit nutrients<br />across our 6 signature cans.</p>
          <div className="flavours-nutrition__scroll">
            <table>
              <thead><tr><th>Nutrient</th>{products.map((product, index) => <th key={product.id}>{nutritionHeadings[index]}</th>)}</tr></thead>
              <tbody>{nutritionRows.map(([label, ...values]) => <tr key={label}><th>{label}</th>{values.map((value, index) => <td key={`${label}-${products[index].id}`}>{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
    <FinalCTA />
  </>;
}
