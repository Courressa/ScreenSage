import SuggestionForm from '../components/forms/SuggestionForm.jsx'

export default function SuggestPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Suggest a Collection</h1>
        <p className="page__subtitle">
          Help shape the next ScreenSage drop. Great ideas get credited by name.
        </p>
      </header>
      <SuggestionForm />
    </div>
  )
}