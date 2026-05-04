import { defineComponent } from "trrn-h";
import { createStore } from "zustand/vanilla";

interface CounterStore {
  count: number;
  inc: () => void;
}

const store = createStore<CounterStore>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

export const ZustandCounter = defineComponent((_, { update, onUnmount }) => {
  const unsub = store.subscribe(() => update());

  onUnmount(() => unsub());

  return () => (
    <div>
      <span>{store.getState().count}</span>
      <button onClick={() => store.getState().inc()}>+</button>
    </div>
  );
});
