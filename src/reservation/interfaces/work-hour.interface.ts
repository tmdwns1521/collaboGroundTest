export interface WorkHour {
    // 하루 영업 종료 시간의 초 단위
    close_interval: number;

    // 해당 요일의 영업 여부를 나타내는 플래그 ( true: 휴무, false, 영업)
    is_day_off: boolean;

    // 요일을 나타내는 키
    key: string;

    // 하루 영업 시작 시간의 단위 초
    open_interval: number;

    // 요일을 숫자로 나타낸 값 (1: 일요일, 2월요일, ..., 7: 토요일)
    weekday: number;
}