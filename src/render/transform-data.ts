import Papa from 'papaparse';

export interface Item {
  name: string;
  path: string;
  value: number;
  children: Item[];
}

export type Order = 'count' | 'time-95' | 'time-75' | 'time-50';

/* This is templary function to clean "message data" */
const normalizePath = (path: string) => {
  const messageFolder = /\.leftRail\.folder\-(.*?)\./.exec(path)?.[1];

  // root.VersatileResponsiveLayout-MessageRailCompactLayout.MESSAGE_LEFT_RAIL_Panel.leftRail.folder-MTR-113153 Finish the federation contacts-handle contact presence.MTR-113153 Finish the federation contacts-handle contact presence.MTR-113153 Finish the federation contacts-handle contact presence-header
  if (messageFolder) {
    if (path.includes(`-${messageFolder}.${messageFolder}.${messageFolder}-`)) {
      return path.replace(
        `-${messageFolder}.${messageFolder}.${messageFolder}-`,
        '.',
      );
    } else {
      return path.replace(`-${messageFolder}.${messageFolder}.`, '.');
    }
  }

  return path;
};

export const transformData = (
  fileContent: string,
  cleanUpData = false,
  order: Order = 'time-95',
) => {
  const { data } = Papa.parse<string[]>(fileContent);
  const records = data.slice(1);

  const map = new Map<string, Item>();

  const filterIndex: Record<Order, number> = {
    count: 0,
    'time-95': 1,
    'time-75': 2,
    'time-50': 3,
  };

  const createItem = (data: Omit<Item, 'children'>) => {
    return {
      ...data,
      children: [],
    };
  };

  const valuse = records.map((record) => {
    let [path, ...rest] = record;

    if (cleanUpData) {
      path = normalizePath(path);
    }

    const value = parseInt(rest[filterIndex[order]].replace(/,/g, ''), 10);

    return {
      path,
      value,
    };
  });

  valuse.sort((a, b) => b.value - a.value);

  valuse.forEach(({ path, value }) => {
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
        map.get(item.path.slice(0, item.path.lastIndexOf('.'))),
      );
    };

    if (item.path.includes('.')) {
      const parentPath = item.path.slice(0, item.path.lastIndexOf('.'));
      const parent = map.get(parentPath);

      parent.children.push(item);

      updateParentValue(parent);
    }
  });

  map.get('root')!.children.sort((a, b) => b.value - a.value);

  return JSON.parse(JSON.stringify(map.get('root') ?? { children: [] }));
};
