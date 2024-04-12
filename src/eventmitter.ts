import { EventEmitter } from 'eventemitter3';

export const ev = new EventEmitter();

export enum EventType {
  selectFiles = 'select-files',
  upload = 'upload',
  chartTypeChange = 'chart-type-change',
  cleanDynamicData = 'clean-dynamic-data',
}
