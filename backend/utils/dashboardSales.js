const BUSINESS_TIMEZONE = 'Asia/Kolkata';
const IST_OFFSET_MINUTES = 330;
const DAY_MS = 24 * 60 * 60 * 1000;

const createISTDate = (
  year,
  month,
  day,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
) =>
  new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds) -
      IST_OFFSET_MINUTES * 60 * 1000,
  );

const getISTParts = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(date));

  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
};

const shiftISTDate = (date, { days = 0, months = 0, years = 0 } = {}) => {
  const parts = getISTParts(date);

  const shifted = new Date(
    Date.UTC(
      parts.year + years,
      parts.month - 1 + months,
      parts.day + days,
      parts.hour,
      parts.minute,
      parts.second,
      new Date(date).getUTCMilliseconds(),
    ),
  );

  return new Date(shifted.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
};

const startOfDay = (date) => {
  const parts = getISTParts(date);

  return createISTDate(parts.year, parts.month, parts.day);
};

const startOfWeek = (date) => {
  const parts = getISTParts(date);

  const dateOnlyUTC = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  );

  const day = dateOnlyUTC.getUTCDay();

  // Monday = start of business week
  const diff = day === 0 ? -6 : 1 - day;

  dateOnlyUTC.setUTCDate(dateOnlyUTC.getUTCDate() + diff);

  return createISTDate(
    dateOnlyUTC.getUTCFullYear(),
    dateOnlyUTC.getUTCMonth() + 1,
    dateOnlyUTC.getUTCDate(),
  );
};

const startOfMonth = (date) => {
  const parts = getISTParts(date);

  return createISTDate(parts.year, parts.month, 1);
};

const formatPeriodLabel = (date, groupBy) => {
  if (groupBy === 'day' || groupBy === 'week') {
    return date.toLocaleDateString('en-IN', {
      timeZone: BUSINESS_TIMEZONE,
      day: '2-digit',
      month: 'short',
    });
  }

  return date.toLocaleDateString('en-IN', {
    timeZone: BUSINESS_TIMEZONE,
    month: 'short',
    year: 'numeric',
  });
};

const getPeriodKey = (date) => new Date(date).toISOString();

const generateSalesPeriods = (startDate, endDate, groupBy) => {
  const periods = [];

  let currentDate;

  if (groupBy === 'day') {
    currentDate = startOfDay(startDate);
  } else if (groupBy === 'week') {
    currentDate = startOfWeek(startDate);
  } else {
    currentDate = startOfMonth(startDate);
  }

  const finalDate =
    groupBy === 'day'
      ? startOfDay(endDate)
      : groupBy === 'week'
        ? startOfWeek(endDate)
        : startOfMonth(endDate);

  while (currentDate <= finalDate) {
    periods.push({
      key: getPeriodKey(currentDate),
      label: formatPeriodLabel(currentDate, groupBy),
      date: currentDate.toISOString(),
      sales: 0,
    });

    if (groupBy === 'day') {
      currentDate = new Date(currentDate.getTime() + DAY_MS);
    } else if (groupBy === 'week') {
      currentDate = new Date(currentDate.getTime() + 7 * DAY_MS);
    } else {
      const parts = getISTParts(currentDate);

      currentDate = createISTDate(parts.year, parts.month + 1, 1);
    }
  }

  return periods;
};

export {
  BUSINESS_TIMEZONE,
  createISTDate,
  shiftISTDate,
  startOfDay,
  startOfWeek,
  startOfMonth,
  getPeriodKey,
  generateSalesPeriods,
};
