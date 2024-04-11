export interface Item {
  name: string;
  path: string;
  value: number;
  children: Item[];
}

export const transformData = (fileContent: string) => {
  const data = fileContent.split('\r\n').filter(Boolean).slice(1).sort();

  const map = new Map();

  const createItem = (data: Omit<Item, 'children'>) => {
    return {
      ...data,
      children: [],
    };
  };

  data.forEach((line) => {
    const pathStr = line.slice(0, line.indexOf(','));
    const valueStr = line.slice(line.indexOf(','));

    const path = pathStr.replaceAll('"', '');
    const value = parseInt(valueStr.replaceAll(',', '').replaceAll('"', ''));

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
