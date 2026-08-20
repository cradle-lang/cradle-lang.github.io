import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './Acknowledgements.module.css';

export default function Acknowledgements(): ReactNode {
  return (
    <section className={styles.acknowledgements}>
      <div
        className={`${sharedStyles.contentWidth} ${styles.acknowledgementsInner}`}>

        <div className={sharedStyles.sectionHeader}>
          <p className={sharedStyles.sectionLabel}>
            Acknowledgements
          </p>

          <h2 className={sharedStyles.sectionHeading}>
            Built through collaboration.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            CRADLE is developed with contributions from project leads,
            collaborators and supporting organizations.
          </p>
        </div>

        <div className={styles.leadSection}>
          <p className={styles.acknowledgementLabel}>
            Project Leads
          </p>

          <div className={styles.leadGrid}>
            <div className={styles.leadCard}>
              <img
                src="/img/collaborators/liang-zhenkai.jpg"
                alt="Associate Professor Liang Zhenkai"
                className={styles.leadImage}
              />

              <div>
                <h3>A/P Liang Zhenkai</h3>
                <span>National University of Singapore</span>
              </div>
            </div>

            <div className={styles.leadCard}>
              <img
                src="/img/collaborators/anis-yusof.jpeg"
                alt="Dr Anis Bin Yusof"
                className={styles.leadImage}
              />

              <div>
                <h3>Dr Anis Bin Yusof</h3>
                <span>National University of Singapore</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.collaboratorSection}>
          <p className={styles.acknowledgementLabel}>
            Collaborating Organizations
          </p>

          <div className={styles.collaboratorGrid}>
            <article className={styles.collaboratorCard}>
              <img
                src="/img/collaborators/ncl.png"
                alt="National Cybersecurity R&D Laboratories"
              />

              <h3>National Cybersecurity R&D Laboratories</h3>
            </article>

            <article className={styles.collaboratorCard}>
              <img
                src="/img/collaborators/isi.png"
                alt="University of Southern California Information Sciences Institute"
              />

              <h3>
                University of Southern California Information Sciences Institute
              </h3>
            </article>
          </div>
        </div>

        <div className={styles.specialThanks}>
          <p className={styles.acknowledgementLabel}>
            Special Thanks
          </p>

          <p>
            We also acknowledge the contributors and organizations that
            supported the development and evaluation of CRADLE.
          </p>
        </div>
      </div>
    </section>
  );
}