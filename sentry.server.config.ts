// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
	enabled: process.env.NODE_ENV === 'production',

	dsn: 'https://624f0571e1ccf32fc5fb3c62165dca72@o4509021525442560.ingest.de.sentry.io/4509021528129616',

	// Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
	tracesSampleRate: 1,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,
})
