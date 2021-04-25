import { IPaginated } from '../dto/paginated.generic';
import { Cursor } from './cursor';

export const createPage = <T, K extends keyof T, V extends keyof T>(
  nodes: T[],
  totalCount: number,
  hasNextPage: boolean,
  cursorIdProp: K,
  cursorThresholdProp: V,
): IPaginated<T> => {
  const edges = nodes.map((node) => {
    const lastId = node[cursorIdProp];
    const threshold = node[cursorThresholdProp];

    const cursor = new Cursor(lastId, threshold);

    return {
      node,
      cursor: cursor.encodedCursor,
    };
  });

  return {
    edges,
    nodes,
    totalCount,
    hasNextPage,
  };
};
