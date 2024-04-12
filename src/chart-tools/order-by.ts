import { ElementSelector } from '../constant';
import { EventType, ev } from '../eventmitter';

export const initOrderBySelector = () => {
  const selector = document.querySelector(
    `#${ElementSelector.orderBy}`,
  ) as HTMLSelectElement;

  selector?.addEventListener('change', () => {
    console.log('Selected data order by:', selector.value);

    ev.emit(EventType.dataFilterChange, selector.value);
  });
};
