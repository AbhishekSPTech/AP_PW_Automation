export default class DurationCalculator {

    //calculates the time in minutes between two times
    public durationInMinutes(start: string, end: string): number {
        const startTime = new Date(start);
        const endTime = new Date(end);

        const diffInMilliseconds = endTime.getTime() - startTime.getTime();
        //console.log('duration calc: ' + Math.floor(diffInMilliseconds / (1000 * 60)));
        return Math.floor(diffInMilliseconds / (1000 * 60));
    }

}