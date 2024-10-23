import Papa from 'papaparse';

export interface Item {
  name: string;
  path: string;
  value: number;
  children: Item[];
}

export type Order = 'count' | 'time-95' | 'time-75' | 'time-50';

const normalizeMessageDynamicData = (path: string) => {
  if (/MESSAGE_LEFT_RAIL_Panel\.leftRail\.folder-/.test(path)) {
    let folderString = /\.folder-(.*?)\.conversation-collapse/.exec(path)?.[1]!;
    const folderName = folderString.slice(0, folderString.length / 2);

    return path.replace(`.folder-${folderName}.${folderName}.`, '.folder.');
  }
  return path;
};

export const transformData = (
  fileContent: string,
  filterPrefix: string,
  order: Order = 'time-95',
) => {
  const { data } = Papa.parse<string[]>(fileContent);

  let body = data.slice(1).filter((record) => record.length > 1);

  if (filterPrefix) {
    if (!filterPrefix.startsWith('root.')) {
      filterPrefix = `root.${filterPrefix}`;
    }

    body = body.filter(([element]) => element.startsWith(filterPrefix));
  }

  const map = new Map<string, Item>();

  const filterIndex: Record<Order, number> = {
    count: 0,
    'time-50': 1,
    'time-75': 2,
    'time-95': 3,
  };

  const createItem = (data: Omit<Item, 'children'>) => {
    return {
      ...data,
      children: [],
    };
  };

  const values = body.map((record) => {
    let [path, ...rest] = record;

    const value = parseInt(rest[filterIndex[order]].replace(/,/g, ''), 10);

    return {
      path: normalizeMessageDynamicData(path),
      value,
    };
  });

  values.sort((a, b) => b.value - a.value);

  values.forEach(({ path, value }) => {
    path.split('.').reduce((pre, cur) => {
      const path = (pre ? pre + '.' : '') + cur;

      if (!map.has(path)) {
        map.set(
          path,
          createItem({
            name: cur,
            path: path,
            value: 0,
          }),
        );
      }

      return path;
    }, '');

    map.get(path)!.value += value;
  });

  map.forEach((item) => {
    const updateParentValue = (item: Item) => {
      if (!item) return;

      item.value = item.children.reduce((acc, child) => acc + child.value, 0);

      updateParentValue(
        map.get(item.path.slice(0, item.path.lastIndexOf('.'))) as Item,
      );
    };

    if (item.path.includes('.')) {
      const parentPath = item.path.slice(0, item.path.lastIndexOf('.'));
      const parent = map.get(parentPath);

      parent!.children.push(item);

      updateParentValue(parent!);
    }
  });

  map.get('root')!.children.sort((a, b) => b.value - a.value);

  return JSON.parse(JSON.stringify(map.get('root') ?? { children: [] }));
};
