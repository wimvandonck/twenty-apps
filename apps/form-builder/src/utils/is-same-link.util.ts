import { type FormLink } from 'src/types/form-link';

export const isSameLink = (a: FormLink, b: FormLink): boolean =>
  JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());
