import {Body, Controller, Post} from '@nestjs/common';
import {ReservationService} from "./reservation.service";
import {DayTimeTable} from "./interfaces/daytimetable.interface";
import {CreateReservationTimetable} from "./interfaces/create-reservation-timetable.interface";

@Controller('reservation')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    @Post('getTimeSlots')
    async getTimeSlots(@Body() createReservationTimetable: CreateReservationTimetable ): Promise<DayTimeTable[]> {
        const {
            start_day_identifier,
            timezone_identifier,
            service_duration,
            days,
            timeslot_interval,
            is_ignore_schedule,
            is_ignore_workhour
        } = createReservationTimetable;

        return this.reservationService.getAbleTimeSlots(
            start_day_identifier,
            timezone_identifier,
            service_duration,
            days,
            timeslot_interval,
            is_ignore_schedule,
            is_ignore_workhour
        )
    }
}
