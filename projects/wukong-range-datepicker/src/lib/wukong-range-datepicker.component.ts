
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, OnDestroy, Output, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { UtilService } from '../component/datepicker/services/my-date-picker.util.service';
import { MyLocaleOptions } from './locale.interface';
import { WukongRangeDatepickerService } from './wukong-range-datepicker.service';
// import { I18NService } from '@platform';

declare var window: any;

// 匹配输入的字体
const timeUnit = 'minute(s)?|hour(s)?|day(s)?|week(s)?|month(s)?|year(s)?';
const wordLastREG = new RegExp(`^last\\s*(\\d+)\\s*(${timeUnit})$`, 'i');
const wordThisREG = new RegExp(`^this\\s*(${timeUnit})\\s*(so far)?$`, 'i');
const wordPreviousREG = new RegExp(`^previous\\s?(\\d?)\\s?(${timeUnit})$`, 'i');
// 转译匹配
const previousMap = {
  'yesterday': 'previous 1 day',
  'day before yesterday': 'previous 2 days',
  'this day last week': 'previous 7 days'
};
const thisMap = {
  'today': 'this day',
  'today so far': 'this day so far'
};
const map = Object.assign(previousMap, thisMap);
enum Year {min = 1970, max = moment().year()};

@Component({
  selector: 'wukong-range-date-picker',
  exportAs: "wukongrangedatepicker",
  styleUrls: [`wukong-range-datepicker.component.css`],
  templateUrl: 'wukong-range-datepicker.component.html',
  providers: [UtilService, WukongRangeDatepickerService],
  encapsulation: ViewEncapsulation.None
})

