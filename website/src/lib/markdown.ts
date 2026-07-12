import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: false,
});

/** Drop the GitHub blob URL block; the site notice is the only link to that file. */
const REPO_URL_BLOCK =
  /\n\*\*(?:Privacy policy URL|Terms of service URL)[^*]*\*\*\nhttps:\/\/github\.com\/[^\n]+\n?/;

export function prepareLegalMarkdown(markdown: string): string {
  return markdown.replace(REPO_URL_BLOCK, '\n');
}

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}
