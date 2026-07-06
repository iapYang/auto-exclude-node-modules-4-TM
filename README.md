# auto-exclude-node-modules-4-TM

为 Time Machine 备份刷新开发缓存和 `node_modules` 排除项。

```bash
pnpm run link
prebackup
# Time Machine 备份完成后
postbackup
```

- `prebackup`：启用 Time Machine、刷新 `~/Project` 下的排除项，并关闭低优先级节流。
- `postbackup`：恢复低优先级节流，并禁用 Time Machine。
- 两个命令会通过 `sudo` 执行需要管理员权限的系统命令。

卸载全局命令：

```bash
pnpm run unlink
```
