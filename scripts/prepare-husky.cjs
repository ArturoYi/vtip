/**
 * 仅在仓库根目录且已安装 husky 时注册 Git hooks。
 * 避免作为 npm 依赖安装时因缺少 husky / .git 导致 prepare 失败。
 */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const root = process.cwd()
if (!fs.existsSync(`${root}/.git`) || !fs.existsSync(`${root}/node_modules/husky`)) {
  process.exit(0)
}

const huskyCli = path.join(root, 'node_modules', 'husky', 'bin.js')
const r = spawnSync(process.execPath, [huskyCli], { stdio: 'inherit', cwd: root })
process.exit(r.status ?? 0)
