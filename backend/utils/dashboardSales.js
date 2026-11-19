import businessConfig from '../config/businessConfig.js';

const BUSINESS_TIMEZONE = businessConfig.timezone;

const getBusinessDateParts = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE, year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit',
    second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(date));
  const values = Object.fromEntries(parts.filter(({ type }) => type !== 'literal')
    .map(({ type, value }) => [type, Number(value)]));
  return {
    year: values.year, month: values.month, day: values.day,
    hour: values.hour, minute: values.minute, second: values.second,
  };
};

const createISTDate = (year, month, day, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) => {
  const target = Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds);
  let result = target;
  for (let i = 0; i < 4; i += 1) {
    const p = getBusinessDateParts(result);
    const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second, milliseconds);
    const difference = target - represented;
    if (difference === 0) break;
    result += difference;
  }
  return new Date(result);
};

const shiftISTDate = (date, { days = 0, months = 0, years = 0 } = {}) => {
  const p = getBusinessDateParts(date);
  const shifted = new Date(Date.UTC(
    p.year + years, p.month - 1 + months, p.day + days,
    p.hour, p.minute, p.second, new Date(date).getUTCMilliseconds(),
  ));
  return createISTDate(
    shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate(),
    shifted.getUTCHours(), shifted.getUTCMinutes(), shifted.getUTCSeconds(),
    shifted.getUTCMilliseconds(),
  );
};

const startOfDay = (date) => {
  const p = getBusinessDateParts(date);
  return createISTDate(p.year, p.month, p.day);
};

const startOfWeek = (date) => {
  const p = getBusinessDateParts(date);
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day));
  const weekday = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + (weekday === 0 ? -6 : 1 - weekday));
  return createISTDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
};

const startOfMonth = (date) => {
  const p = getBusinessDateParts(date);
  return createISTDate(p.year, p.month, 1);
};

const formatPeriodLabel = (date, groupBy) => {
  if (groupBy === 'day' || groupBy === 'week') {
    return date.toLocaleDateString('en-IN', {
      timeZone: BUSINESS_TIMEZONE, day: '2-digit', month: 'short',
    });
  }
  return date.toLocaleDateString('en-IN', {
    timeZone: BUSINESS_TIMEZONE, month: 'short', year: 'numeric',
  });
};

const getPeriodKey = (date) => new Date(date).toISOString();

const generateSalesPeriods = (startDate, endDate, groupBy) => {
  const periods = [];
  let currentDate = groupBy === 'day' ? startOfDay(startDate)
    : groupBy === 'week' ? startOfWeek(startDate) : startOfMonth(startDate);
  const finalDate = groupBy === 'day' ? startOfDay(endDate)
    : groupBy === 'week' ? startOfWeek(endDate) : startOfMonth(endDate);

  while (currentDate <= finalDate) {
    periods.push({
      key: getPeriodKey(currentDate),
      label: formatPeriodLabel(currentDate, groupBy),
      date: currentDate.toISOString(),
      sales: 0,
    });
    if (groupBy === 'day') currentDate = shiftISTDate(currentDate, { days: 1 });
    else if (groupBy === 'week') currentDate = shiftISTDate(currentDate, { days: 7 });
    else {
      const p = getBusinessDateParts(currentDate);
      currentDate = createISTDate(p.year, p.month + 1, 1);
    }
  }
  return periods;
};

export {
  BUSINESS_TIMEZONE, createISTDate, shiftISTDate, startOfDay,
  startOfWeek, startOfMonth, getPeriodKey, generateSalesPeriods,
};
