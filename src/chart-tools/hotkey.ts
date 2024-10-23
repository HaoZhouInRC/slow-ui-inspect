let metaKey = false;

export const initHotkey = () => {
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'meta') {
      e.preventDefault();
      metaKey = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'meta') {
      metaKey = false;
    }
  });
};

export const isHoldMetaKey = () => metaKey;
