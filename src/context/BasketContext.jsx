import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { getPack, getProduct } from '../data/products';
import { site } from '../data/site';

const BasketContext = createContext(null);
const STORAGE_KEY = 'palmo.basket.v1';

const lineId = (productId, packId) => `${productId}__${packId}`;

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const id = lineId(action.productId, action.packId);
      const existing = state.find((l) => l.id === id);
      if (existing) return state.map((l) => (l.id === id ? { ...l, qty: l.qty + (action.qty || 1) } : l));
      return [...state, { id, productId: action.productId, packId: action.packId, qty: action.qty || 1 }];
    }
    case 'qty':
      return state
        .map((l) => (l.id === action.id ? { ...l, qty: Math.max(0, action.qty) } : l))
        .filter((l) => l.qty > 0);
    case 'remove':
      return state.filter((l) => l.id !== action.id);
    case 'pack': {
      const line = state.find((l) => l.id === action.id);
      if (!line || line.packId === action.packId) return state;
      const newId = lineId(line.productId, action.packId);
      const merged = state.find((l) => l.id === newId);
      const rest = state.filter((l) => l.id !== action.id && l.id !== newId);
      const qty = line.qty + (merged ? merged.qty : 0);
      const idx = state.findIndex((l) => l.id === action.id);
      rest.splice(Math.min(idx, rest.length), 0, { ...line, id: newId, packId: action.packId, qty });
      return rest;
    }
    case 'empty':
      return [];
    default:
      return state;
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => getProduct(l.productId) && getPack(l.packId)) : [];
  } catch {
    return [];
  }
}

export function BasketProvider({ children }) {
  const [lines, dispatch] = useReducer(reducer, undefined, load);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0); // increments on every add — drives the badge bump

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* storage unavailable */ }
  }, [lines]);

  const add = useCallback((productId, packId, qty = 1) => {
    dispatch({ type: 'add', productId, packId, qty });
    setPulse((p) => p + 1);
  }, []);
  const setQty = useCallback((id, qty) => dispatch({ type: 'qty', id, qty }), []);
  const remove = useCallback((id) => dispatch({ type: 'remove', id }), []);
  const changePack = useCallback((id, packId) => dispatch({ type: 'pack', id, packId }), []);
  const empty = useCallback(() => dispatch({ type: 'empty' }), []);

  const value = useMemo(() => {
    const detailed = lines.map((l) => {
      const product = getProduct(l.productId);
      const pack = getPack(l.packId);
      return { ...l, product, pack, lineTotal: pack.price * l.qty };
    });
    const subtotal = detailed.reduce((s, l) => s + l.lineTotal, 0);
    const count = detailed.reduce((s, l) => s + l.qty, 0);
    const freeShip = subtotal >= site.freeShippingThreshold;
    const shipping = subtotal === 0 || freeShip ? 0 : site.shippingFee;
    return {
      lines: detailed, count, subtotal, shipping, total: subtotal + shipping,
      toFree: Math.max(0, site.freeShippingThreshold - subtotal),
      freeProgress: Math.min(1, subtotal / site.freeShippingThreshold),
      open, setOpen, pulse, add, setQty, remove, changePack, empty,
    };
  }, [lines, open, pulse, add, setQty, remove, changePack, empty]);

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used inside BasketProvider');
  return ctx;
}

export const money = (n) => `$${n.toFixed(2)}`;
