#!/usr/bin/env node

import { enableTimeMachine, refreshExclusions, setLowPriorityThrottle } from "./service";

try {
    enableTimeMachine();
    refreshExclusions();
    setLowPriorityThrottle(false);
    console.log("prebackup 执行完成");
} catch (error) {
    console.error(`prebackup 执行失败: ${error}`);
    process.exitCode = 1;
}
