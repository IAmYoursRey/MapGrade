export const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'Reporter #0000';
  let id = localStorage.getItem('gosiaga_device_id');
  if (!id) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    id = `Reporter #${randomNum}`;
    localStorage.setItem('gosiaga_device_id', id);
  }
  return id;
};

export const deviceId = getDeviceId();