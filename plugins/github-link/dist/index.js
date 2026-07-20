// Main entry: re-export the component so both `@wudai/github-link` and
// `@wudai/github-link/components` resolve it. The Quartz component loader
// imports the `./components` subpath; the index export keeps the generated
// `.quartz/plugins/index.ts` aggregation working.
export { GitHubLink } from "./components/index.js"
