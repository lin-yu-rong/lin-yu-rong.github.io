import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { withOgImageFonts } from "./quartz/plugins/emitters/ogImageFonts"

const config = await loadQuartzConfig()
config.plugins.emitters = config.plugins.emitters.map(withOgImageFonts)
export default config
export const layout = await loadQuartzLayout()
