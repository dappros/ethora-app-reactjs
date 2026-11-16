// "1 page" / "3 pages", from appAssistant.knows.<kind>[One].
export function countLabel(t: (key: string) => string, kind: 'pages' | 'docs', n: number) {
  return n === 1 ? t(`appAssistant.knows.${kind}One`) : t(`appAssistant.knows.${kind}`).replace('{n}', String(n));
}
