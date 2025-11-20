/**
 * Shared shape definitions for multiplayer sync
 * These must match the frontend shape utilities exactly
 */

import { T } from '@tldraw/validate'
import { createShapePropsMigrationSequence } from '@tldraw/tlschema'

export const customShapeSchemas = {
	'pdf-viewer': {
		props: {
			w: T.nonZeroNumber,
			h: T.nonZeroNumber,
			documentUrl: T.string,
			documentId: T.string,
			filename: T.string,
		},
		migrations: createShapePropsMigrationSequence({
			sequence: [],
		}),
	},
	'c1-response': {
		props: {
			w: T.nonZeroNumber,
			h: T.nonZeroNumber,
			c1Response: T.string,
			isStreaming: T.boolean,
			prompt: T.string,
			isInteracting: T.boolean,
		},
		migrations: createShapePropsMigrationSequence({
			sequence: [],
		}),
	},
	'video-call': {
		props: {
			w: T.nonZeroNumber,
			h: T.nonZeroNumber,
			roomUrl: T.string,
			token: T.string,
		},
		migrations: createShapePropsMigrationSequence({
			sequence: [],
		}),
	},
	'custom-embed': {
		props: {
			w: T.nonZeroNumber,
			h: T.nonZeroNumber,
			embedUrl: T.string,
			service: T.string,
			query: T.string,
			isInteracting: T.boolean,
		},
		migrations: createShapePropsMigrationSequence({
			sequence: [],
		}),
	},
	'meeting-summary': {
		props: {
			w: T.nonZeroNumber,
			h: T.nonZeroNumber,
			summaryContent: T.string,
			isStreaming: T.boolean,
			metadata: T.any,
		},
		migrations: createShapePropsMigrationSequence({
			sequence: [],
		}),
	},
} as const

