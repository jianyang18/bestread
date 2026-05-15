'use client';

import {useState} from 'react';
import {useAction} from 'next-safe-action/hooks';
import {addBookAction} from '@/actions/add-book.action';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {toast} from 'sonner';
import Image from 'next/image';

export function AddBookDialog() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const [selected, setSelected] = useState(null);

	const {execute: addBook, isPending} = useAction(addBookAction, {
		onError: ({error}) => {
			toast.error(error.serverError || 'failed to add book');
		},
	});

	async function searchBooks(e) {
		e.preventDefault();
		if (!query.trim()) return;
		setSearching(true);
		setSelected(null);

		try {
			const res = await fetch(
				`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`,
			);
			const data = await res.json();
			setResults(data.items || []);
		} catch {
			toast.error('search failed');
		} finally {
			setSearching(false);
		}
	}

	function handleSelect(book) {
		const info = book.volumeInfo;
		setSelected({
			title: info.title || 'untitled',
			authors: info.authors || [],
			pageCount: info.pageCount || 0,
			imageUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
		});
		setResults([]);
		setQuery('');
	}

	function handleAdd(isReading) {
		if (!selected) return;
		addBook({
			title: selected.title,
			authors: selected.authors,
			pageCount: selected.pageCount,
			imageUrl: selected.imageUrl || undefined,
			isReading,
		});
	}

	function handleManualAdd(e) {
		e.preventDefault();
		const title = e.target.title.value.trim();
		if (!title) return;
		addBook({title, authors: [], pageCount: 0, isReading: false});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm">add book</Button>
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<DialogHeader>
					<DialogTitle>add a book</DialogTitle>
				</DialogHeader>

				{!selected ? (
					<div className="space-y-4">
						<form onSubmit={searchBooks} className="flex gap-2">
							<Input
								placeholder="search by title or author..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
							<Button type="submit" size="sm" disabled={searching}>
								{searching ? '...' : 'search'}
							</Button>
						</form>

						{results.length > 0 && (
							<ul className="space-y-2 max-h-64 overflow-y-auto">
								{results.map((book) => (
									<li key={book.id}>
										<button
											onClick={() => handleSelect(book)}
											className="w-full text-left flex gap-3 items-start p-2 hover:bg-accent transition-colors">
											{book.volumeInfo.imageLinks?.smallThumbnail && (
												<Image
													src={book.volumeInfo.imageLinks.smallThumbnail.replace('http:', 'https:')}
													alt={book.volumeInfo.title}
													width={32}
													height={48}
													className="object-cover flex-shrink-0"
												/>
											)}
											<div className="min-w-0">
												<p className="text-sm font-medium truncate">{book.volumeInfo.title}</p>
												<p className="text-xs text-muted-foreground truncate">{book.volumeInfo.authors?.join(', ')}</p>
											</div>
										</button>
									</li>
								))}
							</ul>
						)}

						<div className="border-t pt-4 space-y-2">
							<p className="text-xs text-muted-foreground">or add manually</p>
							<form onSubmit={handleManualAdd} className="flex gap-2">
								<Input name="title" placeholder="book title" />
								<Button type="submit" size="sm" disabled={isPending}>
									add
								</Button>
							</form>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex gap-3">
							{selected.imageUrl && (
								<Image
									src={selected.imageUrl}
									alt={selected.title}
									width={48}
									height={72}
									className="object-cover flex-shrink-0"
								/>
							)}
							<div className="min-w-0">
								<p className="font-medium">{selected.title}</p>
								<p className="text-sm text-muted-foreground">{selected.authors.join(', ')}</p>
								{selected.pageCount > 0 && <p className="text-xs text-muted-foreground">{selected.pageCount} pages</p>}
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<Button onClick={() => handleAdd(true)} disabled={isPending} className="w-full">
								currently reading
							</Button>
							<Button onClick={() => handleAdd(false)} disabled={isPending} variant="outline" className="w-full">
								want to read
							</Button>
						</div>
						<button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:underline">
							search again
						</button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
