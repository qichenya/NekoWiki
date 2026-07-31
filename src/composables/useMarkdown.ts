import { marked } from 'marked'

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true,
})

/**
 * 将 Markdown 字符串渲染为 HTML
 */
export function renderMarkdown(raw: string): string {
  return marked.parse(raw) as string
}
