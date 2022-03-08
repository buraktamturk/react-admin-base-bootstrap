import NProgress from 'nprogress';
import { useEffect } from 'react';
import { useAuth } from "react-admin-base";

export default function TopProgressBar({ children }) {
	const [ api ] = useAuth();

	useEffect(function() {
		return api.set_hook(() => NProgress.start(), () => NProgress.done());
	}, [api.set_hook]);

	return children;
}
