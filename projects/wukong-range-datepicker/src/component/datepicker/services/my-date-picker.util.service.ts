import { Injectable } from "@angular/core";
import { IMyDate } from "../interfaces/my-date.interface";
import { IMyDateRange } from "../interfaces/my-date-range.interface";
import { IMyMonth } from "../interfaces/my-month.interface";
import { IMyMonthLabels } from "../interfaces/my-month-labels.interface";
import { IMyMarkedDates } from "../interfaces/my-marked-dates.interface";
import { IMyMarkedDate } from "../interfaces/my-marked-date.interface";
import { IMyDateFormat } from "../interfaces/my-date-format.interface";
import * as moment from 'moment';

const M = "M";
const MM = "MM";
const MMM = "MMM";
const D = "D";
const DD = "DD";
const YYYY = "YYYY";
const hh = "HH";
const h = "H";
const mm = "mm";
const m = "m";
const ss = "ss";
const s = "s";
const TIME = "HH:mm:ss";
const timeREG = /(^(([0-1]?[0-9])|20|21|22|23))\:([0-5]?[0-9])\:([0-5]?[0-9])$/;
// 匹配 now
const nowStr = `(now)`;
// 匹配 -{2}{d}
const operationStr = `(\\+|\\-)(\\d*)?(m|h|d|w|M|y)`;
// 匹配 /(m|h|d|M|y)
const divStr = `(\\/)(m|h|d|w|M|y)`;
// 匹配 匹配 y/y 没有考虑 y/m等
// var comboStr = `^${nowREG}((${operationREG}(\\/(\\6)))|(${operationREG})|(${divREG}))?$`
const comboStr = `^${nowStr}(${operationStr})?(${divStr})?$`;
const syntaxREG = new RegExp(comboStr);

@Injectable()
export class UtilService {
    weekDays: Array<string> = ["su", "mo", "tu", "we", "th", "fr", "sa"];

