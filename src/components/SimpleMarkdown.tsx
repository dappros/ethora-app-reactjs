import { Fragment, ReactNode } from 'react';

// The markdown an LLM reply uses (paragraphs, lists, headings, bold, italic,
// inline code, links), rendered as React elements: no HTML from the text
// ever reaches the page. Links open in a new tab and only http(s) and mailto
// are linked.
const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*|__[^_\n]+__)|(\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_)|(\[[^\]\n]+\]\([^)\s]+\))|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;

function safeHref(href: string): string | null {
  return /^(https?:|mailto:)/i.test(href) ? href : null;
}

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const k = `${key}-${i++}`;
    const [whole, code, bold, italic, link, url] = m;
    if (code) out.push(<code key={k} className="rounded bg-gray-100 px-1 font-mono text-[0.9em]">{code.slice(1, -1)}</code>);
    else if (bold) out.push(<strong key={k}>{inline(bold.slice(2, -2), k)}</strong>);
    else if (italic) out.push(<em key={k}>{inline(italic.slice(1, -1), k)}</em>);
    else if (link) {
      const [, label, href] = link.match(/^\[([^\]]+)\]\(([^)]+)\)$/) || [];
      const safe = href && safeHref(href);
      out.push(safe ? <a key={k} href={safe} target="_blank" rel="noopener noreferrer" className="text-brand-500 underline">{inline(label, k)}</a> : whole);
    } else if (url) out.push(<a key={k} href={url} target="_blank" rel="noopener noreferrer" className="break-all text-brand-500 underline">{url}</a>);
    last = at + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function SimpleMarkdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flushPara = () => {
    if (para.length) blocks.push(<p key={`p${blocks.length}`}>{para.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{inline(l, `p${blocks.length}-${i}`)}</Fragment>)}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const k = `l${blocks.length}`;
    const items = list.items.map((it, i) => <li key={i}>{inline(it, `${k}-${i}`)}</li>);
    blocks.push(list.ordered ? <ol key={k} className="list-decimal pl-5">{items}</ol> : <ul key={k} className="list-disc pl-5">{items}</ul>);
    list = null;
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      const ordered = Boolean(numbered);
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet || numbered)![1]);
    } else if (heading) {
      flushPara();
      flushList();
      blocks.push(<p key={`h${blocks.length}`} className="font-semibold">{inline(heading[1], `h${blocks.length}`)}</p>);
    } else if (!line.trim()) {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return <div className="space-y-2 break-words">{blocks}</div>;
}
