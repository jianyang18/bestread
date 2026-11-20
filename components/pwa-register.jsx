'use client';

import {useEffect} from 'react';

// Registers public/sw.js in production so the app shell loads fast and an offline note
// shows instead of the browser's error page. Skipped in dev so it never caches stale code.
export function PwaRegister() {
	useEffect(() => {
		if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
		navigator.serviceWorker.register('/sw.js', {scope: '/'}).catch(() => {});
	}, []);
	return null;
}
