import { h } from "preact"

// src/index.ts

const CanonicalPlugin = (opts) => {
  const siteUrl = (opts?.siteUrl ?? "https://lin-yu-rong.github.io").replace(/\/+$/, "")

  return {
    name: "CanonicalSEO",
    externalResources: () => {
      return {
        additionalHead: [
          (pageData) => {
            // 404 / virtual pages have no meaningful canonical URL
            if (pageData.slug === "404") {
              return null
            }

            const slug = pageData.slug ?? ""
            const canonical = slug === "" || slug === "index" ? `${siteUrl}/` : `${siteUrl}/${slug}`

            return h("link", { rel: "canonical", href: canonical })
          },
          () => h("meta", { property: "og:locale", content: "zh_CN" }),
          () => h("link", { rel: "alternate", hreflang: "zh-Hans", href: `${siteUrl}/` }),
          () => h("link", { rel: "alternate", hreflang: "x-default", href: `${siteUrl}/` }),
        ],
      }
    },
  }
}

export default CanonicalPlugin
export const Canonical = CanonicalPlugin
