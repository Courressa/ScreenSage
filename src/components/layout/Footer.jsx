export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <p>&copy; {year} ScreenSage. Premium AI wallpapers &amp; videos.</p>
      <p>
        <a href="https://screensage.fyi" target="_blank" rel="noopener noreferrer">
          screensage.fyi
        </a>
      </p>
    </footer>
  )
}