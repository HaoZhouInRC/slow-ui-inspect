import { Item, Order } from './transform-data';

export const transformDownloadData = (
  data: Item,
  depth: number = 0,
  orderBy: Order,
): string[] => {
  let line = `${'    '.repeat(depth * 2)} > ${data.name}`;

  if (orderBy === 'count') {
    line = `${line} (${data.value})`;
  }

  if (data.children.length === 0) {
    if (orderBy !== 'count') {
      line = `${line} (${data.value}ms)`;
    }

    return [line];
  }

  return [
    line,
    ...data.children.flatMap((child: Item) =>
      transformDownloadData(child, depth + 1, orderBy),
    ),
  ];
};
