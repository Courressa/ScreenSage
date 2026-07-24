import { useState } from 'react'
import { useSubmit } from '@formspree/react'
import { isSubmissionError } from '@formspree/core'
import '../../styles/forms.css'

const INITIAL_FORM = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Prefer a dedicated contact form; fall back to the suggestion form id for local/dev. */
function getContactFormId() {
  return (
    import.meta.env.VITE_FORMSPREE_CONTACT_ID ||
    import.meta.env.VITE_FORMSPREE_ID ||
    ''
  )
}

function collectFormspreeErrors(errors) {
  if (!errors) return []
  const messages = []

  for (const err of errors.getFormErrors?.() || []) {
    if (err?.message) messages.push(err.message)
  }

  for (const [field, fieldErrors] of errors.getAllFieldErrors?.() || []) {
    for (const err of fieldErrors || []) {
      if (!err?.message) continue
      const label = field
        ? String(field).charAt(0).toUpperCase() + String(field).slice(1)
        : ''
      messages.push(label ? `${label}: ${err.message}` : err.message)
    }
  }

  return messages
}

export default function ContactForm() {
  const formId = getContactFormId()
  const submit = useSubmit(formId || 'missing-form-id')

  const [form, setForm] = useState(INITIAL_FORM)
  const [localErrors, setLocalErrors] = useState({})
  const [fieldErrors, setFieldErrors] = useState({})
  const [bannerErrors, setBannerErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [succeeded, setSucceeded] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setLocalErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
    setFieldErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
    setBannerErrors([])
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.email.trim()) {
      next.email = 'Email is required.'
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      next.email = 'Please enter a valid email address.'
    }
    if (!form.subject.trim()) next.subject = 'Subject is required.'
    if (!form.message.trim()) next.message = 'Message is required.'
    setLocalErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(event) {
    event.preventDefault()
    setBannerErrors([])
    setFieldErrors({})

    if (!validate()) {
      setBannerErrors(['Please fix the highlighted fields and try again.'])
      return
    }

    setSubmitting(true)
    try {
      const result = await submit(event)

      if (isSubmissionError(result)) {
        // Never show success when Formspree returns 422 / validation errors
        setSucceeded(false)

        const messages = collectFormspreeErrors(result)
        setBannerErrors(
          messages.length > 0
            ? messages
            : ['Formspree rejected this submission. Please try again.']
        )

        const byField = {}
        for (const [field, errs] of result.getAllFieldErrors?.() || []) {
          const text = (errs || []).map((e) => e.message).filter(Boolean).join(', ')
          if (text) byField[field] = text
        }
        setFieldErrors(byField)
        return
      }

      setSucceeded(true)
      setBannerErrors([])
      setFieldErrors({})
    } catch (err) {
      setSucceeded(false)
      setBannerErrors([
        err?.message || 'Network error while sending. Check your connection and try again.',
      ])
    } finally {
      setSubmitting(false)
    }
  }

  if (!formId) {
    return (
      <div className="form-error form-error--banner" role="alert">
        <strong>Contact form unavailable.</strong>
        <p style={{ margin: '0.35rem 0 0' }}>
          Set <code>VITE_FORMSPREE_CONTACT_ID</code> (or{' '}
          <code>VITE_FORMSPREE_ID</code>) in your environment, then restart the
          dev server.
        </p>
      </div>
    )
  }

  if (succeeded) {
    return (
      <div className="form-success">
        <h2>Thanks, {form.name || 'there'}!</h2>
        <p>
          Your message is on its way. We read every email and will reply to{' '}
          <strong>{form.email}</strong> as soon as we can.
        </p>
        <button
          type="button"
          className="btn btn--secondary"
          style={{ marginTop: '1rem' }}
          onClick={() => {
            setSucceeded(false)
            setForm(INITIAL_FORM)
            setLocalErrors({})
            setFieldErrors({})
            setBannerErrors([])
          }}
        >
          Send another message
        </button>
      </div>
    )
  }

  const emailError = localErrors.email || fieldErrors.email
  const nameError = localErrors.name || fieldErrors.name
  const subjectError = localErrors.subject || fieldErrors.subject
  const messageError = localErrors.message || fieldErrors.message

  return (
    <form className="suggestion-form" onSubmit={onSubmit} noValidate>
      <p className="suggestion-form__intro">
        Order help, download issues, refunds, or general questions — email is
        the best way to reach us. Include your order email if this is about a
        purchase.
      </p>

      {bannerErrors.length > 0 && (
        <div className="form-error form-error--banner" role="alert">
          <strong>Could not send your message.</strong>
          <ul className="form-error__list">
            {bannerErrors.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={`form-group${nameError ? ' form-group--error' : ''}`}>
        <label htmlFor="contact-name">Your name</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
          required
        />
        {nameError && <p className="form-error">{nameError}</p>}
      </div>

      <div className={`form-group${emailError ? ' form-group--error' : ''}`}>
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />
        {emailError && <p className="form-error">{emailError}</p>}
      </div>

      <div className={`form-group${subjectError ? ' form-group--error' : ''}`}>
        <label htmlFor="contact-subject">Subject</label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          placeholder="e.g. Download link missing from order"
          required
        />
        {subjectError && <p className="form-error">{subjectError}</p>}
      </div>

      <div className={`form-group${messageError ? ' form-group--error' : ''}`}>
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us what you need help with…"
          required
        />
        {messageError && <p className="form-error">{messageError}</p>}
      </div>

      <button type="submit" className="btn btn--primary" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
