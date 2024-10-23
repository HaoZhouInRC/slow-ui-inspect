import { ElementSelector } from '../constant';
import { EventType, ev } from '../eventmitter';

export const initFilterPrefix = () => {
  const selector = document.querySelector(
    `#${ElementSelector.filterInput}`,
  ) as HTMLInputElement;

  selector?.addEventListener('blur', () => {
    console.log('Selected data filter by:', selector.value);

    ev.emit(EventType.filterPrefixChange, selector.value);
  });
};

export const updateFilterValue = (value: string) => {
  const selector = document.querySelector(
    `#${ElementSelector.filterInput}`,
  ) as HTMLInputElement;

  selector.value = value;
};
