
import React, { useContext, useMemo, useState } from 'react';
import { useApp, useLocalStorage } from 'react-admin-base';
import { IntlProvider } from 'react-intl';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import enMessages from '../i18n/en.json';
import deMessages from '../i18n/de.json';
import trMessages from '../i18n/tr.json';

const _languages = {
  'en': enMessages,
  'de': deMessages,
  'tr': trMessages
};

const LanguageContext = React.createContext(null as any);

export function useLanguage() {
  return useContext(LanguageContext);
}

type LanguageProviderProps = {
    defaultLanguage: string;
    languages: any[];
    loader?: (language: any) => any;
    children: React.ReactNode;
};

export default function LanguageProvider({ defaultLanguage, languages, loader, children }: LanguageProviderProps) {
  const app = useApp();
  
  const preferredLanguage = (navigator.languages && navigator.languages[0]) || navigator.language;

  const [ lang, setLang ] = useLocalStorage(app.id + "_language");

  const activeLanguageKey = (!!lang && languages[lang] && lang) || (languages[preferredLanguage] && preferredLanguage) || (languages[defaultLanguage] && defaultLanguage);
  const activeLanguage = languages[activeLanguageKey];
  const value = useMemo(() => [ activeLanguage, languages, setLang], [ activeLanguage, languages, setLang]);

  const originalMessages = (loader && loader(activeLanguage)) || activeLanguage.messages;

  const messages = useMemo(() => originalMessages && ({ ...(_languages[activeLanguageKey] || _languages.en), ...originalMessages }), [originalMessages, activeLanguage]);

  if (!messages)
    return null;

  return <IntlProvider locale={activeLanguageKey} messages={messages}>
    <LanguageContext.Provider value={value}>
      { children }
    </LanguageContext.Provider>
  </IntlProvider>;
}

export function LanguageSwitcher() {
  const [show, setShow] = useState(false);
  const [ activeLang, languages, setLanguage ] = useLanguage();
  
  if (Object.keys(languages).length <= 1)
    return null;

  return <Dropdown isOpen={show} toggle={() => setShow(!show)}>
      <DropdownToggle className="nav-flag" nav caret>
          { activeLang.icon && <img width="20" className="me-1" src={ activeLang.icon } alt={activeLang.name} /> } {activeLang.name}
      </DropdownToggle>
      <DropdownMenu>
          { Object.entries(languages).map(([key, value] : any) => <DropdownItem key={key} active={activeLang === value} onClick={() => setLanguage(key)}>
              {value.icon && <img width="20" className="me-1" src={value.icon} alt={value.name} /> } <span className="align-middle">{ value.name }</span>
          </DropdownItem>) }
      </DropdownMenu>
  </Dropdown>;
}
