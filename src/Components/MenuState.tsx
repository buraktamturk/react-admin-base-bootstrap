import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useLocation } from "react-router-dom";

export function useIsMobile() {
	return useMediaQuery({ query: '(max-width: 992px)' });
}

const useOnLocationChange = (handleLocationChange: any) => {
	const location = useLocation();
	
	const locationRef = useRef("");
	
	useEffect(function() {
		if (locationRef.current != location.pathname) {
			handleLocationChange(location);
			locationRef.current = location.pathname;
		}
	}, [location.pathname, locationRef, handleLocationChange]);
};

export function useMenuState() {
	const isMobile = useIsMobile();
	
	const state = useReducer(a => !a, !isMobile);
	const [ isOpen, toggleOpen ] = state;

	const locationChangeCallback = useCallback(function() {
		if (isMobile && !isOpen) {
			toggleOpen();
		}
	}, [ isMobile, isOpen ]);

	useOnLocationChange(locationChangeCallback);
	
	return state;
}
