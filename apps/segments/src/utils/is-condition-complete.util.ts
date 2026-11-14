import { type Condition } from 'src/types/segment-definition';
import { needsValue } from 'src/utils/build-property-filter.util';

// Whether a condition has everything it needs before it can be calculated.
export const isConditionComplete = (condition: Condition): boolean => {
  switch (condition.type) {
    case 'related':
      return (
        condition.object !== '' &&
        condition.relation !== '' &&
        (condition.measure?.aggregate === 'COUNT' || condition.measure === undefined || condition.measure.field !== '') &&
        condition.value !== undefined &&
        condition.value !== ''
      );
    case 'property':
      return condition.field !== undefined
        ? condition.field !== '' && (!needsValue(condition.operator ?? 'IS') || (condition.value ?? '') !== '')
        : Object.keys(condition.filter).length > 0;
    case 'list':
      return condition.listId !== '';
    case 'group':
      return condition.conditions.length > 0 && condition.conditions.every(isConditionComplete);
  }
};
