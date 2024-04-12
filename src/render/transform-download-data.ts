import { Item } from './transform-data';

export const transformDownloadData = (data: Item, depth = 0): string[] => {
  const line = `${'    '.repeat(depth * 2)} > ${data.name} (${data.value})`;

  if (data.children.length === 0) {
    return [line];
  }

  return [
    line,
    ...data.children.flatMap((child: Item, index) =>
      transformDownloadData(child, depth + 1),
    ),
  ];
};
