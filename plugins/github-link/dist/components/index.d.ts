import { QuartzComponent } from "@quartz-community/types"

export interface GitHubLinkOptions {
  /** Repository URL the toolbar button points at. */
  url?: string
  /** Accessible label and tooltip text for the button. */
  title?: string
}

declare const _default: (opts?: GitHubLinkOptions) => QuartzComponent

export { _default as GitHubLink }
