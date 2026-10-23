import type {ReactNode} from 'react';
import OriginalMDXA from '@theme-original/MDXComponents/A';
import type {Props} from '@theme/MDXComponents/A';

export default function MDXA(props: Props): ReactNode {
  // Specification links are file downloads, not documentation routes.
  // Use a native anchor so client-side navigation cannot open the source.
  if (props.href && /\.cradle(?:[?#]|$)/i.test(props.href)) {
    return <a {...props} download={props.download || 'scenario.cradle'} />;
  }
  return <OriginalMDXA {...props} />;
}
