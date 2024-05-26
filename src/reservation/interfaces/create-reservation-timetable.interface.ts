export interface CreateReservationTimetable {
    // 시작 날짜 식별자 (YYYYMMDD 형식)
    start_day_identifier: string;

    // 시간대 식별자 (Asia/Seoul)
    timezone_identifier: string;

    // 서비스 지속 시간 (단위 초)
    service_duration: number;

    // 예약 가능 일수 (기본값 1, 선택적)
    days?: number;

    // 타임슬롯 간격 (단위 초, 기본값 30분 = 1800초, 선택적)
    timeslot_interval?: number;

    // 스케줄 무시할지 여부 (기본값 false, 선택적)
    is_ignore_schedule?: boolean;

    // 영업시간 무시할지 여부 (기본값 false, 선택적)
    is_ignore_workhour?: boolean;
}