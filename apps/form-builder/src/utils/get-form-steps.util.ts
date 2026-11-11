import { type FormDefinition } from 'src/types/form-definition';
import { type FormStep } from 'src/types/form-step';
import { isPageBreak } from 'src/utils/is-page-break.util';

// Splits the visible fields into the steps of the public form. A page break
// starts a new step and gives it its title; breaks that would leave a step
// without fields are ignored. A form without breaks has one step.
export const getFormSteps = (definition: Pick<FormDefinition, 'records'>): FormStep[] => {
  const steps: FormStep[] = [{ title: '', sections: [] }];

  for (const record of definition.records) {
    for (const field of record.fields) {
      const step = steps[steps.length - 1];

      if (isPageBreak(field)) {
        if (step.sections.length > 0) {
          steps.push({ title: field.label, sections: [] });
        } else {
          step.title = field.label;
        }
      } else if (field.hidden !== true) {
        const section = step.sections[step.sections.length - 1];

        if (section?.record.key === record.key) {
          section.fields.push(field);
        } else {
          step.sections.push({ record, fields: [field] });
        }
      }
    }
  }

  return steps.filter(({ sections }) => sections.length > 0);
};
