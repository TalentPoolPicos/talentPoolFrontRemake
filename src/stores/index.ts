import { createPinia } from 'pinia';
import persisted from 'pinia-plugin-persistedstate';

export const pinia = createPinia().use(persisted);
