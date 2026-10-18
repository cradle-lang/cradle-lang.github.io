import type * as PrismNamespace from 'prismjs';
import includeOriginalLanguages from '@theme-original/prism-include-languages';

export default function includeLanguages(Prism: typeof PrismNamespace): void {
  includeOriginalLanguages(Prism);

  // CRADLE's function-style DSL is not part of Prism's bundled languages.
  Prism.languages.cradle = {
    string: {pattern: /"(?:\\.|[^"\\])*"/, greedy: true},
    boolean: /\b(?:true|false)\b/,
    function: /\b[a-zA-Z_]\w*(?=\s*\()/,
    number: /\b\d+(?:\.\d+)?\b/,
    operator: />/,
    punctuation: /[(),.]/,
  };
  Prism.languages.ansible = Prism.languages.yaml;
}
