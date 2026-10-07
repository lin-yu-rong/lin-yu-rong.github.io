export type CanonicalOptions = {
  siteUrl?: string
}

export declare const CanonicalPlugin: (opts?: CanonicalOptions) => {
  name: string
  emit: () => string[]
  externalResources: () => { additionalHead: unknown[] }
}

export default CanonicalPlugin
