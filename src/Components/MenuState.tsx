import { useEffect, useReducer } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useHistory } from "react-router-dom";

export function useIsMobile() {
	return useMediaQuery({ query: '(max-width: 992px)' });
}

export function useMenuState() {
	const isMobile = useIsMobile();
	const state = useReducer(a => !a, !isMobile);
	const [ isOpen, toggleOpen ] = state;

	const history = useHistory();
	useEffect(function() {
		if (isMobile && isOpen) {
			return history.listen(function() {
			   toggleOpen();
			});
		}
	}, [isMobile, isOpen, history]);

	return state;
}
