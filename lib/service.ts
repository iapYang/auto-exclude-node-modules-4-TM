import { execFileSync } from "child_process";
import { readdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

function runWithSudo(command: string, args: string[]): void {
    execFileSync("sudo", [command, ...args], { stdio: "inherit" });
}

function traverseDirectory(dir: string, nodeModulesPaths: string[]): void {
    const files = readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = join(dir, file.name);
        if (!file.isDirectory()) continue;

        if (file.name === "node_modules") {
            nodeModulesPaths.push(fullPath);
        } else {
            traverseDirectory(fullPath, nodeModulesPaths);
        }
    }
}

export function enableTimeMachine(): void {
    runWithSudo("tmutil", ["enable"]);
}

export function disableTimeMachine(): void {
    runWithSudo("tmutil", ["disable"]);
}

export function setLowPriorityThrottle(enabled: boolean): void {
    runWithSudo("sysctl", [`debug.lowpri_throttle_enabled=${enabled ? 1 : 0}`]);
}

export function refreshExclusions(): void {
    let excludeListData = "";
    try {
        excludeListData = execFileSync(
            "defaults",
            ["read", "/Library/Preferences/com.apple.TimeMachine", "SkipPaths"],
            { encoding: "utf8" },
        );
    } catch (error) {
        console.warn(`读取 Time Machine 旧排除路径失败，将继续添加新路径: ${error}`);
    }
    const excludeList = (excludeListData.match(/"([^"]+)"/g) ?? [])
        .map(path => path.replace(/"/g, ""));

    for (const path of excludeList) {
        console.log(`正在移除旧排除路径: ${path}`);
        try {
            runWithSudo("tmutil", ["removeexclusion", "-p", path]);
        } catch (error) {
            console.error(`移除排除路径时出错: ${error}`);
        }
    }

    const home = homedir();
    const projectDir = join(home, "Project");
    const nodeModulesPaths = [
        join(home, ".gradle", "caches"),
        join(home, ".npm"),
        join(home, "Library", "Caches", "Yarn"),
        join(home, "Library", "pnpm", "store"),
    ];

    console.log(`正在扫描目录: ${projectDir}`);
    traverseDirectory(projectDir, nodeModulesPaths);

    for (const path of nodeModulesPaths) {
        console.log(`正在加入排除路径: ${path}`);
        try {
            runWithSudo("tmutil", ["addexclusion", "-p", path]);
        } catch (error) {
            console.error(`加入排除路径时出错: ${error}`);
        }
    }
}
