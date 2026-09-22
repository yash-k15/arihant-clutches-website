const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const startOfWeek = (date) => {
  const result = startOfDay(date);
  const day = result.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);

  return result;
};

const startOfMonth = (date) => {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
};

const formatPeriodLabel = (date, groupBy) => {
  if (groupBy === 'day') {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  }

  if (groupBy === 'week') {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

const getPeriodKey = (date, groupBy) => {
  if (groupBy === 'day') {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
  }

  if (groupBy === 'week') {
    const weekStart = startOfWeek(date);

    return [
      weekStart.getFullYear(),
      weekStart.getMonth() + 1,
      weekStart.getDate(),
    ].join('-');
  }

  return [date.getFullYear(), date.getMonth() + 1].join('-');
};

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
      key: getPeriodKey(currentDate, groupBy),
      label: formatPeriodLabel(currentDate, groupBy),
      date: currentDate.toISOString(),
      sales: 0,
    });

    if (groupBy === 'day') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (groupBy === 'week') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return periods;
};

export { getPeriodKey, generateSalesPeriods };
