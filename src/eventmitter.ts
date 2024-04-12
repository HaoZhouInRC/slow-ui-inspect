import { EventEmitter } from 'eventemitter3';

export const ev = new EventEmitter();

export enum EventType {
  upload = 'upload',
  chartTypeChange = 'chart-type-change',
}