export class WukongRangeDatepickerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild("refreshRef", {read: ElementRef}) refreshRef: ElementRef;
  @ViewChild("timeBarRef", {read: ElementRef}) timeBarRef: ElementRef;
  @Output() refreshRangeTime: EventEmitter<any> = new EventEmitter<any>();
  @Output() applySubmit: EventEmitter<any> = new EventEmitter<any>();
  public _locale = 'zh-cn'; // 时间picker 显示 中文
  @Input()
  set locale(value){
    if (this._locale === value) {
      return;
    }
    this._locale = value;
    this.setLocaleOptions();
    this.aliasRelativeTimeMap = [];
    this.generateAliasRelativeTime();
    this.clockMessage();
  }

  get locale() {
    return this._locale;
  }
  @Input() initRangeTime: Array<string>;
  // [from] 显示时间
  public fromTimeTxt = '';
  // [to] 显示时间
  public toTimeTxt = '';
  // [from] long time 数字时间
  public fromLongTime: number;
  // [to]   long time 数字时间
  public toLongTime: number;
  // 更新相对时间选色器
  public toUpdateRelativeSelectTime = null;
  public fromUpdateRelativeSelectTime = null;
  // 是否是相对时间
  public fromIsRelativeTime = true;
  public toIsRelativeTime = true;
  public fromInvalid = false;
  public toInvalid = false;
  // 时间控件配置
  public myFromDatePickerOptions = {
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    showTodayBtn: false,
    selectorHeight: '220px',
    selectorWidth: '220px',
    width: '220px',
    showClearDateBtn: false,
    satHighlight: false,
    sunHighlight: false,
    minYear: <number> Year.min,
    maxYear: <number> Year.max,
  };
  public myToDatePickerOptions = {
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    showTodayBtn: false,
    selectorHeight: '220px',
    selectorWidth: '220px',
    width: '220px',
    showClearDateBtn: false,
    satHighlight: false,
    sunHighlight: false,
    minYear: <number> Year.min,
    maxYear: <number> Year.max,
  };
  // 相对时间列表
  public timeOptions = [
    ['Last 2 days',
      'Last 7 days',
      'Last 30 days',
      'Last 90 days',
      'Last 6 months',
      'Last 1 year',
      'Last 2 years',
      'Last 5 years',
    ],
    [
      'Yesterday',
      'Day before yesterday',
      'This day last week',
      'Previous week',
      'Previous month',
      'Previous year'
    ],
    [
      'Today',
      'Today so far',
      'This week',
      'This week so far',
      'This month',
      'This month so far',
      'This year',
      'This year so far',
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
  ];
  public activeList = [new Array(8).fill(false), new Array(6).fill(false), new Array(8).fill(false), new Array(8).fill(false)];
  public prevActive = [0, 0];
  public aliasRelativeTimeMap: Array<any> = [];
  // 刷新时间 参数
  // public refreshValueOptions = [
  //   { key: 'off', value: -1},
  //   { key: '5s',  value:     5000},
  //   { key: '10s', value:    10000},
  //   { key: '30s', value:    30000},
  //   { key: '1m',  value:    60000},
  //   { key: '5m',  value:   300000},
  //   { key: '15m', value:   900000},
  //   { key: '30m', value:  1800000},
  //   { key: '1h',  value:  3600000},
  //   { key: '2h',  value:  7200000},
  //   { key: '1d',  value: 86400000}
  // ];
  public refreshIndex: number;
  public refreshValue = -1;
  // public saveValue = -1;
  private timerId: number;
  public isRunning = false;
  public OpenTimeBar = false;

  public zoomUnit = 0; // 默认放大时间单位 为1天
  public zoomCombo = 0; // 连击次数
  public clockBoard: string; // 显示面板
  public refreshBoard: string;
  public localeOpts: MyLocaleOptions; // locale字段表
  public debounce = null;
  public activeTimerIndex = 0;

  public refreshSetting = false;
  localeOptionContent;


  constructor(private utilService: UtilService, private localeRangeService: WukongRangeDatepickerService, /*private _i18NService: I18NService*/) {
    // let mapLang = {'en': 'en', 'zh': 'zh-cn'};
    // this.locale = mapLang[this._i18NService.currentLang];
    // this._i18NService.onLangChange.subscribe(trans => {
    //   this.locale = mapLang[trans.lang];
    //   this.setLocaleOptions();
    //   this.aliasRelativeTimeMap = [];
    //   this.generateAliasRelativeTime();
    //   this.clockMessage();
    // });
  }

  ngOnInit() {
    this.initRangeTime = this.localeRangeService.getDate();
    if (!this.initRangeTime) {
      this.fromIsRelativeTime = true;
      this.toIsRelativeTime = true;
      this.clockBoard = this.timeOptions[this.prevActive[0]][this.prevActive[1]];
      this.activeList[this.prevActive[0]][this.prevActive[1]] = true; // 初始 active
      const resolver = this.relativeMomentResolver(this.clockBoard);
      this.fromTimeTxt = resolver.fromKey;
      this.toTimeTxt = resolver.toKey;
    } else {
      this.fromTimeTxt = this.initRangeTime[0];
      this.toTimeTxt = this.initRangeTime[1];
      setTimeout(() => {
        this.clockMessage();
        this.setZoomUnit();
      });
    }
    // this.initPatchEvent(); 
    this.generateAliasRelativeTime();
    this.toggleTouchOutsideEvent(true);
    this.debounce = _.debounce(() => { this.applySubmit.emit(this.outputFormat()); }, 150);
    this.setLocaleOptions();
  }

  ngOnChanges() {
    this.setLocaleOptions();
  }

  ngOnDestroy() {
    this.stopRefreshController();
    this.toggleTouchOutsideEvent(false);
  }

  ngAfterViewInit() {
    setTimeout( ( ) => { this.debounce(); }, 200);
  }
  // localeOptionContent;
  /**
   * locale 设置语言类型
   */
  setLocaleOptions(): void {
    const opts = this.localeRangeService.getLocaleOptions(this.locale);
    this.localeOpts = opts;
  }
  // ==================相对时间 解析功能=============================
  relativeChooseClick(event, i, k) {
    event.preventDefault();
    // 获取内容
    const content = this.timeOptions[i][k];
    this.localeOptionContent = content;
    // 解析内容 翻译为 相对时间
    const resolver = this.relativeMomentResolver(content);
    this.fromTimeTxt = resolver.fromKey;
    this.toTimeTxt = resolver.toKey;
    this.activeClassSwap(i, k);
    this.OpenTimeBar = false;
    this.debounce();
  }


  activeClassSwap(i, k) {
    this.activeList[this.prevActive[0]][this.prevActive[1]] = false;
    this.activeList[i][k] = true;
    this.prevActive[0] = i;
    this.prevActive[1] = k;
  }

  cancelActiveClass() {
    this.activeList[this.prevActive[0]][this.prevActive[1]] = false;
  }


  applySubmitHandle() {
    if (!this.toInvalid && !this.fromInvalid) {
      this.applySubmit.emit(this.outputFormat()); // 当提交条件时候
      this.OpenTimeBar = false;
    }
  }

  keyMap(str) {
    const _str = str.toLowerCase().trim();
    if (map[_str]) {
      return map[_str.toLowerCase()];
    }
    return _str;
  }
  // minute 与 month 的补丁
  patch(minOrMon) {
    const firstWord = minOrMon.substring(0, 1);
    if (firstWord === 'm') {
      return minOrMon.match(/^mon/i) ? 'M' : 'm';
    }
    return firstWord;
  }

  relativeMomentResolver(content: string) {
    let reg;
    let result;
    let firstWord;
    let num;
    const str = this.keyMap(content);
    if (reg = this.likeArray(str.match(wordLastREG))) {
      firstWord = this.patch(reg[2]);
      num = reg[1];
      result = {
        fromKey: `now-${num}${firstWord}`,
        toKey: `now`,
      };
    } else if (reg = this.likeArray(str.match(wordThisREG))) {
      firstWord = this.patch(reg[1]);
      result = {
        fromKey: `now/${firstWord}`
      };
      if (reg[2]) {
        result.toKey = `now`;
      } else {
        result.toKey = `now/${firstWord}`;
      }
    } else if (reg = this.likeArray(str.match(wordPreviousREG))) {
      firstWord = this.patch(reg[2]);
      num = reg[1];
      result = {
        fromKey: `now-${num}${firstWord}/${firstWord}`,
        toKey: `now-${num}${firstWord}/${firstWord}`,
      };
    }
    // this.zoomUnit = `${num ? num : 1}|${firstWord}`;
    return result;
  }

  likeArray(arr) {
    if (!arr || arr.length === 0) {
      return null;
    }
    const newArr = [];
    let i = 0;
    for (let item in arr) {
      if (i++ === arr.length) {
        break;
      }
      if (arr[item]) {
        newArr.push(arr[item]);
      } else if (arr[item] === '') {
        newArr.push("1");
      }
    }
    return newArr;
  }

  // 起始时间改变
  fromDatepickerChanged(data) {
    this.fromInvalid = !data;
    if (!data) { return; }
    // if (!data.isRelative && !this.toIsRelativeTime) {
    //   this.refreshValue = -1; // 刷新select option选择 空
    //   this.stopRefreshController();
    // } else {
    //   this.refreshValue = this.saveValue;
    // }
    if (data.isRelative && data.date.relativeTime) {
      this.fromTimeTxt = data.date.relativeTime;
    }
    this.fromIsRelativeTime = data.isRelative;
    this.fromLongTime = data.formatted;
  }
  // 结束时间改变
  toDatepickerChanged(data) {
    this.toInvalid = !data;
    if (!data) { return; }
    // if (!data.isRelative && !this.fromIsRelativeTime) {
    //   this.refreshValue = -1;
    //   this.stopRefreshController();
    // } else {
    //   this.refreshValue = this.saveValue;
    // }
    if (data.isRelative && data.date.relativeTime) {
      this.toTimeTxt = data.date.relativeTime;
    }
    this.toLongTime = data.formatted;
    this.toIsRelativeTime = data.isRelative;
  }

  // =====================refresh==========================
  // 启动定时器推出时间范围
  runRefreshController() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timerId = window.setInterval(() => {
        // console.log('runRefreshController');
        this.refreshRangeTime.emit(this.outputFormat());
      }, this.refreshValue);
    }
  }

  stopRefreshController() {
    window.clearInterval(this.timerId);
    this.isRunning = false;
  }
  // 重置刷新控制器
  resetRefreshController() {
    if (this.refreshValue > 0) {
      this.stopRefreshController();
      this.runRefreshController();
    } else {
      this.stopRefreshController();
    }
  }

  // 重置刷新控制器
  resetRefreshImmediatelyController() {
    this.refreshRangeTime.emit(this.outputFormat());
    if (this.refreshValue > 0) {
      this.stopRefreshController();
      this.runRefreshController();
    } else {
      this.stopRefreshController();
    }
  }
  // =====================refresh==========================

  timebarShowClick(event) {
    event.stopPropagation();
    this.OpenTimeBar = !this.OpenTimeBar;
  }

  // =====================zoom 功能==========================
  // zoom Event
  zoomHandle() {
    if (!this.zoomLimitInSection('-','+')) { return; }
    const unit = this.zoomComboCounter(true);
    const num = this.zoomUnit;
    this.fromTimeTxt = moment(this.fromLongTime).subtract(num * unit, 'seconds').format(this.myFromDatePickerOptions.dateFormat);
    this.toTimeTxt = moment(this.toLongTime).add(num * unit, 'seconds').format(this.myToDatePickerOptions.dateFormat);
    setTimeout(() => { this.applySubmit.emit(this.outputFormat()); }, 0); // 当提交条件时候
  }
  // 已当前 combo次数 为单位 连续左移时间轴, 增加单位(倍数) 为 2^combo
  removeLeftHandle() {
    if (!this.zoomLimitInSection('+','+')) { return; }
    const unit = this.zoomComboCounter(false);
    const num = this.zoomUnit;
    this.fromTimeTxt = moment(this.fromLongTime).add(num * unit, 'seconds').format(this.myFromDatePickerOptions.dateFormat);
    this.toTimeTxt = moment(this.toLongTime).add(num * unit, 'seconds').format(this.myToDatePickerOptions.dateFormat);
    setTimeout(() => { this.applySubmit.emit(this.outputFormat()); }, 0); // 当提交条件时候
  }
  // 已当前 combo次数 为单位 连续右移时间轴, 减小单位(倍数) 为 2^combo
  removeRightHandle() {
    if (!this.zoomLimitInSection('-','-')) { return; }
    const unit = this.zoomComboCounter(false);
    const num = this.zoomUnit;
    this.fromTimeTxt = moment(this.fromLongTime).subtract(num * unit, 'seconds').format(this.myFromDatePickerOptions.dateFormat);
    this.toTimeTxt = moment(this.toLongTime).subtract(num * unit, 'seconds').format(this.myToDatePickerOptions.dateFormat);
    setTimeout(() => { this.applySubmit.emit(this.outputFormat()); }, 0); // 当提交条件时候
  }
  /**
   *  点击大小this.zoomCombo 指数倍增加
   * @param{boolean} increase false 不增加连击次数
   */
  zoomComboCounter(increase) {
    const zoomNum = Math.pow(2, this.zoomCombo);
    if (increase) { this.zoomCombo++; }
    return zoomNum;
  }

  zoomLimitInSection(startSign, endSign) {
    const unit = this.zoomComboCounter(false);
    const num = this.zoomUnit;
    let startYear, endYear;
    if(startSign === '+') {
      startYear = moment(this.fromLongTime).add(num * unit, 'seconds').year();
    } else if(startSign === '-'){
       startYear = moment(this.fromLongTime).subtract(num * unit, 'seconds').year();
    }

    if(endSign === '+') {
      endYear = moment(this.toLongTime).add(num * unit, 'seconds').year();
    } else if(endSign === '-'){
      endYear = moment(this.toLongTime).subtract(num * unit, 'seconds').year();
    }
    return startYear >= Year.min && endYear <= Year.max;
  }

  // ==============解析navbar 时间显示==================
  clockMessage() {
    if (!this.fromIsRelativeTime && !this.toIsRelativeTime) {
      this.cancelActiveClass();
      this.clockBoard = `${moment(this.fromLongTime).format('YYYY-MM-DD HH:mm:ss')} ${this.localeOpts.toText} ${moment(this.toLongTime).format('YYYY-MM-DD HH:mm:ss')}`;
    } else if (this.fromIsRelativeTime && !this.toIsRelativeTime) {
      this.cancelActiveClass();
      this.clockBoard = `${this.fromTimeTxt} ${this.localeOpts.toText} ${moment(this.toLongTime).format('YYYY-MM-DD HH:mm:ss')}`;
    } else if (!this.fromIsRelativeTime && this.toIsRelativeTime) {
      this.cancelActiveClass();
      this.clockBoard = `${moment(this.fromLongTime).format('YYYY-MM-DD HH:mm:ss')} ${this.localeOpts.toText} ${this.toTimeTxt}`;
    } else if (this.fromIsRelativeTime && this.toIsRelativeTime) {
      const alias = `${this.fromTimeTxt}#${this.toTimeTxt}`;
      const data = this.aliasRelativeTimeMap.find((item) => {
        return item.alias === alias;
      });
      // console.log('data ==>', data);
      if (!data) {
        this.cancelActiveClass();
        this.clockBoard = `${this.fromTimeTxt} ${this.localeOpts.toText} ${this.toTimeTxt}`;
      } else {
        this.activeClassSwap(data.i, data.k);
        this.clockBoard = `${data.locale}`;
        this.localeOptionContent = data.key
      }
    }
  }

  updateTime() {
    const syntax = this.utilService.syntax;
    const formatPhrase = this.utilService.formatPhrase;
    let from;
    let to;
    if (this.fromIsRelativeTime) {
      from = formatPhrase(syntax(this.fromTimeTxt), 'from', this.myFromDatePickerOptions.dateFormat);
      this.fromLongTime = from.txt;
      this.fromUpdateRelativeSelectTime = from.dateObj; // 更新选色器 日期
    }
    if (this.toIsRelativeTime) {
      to = formatPhrase(syntax(this.toTimeTxt), 'to', this.myToDatePickerOptions.dateFormat);
      this.toLongTime = to.txt;
      this.toUpdateRelativeSelectTime = to.dateObj; // 更新选色器 日期
    }
  }

  // ==============output formatTime==================
  outputFormat() {
    this.updateTime();
    this.clockMessage();
    this.setZoomUnit(); // 重置 zoom粒度
    this.saveSelectedDate([this.fromTimeTxt, this.toTimeTxt]);
    return {
      fromIsRelativeTime: this.fromIsRelativeTime,
      toIsRelativeTime: this.toIsRelativeTime,
      fromFormatTime: this.fromLongTime,
      localeOptionContent: this.localeOptionContent,
      raw: { from: this.fromTimeTxt, to: this.toTimeTxt },
      toFormatTime: this.toLongTime
    };
  }

  generateAliasRelativeTime() {
    this.timeOptions.forEach((item, i) => {
      return item.forEach((key, k) => {
        const resolver = this.relativeMomentResolver(key);
        this.aliasRelativeTimeMap.push({ key: key, locale: this.localeOpts.timeLocaleOptions[i][k], alias: `${resolver.fromKey}#${resolver.toKey}`, active: false, i: i, k: k });
      });
    });
  }

  switchTimer(i, item) {
    this.activeTimerIndex = i;
    this.refreshValue = item.value;
    this.resetRefreshController();
    this.refreshSetting = false;
    event.stopPropagation();
  }

  setZoomUnit() {
    this.zoomCombo = 0;
    this.zoomUnit = (moment(this.toLongTime).valueOf() - moment(this.fromLongTime).valueOf()) / 1000 / 2;
  }

  // initPatchEvent() {
  //   if ($ && $('.content .content-header') && $('.content .content-header').length > 0 ) {
  //     $('.content .content-header').click((event) => {
  //       if (this.OpenTimeBar) {
  //         this.OpenTimeBar = false;
  //       }
  //       event.preventDefault();
  //     });
  //   }
  // }

  // 时间日期 下拉框禁止冒泡
  datepickerBox(event) {
    event.stopPropagation();
    // event.preventDefault();
  }

  updateToolTipTime() {
    this.updateTime();
  }

  private saveSelectedDate(date: any) {
    setTimeout(() => this.localeRangeService.saveDate(date), 120);
  }

  clickRefreshSetting() {
    this.refreshSetting = !this.refreshSetting;
    event.preventDefault();
  }

  toggleTouchOutsideEvent(enabled) {
    let eventTogglerName = enabled
      ? document.addEventListener
        ? 'addEventListener'
        : 'attachEvent'
      : document.removeEventListener
        ? 'removeEventListener'
        : 'detachEvent';
    let pref = document.addEventListener ? '' : 'on';

    document[eventTogglerName](pref + 'touchstart', this.handleTouchOutsideTimeRefresh.bind(this));
    document[eventTogglerName](pref + 'mousedown', this.handleTouchOutsideTimeRefresh.bind(this));

    // document[eventTogglerName](pref + 'touchstart', this.handleTouchOutsideTimeBar.bind(this));
    // document[eventTogglerName](pref + 'mousedown', this.handleTouchOutsideTimeBar.bind(this));
  }

  handleTouchOutsideTimeRefresh(event) {
    // handle touch outside on ios to dismiss menu
    if (this.refreshRef && !this.refreshRef.nativeElement.contains(event.target)) {
      this.refreshSetting = false;
    }
  }

  handleTouchOutsideTimeBar(event) {
    // handle touch outside on ios to dismiss menu
    if (this.timeBarRef && !this.timeBarRef.nativeElement.contains(event.target)) {
      this.OpenTimeBar = false;
    }
  }
}


