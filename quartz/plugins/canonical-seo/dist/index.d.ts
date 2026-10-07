import { QuartzEmitterPlugin } from "@quartz-community/types"

type CanonicalOptions = {
  siteUrl?: string
}

declare const CanonicalPlugin: QuartzEmitterPlugin<CanonicalOptions | undefined>
export { CanonicalPlugin, CanonicalPlugin as Canonical }
export default CanonicalPlugin
