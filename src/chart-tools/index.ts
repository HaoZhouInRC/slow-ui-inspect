import { initChartSelector } from './chart-type-selector';
import { initDownloadButton } from './download-btn';
import { initHotkey } from './hotkey';
import { initOrderBySelector } from './order-by';
import { initFilterPrefix } from './prefix-filter';

initChartSelector();
initOrderBySelector();
initDownloadButton();
initFilterPrefix();
initHotkey();

export { updateFilterValue } from './prefix-filter';
export { isHoldMetaKey } from './hotkey';
