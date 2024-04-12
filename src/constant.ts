function getDefaultValueFromDom(id: string) {
  const element = document.querySelector(`#${id}`) as HTMLElement;

  if (!element) {
    console.warn('Element not found:', id);
    return '';
  }

  switch (element.tagName) {
    case 'INPUT':
      return (element as HTMLInputElement).value;
    case 'SELECT':
      return (element as HTMLSelectElement).options[
        (element as HTMLSelectElement).selectedIndex
      ].value;
  }
}

export enum ElementSelector {
  uploadInput = 'upload-input',
  chartType = 'chart-type-selector',
  cleanDynamicData = 'clean-dynamic-data',
  orderBy = 'order-by',
  downloadBtn = 'download-btn',
}

export const chartType = getDefaultValueFromDom(ElementSelector.chartType);

export const cleanDynamicData = getDefaultValueFromDom(
  ElementSelector.cleanDynamicData,
);

export const orderBy = getDefaultValueFromDom(ElementSelector.orderBy);
