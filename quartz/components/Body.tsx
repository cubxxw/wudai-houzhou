import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return (
    <>
      <a href="#quartz-body" class="skip-link">
        跳 转 至 正 文
      </a>
      {/* 注意：必须用 <div id="quartz-body">，因为 quartz 内置 CSS 用 .page > #quartz-body
          子选择器布局 left/right sidebar。改成 <main> 包 <div> 会多一层使选择器失效。
          所以这里用 <div id="quartz-body" role="main"> —— role="main" 保持 WCAG 1.3.1 landmark
          合规，避免布局塌陷。 */}
      <div id="quartz-body" role="main" aria-label="正 文">
        {children}
      </div>
    </>
  )
}

export default (() => Body) satisfies QuartzComponentConstructor
