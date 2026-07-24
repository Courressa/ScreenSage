import { useState } from 'react'
import { useForm, ValidationError } from '@formspree/react';
import '../../styles/forms.css'

const INITIAL_FORM = {
  name: '',
  email: '',
  idea: '',
  notes: '',
}

export default function SuggestionForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [state, handleSubmit] = useForm(import.meta.env.VITE_FORMSPREE_ID);

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
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
    <form className="suggestion-form" onSubmit={handleSubmit} noValidate>
      <p className="suggestion-form__intro">
        Have an idea for a new wallpaper collection? Share it with us. Accepted
        suggestions are credited by naming the collection after the contributor.
      </p>

      <div className="form-group">
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
        />
        <ValidationError
          field="name"
          prefix="Name"
          errors={state.errors}
          className="form-error"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
        />
        <ValidationError
          field="email"
          prefix="Email"
          errors={state.errors}
          className="form-error"
        />
      </div>

      <div className="form-group">
        <label htmlFor="idea">Collection idea</label>
        <input
          id="idea"
          name="idea"
          type="text"
          value={form.idea}
          onChange={handleChange}
          placeholder="e.g. Neon Tokyo alleyways at midnight"
        />
        <ValidationError
          field="idea"
          prefix="Idea"
          errors={state.errors}
          className="form-error"
        />
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

      <ValidationError errors={state.errors} className="form-error form-error--banner" />

      <button
        type="submit"
        className="btn btn--primary"
        disabled={state.submitting}
      >
        {state.submitting ? "Sending..." : "Submit suggestion"}
      </button>
    </form>
  )
}