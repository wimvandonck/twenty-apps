// Adds the person of a submission to a list.
export type FormList = {
  // Unique within the form, e.g. "list1".
  key: string;
  listId: string;
  // The list's name when it was chosen, shown if the list is gone.
  listName: string;
  // The form's person record that becomes a member.
  recordKey: string;
  // Whether the visitor decides, by ticking a box on the form.
  optIn: boolean;
  // The text next to that box, and whether it starts ticked.
  label: string;
  checked: boolean;
};
