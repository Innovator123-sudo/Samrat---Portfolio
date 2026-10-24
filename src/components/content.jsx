import { useEffect, useRef, useState } from 'react'
import { IDENTITY, PROJECT_CTA } from '../data/content'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  GitHubIcon,
  MailIcon,
  MapPinIcon,
  QuoteIcon,
} from './icons'

function TiltFrame({ className = '', max = 4.5, children }) {
  const ref = useRef(null)

  const handleMove = (event) => {
    const element = ref.current
    if (!element) return
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
    const rect = element.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    element.style.setProperty('--tilt-ry', `${((px - 0.5) * max * 2).toFixed(2)}deg`)
    element.style.setProperty('--tilt-rx', `${((0.5 - py) * max * 2).toFixed(2)}deg`)
    element.style.setProperty('--tilt-mx', `${(px * 100).toFixed(1)}%`)
    element.style.setProperty('--tilt-my', `${(py * 100).toFixed(1)}%`)
  }

  const handleLeave = () => {
    const element = ref.current
    if (!element) return
    element.style.setProperty('--tilt-ry', '0deg')
    element.style.setProperty('--tilt-rx', '0deg')
    element.style.setProperty('--tilt-mx', '50%')
    element.style.setProperty('--tilt-my', '50%')
  }

  return (
    <div
      ref={ref}
      className={`${className} tilt`}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </div>
  )
}

function ProjectInquiry({ project }) {
  const subject = encodeURIComponent(`Project question — ${project.title}`)
  const body = encodeURIComponent(
    `Hi Samrat,\n\nI saw ${project.title} in your portfolio and would love to know more about it.\n\n`,
  )
  return (
    <a className="project-link" href={`mailto:${IDENTITY.email}?subject=${subject}&body=${body}`}>
      {PROJECT_CTA.label}
      <ArrowUpRight width={17} height={17} />
    </a>
  )
}

