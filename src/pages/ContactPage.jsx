import ContactForm from '../components/forms/ContactForm.jsx'

export default function ContactPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Contact us</h1>
        <p className="page__subtitle">
          Send a message below and we&apos;ll get back to
          you personally.
        </p>
      </header>
      <ContactForm />
    </div>
  )
}
