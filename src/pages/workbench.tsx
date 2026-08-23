import type { ReactNode } from 'react';
import Layout from '@theme/Layout';

import Workbench from '../components/workbench/Workbench';

export default function WorkbenchPage(): ReactNode {
  return (
    <Layout
      title="Workbench"
      description="Write CRADLE scenarios and inspect their topology and event graph in the browser."
      noFooter
    >
      <Workbench />
    </Layout>
  );
}