import NProgress from 'nprogress';
import React, { useEffect } from 'react';
import { useAuth } from "react-admin-base";

type TopProgressBarProps = {
    children: React.ReactNode;
};

export default function TopProgressBar({ children }: TopProgressBarProps): React.ReactNode {
	const [ api ] = useAuth();

	useEffect(function() {
		return api.set_hook(() => NProgress.start(), () => NProgress.done());
	}, [api.set_hook]);

	return children;
}
