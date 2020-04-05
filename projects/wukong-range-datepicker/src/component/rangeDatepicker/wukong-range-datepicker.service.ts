
import { Injectable } from "@angular/core";
import { MyLocaleOptions } from "./locale.interface";
const PROVIDER_PICKER_DATE = `PROVIDER_PICKER_DATE`;

@Injectable()
export class WukongRangeDatepickerService {
    private locales = {
        "en": {
            timeLocaleOptions: [
                [ 'Last 2 days',
                  'Last 7 days',
                  'Last 30 days',
                  'Last 90 days',
                  // 'Last 6 months',
                  // 'Last 1 year',
                  // 'Last 2 years',
                  // 'Last 5 years',
                ],
                [
                  'Yesterday',
                  'Day before yesterday',
                  'This day last week',
                  'Previous week',
                  'Previous month',
                  // 'Previous year'
                ],
                [
                  'Today',
                  'Today so far',
                  'This week',
                  'This week so far',
                  'This month',
                  'This month so far',
                  // 'This year',
                  // 'This year so far',
                ],
                [
                  'Last 5 minutes',
                  'Last 15 minutes',
                  'Last 30 minutes',
                  'Last 1 hour',
                  'Last 3 hours',
                  'Last 6 hours',
                  'Last 12 hours',
                  'Last 24 hours'
                ]
            ],
            customRangeTitle: 'Custom range',
            quickRangesTitle: 'Quick ranges',
            fromText: 'From',
            toText: 'To',
            refreshingEvery: 'Refreshing every',
            zoomTooltipMsg: 'ZoomIn Time',
            refreshTooltipMsg: 'Reset Timer ',
            refreshValueOptions: [
                { key: 'off', value: -1},
                // { key: '5s',  value:     5000},
                // { key: '10s', value:    10000},
                { key: '30s', value:    30000},
                { key: '1m',  value:    60000},
                // { key: '5m',  value:   300000},
                { key: '10m', value:   600000},
                // { key: '15m', value:   900000},
                { key: '30m', value:  1800000},
                { key: '1h',  value:  3600000},
                // { key: '2h',  value:  7200000},
                // { key: '1d',  value: 86400000}
            ],
            apply: 'Apply'
        },
        "zh-cn": {
            timeLocaleOptions: [
                [ '过去2天',
                  '过去7天',
                  '过去30天',
                  '过去90天',
                  // '过去6个月',
                  // '过去1年',
                  // '过去2年',
                  // '过去5年',
                ],
                [
                  '昨天',
                  '前天',
                  '上周的这一天',
                  '前一整周',
                  '前一个月',
                  // '前一整年'
                ],
                [
                  '今天',
                  '今天到目前为止',
                  '本周',
                  '本周到目前为止',
                  '本月',
                  '本月到目前为止',
                  // '本年',
                  // '本年到目前为止',
                ],
                [
                  '过去5分钟',
                  '过去15分钟',
                  '过去30分钟',
                  '过去1小时',
                  '过去3小时',
                  '过去6小时',
                  '过去12小时',
                  '过去24小时'
                ]
            ],
            customRangeTitle: '自定义时间范围',
            quickRangesTitle: '快速查询时间范围',
            fromText: '从',
            toText: '至',
            refreshingEvery: '刷新时间',
            zoomTooltipMsg: '时间范围放大',
            refreshTooltipMsg: '重置刷新计时',
            refreshValueOptions: [
                { key: '关闭', value: -1},
                // { key: '5秒',  value:     5000},
                // { key: '10秒', value:    10000},
                { key: '30秒',   value:    30000},
                { key: '1分钟',  value:    60000},
                // { key: '5分钟',  value:   300000},
                { key: '10分钟', value:   600000},
                // { key: '15分钟', value:   900000},
                { key: '30分钟', value:  1800000},
                { key: '1小时',  value:  3600000},
                // { key: '2小时',  value:  7200000},
                // { key: '1天',  value: 86400000}
            ],
            apply: '确 定'
        },
    };

    getLocaleOptions(locale: string): MyLocaleOptions {
        if (locale && this.locales.hasOwnProperty(locale)) {
            // User given locale
            return this.locales[locale];
        }
        // Default: en
        return this.locales["en"];
    }


  saveDate(date){

     localStorage.setItem(PROVIDER_PICKER_DATE,JSON.stringify(date));
  }
  getDate(){

    const jsonItem = localStorage.getItem(PROVIDER_PICKER_DATE) || JSON.stringify([]);
    let date = JSON.parse(jsonItem);
    if(!date || !date.length) date = ["now-30m","now"];

    return date;
  }

}
