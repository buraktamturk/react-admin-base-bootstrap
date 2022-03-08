
import React, { useContext, useReducer, useMemo, useState } from 'react';
import { useApp } from 'react-admin-base';
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

export default function LanguageProvider({ defaultLanguage, languages, children }) {
  const app = useApp();

  const preferredLanguage = (navigator.languages && navigator.languages[0]) ||
    navigator.language;

  const [ lang, setLang ] = useReducer((oldValue, newValue) => {
    localStorage.setItem(app.id + "_" + 'language', newValue);
    return newValue;
  }, localStorage.getItem(app.id + "_" + 'language') || null);

  const activeLanguageKey = (!!lang && languages[lang] && lang) || (languages[preferredLanguage] && preferredLanguage) || (languages[defaultLanguage] && defaultLanguage);
  const activeLanguage = languages[activeLanguageKey];

  const messages = useMemo(() => ({ ...(_languages[activeLanguageKey] || _languages.en), ...activeLanguage.messages }), [activeLanguage])
  const value = useMemo(() => [ activeLanguage, languages, setLang], [ activeLanguage, languages, setLang]);

  return <IntlProvider locale={activeLanguageKey} messages={messages}>
    <LanguageContext.Provider value={value}>
      { children }
    </LanguageContext.Provider>
  </IntlProvider>;
}

export function LanguageSwitcher() {
  const [show, setShow] = useState(false);
  const [ activeLang, languages, setLanguage ] = useLanguage();

  return <Dropdown isOpen={show} toggle={() => setShow(!show)}>
      <DropdownToggle className="nav-flag dropdown-toggle show" nav caret>
          <img width="20" src={ activeLang.icon } alt={activeLang.name} />
      </DropdownToggle>
      <DropdownMenu end>
          { Object.entries(languages).map(([key, value] : any) => <DropdownItem key={key} active={activeLang === value} onClick={() => setLanguage(key)}>
              <img width="20" src={value.icon} alt={value.name} /> <span className="align-middle">{ value.name }</span>
          </DropdownItem>) }
      </DropdownMenu>
  </Dropdown>;
}
