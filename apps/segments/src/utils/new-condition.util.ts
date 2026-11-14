import { type EditorMetadata } from 'src/types/editor-metadata';
import { type Condition } from 'src/types/segment-definition';
import { personLinks } from 'src/utils/person-links.util';

// A new, still empty condition of the given type.
export const newCondition = (type: Condition['type'], metadata: EditorMetadata): Condition => {
  switch (type) {
    case 'related': {
      const [link] = personLinks(metadata.objects);
      return { type, object: link?.object.namePlural ?? '', relation: link?.relation.name ?? '', value: 1 };
    }
    case 'property':
      return { type, filter: {}, field: '', operator: 'IS', value: '' };
    case 'list':
      return { type, listId: '', isMember: true };
    case 'group':
      return { type, match: 'ANY', conditions: [] };
  }
};
