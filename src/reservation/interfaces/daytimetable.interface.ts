import { Timeslot } from "./timeslot.interface";

export interface DayTimeTable {
    // 해당 날짜의 시작 시간의 타임스탬프
    start_of_day: number;

    // 시작 날짜로부터의 일 수
    day_modifier: number;

    // 해당 날짜가 휴일인지 여부
    is_day_off: boolean;

    // 해당 날짜의 예약 가능한 타임슬롯 배열
    timeslots: Timeslot[];
}