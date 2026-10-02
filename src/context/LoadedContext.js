import { createContext, useContext } from 'react';

/** true once the intro loader has finished — sections wait on it to start entrance animations. */
export const LoadedContext = createContext(false);
export const useLoaded = () => useContext(LoadedContext);
