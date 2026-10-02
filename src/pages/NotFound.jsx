import Button from '../components/Button';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Not found');
  return (
    <section style={{ minHeight: '90vh', display: 'grid', placeContent: 'center', justifyItems: 'center', gap: '1.6rem', textAlign: 'center', padding: '8rem 1rem 4rem', background: 'var(--cream)', color: 'var(--palm)' }}>
      <h1 className="display" style={{ fontSize: 'clamp(5rem, 20vw, 16rem)' }}>404</h1>
      <p className="serif" style={{ fontSize: '1.6rem' }}>This page fell off the palm.</p>
      <Button to="/">Back home</Button>
    </section>
  );
}
