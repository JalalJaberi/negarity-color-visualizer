import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import styles from './index.module.css';

export default function Home(): ReactNode {
  return (
    <div className={styles.hero}>
      <div className={styles.bgWash} aria-hidden />

      <div className={styles.inner}>
        <header className={styles.copy}>
          <p className={styles.eyebrow}>Negarity Color Visualizer</p>
          <h1 className={styles.title}>Embed the view, not just the hex</h1>
          <p className={styles.subtitle}>
            A TypeScript kit for <strong>2D diagrams</strong> (Konva) and <strong>3D scenes</strong>{' '}
            (Three.js): RGB cubes, gamut-style plots, axes, markers, and channel UIs you can ship
            beside your product copy.
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="/docs/getting-started">
              Get Started
            </Link>
            <Link className={styles.secondaryLink} to="/docs/intro">
              How it fits together →
            </Link>
          </div>
        </header>

        <div className={styles.showcase}>
          <div className={styles.demoRow} aria-hidden>
            <figure className={styles.demoCard}>
              <figcaption className={styles.demoLabel}>
                <span className={styles.demoBadge}>3D</span>
                Three.js · orbit &amp; volume
              </figcaption>
              <div className={styles.demoBody}>
                <div className={styles.cubeStage}>
                  <div className={styles.cubePivot}>
                    <div className={`${styles.cubeFace} ${styles.cubeFront}`} />
                    <div className={`${styles.cubeFace} ${styles.cubeBack}`} />
                    <div className={`${styles.cubeFace} ${styles.cubeRight}`} />
                    <div className={`${styles.cubeFace} ${styles.cubeLeft}`} />
                    <div className={`${styles.cubeFace} ${styles.cubeTop}`} />
                    <div className={`${styles.cubeFace} ${styles.cubeBottom}`} />
                  </div>
                </div>
                <div className={styles.axisLegend}>
                  <span className={styles.axisR}>R</span>
                  <span className={styles.axisG}>G</span>
                  <span className={styles.axisB}>B</span>
                </div>
              </div>
            </figure>

            <figure className={styles.demoCard}>
              <figcaption className={styles.demoLabel}>
                <span className={styles.demoBadge}>2D</span>
                Konva · stage &amp; layers
              </figcaption>
              <div className={styles.demoBody}>
                <svg
                  className={styles.plotSvg}
                  viewBox="0 0 220 150"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <rect className={styles.plotFrame} x="8" y="8" width="204" height="134" rx="10" />
                  <line className={styles.plotAxis} x1="32" y1="118" x2="196" y2="118" />
                  <line className={styles.plotAxis} x1="32" y1="24" x2="32" y2="118" />
                  <text className={styles.plotAxisText} x="188" y="132">
                    x
                  </text>
                  <text className={styles.plotAxisText} x="18" y="32">
                    y
                  </text>
                  <path
                    className={styles.plotTrail}
                    d="M 52 96 C 78 52, 118 38, 148 58 S 188 88, 172 108"
                  />
                  <g className={styles.plotDotWrap}>
                    <circle className={styles.plotDot} r="7" cx="0" cy="0" />
                  </g>
                </svg>
              </div>
            </figure>
          </div>
          <p className={styles.showcaseHint}>
            Same library: wireframe presets, 2D overlays, and optional channel sliders.
          </p>
        </div>
      </div>
    </div>
  );
}
