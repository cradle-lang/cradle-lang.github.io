import type { ReactNode } from 'react';
import Layout from '@theme/Layout';

import Hero from '../components/homepage/Hero/Hero';
import WhyCradle from '../components/homepage/WhyCradle/WhyCradle';
import CradleInAction from '../components/homepage/CradleInAction/CradleInAction';
import StartLearning from '../components/homepage/StartLearning/StartLearning';
import LatestRelease from '../components/homepage/LatestRelease/LatestRelease';
import SupportedWorkflow from '../components/homepage/SupportedWorkflow/SupportedWorkflow';
import EvaluateCradle from '../components/homepage/EvaluateCradle/EvaluateCradle';
import Acknowledgements from '../components/homepage/Acknowledgements/Acknowledgements';


export default function Home(): ReactNode {
  return (
    <Layout
      title="CRADLE"
      description="Cyber Experimentation as Code: define structured, repeatable cyber environments and transform them for supported platforms.">
      <main>
        <Hero />
        <WhyCradle />
        <CradleInAction />
        <SupportedWorkflow />
        <StartLearning />
        <EvaluateCradle />
        <LatestRelease />
        <Acknowledgements />
      </main>
    </Layout>
  );
}
