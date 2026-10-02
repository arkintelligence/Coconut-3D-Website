import { lazy, Suspense, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import { LoadedContext } from './context/LoadedContext';

const Story = lazy(() => import('./pages/Story'));
const Flavours = lazy(() => import('./pages/Flavours'));
const Benefits = lazy(() => import('./pages/Benefits'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  return (
    <LoadedContext.Provider value={loaded}>
      {!loaderGone && <LoadingScreen onReveal={() => setLoaded(true)} onDone={() => setLoaderGone(true)} />}
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <Routes>
          <Route element={<Layout ready={loaded} />}>
            <Route index element={<Home />} />
            <Route path="story" element={<Story />} />
            <Route path="flavours" element={<Flavours />} />
            <Route path="benefits" element={<Benefits />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </LoadedContext.Provider>
  );
}
