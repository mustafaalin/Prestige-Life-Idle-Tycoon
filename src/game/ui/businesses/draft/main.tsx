import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../../index.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import '../../../mobile.css';
import { I18nProvider } from '../../../i18n/I18nProvider';
import { BusinessDraft } from './BusinessDraft';

// Entry of business-draft.html (dev server only).

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <I18nProvider initialLocale="tr">
      <BusinessDraft />
    </I18nProvider>
  </StrictMode>,
);
