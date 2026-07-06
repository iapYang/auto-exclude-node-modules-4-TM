#!/usr/bin/env node

import { disableTimeMachine, setLowPriorityThrottle } from "./service";

try {
    setLowPriorityThrottle(true);
    disableTimeMachine();
    console.log("postbackup 执行完成");
} catch (error) {
    console.error(`postbackup 执行失败: ${error}`);
    process.exitCode = 1;
}
