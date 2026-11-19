import siteConfig from '../config/siteConfig.js';

const timeZone = siteConfig.business.timezone;

export const getDateStringInBusinessTimeZone = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export const addDaysToDateString = (dateString, days) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
};

export const formatDateInBusinessTimeZone = (date, options) =>
  new Date(date).toLocaleDateString('en-GB', { ...options, timeZone });

export const getDatePartsInBusinessTimeZone = (date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(new Date(date));
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
};