    isAbsoluteDateValid(dateStr: string, dateFormat: string, minYear: number, maxYear: number, disableUntil: IMyDate, disableSince: IMyDate, disableWeekends: boolean, disableWeekDays: Array<string>, disableDays: Array<IMyDate>, disableDateRanges: Array<IMyDateRange>, monthLabels: IMyMonthLabels, enableDays: Array<IMyDate>): IMyDate {
        // let moment =
        let returnDate: IMyDate = {day: 0, month: 0, year: 0, hour: 0, minute: 0, second: 0};
        let daysInMonth: Array<number> = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let isMonthStr: boolean = dateFormat.indexOf(MMM) !== -1;
        let delimeters: Array<string> = this.getDateFormatDelimeters(dateFormat);
        let dateValue: Array<IMyDateFormat> = this.getDateValue(dateStr, dateFormat, delimeters);
        console.log('dateValue--->', dateValue);
        if (dateValue === null){ return returnDate; } // 判断getDateValue出错
        let year: number = this.getNumberByValue(dateValue[0]);
        let month: number = isMonthStr ? this.getMonthNumberByMonthName(dateValue[1], monthLabels) : this.getNumberByValue(dateValue[1]);
        let day: number = this.getNumberByValue(dateValue[2]);
        let hour: number = this.getNumberByValue(dateValue[3]);
        let minute: number = this.getNumberByValue(dateValue[4]);
        let second: number = this.getNumberByValue(dateValue[5]);
        console.log(`${hour}${delimeters[3]}${minute}${delimeters[4]}${second}`);
        let regResult = timeREG.exec(`${hour}${delimeters[3]}${minute}${delimeters[4]}${second}`);
        if (!regResult || !regResult[1] === undefined || regResult[4] === undefined || regResult[5] === undefined){
            return returnDate;
        }

        if (month !== -1 && day !== -1 && year !== -1) {
            if (year < minYear || year > maxYear || month < 1 || month > 12) {
                return returnDate;
            }

            let date: IMyDate = {year: year, month: month, day: day, hour: hour, minute: minute, second: second};

            if (this.isDisabledDay(date, minYear, maxYear, disableUntil, disableSince, disableWeekends, disableWeekDays, disableDays, disableDateRanges, enableDays)) {
                return returnDate;
            }

            if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
                daysInMonth[1] = 29;
            }

            if (day < 1 || day > daysInMonth[month - 1]) {
                return returnDate;
            }

            // Valid date
            return date;
        }
        return returnDate;
    }

    isRelativeDateValid( dateStr: string, startOrEnd: string, dateFormat: string, minYear: number, maxYear: number, disableUntil: IMyDate, disableSince: IMyDate, disableWeekends: boolean, disableWeekDays: Array<string>, disableDays: Array<IMyDate>, disableDateRanges: Array<IMyDateRange>, monthLabels: IMyMonthLabels, enableDays: Array<IMyDate>): IMyDate {
        let returnDate: IMyDate = {day: 0, month: 0, year: 0, hour: 0, minute: 0, second: 0};
        let phrase = null;
        let relativeDate = null;
        if (phrase = this.syntax(dateStr)){
            relativeDate = this.formatPhrase(phrase, startOrEnd, dateFormat);
        } else {
            return returnDate;
        }
        let date: IMyDate = relativeDate.dateObj;
        if (this.isDisabledDay(date, minYear, maxYear, disableUntil, disableSince, disableWeekends, disableWeekDays, disableDays, disableDateRanges, enableDays)) {
            return returnDate;
        }
        return date;
    }

    // getDateValue(dateStr: string, dateFormat: string, delimeters: Array<string>): Array<IMyDateFormat> {
    //     let del: string = delimeters[0];
    //     if (delimeters[0] !== delimeters[1]) {
    //         del = delimeters[0] + delimeters[1];
    //     }

    //     let re: any = new RegExp("[" + del + "]");
    //     let ds: Array<string> = dateStr.split(re);
    //     let df: Array<string> = dateFormat.split(re);
    //     let da: Array<IMyDateFormat> = [];

    //     for (let i = 0; i < df.length; i++) {
    //         if (df[i].indexOf(YYYY) !== -1) {
    //             da[0] = {value: ds[i], format: df[i]};
    //         }
    //         if (df[i].indexOf(M) !== -1) {
    //             da[1] = {value: ds[i], format: df[i]};
    //         }
    //         if (df[i].indexOf(D) !== -1) {
    //             da[2] = {value: ds[i], format: df[i]};
    //         }
    //     }
    //     return da;
    // }

    getDateValue(dateStr: string, dateFormat: string, delimeters: Array<string>): Array<IMyDateFormat> {
        let da: Array<IMyDateFormat> = [];
        let head = 0, tail = 0;
        let fHead = 0, fTail = 0;
        let sign = '';
        let _value, _format;
        let i = 0;
        for ( ; i < delimeters.length; i++) {
            sign = delimeters[i];
            tail = dateStr.indexOf(sign, head);
            fTail = dateFormat.indexOf(sign, head);
            _value = dateStr.substring(head, tail);
            _format = dateFormat.substring(fHead, fTail);
            // 判断 format 是否一致
            if (_value.length !== _format.length){
                return null;
            }
            da[i] = {value: _value, format: _format};
            head = tail + 1;
            fHead = fTail + 1;
        }
        _value = dateStr.substring(head, dateStr.length);
        _format = dateFormat.substring(fHead, dateFormat.length);
        // 判断 format 是否一致
        if (_value.length !== _format.length){
            return null;
        }
        da[i] = {value: _value, format: _format};
        return da;
    }

    getMonthNumberByMonthName(df: IMyDateFormat, monthLabels: IMyMonthLabels): number {
        if (df.value) {
            for (let key = 1; key <= 12; key++) {
                if (df.value.toLowerCase() === monthLabels[key].toLowerCase()) {
                    return key;
                }
            }
        }
        return -1;
    }

    getNumberByValue(df: IMyDateFormat): number {
        // console.log('getNumberByValue', df);
        if (!df) { return -1; }
        if (!/^\d+$/.test(df.value)) {
            return -1;
        }

        let nbr: number = Number(df.value);
        if (df.format.length === 1 && df.value.length !== 1 && nbr < 10 || df.format.length === 1 && df.value.length !== 2 && nbr >= 10) {
            nbr = -1;
        }
        else if (df.format.length === 2 && df.value.length > 2) {
            nbr = -1;
        }
        return nbr;
    }

    getDateFormatDelimeters(dateFormat: string): Array<string> {
        return dateFormat.match(/[^(YMDHms)]{1,}/g);
    }

    parseDefaultMonth(monthString: string): IMyMonth {
        let month: IMyMonth = {monthTxt: "", monthNbr: 0, year: 0};
        if (monthString !== "") {
            let split = monthString.split(monthString.match(/[^0-9]/)[0]);
            month.monthNbr = split[0].length === 2 ? parseInt(split[0], 10) : parseInt(split[1], 10);
            month.year = split[0].length === 2 ? parseInt(split[1], 10) : parseInt(split[0], 10);
        }
        return month;
    }

    formatDate(date: IMyDate, dateFormat: string, monthLabels: IMyMonthLabels, mode?: any): string {
        let formatted: string = dateFormat.replace(YYYY, String(date.year));

        if (dateFormat.indexOf(MMM) !== -1) {
            formatted = formatted.replace(MMM, monthLabels[date.month]);
        }
        else if (dateFormat.indexOf(MM) !== -1) {
            formatted = formatted.replace(MM, String(this.preZero(date.month)));
        }
        else {
            formatted = formatted.replace(M, String(date.month));
        }

        if (dateFormat.indexOf(DD) !== -1) {
            formatted = formatted.replace(DD, String(this.preZero(date.day)));
        }
        else {
            formatted = formatted.replace(D, String(date.day));
        }

        if (dateFormat.indexOf(hh) !== -1) {
            formatted = formatted.replace(hh, String(this.preZero(date.hour)));
        }
        else {
            formatted = formatted.replace(h, String(date.hour));
        }

        if (dateFormat.indexOf(mm) !== -1) {
            formatted = formatted.replace(mm, String(this.preZero(date.minute)));
        }
        else {
            formatted = formatted.replace(m, String(date.minute));
        }

        if (dateFormat.indexOf(ss) !== -1) {
            // formatted = formatted.replace(ss, String(this.preZero(date.second)));
            if (mode){
              formatted = formatted.replace(ss, String(date.second));
            }else{
              formatted = formatted.replace(ss, String(this.preZero(date.second)));
            }
        }
        else {
            formatted = formatted.replace(s, String(date.second));
        }
        // 匹配 时间是否符合 重新赋值date
        // if (allowTime){
        //     return this.allowTimeSet(date, formatted);
        // }
        return formatted;
    }

    // 点击确认的时候format 时间
    defaultFormatTime(dateStr: string, dateFormat: string): string{
        return moment(dateStr).format(dateFormat);
    }


    preZero(val: number): string {
        return val < 10 ? "0" + val : String(val);
    }

    isDisabledDay(date: IMyDate, minYear: number, maxYear: number, disableUntil: IMyDate, disableSince: IMyDate, disableWeekends: boolean, disableWeekDays: Array<string>, disableDays: Array<IMyDate>, disableDateRanges: Array<IMyDateRange>, enableDays: Array<IMyDate>): boolean {
        for (let e of enableDays) {
            if (e.year === date.year && e.month === date.month && e.day === date.day) {
                return false;
            }
        }

        let dn = this.getDayNumber(date);

        if (date.year < minYear && date.month === 12 || date.year > maxYear && date.month === 1) {
            return true;
        }

        let dateMs: number = this.getTimeInMilliseconds(date);
        if (this.isInitializedDate(disableUntil) && dateMs <= this.getTimeInMilliseconds(disableUntil)) {
            return true;
        }

        if (this.isInitializedDate(disableSince) && dateMs >= this.getTimeInMilliseconds(disableSince)) {
            return true;
        }

        if (disableWeekends) {
            if (dn === 0 || dn === 6) {
                return true;
            }
        }

        if (disableWeekDays.length > 0) {
            for (let wd of disableWeekDays) {
                if (dn === this.getWeekdayIndex(wd)) {
                    return true;
                }
            }
        }

        for (let d of disableDays) {
            if (d.year === date.year && d.month === date.month && d.day === date.day) {
                return true;
            }
        }

        for (let d of disableDateRanges) {
            if (this.isInitializedDate(d.begin) && this.isInitializedDate(d.end) && dateMs >= this.getTimeInMilliseconds(d.begin) && dateMs <= this.getTimeInMilliseconds(d.end)) {
                return true;
            }
        }
        return false;
    }

    isMarkedDate(date: IMyDate, markedDates: Array<IMyMarkedDates>, markWeekends: IMyMarkedDate): IMyMarkedDate {
        for (let md of markedDates) {
            for (let d of md.dates) {
                if (d.year === date.year && d.month === date.month && d.day === date.day) {
                    return {marked: true, color: md.color};
                }
            }
        }
        if (markWeekends && markWeekends.marked) {
            let dayNbr = this.getDayNumber(date);
            if (dayNbr === 0 || dayNbr === 6) {
                return {marked: true, color: markWeekends.color};
            }
        }
        return {marked: false, color: ""};
    }

    isHighlightedDate(date: IMyDate, sunHighlight: boolean, satHighlight: boolean, highlightDates: Array<IMyDate>): boolean {
        let dayNbr: number = this.getDayNumber(date);
        if (sunHighlight && dayNbr === 0 || satHighlight && dayNbr === 6) {
            return true;
        }
        for (let d of highlightDates) {
            if (d.year === date.year && d.month === date.month && d.day === date.day) {
                return true;
            }
        }
        return false;
    }

    getWeekNumber(date: IMyDate): number {
        let d: Date = new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0);
        d.setDate(d.getDate() + (d.getDay() === 0 ? -3 : 4 - d.getDay()));
        return Math.round(((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000) / 7) + 1;
    }

    isMonthDisabledByDisableUntil(date: IMyDate, disableUntil: IMyDate): boolean {
        return this.isInitializedDate(disableUntil) && this.getTimeInMilliseconds(date) <= this.getTimeInMilliseconds(disableUntil);
    }

    isMonthDisabledByDisableSince(date: IMyDate, disableSince: IMyDate): boolean {
        return this.isInitializedDate(disableSince) && this.getTimeInMilliseconds(date) >= this.getTimeInMilliseconds(disableSince);
    }

    isInitializedDate(date: IMyDate | any): boolean {
        return date.year !== 0 && date.month !== 0 && date.day !== 0;
    }

    isSameDate(d1: IMyDate, d2: IMyDate): boolean {
        return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
    }

    getTimeInMilliseconds(date: IMyDate): number {
        return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0).getTime();
    }

    getDayNumber(date: IMyDate): number {
        return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0).getDay();
    }

    getWeekDays(): Array<string> {
        return this.weekDays;
    }

    getWeekdayIndex(wd: string) {
        return this.weekDays.indexOf(wd);
    }

    syntax(lang){
        if (!lang){
           return null;
        }
        if (syntaxREG.exec(lang)){
          let now = RegExp.$1;
          let operation = RegExp.$3;
          let num1 = RegExp.$4 ? RegExp.$4 : 1;
          let num1Unit = RegExp.$5;
          let div = RegExp.$7;
          let divUnit = RegExp.$8 === 'w' ? 'isoweek' : RegExp.$8;
          return {now, operation, num1, num1Unit, div, divUnit};
        }
        return null;
        // else {
        //   console.error('syntax parse error');
        // }
      }

    /*
     * 存在一个上下界问题， ${time}/m 取整月的时间范围
     * 如果 from 那就是 这个月第一天;
     * @param {*} phrase
     * @param {*} pos [start,end] alias [from,to]
     */
    formatPhrase(phrase, pos, momentFormat){
        let timeRef;
        if (phrase.now){
          timeRef = moment();
          if (phrase.operation === '-'){
            timeRef = timeRef.subtract(phrase.num1, phrase.num1Unit);
          }else if (phrase.operation === '+'){
            timeRef = timeRef.add(phrase.num1, phrase.num1Unit);
          }
          if (phrase.div){
            if (pos === 'from'){
              timeRef = timeRef.startOf(phrase.divUnit);
            }else if (pos === 'to'){
            //   timeRef = timeRef.add(1, 'd').startOf(phrase.divUnit);
              timeRef = timeRef.endOf(phrase.divUnit).add(1, 'd').startOf('d');
            }
          }
          return {
                  txt: timeRef.format(momentFormat),
                  dateObj: {year: timeRef.year() , month: timeRef.month() + 1, day: timeRef.date(), hour: timeRef.hour(), minute: timeRef.minute(), second: timeRef.second()}
                };
        }
        return null;
    }

    parseTimeStringtoObj(str){
    let timeRef = moment(str);
        return {year: timeRef.year() , month: timeRef.month() + 1, day: timeRef.date(), hour: timeRef.hour(), minute: timeRef.minute(), second: timeRef.second()};
    }

    validAbsoluteDate(str, format) {
      return moment([format], str, true).isValid();
    }

    validRelativeDate(str) {
        return !!this.syntax(str);
    }
}
