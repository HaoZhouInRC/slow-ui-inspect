import { EventEmitter } from 'eventemitter3';

export const ev = new EventEmitter();

export enum EventType {
  selectFiles = 'select-files',
  upload = 'upload',
  chartTypeChange = 'chart-type-change',
  dataFilterChange = 'data-filter-change',
  downloadData = 'download-data',
  filterPrefixChange = ' filter-prefix-change',
}
