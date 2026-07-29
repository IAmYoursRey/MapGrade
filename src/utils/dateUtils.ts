export const formatIndonesiaTimestamp = (dateInput?: string | Date | number): string => {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return new Date().toLocaleString('id-ID');

  const offsetMinutes = -date.getTimezoneOffset();
  const offsetHours = offsetMinutes / 60;

  let tzSuffix = 'WIB';
  if (offsetHours === 8) {
    tzSuffix = 'WITA';
  } else if (offsetHours === 9) {
    tzSuffix = 'WIT';
  } else if (offsetHours === 7) {
    tzSuffix = 'WIB';
  } else {
    const sign = offsetHours >= 0 ? '+' : '-';
    const absH = Math.abs(Math.floor(offsetHours));
    tzSuffix = `UTC${sign}${absH}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes} ${tzSuffix}`;
};
