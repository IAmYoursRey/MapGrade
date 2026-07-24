export const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('gosiaga_device_id');
    if (!deviceId) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      deviceId = `Reporter #${randomNum}`;
      localStorage.setItem('gosiaga_device_id', deviceId);
    }
    return deviceId;
  };