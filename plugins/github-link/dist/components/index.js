// Local Quartz component: a toolbar button linking to this site's GitHub repo.
//
// This plugin is intentionally shipped as hand-written ESM under `dist/` with no
// build step and no bundled dependencies. Local plugins are symlinked rather than
// cloned+built by the plugin loader, so keeping it build-free means a deploy can
// never fail on it — which is exactly the failure mode this repo hit before.
import { jsx, jsxs } from "preact/jsx-runtime"

const style = `
.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  color: var(--darkgray);
  cursor: pointer;
  flex-shrink: 0;
}
.github-link:hover {
  color: var(--secondary);
}
.github-link svg {
  width: 1.4rem;
  height: 1.4rem;
  fill: currentColor;
}
`

const DEFAULT_URL = "https://github.com/cubxxw/wudai-houzhou"
const DEFAULT_TITLE = "在 GitHub 上查看本站源码"

// GitHub "Octicon" mark, MIT licensed (https://github.com/primer/octicons)
const GITHUB_PATH =
  "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8Z"

const _default = (opts) => {
  const url = opts?.url ?? DEFAULT_URL
  const title = opts?.title ?? DEFAULT_TITLE

  const Component = ({ displayClass }) =>
    jsx("a", {
      href: url,
      class: `github-link ${displayClass ?? ""}`,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": title,
      title: title,
      children: jsxs("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 16 16",
        "aria-hidden": "true",
        children: [jsx("title", { children: title }), jsx("path", { d: GITHUB_PATH })],
      }),
    })

  Component.css = style
  return Component
}

export { _default as GitHubLink }
