import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import sharedStyles from '../Homepage.module.css';
import styles from './Acknowledgements.module.css';

const partners = [
  {
    name: 'University of Southern California Information Sciences Institute',
    logo: '/img/collaborators/isi.png',
    url: 'https://www.isi.edu/',
    description:
      'Research collaboration in cybersecurity and cyber experimentation.',
  },

  // Add more partners here in the future:
  //
  // {
  //   name: 'Partner Organization',
  //   logo: '/img/collaborators/partner.png',
  //   url: 'https://example.com/',
  //   description: 'Short description of the collaboration.',
  // },
];

export default function Acknowledgements(): ReactNode {
  return (
    <section className={styles.acknowledgements}>
      <div
        className={`${sharedStyles.contentWidth} ${styles.acknowledgementsInner}`}>

        <div className={sharedStyles.sectionHeader}>
          <p className={sharedStyles.sectionLabel}>
            THE CRADLE COMMUNITY
          </p>

          <h2 className={sharedStyles.sectionHeading}>
            The people behind the project.
          </h2>

          <p className={sharedStyles.sectionDescription}>
            Researchers, educators and cybersecurity practitioners contribute
            to its research, development and continued evolution.
          </p>
        </div>

        <div className={styles.communityContent}>
          {/* =====================================================
              PROJECT ORIGINS
              ===================================================== */}

          <section className={styles.communitySection}>
            <div className={styles.sectionMeta}>
              <span className={styles.sectionNumber}>01</span>
              <p>Project Origins</p>
            </div>

            <div className={styles.sectionBody}>
              <p className={styles.sectionDescription}>
                CRADLE began as a joint effort bringing together cybersecurity
                research and cyber-range infrastructure.
              </p>

              <div className={styles.originOrganizations}>
                <Link
                  className={styles.originOrganization}
                  href="https://curiosity.comp.nus.edu.sg/">
                  <img
                    src="/img/collaborators/curiosity.png"
                    alt="NUS CuriOSity"
                  />

                  <span>NUS CuriOSity</span>
                </Link>

                <span
                  className={styles.originDivider}
                  aria-hidden="true">
                  +
                </span>

                <Link
                  className={styles.originOrganization}
                  href="https://ncl.sg/">
                  <img
                    src="/img/collaborators/ncl.png"
                    alt="National Cybersecurity R&D Laboratory"
                  />

                  <span>
                    National Cybersecurity R&amp;D Laboratory
                  </span>
                </Link>
              </div>
            </div>
          </section>

          {/* =====================================================
              PROJECT LEADS
              ===================================================== */}

          <section className={styles.communitySection}>
            <div className={styles.sectionMeta}>
              <span className={styles.sectionNumber}>02</span>
              <p>Project Leads</p>
            </div>

            <div className={styles.sectionBody}>
              <div className={styles.leadList}>
                <div className={styles.leadItem}>
                  <h3>Prof. Liang Zhenkai</h3>

                  <p>
                    National University of Singapore
                  </p>
                </div>

                <div className={styles.leadItem}>
                  <h3>Dr. Anis Yusof</h3>

                  <p>
                    National University of Singapore
                  </p>
                </div>
              </div>

              <p className={styles.sectionDescription}>
                They guide the project&apos;s research direction, system design,
                technical development and continued work on reproducible cyber
                experimentation.
              </p>
            </div>
          </section>

          {/* =====================================================
              PARTNER ORGANIZATIONS
              ===================================================== */}

          <section className={styles.communitySection}>
            <div className={styles.sectionMeta}>
              <span className={styles.sectionNumber}>03</span>
              <p>Partner Organizations</p>
            </div>

            <div className={styles.sectionBody}>
              <p className={styles.partnerIntroduction}>
                CRADLE works with research organizations contributing expertise
                in cybersecurity, cyber experimentation and related research.
              </p>

              <div className={styles.partnerGrid}>
                {partners.map((partner) => (
                  <article
                    key={partner.name}
                    className={styles.partnerCard}>

                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className={styles.partnerLogo}
                    />

                    <div className={styles.partnerDetails}>
                      <h3>
                        <a
                          href={partner.url}
                          target="_blank"
                          rel="noopener noreferrer">
                          {partner.name}
                        </a>
                      </h3>

                      <p>
                        {partner.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}