import { Injectable } from '@nestjs/common';
import { DayTimeTable } from "./interfaces/daytimetable.interface";
import {eventsJson, workHoursJson} from "./utils/json-data.util";
import * as moment from 'moment-timezone';
import {WorkHour} from "./interfaces/work-hour.interface";
import {Event} from "./interfaces/event.interface";

@Injectable()
export class ReservationService {

    private eventJson: Event[] = eventsJson();
    private workHoursJson: WorkHour[] = workHoursJson();

    /**
     * STEP 1
     * DayTimeTable 리스트 생성 함수
     * @param startDayIdentifier
     * @param timezoneIdentifier
     * @param serviceDuration
     * @param days
     * @param timeslotInterval
     */
    async createDayTimeTable(startDayIdentifier: string, timezoneIdentifier: string, serviceDuration: number, days: number, timeslotInterval: number) {
        // 시작 날짜를 해당 타임존으로 설정하여 moment 객체 생성
        const startDate = moment.tz(startDayIdentifier, 'YYYYMMDD', timezoneIdentifier);
        // 생성된 일정을 저장할 배열 초기화
        const dayTimeTableList: DayTimeTable[] = [];

        // 주어진 일 수에 따라 각 날짜에 대한 일정을 생성
        for (let day = 0; day < days; day++) {
            // 현재 날짜를 시작 날짜 기준으로 계산하여 설정
            const currentDay = startDate.clone().add(day, 'days');
            // 현재 날짜의 요일을 확인
            const dayOfWeek = currentDay.day() + 1;
            // console.log('요일 :::', dayOfWeek);
            // 현재 날짜의 요일에 해당하는 근무 시간을 찾는다. 근무 시간이 없으면 휴무로 설정
            const workHour = this.workHoursJson.find((wh: WorkHour) => wh.weekday === dayOfWeek) || { is_day_off: true };
            // console.log('workHour ::: ', workHour);

            // 현재 날짜의 일정을 저장할 객체를 초기화
            const timeTable: DayTimeTable = {
                // 현재 날짜의 시작 시간을 타임스탬프로 변환
                start_of_day: currentDay.startOf('day').unix(),
                // 현재 날짜의 일 수 저장
                day_modifier: day,
                // 현재 날짜가 휴무 여부에 따라 일정 설정
                is_day_off: workHour.is_day_off,
                // 현재 날짜의 가능한 타임슬롯을 저장할 배열 초기화
                timeslots: [],
            }

            // 만약 현재 날짜가 휴무일이 아니라면, 가능한 타임슬롯을 계산하여 추가
            if (!workHour.is_day_off) {
                // 근무 시간과 종료 시간을 설정
                const openTime = currentDay.clone().startOf('day').add((workHour as WorkHour).open_interval, 'seconds');
                // console.log('openTime::: ', openTime);
                const closeTime = currentDay.clone().startOf('day').add((workHour as WorkHour).close_interval, 'seconds');
                // console.log('closeTime::: ', closeTime);
                let startTime = openTime.clone();

                // 타임슬롯 간격에 따라 가능한 타임슬롯을 계산하여 추가
                while (startTime.isBefore(closeTime)) {
                    const endTime = startTime.clone().add(serviceDuration, 'seconds');
                    // console.log('startTime :::', startTime);
                    // console.log('endTime :::', endTime);
                    // 종료 시간이 근무 종료 시간을 넘어가면 더 이상 타임슬롯을 추가하지 않음
                    if (endTime.isAfter(closeTime)) break;
                    // 시작 시간과 종료 시간을 타임스탬프로 변환하여 타임슬롯에 추가
                    timeTable.timeslots.push({ begin_at: startTime.unix(), end_at: endTime.unix() });
                    // 다음 타임슬롯의 시작 시간을 설정
                    startTime.add(timeslotInterval, 'seconds');
                }
            }

            // 현재 날짜의 일정을 일정 목록에 추가
            dayTimeTableList.push(timeTable);
        }

        // 생성된 일정 목록 반환
        return dayTimeTableList;
    }

    /**
     * STEP 2
     * 이벤트와 겹치지 않는 타임슬롯을 필터링 하는 함수
     * @param dayTimeTableList
     * @param isIgnoreSchedule
     */
    checkEvents(dayTimeTableList: DayTimeTable[], isIgnoreSchedule: boolean):DayTimeTable[]  {
        // 스케줄을 무시해야 하는 경우, 필터링 없이 원본 리스트를 반환
        if (isIgnoreSchedule) return dayTimeTableList;

        // 각 DayTimeTable 객체를 순회하며 타임슬롯을 필터링
        return dayTimeTableList.map(timetable => {
            // 현재 DayTimeTable의 타임슬롯 중 이벤트와 겹치지 않는 타임슬롯을 필터링
            const filteredTimeslots = timetable.timeslots.filter(slot => {
                // 이벤트와 타임슬롯이 겹치는지 확인
                return !this.eventJson.some((event: Event) => {
                    // 타임슬롯이 이벤트의 시작 시간보다 늦거나 끝나는 시간이 이벤트의 시작 시간보다 빠르면 겹치지 않음
                    return !(slot.end_at < event.begin_at || slot.begin_at > event.end_at);
                });
            });


            // 필터링된 타임슬롯을 포함하는 새로운 DayTimeTable 객체를 반환
            return { ...timetable, timeslots: filteredTimeslots };
        });
    }

    /**
     * STEP3
     * 근무 유무 확인해서 DayTimeTable 필터링 하는 함수
     * @param dayTimeTableList
     * @param isIgnoreWorkHour
     */
    checkWorkHours(dayTimeTableList: DayTimeTable[], isIgnoreWorkHour: boolean):DayTimeTable[]  {
        // 근무를 무시해야 하는 경우, 필터링 없이 원본 리스트 반환
        if (isIgnoreWorkHour) return dayTimeTableList;

        // 각 DayTimeTable 객체의 근무시간들을 확인
        return dayTimeTableList.map(timetable => {
            // 근무하지 않는 날이면, timeslots를 빈 배열로 설정
            if (timetable.is_day_off) return { ...timetable, timeslots: [] };

            // 근무하는 날이면, 기존 DayTimeTable 객체를 그대로 반환
            return timetable;
        })
    }

    async getAbleTimeSlots(startDayIdentifier: string, timezoneIdentifier: string, serviceDuration: number, days: number, timeslotInterval: number, isIgnoreSchedule: boolean, isIgnoreWorkhour: boolean) {
        // 주어진 파라미터를 기반으로 DayTimeTable 리스트 생성
        let dayTimeTableList: DayTimeTable[] = await this.createDayTimeTable(startDayIdentifier, timezoneIdentifier, serviceDuration, days, timeslotInterval);

        // 이벤트와 겹치지 않는 타임슬롯 필터링
        dayTimeTableList = this.checkEvents(dayTimeTableList, isIgnoreSchedule);

        // 근무시간을 반영하여 타임슬롯 필터링
        dayTimeTableList = this.checkWorkHours(dayTimeTableList, isIgnoreWorkhour);

        return dayTimeTableList;
    }
}
