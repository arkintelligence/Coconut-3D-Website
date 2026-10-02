import { useEffect } from 'react';
export default function usePageTitle(title) {
  useEffect(() => { document.title = `Palmo — ${title}`; }, [title]);
}
