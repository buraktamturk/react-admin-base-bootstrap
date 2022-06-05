import React, { createContext, Dispatch, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { useApp, useLocalStorage } from "react-admin-base";

const ThemeContext = createContext(null as any);
const AllThemesContext = createContext(null as any);

export function useTheme() {
	return useContext(ThemeContext);	
}

export function useAllThemes() {
	return useContext(AllThemesContext);	
}

export default function ThemeProvider({ themes, defaultTheme, children }) {
	const state = useLocalStorage('theme');
	const [ theme, setTheme ] = state;
	
	const rTheme = theme || defaultTheme || 'light';
	
	useEffect(function() {
		const promise = (themes[rTheme] || themes[defaultTheme]).css()
			.then(css => {
				css.default.use();
				return css;
			});
		
		return function() {
			promise.then(css => css.default.unuse());
		};
	}, [ theme ]);
	
	const val = useMemo(() => [rTheme, setTheme], [rTheme, setTheme]);
	
	return <AllThemesContext.Provider value={themes}>
		<ThemeContext.Provider value={val}>
			{ children }
		</ThemeContext.Provider>
	</AllThemesContext.Provider>;
}
