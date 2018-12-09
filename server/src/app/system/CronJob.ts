"use strict";

import {Job, RecurrenceRule, RecurrenceSpecDateRange, RecurrenceSpecObjLit} from "node-schedule";

export interface CronJob {

    setJob(job: Job): void;
    getRule(): RecurrenceRule | RecurrenceSpecDateRange | RecurrenceSpecObjLit | Date | string;
    execute(): void;

}