export function AboutContent({ content }) {
  return (
    <div className="about-layout">
      <figure className="about-portrait">
        <TiltFrame className="about-portrait__image" max={6}>
          <img src={content.portrait} alt={content.portraitAlt} width="1024" height="1024" loading="lazy" />
          <span className="about-portrait__stamp">Still en route</span>
        </TiltFrame>
        <figcaption>
          <span>Devdaha, Nepal</span>
          <span>UTC +5:45</span>
        </figcaption>
      </figure>

      <div className="about-copy">
        <p className="content-lede">{content.lede}</p>
        <div className="prose">
          {content.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <dl className="about-stats" aria-label="At a glance">
          {content.stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="about-notes">
          <div>
            <h3 className="minor-heading">Field notes</h3>
            <ul className="notes-list">
              {content.funFacts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="minor-heading">How I work</h3>
            <dl className="trait-list">
              {content.traits.map((trait) => (
                <div key={trait.label}>
                  <dt>{trait.label}</dt>
                  <dd>{trait.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SkillsContent({ content }) {
  const toolCount = content.categories.reduce((total, category) => total + category.items.length, 0)

  return (
    <div className="skills-layout">
      <div className="skills-intro">
        <p className="content-lede skills-lede">{content.lede}</p>
        <dl className="skills-summary" aria-label="Skills at a glance">
          <div>
            <dt>Disciplines</dt>
            <dd>{String(content.categories.length).padStart(2, '0')}</dd>
          </div>
          <div>
            <dt>Tools</dt>
            <dd>{String(toolCount).padStart(2, '0')}</dd>
          </div>
          <div>
            <dt>Core focus</dt>
            <dd>{content.focus}</dd>
          </div>
        </dl>
      </div>
      <div className="skills-grid">
        {content.categories.map((category, index) => (
          <section className="skill-group" key={category.name}>
            <header>
              <span className="skill-index">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{category.name}</h3>
                <p className="skill-group__note">{category.note}</p>
              </div>
              <span className="skill-group__count">{category.items.length} tools</span>
            </header>
            <div className="skill-list">
              {category.items.map((skill) => (
                <div className="skill-row" key={skill.name}>
                  <div className="skill-row__head">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-level">
                      {String(skill.level).padStart(2, '0')}
                      <small>%</small>
                    </span>
                  </div>
                  <span
                    className="skill-meter"
                    role="img"
                    aria-label={`${skill.name}: ${skill.level} out of 100`}
                  >
                    <span style={{ '--level': `${skill.level}%` }} />
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="skills-footnote">
        I work best as a bridge between design and engineering — close enough to the pixels,
        deep enough in the code to make the intent survive.
      </p>
    </div>
  )
}

export function ProjectsContent({ content }) {
  return (
    <div className="projects-layout">
      {content.items.map((project, index) => (
        <article className="project-row" key={project.title}>
          <figure className="project-figure">
            <TiltFrame className="project-figure__frame" max={3.6}>
              <img
                src={project.image}
                alt={project.imageAlt}
                width="1000"
                height="660"
                loading="lazy"
              />
            </TiltFrame>
            <figcaption>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span>{project.year}</span>
            </figcaption>
          </figure>
          <div className="project-copy">
            <div className="project-topline">
              <span>{project.role}</span>
              <span className="project-metric">{project.metric}</span>
            </div>
            <h3>{project.title}</h3>
            <p className="project-subtitle">{project.subtitle}</p>
            <p>{project.description}</p>
            <ul className="tag-list" aria-label={`${project.title} technologies`}>
              {project.stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {project.links?.length > 0 && (
              <div className="project-links" aria-label={`${project.title} links`}>
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    className="project-external"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                    <ArrowUpRight width={15} height={15} />
                  </a>
                ))}
              </div>
            )}
            <div className="project-footer">
              <span>{project.note}</span>
              <ProjectInquiry project={project} />
            </div>
          </div>
        </article>
      ))}
      <p className="project-note">{PROJECT_CTA.note}</p>
    </div>
  )
}

export function ExperienceContent({ content }) {
  return (
    <div className="experience-layout">
      <p className="content-lede experience-lede">{content.lede}</p>
      <ol className="timeline">
        {content.items.map((job, index) => (
          <li key={`${job.company}-${job.period}`}>
            <div className="timeline-period">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <time>{job.period}</time>
              {job.periodNote && <small>{job.periodNote}</small>}
            </div>
            <div className="timeline-content">
              <header>
                <h3>{job.role}</h3>
                <p>
                  {job.company} <span aria-hidden="true">/</span> {job.location}
                </p>
              </header>
              <ul>
                {job.milestones.map((milestone) => (
                  <li key={milestone}>{milestone}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      <div className="experience-quote">
        <QuoteIcon width={30} height={30} />
        <p>
          Good interfaces keep a promise. Great ones make you feel the person who kept it.
        </p>
      </div>
    </div>
  )
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function ContactContent({ content }) {
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef(null)

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    },
    [],
  )

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    if (status === 'error') setStatus('idle')
  }

  const validate = () => {
    const next = {}
    if (values.name.trim().length < 2) next.name = 'Tell me who you are.'
    if (!EMAIL_PATTERN.test(values.email.trim())) next.email = 'That email needs a second look.'
    if (values.message.trim().length < 12) next.message = 'A little more detail helps.'
    return next
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(IDENTITY.email)
      setCopied(true)
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(false), 2600)
    } catch {
      window.location.href = `mailto:${IDENTITY.email}`
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      const first = Object.keys(nextErrors)[0]
      document.getElementById(`contact-${first}`)?.focus()
      return
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    }

    const endpoint = content.formEndpoint?.trim()
    if (endpoint) {
      setStatus('sending')
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error('Request failed')
        setStatus('sent')
        setValues({ name: '', email: '', message: '' })
      } catch {
        setStatus('error')
      }
      return
    }

    const subject = encodeURIComponent(`Portfolio enquiry from ${payload.name}`)
    const body = encodeURIComponent(
      `${payload.message}\n\n— ${payload.name}\n${payload.email}`,
    )
    window.location.href = `mailto:${IDENTITY.email}?subject=${subject}&body=${body}`
    setStatus('sent')
  }

  return (
    <div className="contact-layout">
      <div className="contact-intro">
        <p className="content-lede">{content.lede}</p>
        <p className="contact-availability">{content.availability}</p>
        <ul className="contact-channels">
          <li>
            <MailIcon width={19} height={19} />
            <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
            <button type="button" className="copy-button" onClick={copyEmail}>
              {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </li>
          <li>
            <MapPinIcon width={19} height={19} />
            <span>{IDENTITY.location}</span>
          </li>
          <li>
            <span className="contact-dot" aria-hidden="true" />
            <span>{IDENTITY.availability}</span>
          </li>
        </ul>
        <p className="contact-privacy">
          No tracking, no newsletter trap. This form hands off to your email app. If your mail
          client is not set up, copy the address instead.
        </p>
      </div>

      <form className="contact-form" onSubmit={submit} noValidate>
        <div className="field-group">
          <label className="field-label" htmlFor="contact-name">
            {content.formLabels.name}
          </label>
          <input
            id="contact-name"
            className="field"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={update('name')}
            placeholder={content.formPlaceholders.name}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
          />
          {errors.name && (
            <span className="field-error" id="contact-name-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="contact-email">
            {content.formLabels.email}
          </label>
          <input
            id="contact-email"
            className="field"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
            placeholder={content.formPlaceholders.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
          />
          {errors.email && (
            <span className="field-error" id="contact-email-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="contact-message">
            {content.formLabels.message}
          </label>
          <textarea
            id="contact-message"
            className="field field-area"
            name="message"
            rows={5}
            value={values.message}
            onChange={update('message')}
            placeholder={content.formPlaceholders.message}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
          />
          {errors.message && (
            <span className="field-error" id="contact-message-error" role="alert">
              {errors.message}
            </span>
          )}
        </div>

        <div className="contact-actions">
          <button type="submit" className="btn btn-signal" disabled={status === 'sending'}>
            {status === 'sending' ? 'Packing the car…' : 'Send the details'}
            <ArrowRight width={18} height={18} />
          </button>
          <span className="contact-response">Usually replies within 24 hours.</span>
        </div>

        <div className="contact-status" role="status" aria-live="polite">
          {status === 'sent' && <p className="form-success">{content.success}</p>}
          {status === 'error' && <p className="field-error">{content.errorNetwork}</p>}
        </div>
      </form>
    </div>
  )
}

export function HireContent({ content }) {
  const lanes = [
    {
      href: content.ctas.emailHref,
      label: content.ctas.emailLabel,
      detail: IDENTITY.email,
      icon: MailIcon,
    },
    {
      href: content.ctas.resumeHref,
      label: content.ctas.resumeLabel,
      detail: 'Nine public repos and the code behind these builds',
      icon: GitHubIcon,
      external: true,
    },
    {
      href: content.ctas.bookHref,
      label: content.ctas.bookLabel,
      detail: 'Tell me the idea — I reply within a day',
      icon: CalendarIcon,
    },
  ]

  return (
    <div className="hire-layout">
      <div className="hire-intro">
        <p className="content-lede">{content.lede}</p>
        <p>{content.note}</p>
        <p className="hire-response">
          <span aria-hidden="true" className="contact-dot" />
          {content.response}
        </p>
      </div>
      <div className="hire-lanes">
        {lanes.map((lane, index) => {
          const Icon = lane.icon
          return (
            <a
              className="hire-lane"
              href={lane.href}
              key={lane.label}
              target={lane.external ? '_blank' : undefined}
              rel={lane.external ? 'noreferrer' : undefined}
            >
              <span className="hire-lane__number">0{index + 1}</span>
              <Icon width={22} height={22} />
              <span className="hire-lane__copy">
                <strong>{lane.label}</strong>
                <small>{lane.detail}</small>
              </span>
              <ArrowUpRight width={19} height={19} />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export const CONTENT_COMPONENTS = {
  about: AboutContent,
  skills: SkillsContent,
  projects: ProjectsContent,
  experience: ExperienceContent,
  contact: ContactContent,
  hire: HireContent,
}
