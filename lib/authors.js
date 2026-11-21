// Authors are stored as a text[] and shown joined with ", ".
// Typed input uses the same separator, so editing round-trips cleanly.
export function parseAuthors(text) {
	return (text ?? '')
		.split(',')
		.map((name) => name.trim())
		.filter(Boolean);
}

export function formatAuthors(authors) {
	return (authors ?? []).join(', ');
}
