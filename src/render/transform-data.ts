import Papa from 'papaparse';

export interface TreeItem {
  name: string;
  path: string;
  value: number;
  children: TreeItem[];
}

export type Order = 'count' | 'time-95' | 'time-75' | 'time-50' | 'total-95';

export const filterIndex: Record<Order, number> = {
  count: 0,
  'time-50': 1,
  'time-75': 2,
  'time-95': 3,
  'total-95': 4,
};

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

  const map = new Map<string, TreeItem>();

  const createItem = (data: Omit<TreeItem, 'name' | 'children'>) => {
    return {
      ...data,
      name: data.path.split('.').pop()!,
      children: [],
    };
  };

  const values = body.map((record) => {
    let [path, ...rest] = record;

    const toNumber = (v: number) => parseInt(rest[v].replace(/,/g, ''), 10);

    let value = toNumber(filterIndex[order]);

    if (order === 'total-95') {
      value = toNumber(filterIndex['count']) * toNumber(filterIndex['time-95']);
    }

    return {
      path: normalizeMessageDynamicData(path),
      value,
    };
  });

  values.forEach(({ path, value }) => {
    if (!map.has(path)) {
      map.set(path, createItem({ path, value }));
    } else {
      map.get(path)!.value += value;
    }

    let lastIndex = path.lastIndexOf('.');
    let current = map.get(path)!;

    while (lastIndex >= 0) {
      const parentPath = path.slice(0, lastIndex);

      if (!map.has(parentPath)) {
        map.set(parentPath, createItem({ path: parentPath, value: 0 }));
      }

      const parent = map.get(parentPath)!;

      parent.value = parent.value + value;

      if (!parent.children.find((item) => item.path === current.path)) {
        parent.children.push(current);
      }

      // for next loop
      path = parentPath;
      current = parent;

      lastIndex = path.lastIndexOf('.');
    }
  });

  return [
    JSON.parse(JSON.stringify(map.get('root') ?? { children: [] })),
    body,
  ];
};
