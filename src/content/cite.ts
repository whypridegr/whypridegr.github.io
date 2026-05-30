// Shared shape for a short citation shown inside a Popover: one explanatory
// note plus optional source links. Used by myths, parallels and the timeline.
export type Cite = {
  note: string;
  links?: { label: string; url: string }[];
};
