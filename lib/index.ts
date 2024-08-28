import { execSync } from "child_process";
import { readdirSync } from "fs";
import { join, resolve } from "path";

let excludeList = [] as string[];

try {
    const excludeListDataBuffer = execSync("defaults read /Library/Preferences/com.apple.TimeMachine SkipPaths");

    const excludeListData = excludeListDataBuffer.toString();

    console.log("excludeListData", excludeListData);

    // 使用正则表达式提取路径
    excludeList = (excludeListData.match(/"([^"]+)"/g) ?? [] as string[]).map(path => path.replace(/"/g, ''));

    console.log("excludeList", excludeList);
} catch (error) {
    console.log("error", error);
}

for (const path of excludeList) {
    console.log(`正在排除路径: ${path}`);

    try {
        execSync(`tmutil removeexclusion -p ${path}`);

        console.log(`已排除路径: ${path}`);
    } catch (error) {
        console.error(`排除路径时出错: ${error}`);
    }
}

const dir = resolve(__dirname, "../../");

console.log(dir);

const nodeModulesPaths: string[] = [];

traverseDirectory(dir, nodeModulesPaths);

for (const nodeModulesPath of nodeModulesPaths) {
    console.log(`正在加入路径: ${nodeModulesPath}`);

    try {
        execSync(`tmutil addexclusion -p ${nodeModulesPath}`);

        console.log(`已加入路径: ${nodeModulesPath}`);
    } catch (error) {
        console.error(`加入路径时出错: ${error}`);
    }
}

// 递归遍历文件夹
function traverseDirectory(dir: string, nodeModulesPaths: string[] = []) {
    const files = readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = join(dir, file.name);

        if (file.isDirectory()) {
            if (file.name === 'node_modules') {
                nodeModulesPaths.push(fullPath);
            } else {
                // 如果不是node_modules文件夹，继续递归遍历
                traverseDirectory(fullPath, nodeModulesPaths);
            }
        }
    }
}
