import { useEffect, useRef } from 'react'
import { IDENTITY, STATIONS } from '../data/content'
import { useJourney } from '../state/journeyStore'
import { CONTENT_COMPONENTS } from './content'
import {
  ArrowDown,
  ArrowRight,
  BrandMark,
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  MailIcon,
  MoonIcon,
  ReadingIcon,
  SunIcon,
} from './icons'

const byKey = Object.fromEntries(STATIONS.map((station) => [station.key, station]))
const SOCIAL_ICONS = {
  github: GitHubIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  email: MailIcon,
}

function ReadingSection({ station, index }) {
  const Content = CONTENT_COMPONENTS[station.key]
  return (
    <section
      className={`reading-section reading-section--${station.key}`}
      id={station.key}
      aria-labelledby={`reading-${station.key}-title`}
      style={{ '--section-accent': station.accent }}
    >
      <header className="reading-section__head">
        <div className="reading-section__number">
          <span>{station.index}</span>
          <span>Stop {index + 1} / 06</span>
        </div>
        <div>
          <p className="reading-eyebrow">{station.content.eyebrow}</p>
          <h2 id={`reading-${station.key}-title`}>{station.content.title}</h2>
        </div>
        <span className="reading-section__rule" aria-hidden="true" />
      </header>
      <div className="reading-section__body">
        <Content content={station.content} />
      </div>
    </section>
  )
}

export function StaticPortfolio({ onEnterExperience, reason }) {
  const hire = byKey.hire
  const canExperience = reason !== 'unsupported'
  const socials = IDENTITY.socials.filter((social) => social.key !== 'email')
  const warmedRef = useRef(false)
  const theme = useJourney((s) => s.theme)
  const setTheme = useJourney((s) => s.setTheme)
  const isDark = theme === 'dark'

  /* Warm the 3D chunk while the reader is idle so "Open the drive" starts instantly. */
  useEffect(() => {
    if (!canExperience || warmedRef.current) return undefined
    warmedRef.current = true
    const warm = () => import('../journey/Scene').catch(() => {})
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => warm(), { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(warm, 2500)
    return () => window.clearTimeout(timer)
  }, [canExperience])

  return (
    <div className="reading">
      <a className="skip-link" href="#reading-main">
        Skip to the portfolio
      </a>

      <header className="reading-header">
        <div className="reading-header__inner">
          <a className="reading-header__brand" href="#top" aria-label="Samrat Bhusal, back to top">
            <BrandMark size={31} />
            <span>
              <strong>Samrat</strong>
              <small>Front-end developer</small>
            </span>
          </a>
          <nav className="reading-nav" aria-label="Reading sections">
            {STATIONS.map((station) => (
              <a key={station.key} href={`#${station.key}`}>
                <span>{station.index}</span>
                {station.label}
              </a>
            ))}
          </nav>
          <div className="reading-header__tools">
            <button
              type="button"
              className="reading-header__theme"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-pressed={isDark}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
            {canExperience && (
              <button type="button" className="reading-header__drive" onClick={onEnterExperience}>
                <ReadingIcon width={17} height={17} />
                Open the drive
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="reading-main">
        <section className="reading-hero" id="top" aria-labelledby="reading-hero-title">
          <div className="reading-hero__copy">
            {reason === 'reduced-motion' && (
              <p className="reading-hero__notice">
                Reduced motion is on — this is the quiet reading edition. The drive is still here
                if you want it.
              </p>
            )}
            {reason === 'unsupported' && (
              <p className="reading-hero__notice">
                This browser can’t render the 3D drive. Everything is here, unabridged.
              </p>
            )}
            {reason === 'scene-crash' && (
              <p className="reading-hero__notice">
                The 3D drive failed to start this time — try again any moment from “Open the
                drive”, top right. Everything stays readable here meanwhile.
              </p>
            )}
            <p className="reading-eyebrow">
              <span className="status-dot" aria-hidden="true" />
              {IDENTITY.status}
            </p>
            <h1 id="reading-hero-title">
              The long way
              <em>home.</em>
            </h1>
            <p className="reading-hero__lede">{IDENTITY.tagline}</p>
            <div className="reading-hero__actions">
              <a className="btn btn-primary" href={`mailto:${IDENTITY.email}`}>
                <MailIcon width={18} height={18} />
                Start a conversation
              </a>
              <a
                className="btn btn-ghost"
                href={IDENTITY.resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                <GitHubIcon width={18} height={18} />
                GitHub
              </a>
            </div>
            <a className="reading-hero__scroll" href="#about">
              Six stops below
              <ArrowDown width={17} height={17} />
            </a>
          </div>

          <figure className="reading-hero__figure">
            <img
              src="/photos/open-road.jpg"
              alt="An empty road running toward distant hills in warm daylight."
              width="1200"
              height="800"
              fetchpriority="high"
              decoding="async"
            />
            <figcaption>
              <span>Somewhere between here and the next idea.</span>
              <span>35 mm · road study</span>
            </figcaption>
          </figure>

          <ol className="reading-hero__route" aria-label="The six stops">
            {STATIONS.map((station) => (
              <li key={station.key}>
                <a href={`#${station.key}`}>
                  <span>{station.index}</span>
                  <strong>{station.label}</strong>
                  <ArrowRight width={15} height={15} />
                </a>
              </li>
            ))}
          </ol>
        </section>

        {STATIONS.slice(0, 5).map((station, index) => (
          <ReadingSection key={station.key} station={station} index={index} />
        ))}

        <section
          className="reading-hire"
          id="hire"
          aria-labelledby="reading-hire-title"
          style={{ '--section-accent': hire.accent }}
        >
          <div className="reading-hire__inner">
            <p className="reading-eyebrow">The last stop</p>
            <h2 id="reading-hire-title">{hire.content.title}</h2>
            <div className="reading-hire__body">
              <CONTENT_COMPONENTS.hire content={hire.content} />
            </div>
          </div>
        </section>
      </main>

      <footer className="reading-footer">
        <div className="reading-footer__top">
          <div className="reading-footer__brand">
            <BrandMark size={48} />
            <div>
              <p className="reading-footer__kicker">The road ends. The work doesn’t.</p>
              <p className="reading-footer__line">
                Designed and built by Samrat Bhusal in Devdaha, Nepal.
              </p>
            </div>
          </div>
          <div className="reading-footer__cta">
            <a className="btn btn-signal" href={`mailto:${IDENTITY.email}`}>
              <MailIcon width={18} height={18} />
              Start a conversation
            </a>
            <div className="reading-footer__socials" aria-label="Social links">
              {socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.key] || ArrowRight
                return (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                  >
                    <Icon width={18} height={18} />
                    <span>{social.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
        <nav className="reading-footer__links" aria-label="Footer sections">
          {STATIONS.map((station) => (
            <a key={station.key} href={`#${station.key}`}>
              <span>{station.index}</span>
              {station.label}
            </a>
          ))}
        </nav>
        <div className="reading-footer__meta">
          <span className="reading-footer__copyright">
            © 2026 Samrat Bhusal. All rights reserved.
          </span>
          <span>Built with React, Three.js & far too much attention to detail.</span>
          <span>
            Road photograph via{' '}
            <a href="https://unsplash.com/license">Unsplash</a>
          </span>
          {canExperience && (
            <button type="button" onClick={onEnterExperience}>
              Take the drive instead
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
