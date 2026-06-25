import { FilePath, QUARTZ, joinSegments } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import fs from "fs"
import { glob } from "../../util/glob"
import { dirname } from "path"

export const Static: QuartzEmitterPlugin = () => ({
  name: "Static",
  async *emit({ argv, cfg }) {
    const staticPath = joinSegments(QUARTZ, "static")
    // 排除 _root 子目录（它们 emit 到 public 根而不是 public/static）
    const ignorePatterns = [...cfg.configuration.ignorePatterns, "_root/**"]
    const fps = await glob("**", staticPath, ignorePatterns)
    const outputStaticPath = joinSegments(argv.output, "static")
    await fs.promises.mkdir(outputStaticPath, { recursive: true })
    for (const fp of fps) {
      const src = joinSegments(staticPath, fp) as FilePath
      const dest = joinSegments(outputStaticPath, fp) as FilePath
      await fs.promises.mkdir(dirname(dest), { recursive: true })
      await fs.promises.copyFile(src, dest)
      yield dest
    }

    // 特殊处理：quartz/static/_root/* 文件 emit 到 public 根
    // 用于 robots.txt 等必须放在域名根的文件
    const rootSrcPath = joinSegments(staticPath, "_root")
    try {
      await fs.promises.access(rootSrcPath)
      const rootFps = await glob("**", rootSrcPath, cfg.configuration.ignorePatterns)
      for (const fp of rootFps) {
        const src = joinSegments(rootSrcPath, fp) as FilePath
        const dest = joinSegments(argv.output, fp) as FilePath
        await fs.promises.mkdir(dirname(dest), { recursive: true })
        await fs.promises.copyFile(src, dest)
        yield dest
      }
    } catch {
      // _root 目录不存在，跳过
    }
  },
  async *partialEmit() {},
})
