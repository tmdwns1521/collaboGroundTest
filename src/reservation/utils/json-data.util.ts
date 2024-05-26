import * as fs from 'fs';
import * as path from 'path';
import {WorkHour} from "../interfaces/work-hour.interface";
import {Event} from "../interfaces/event.interface";

export const eventsJson = (): Event[] => {
    const eventsJsonPath = path.resolve(process.cwd(), 'src/data/events.json');
    return JSON.parse(fs.readFileSync(eventsJsonPath, 'utf-8'));
};

export const workHoursJson = (): WorkHour[] => {
    const worksHoursPath = path.resolve(process.cwd(), 'src/data/workHours.json');
    return JSON.parse(fs.readFileSync(worksHoursPath, 'utf-8'));
}