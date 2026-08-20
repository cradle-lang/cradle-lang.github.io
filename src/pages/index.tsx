import type { ReactNode } from 'react';
import Layout from '@theme/Layout';

import Hero from '../components/homepage/Hero/Hero';
import WhyCradle from '../components/homepage/WhyCradle/WhyCradle';
import CradleInAction from '../components/homepage/CradleInAction/CradleInAction';
import StartLearning from '../components/homepage/StartLearning/StartLearning';
import SupportedWorkflow from '../components/homepage/SupportedWorkflow/SupportedWorkflow';
import Acknowledgements from '../components/homepage/Acknowledgements/Acknowledgements';


export default function Home(): ReactNode {
  return (
    <Layout
      title="CRADLE"
      description="A domain-specific language and toolchain for defining and deploying reproducible cyber-range environments.">
      <main>
        <Hero />
        <WhyCradle />
        <CradleInAction />
        <StartLearning />
        <SupportedWorkflow />
        <Acknowledgements />
      </main>
    </Layout>
  );
}