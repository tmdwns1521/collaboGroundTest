export interface Event {
    // 이벤트 시작 시간 타임스탬프
    begin_at: number;

    // 이벤트 종료 시간 타임스탬프
    end_at: number;

    // 이벤트가 생성된 시간 타임스탬프
    created_at: number;

    // 이벤트가 마지막으로 업데이트된 시간 타임스탬프
    updated_at: number;
}