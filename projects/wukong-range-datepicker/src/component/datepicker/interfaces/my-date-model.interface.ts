import { IMyDate } from "./my-date.interface";

export interface IMyDateModel {
    date: IMyDate;
    isRelative?: Boolean;
    jsdate: Date;
    formatted: string;
    epoc: number;
}
