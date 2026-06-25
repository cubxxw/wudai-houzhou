import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../../.quartz/plugins"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        {/* 预连接到 jsdelivr：pixi.js / d3.js 的 CDN（graph plugin 用），节省 100-200ms 握手 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        {/* 注：本站不使用 cdnjs.cloudflare.com（曾用于 latex/katex，已禁用），故不预连接 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <link rel="apple-touch-icon" href={iconPath} />
        <link rel="manifest" href={joinSegments(baseDir, "static/manifest.webmanifest")} />
        <meta name="theme-color" content="#2a2826" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="乱世为龙" />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {/* RSS auto-discovery: 让浏览器和 RSS 阅读器自动发现订阅源 */}
        {cfg.baseUrl && (
          <>
            <link
              rel="alternate"
              type="application/rss+xml"
              title={cfg.pageTitle}
              href={`https://${cfg.baseUrl}/index.xml`}
            />
            <link rel="canonical" href={socialUrl} />
          </>
        )}

        {/* Schema.org JSON-LD: 让搜索引擎理解站点结构 */}
        {cfg.baseUrl && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "WebSite",
                    "@id": `https://${cfg.baseUrl}/#website`,
                    name: cfg.pageTitle,
                    description: description,
                    url: `https://${cfg.baseUrl}/`,
                    inLanguage: cfg.locale ?? "zh-CN",
                    publisher: {
                      "@type": "Organization",
                      name: cfg.pageTitle,
                      logo: {
                        "@type": "ImageObject",
                        url: `https://${cfg.baseUrl}/static/icon.png`,
                      },
                    },
                  },
                  // BreadcrumbList: 让 Google 搜索结果显示面包屑路径
                  ...((): any[] => {
                    if (fileData.slug === "index") return []
                    const segments = (fileData.slug as string).split("/")
                    const items: any[] = [
                      {
                        "@type": "ListItem",
                        position: 1,
                        name: "总览",
                        item: `https://${cfg.baseUrl}/`,
                      },
                    ]
                    let acc = ""
                    segments.forEach((seg, i) => {
                      acc = acc ? `${acc}/${seg}` : seg
                      items.push({
                        "@type": "ListItem",
                        position: i + 2,
                        name: seg.replace(/-/g, " "),
                        item: `https://${cfg.baseUrl}/${acc}`,
                      })
                    })
                    return [
                      {
                        "@type": "BreadcrumbList",
                        "@id": `${socialUrl}#breadcrumb`,
                        itemListElement: items,
                      },
                    ]
                  })(),
                  fileData.slug === "index"
                    ? {
                        "@type": "Book",
                        "@id": `https://${cfg.baseUrl}/#book`,
                        name: "郭威·乱世为龙——后周太祖郭威传",
                        alternateName: "乱世为龙",
                        description: description,
                        url: `https://${cfg.baseUrl}/`,
                        inLanguage: cfg.locale ?? "zh-CN",
                        about: [
                          {
                            "@type": "Person",
                            name: "郭威",
                            description: "后周开国皇帝（904–954）",
                          },
                          {
                            "@type": "Thing",
                            name: "五代十国",
                            description: "中国历史时期（907–960）",
                          },
                          { "@type": "Thing", name: "后周", description: "五代第五朝（951–960）" },
                        ],
                        author: {
                          "@type": "Person",
                          name: cfg.pageTitle,
                        },
                        publisher: {
                          "@id": `https://${cfg.baseUrl}/#website`,
                        },
                        image: `https://${cfg.baseUrl}/static/og-image.png`,
                        bookFormat: "https://schema.org/EBook",
                        numberOfPages: 29,
                        genre: ["历史小说", "传记", "五代史"],
                      }
                    : {
                        "@type": "Article",
                        "@id": `${socialUrl}#article`,
                        headline: fileData.frontmatter?.title ?? title,
                        description: description,
                        url: socialUrl,
                        inLanguage: cfg.locale ?? "zh-CN",
                        isPartOf: { "@id": `https://${cfg.baseUrl}/#website` },
                        image: `https://${cfg.baseUrl}/static/og-image.png`,
                      },
                ],
              }),
            }}
          />
        )}

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
