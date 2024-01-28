import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { useLocalStorage } from "react-admin-base";

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

export async function rawCssLoader(cb) {
	const styleTag = document.createElement('style');

	let loaded = false;

	return {
		default: {
			use: async function() {
				document.head.appendChild(styleTag);

				if (!loaded) {
					loaded = true;
					styleTag.innerHTML = await cb();
				}
			},
			unuse: function() {
				document.head.removeChild(styleTag);
			}
		}
	};
}

export async function urlCssLoader(link) {
	const linkTag = document.createElement('link');
	linkTag.rel = 'stylesheet';
	linkTag.type = 'text/css';
	linkTag.href = link;

	return {
		default: {
			use: function() {
				document.head.appendChild(linkTag);
			},
			unuse: function() {
				document.head.removeChild(linkTag);
			}
		}
	};
}
