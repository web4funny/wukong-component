import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wukong-component';
  rangeTime: string[];
  public lang: string;

  constructor() {
    this.lang = 'zh-cn';
    this.rangeTime = ["now-30m","now"];
  }

   // 触发时间
  timeApplyHandler(event) {
    console.log(event);
  }

  // 刷新时间
  refreshTimeHandler(event) {
    this.timeApplyHandler(event);
    console.log(event);
  }
}
