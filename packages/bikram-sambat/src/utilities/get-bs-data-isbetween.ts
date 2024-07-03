import type { getBoundaryInclusionType } from '..';

export const getBoundaryInclusion = (
  val: getBoundaryInclusionType
): [number, number] => {
  switch (val) {
    case '()':
      return [1, 1];
    case '(]':
      return [1, 0];
    case '[)':
      return [0, 1];
    case '[]':
      return [0, 0];
  }
};