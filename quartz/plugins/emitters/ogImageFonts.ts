import { CustomOgImagesEmitterName } from "@quartz-community/og-image"
import { createHash } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import type { BuildCtx } from "../../util/ctx"
import type { QuartzEmitterPluginInstance } from "../types"

const fontName = "Noto Sans CJK SC"
const fontSource =
  "https://raw.githubusercontent.com/notofonts/noto-cjk/Sans2.004/Sans/OTF/SimplifiedChinese"
const fontFiles = [
  ["Regular", 400, "2c76254f6fc379fddfce0a7e84fb5385bb135d3e399294f6eeb6680d0365b74b"],
  ["Bold", 700, "b5f0d1a190a7f9b43c310a8850630af12553df32c4c050543f9059732d9b4c0a"],
] as const

async function prepareFontCache() {
  // og-image 0.1.1 reads this cache before looking up a font in Google Fonts.
  // Cache the full fonts so the renderer gets all glyphs instead of a CSS subset.
  const cache = join("quartz", ".quartz-cache", "fonts")
  await mkdir(cache, { recursive: true })
  await Promise.all(
    fontFiles.map(async ([style, weight, checksum]) => {
      const destination = join(cache, `${fontName.replaceAll(" ", "+")}-${weight}`)
      const digest = (data: Buffer) => createHash("sha256").update(data).digest("hex")
      const cached = await readFile(destination).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error
      })
      if (cached && digest(cached) === checksum) return

      const response = await fetch(`${fontSource}/NotoSansCJKsc-${style}.otf`, {
        signal: AbortSignal.timeout(60_000),
      })
      if (!response.ok)
        throw new Error(`Cannot download ${fontName} ${style}: HTTP ${response.status}`)
      const data = Buffer.from(await response.arrayBuffer())
      if (digest(data) !== checksum) throw new Error(`Invalid checksum for ${fontName} ${style}`)

      const temporary = `${destination}.${randomUUID()}`
      await writeFile(temporary, data)
      await rename(temporary, destination)
    }),
  )
}

export function withOgImageFonts(
  emitter: QuartzEmitterPluginInstance,
): QuartzEmitterPluginInstance {
  if (emitter.name !== CustomOgImagesEmitterName) return emitter

  let fontCache: Promise<void> | undefined
  const imageContext = async (ctx: BuildCtx): Promise<BuildCtx> => {
    fontCache ??= prepareFontCache().catch((error) => {
      fontCache = undefined
      throw error
    })
    await fontCache
    const { configuration } = ctx.cfg
    const { theme } = configuration
    const typography = { ...theme.typography, header: fontName, body: fontName }
    return {
      ...ctx,
      cfg: { ...ctx.cfg, configuration: { ...configuration, theme: { ...theme, typography } } },
    }
  }

  const { partialEmit } = emitter
  return {
    ...emitter,
    async *emit(ctx, content, resources) {
      yield* await emitter.emit(await imageContext(ctx), content, resources)
    },
    partialEmit:
      partialEmit &&
      async function* (ctx, content, resources, changes) {
        yield* (await partialEmit(await imageContext(ctx), content, resources, changes)) ?? []
      },
  }
}
