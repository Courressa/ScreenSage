import React, { useState } from 'react'
import { useForm, ValidationError } from '@formspree/react';
import '../../styles/forms.css'

const INITIAL_FORM = {
  name: '',
  email: '',
  idea: '',
  notes: '',
}

export default function SuggestionForm() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [state, handleSubmit] = useForm(import.meta.env.VITE_FORMSPREE_ID);

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function validate() {
    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = 'Name is required.'
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!form.idea.trim()) nextErrors.idea = 'Collection idea is required.'

    return nextErrors
  }

  function handleFormSubmit(event) {
    event.preventDefault()

    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    handleSubmit(event)
  }

  if (state.succeeded) {
    return (
      <div className="form-success">
        <h2>Thank you, {form.name}!</h2>
        <p>
          Your suggestion has been received. If accepted, your collection will
          be credited to you by name.
        </p>
      </div>
    )
  }

  return (
    <form className="suggestion-form" onSubmit={handleFormSubmit} noValidate>
      <p className="suggestion-form__intro">
        Have an idea for a new wallpaper collection? Share it with us. Accepted
        suggestions are credited by naming the collection after the contributor.
      </p>

      <div className={`form-group${errors.name ? ' form-group--error' : ''}`}>
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
        />
        {errors.name && <p className="form-error">{errors.name}</p>}
      </div>

      <div className={`form-group${errors.email ? ' form-group--error' : ''}`}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
        />
        {errors.email && <p className="form-error">{errors.email}</p>}
      </div>

      <div className={`form-group${errors.idea ? ' form-group--error' : ''}`}>
        <label htmlFor="idea">Collection idea</label>
        <input
          id="idea"
          name="idea"
          type="text"
          value={form.idea}
          onChange={handleChange}
          placeholder="e.g. Neon Tokyo alleyways at midnight"
        />
        {errors.idea && <p className="form-error">{errors.idea}</p>}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Theme / mood notes (optional)</label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Colors, moods, or styles you have in mind..."
        />
      </div>

      <button type="submit" className="btn btn--primary">
        Submit suggestion
      </button>
    </form>
  )
}