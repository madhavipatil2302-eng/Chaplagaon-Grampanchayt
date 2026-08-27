import { useTranslation } from 'react-i18next'

function Language() {
  const { i18n } = useTranslation()

  return (
    <>
      <p>Select language</p>
      <button onClick={() => i18n.changeLanguage('mr')}>Marathi</button>
      <button onClick={() => i18n.changeLanguage('hi')}>Hindi</button>
      <button onClick={() => i18n.changeLanguage('en')}>English</button>
    </>
  )
}

export default Language
