import { useEffect, useState } from 'react';
import './SiteNotices.css';

export default function SiteNotices() {
  const [cookies, setCookies] = useState(true);
  const [gyro, setGyro] = useState(true);
  useEffect(() => {
    const onScroll = () => setGyro(window.scrollY < window.innerHeight * .65);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <>
      {gyro && <aside className="notice notice--gyro"><img src="/palm-mark.svg" alt="" /><strong>Gyro Sensor</strong><span>Use mobile to experience gyro tilt</span><button type="button" onClick={() => setGyro(false)} aria-label="Dismiss gyro notice">×</button></aside>}
      {cookies && <aside className="notice notice--cookie"><span>We use cookies to improve your experience.</span><button type="button" onClick={() => setCookies(false)}>Later</button><button type="button" onClick={() => setCookies(false)}>Okay!</button></aside>}
    </>
  );
}
