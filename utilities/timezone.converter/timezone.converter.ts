import { toZonedTime, format } from 'date-fns-tz';

export default class TimezoneConverter {

    public convertUtcToUK(timestampUTC: string): string {
        const timeZone = 'Europe/London';

        //Ensure the input is parsed as UTC (add 'Z' only if not present)
        const safeUtc = timestampUTC.endsWith('Z') ? timestampUTC : `${timestampUTC}Z`;
        const utcDate = new Date(safeUtc);

        //Convert to UK time
        const zonedDate = toZonedTime(utcDate, timeZone);

        //Format to match original input
        return format(zonedDate, 'yyyy-MM-dd\'T\'HH:mm:ss', { timeZone });
    }

    public static convertUtcToCET(timestampUTC: string): string {
        const timeZone = 'Europe/Amsterdam';

        //Ensure the input is parsed as UTC (add 'Z' only if not present)
        const safeUtc = timestampUTC.endsWith('Z') ? timestampUTC : `${timestampUTC}Z`;
        const utcDate = new Date(safeUtc);

        //Convert to UK time
        const zonedDate = toZonedTime(utcDate, timeZone);

        //Format to match original input
        return format(zonedDate, 'dd/MM/yyyy HH:mm', { timeZone });
    }
}