import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';

import styles from './styles.module.css';

type VersionName = 'current' | '1.0.0';

type VersionOption = {
  value: VersionName;
  label: string;
};

const STORAGE_KEY = 'cradle-docs-version';

const VERSION_OPTIONS: VersionOption[] = [
  {
    value: 'current',
    label: 'Current',
  },
  {
    value: '1.0.0',
    label: '1.0.0',
  },
];

function getVersionFromPath(pathname: string): VersionName {
  if (
    pathname === '/docs/1.0.0' ||
    pathname.startsWith('/docs/1.0.0/')
  ) {
    return '1.0.0';
  }

  return 'current';
}

function isDocsPath(pathname: string): boolean {
  return pathname === '/docs' || pathname.startsWith('/docs/');
}

function removeVersionFromDocsPath(pathname: string): string {
  if (
    pathname === '/docs/1.0.0' ||
    pathname === '/docs/1.0.0/'
  ) {
    return '/docs/';
  }

  if (pathname.startsWith('/docs/1.0.0/')) {
    return pathname.replace('/docs/1.0.0/', '/docs/');
  }

  return pathname;
}

function getVersionedDocsPath(
  pathname: string,
  version: VersionName,
): string {
  const unversionedPath = removeVersionFromDocsPath(pathname);

  if (version === 'current') {
    return unversionedPath;
  }

  if (unversionedPath === '/docs') {
    return `/docs/${version}`;
  }

  if (unversionedPath === '/docs/') {
    return `/docs/${version}/`;
  }

  return unversionedPath.replace(
    /^\/docs\//,
    `/docs/${version}/`,
  );
}

export default function CustomVersionDropdownNavbarItem(): React.ReactNode {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] =
    useState<VersionName>('current');

  const containerRef = useRef<HTMLDivElement>(null);

  const pathname = location.pathname;

  const currentPathVersion = useMemo(
    () => getVersionFromPath(pathname),
    [pathname],
  );

  useEffect(() => {
    if (isDocsPath(pathname)) {
      setSelectedVersion(currentPathVersion);

      localStorage.setItem(
        STORAGE_KEY,
        currentPathVersion,
      );

      return;
    }

    const savedVersion =
      localStorage.getItem(STORAGE_KEY) as VersionName | null;

    if (
      savedVersion === 'current' ||
      savedVersion === '1.0.0'
    ) {
      setSelectedVersion(savedVersion);
    }
  }, [pathname, currentPathVersion]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent): void {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      );
    };
  }, []);

  function handleVersionSelection(version: VersionName): void {
    localStorage.setItem(STORAGE_KEY, version);
    setSelectedVersion(version);
    setIsOpen(false);
  }

  function getTargetPath(version: VersionName): string {
    if (!isDocsPath(pathname)) {
      /*
       * Important:
       * If the user is currently on the landing page, Workbench,
       * Releases, or another non-docs route, changing the selected
       * documentation version must NOT navigate away from that page.
       */
      return pathname;
    }

    return getVersionedDocsPath(pathname, version);
  }

  const selectedLabel =
    VERSION_OPTIONS.find(
      (option) => option.value === selectedVersion,
    )?.label ?? 'Current';

  return (
    <div
      ref={containerRef}
      className={styles.container}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span>{selectedLabel}</span>

        <svg
          className={styles.chevron}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            d="M2.5 4.25L6 7.75L9.5 4.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={styles.menu}
          role="menu"
        >
          {VERSION_OPTIONS.map((option) => {
            const active =
              option.value === selectedVersion;

            return (
              <Link
                key={option.value}
                to={getTargetPath(option.value)}
                className={[
                  styles.menuItem,
                  active ? styles.active : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="menuitem"
                onClick={() =>
                  handleVersionSelection(option.value)
                }
              >
                <span>{option.label}</span>

                {active && (
                  <span
                    className={styles.check}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}