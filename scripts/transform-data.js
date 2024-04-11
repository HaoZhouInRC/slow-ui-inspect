const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(
  __dirname,
  '../data/Slow UI  Element - Click event.csv',
);

const data = fs
  .readFileSync(dataFilePath, 'utf8')
  .toString()
  .split('\r\n')
  .filter(Boolean)
  .slice(1)
  .sort();

const map = new Map();

/**
 *
 * @return {{path, children: *[], name, value}}
 */
const createItem = (data) => {
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
  const updateParentValue = (item) => {
    if (!item) return;

    item.value = item.children.reduce((acc, child) => acc + child.value, 0);

    updateParentValue(map.get(item.path.slice(0, item.path.lastIndexOf('.'))));
  };

  if (item.path.includes('.')) {
    const parentPath = item.path.slice(0, item.path.lastIndexOf('.'));
    const parent = map.get(parentPath);

    parent.children.push(item);

    updateParentValue(parent);
  }
});

fs.writeFileSync(
  path.join(__dirname, '../data/data-test.json'),
  JSON.stringify(map.get('root'), null, 2),
);
