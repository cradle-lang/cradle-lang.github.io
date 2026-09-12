function unique(values) {
  return [...new Set(values)];
}

function templateBody(template, description) {
  if (typeof template !== 'string' || template.trim() === '') {
    throw new TypeError(`${description} must be a non-empty string.`);
  }

  const normalized = template.replaceAll('\r\n', '\n');
  if (!normalized.startsWith('---\n')) return normalized;

  const frontmatterEnd = normalized.indexOf('\n---\n', 4);
  if (frontmatterEnd === -1) {
    throw new Error(`${description} has unclosed YAML frontmatter.`);
  }
  return normalized.slice(frontmatterEnd + '\n---\n'.length);
}

export function renderMarkdownTemplate(
  template,
  values,
  {description = 'Markdown template'} = {},
) {
  let body = templateBody(template, description).trimStart();

  for (const [name, value] of Object.entries(values)) {
    body = body.replaceAll(`{{${name}}}`, String(value));
  }

  const unresolved = unique(
    [...body.matchAll(/\{\{([^{}\n]+)\}\}/g)]
      .map((match) => match[1].trim()),
  );
  if (unresolved.length > 0) {
    throw new Error(`Unresolved template placeholders: ${unresolved.join(', ')}`);
  }

  return `${body.trimEnd()}\n`;
}
