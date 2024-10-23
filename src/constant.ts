import { Order } from './render/transform-data';

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
  orderBy = 'order-by',
  downloadBtn = 'download-btn',
  filterInput = 'filter-prefix',
}

const chartType = getDefaultValueFromDom(ElementSelector.chartType);

const orderBy = getDefaultValueFromDom(ElementSelector.orderBy) as Order;

const filterPrefix = getDefaultValueFromDom(ElementSelector.filterInput) || '';

export const defaultValue = {
  chartType,
  orderBy,
  filterPrefix,
};
