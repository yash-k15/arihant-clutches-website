const getDateParts = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || '')) {
    throw new Error('Invalid date filter. Expected YYYY-MM-DD.');
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new Error('Invalid date filter.');
  }

  return { year, month, day };
};

const zonedDateTimeToUtc = (dateString, timeZone) => {
  const { year, month, day } = getDateParts(dateString);
  const targetUtc = Date.UTC(year, month - 1, day);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  let result = targetUtc;
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(result))
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, Number(part.value)]),
    );
    const representedUtc = Date.UTC(
      parts.year, parts.month - 1, parts.day,
      parts.hour, parts.minute, parts.second,
    );
    result = targetUtc - (representedUtc - result);
  }

  return new Date(result);
};

const addOneCalendarDay = (dateString) => {
  const { year, month, day } = getDateParts(dateString);
  const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
  return [
    nextDay.getUTCFullYear(),
    String(nextDay.getUTCMonth() + 1).padStart(2, '0'),
    String(nextDay.getUTCDate()).padStart(2, '0'),
  ].join('-');
};

export const getDateRangeInTimeZone = (dateFrom, dateTo, timeZone) => {
  const range = {};
  if (dateFrom) range.$gte = zonedDateTimeToUtc(dateFrom, timeZone);
  if (dateTo) range.$lt = zonedDateTimeToUtc(addOneCalendarDay(dateTo), timeZone);
  return range;
};
