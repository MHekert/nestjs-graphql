import { format } from 'date-fns';

export const formatTimestampWithoutTimezone = (date: string | number | Date) =>
  format(new Date(date), 'yyyy-MM-dd HH:mm:ss.SSS');
