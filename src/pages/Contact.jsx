import { useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../data/site';
import { images } from '../assets';
import usePageTitle from '../hooks/usePageTitle';
import { useLoaded } from '../context/LoadedContext';
import './Contact.css';

const topics = ['Say hello', 'Wholesale', 'Press', 'Something else'];

export default function Contact() {
  usePageTitle('Contact');
  const loaded = useLoaded();
  const [form, setForm] = useState({ name: '', email: '', topic: topics[0], message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Tell us what to call you.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'That email doesn’t look quite right.';
    if (form.message.trim().length < 10) e.message = 'A few more words, please (10+ characters).';
    return e;
  };
  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`c-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setSent(true); // prototype: nothing is sent anywhere
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(site.email); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { window.location.href = `mailto:${site.email}`; }
  };

  return (
    <main className={`contact ${loaded ? 'is-in' : ''}`} aria-labelledby="contact-title">
      <section>
      <div className="wrap contact__grid">
        <div className="contact__left">
          <p className="eyebrow">Contact</p>
          <h1 id="contact-title" className="contact__title display">
            <span className="line-mask"><span>Say</span></span>
            <span className="line-mask"><span><em className="serif-it">hello.</em></span></span>
          </h1>
          <p className="lead contact__lead">Questions, stockist enquiries, or just a good coconut story — the inbox is always open.</p>
          <div className="contact__mail">
            <a href={`mailto:${site.email}`} className="serif">{site.email}</a>
            <button type="button" onClick={copy} aria-live="polite">{copied ? 'Copied ✓' : 'Copy'}</button>
          </div>
          <dl className="contact__info">
            <div><dt>Grove office</dt><dd>{site.address}</dd></div>
            <div><dt>Hours</dt><dd>Mon–Fri, sunrise to sunset (IST)</dd></div>
          </dl>
          <div className="contact__img" aria-hidden="true">
            <img src={images.story.craft.src} srcSet={images.story.craft.srcSet} sizes="40vw" alt="" className="cover" loading="lazy" />
          </div>
        </div>

        <div className="contact__right">
          {sent ? (
            <div className="contact__done" role="status">
              <p className="display">Poured.</p>
              <p className="serif">Thanks, {form.name.split(' ')[0]}. We’ll write back within two working days.</p>
              <p className="contact__proto">Prototype — this form doesn’t send anything yet.</p>
              <div className="contact__done-actions">
                <button type="button" onClick={() => { setSent(false); setForm({ name: '', email: '', topic: topics[0], message: '' }); }}>Send another</button>
                <Link to="/">Back to home →</Link>
              </div>
            </div>
          ) : (
            <form className="cform" onSubmit={submit} noValidate>
              <fieldset className="cform__topics">
                <legend>What’s it about?</legend>
                {topics.map((t) => (
                  <label key={t} className={form.topic === t ? 'is-on' : ''}>
                    <input type="radio" name="topic" value={t} checked={form.topic === t} onChange={set('topic')} className="sr-only" />
                    {t}
                  </label>
                ))}
              </fieldset>
              {[
                { k: 'name', label: 'Your name', type: 'text', auto: 'name' },
                { k: 'email', label: 'Email address', type: 'email', auto: 'email' },
              ].map((f) => (
                <div key={f.k} className={`cform__field ${errors[f.k] ? 'has-err' : ''}`}>
                  <label htmlFor={`c-${f.k}`}>{f.label}</label>
                  <input id={`c-${f.k}`} type={f.type} autoComplete={f.auto} value={form[f.k]} onChange={set(f.k)} aria-invalid={!!errors[f.k]} aria-describedby={errors[f.k] ? `c-${f.k}-err` : undefined} />
                  {errors[f.k] && <p id={`c-${f.k}-err`} className="cform__err">{errors[f.k]}</p>}
                </div>
              ))}
              <div className={`cform__field ${errors.message ? 'has-err' : ''}`}>
                <label htmlFor="c-message">Message</label>
                <textarea id="c-message" rows={5} value={form.message} onChange={set('message')} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'c-message-err' : undefined} />
                {errors.message && <p id="c-message-err" className="cform__err">{errors.message}</p>}
              </div>
              <button type="submit" className="cform__send">Send message <span aria-hidden="true">→</span></button>
            </form>
          )}
        </div>
      </div>
      </section>
      <section className="contact-orbit" aria-label="How we can help">
        <div className="contact-orbit__track" aria-hidden="true">
          <span>Wholesale · Stockists · Press · Collaborations · Coconut stories · </span>
          <span>Wholesale · Stockists · Press · Collaborations · Coconut stories · </span>
        </div>
        <div className="contact-orbit__cards wrap">
          <article><span>01</span><h2>Quick replies.</h2><p>We answer every thoughtful note within two working days.</p></article>
          <article><span>02</span><h2>Real people.</h2><p>Your message lands with our small Palmo team—not a support maze.</p></article>
          <article><span>03</span><h2>Sunny ideas.</h2><p>Stockist pitches, press requests and collaborations are always welcome.</p></article>
        </div>
      </section>
    </main>
  );
}
