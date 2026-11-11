import { type FormField } from 'src/types/form-field';

export const isPageBreak = (field: Pick<FormField, 'type'>): boolean => field.type === 'PAGE_BREAK';
