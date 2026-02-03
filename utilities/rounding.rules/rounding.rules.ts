import { round } from "reliable-round";

export default class RoundingRules {

    //rounds up to the nearest multiple of 15
    //to simulate the most common 'rounding rule' used in many client / supplier rates
    public roundUpToNearest15(value: number): number {
        return value % 15 === 0 ? value : Math.ceil(value / 15) * 15;
    }

    //rounds to the nearest 2 decimal places using the reliable-round lib to avoid weird JS math results
    //useful for rouding monetary values, rounds up on 0.5 or greater, down on less
    public async roundToMoney(unroundedValue) {
        // console.log('roundToMoney Before: ' + unroundedValue);
        // console.log('roundToMoney After: ' + round(unroundedValue, 2));
        return round(unroundedValue, 2);
    }

    //rounds to the nearest whole number
    public async roundToNearestWhole(unroundedValue) {
        return round(unroundedValue);
    }

    //round to 2 decimal places but always rounds up e.g. 1.111 = 1.12
    public roundUpToTwoDecimals(unroundedValue: number): number {
        return Math.ceil(unroundedValue * 100) / 100;
    }

}