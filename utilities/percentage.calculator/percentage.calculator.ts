export default class PercentageCalculator {

    public percentageDifference(value1: number, value2: number): number {
        if (value1 === 0) {
            // Avoid division by zero; define behavior
            return value2 === 0 ? 0 : Infinity;
        }
        //console.log('% diff: ' + Math.abs((value2 - value1) / value2) * 100);
        return Math.abs((value2 - value1) / value2) * 100;
    }

}