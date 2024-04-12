export interface Item {
  name: string;
  path: string;
  value: number;
  children: Item[];
}

export type DataFilter = 'count' | 'time' | 'avgTime';

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
  filterBy: DataFilter = 'count',
) => {
  const data = fileContent.split('\r\n').filter(Boolean).slice(1).sort();

  const map = new Map();

  const filterIndex: Record<string, number> = {
    count: 0,
    time: 1,
    avgTime: 2,
  };

  const createItem = (data: Omit<Item, 'children'>) => {
    return {
      ...data,
      children: [],
    };
  };

  const valuse = data.map((line: string) => {
    const [pathStr, ...rest] = line
      .split(',"')
      .map((str) => str.replaceAll('"', ''));

    const valueStr = rest[filterIndex[filterBy]] || '0';

    if (valueStr === '0') {
      console.warn('Value not found in line:', line);
    }

    const path = cleanUpData ? normalizePath(pathStr) : pathStr;
    const value = parseInt(valueStr.replaceAll(',', ''));

    return {
      path,
      value,
    };
  });

  valuse.sort((a, b) => a.value - b.value);

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

    map.get(path).value += value;
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

  return JSON.parse(JSON.stringify(map.get('root') ?? { children: [] }));
};
