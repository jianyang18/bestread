'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {useAction} from 'next-safe-action/hooks';
import {addBookAction} from '@/actions/add-book.action';
import {logOutAction} from '@/actions/log-out.action';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {ThemeToggle} from '@/components/theme-toggle';
import {uploadBookCover} from '@/lib/upload-cover';
import {toast} from 'sonner';

export function AddBookClientPage({username}) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const [selected, setSelected] = useState(null);
	const [manualTitle, setManualTitle] = useState('');
	const [manualImageUrl, setManualImageUrl] = useState(null);
	const [uploading, setUploading] = useState(false);
	const selectedFileRef = useRef(null);
	const manualFileRef = useRef(null);

	const {execute: addBook, isPending} = useAction(addBookAction, {
		onError: ({error}) => toast.error(error.serverError || 'failed to add book'),
	});

	// Debounced live search
	useEffect(() => {
		if (selected) return;
		const trimmed = query.trim();
		if (!trimmed) {
			setResults([]);
			setSearching(false);
			return;
		}
		setSearching(true);
		const controller = new AbortController();
		const timer = setTimeout(async () => {
			try {
				const res = await fetch(
					`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(trimmed)}&maxResults=8&key=${process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}`,
					{signal: controller.signal},
				);
				const data = await res.json();
				setResults(data.items || []);
			} catch (err) {
				if (err.name !== 'AbortError') toast.error('search failed');
			} finally {
				setSearching(false);
			}
		}, 350);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [query, selected]);

	function handleSelect(book) {
		const info = book.volumeInfo;
		setSelected({
			title: info.title || 'untitled',
			authors: info.authors || [],
			pageCount: info.pageCount || 0,
			imageUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
		});
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
		if (!manualTitle.trim()) return;
		addBook({
			title: manualTitle.trim(),
			authors: [],
			pageCount: 0,
			imageUrl: manualImageUrl || undefined,
			isReading: false,
		});
	}

	async function uploadAndSet(file, setUrl) {
		if (!file) return;
		setUploading(true);
		try {
			const url = await uploadBookCover(file);
			setUrl(url);
			toast.success('cover uploaded');
		} catch (err) {
			toast.error(err.message || 'upload failed');
		} finally {
			setUploading(false);
		}
	}

	async function handleSelectedFileChange(e) {
		const file = e.target.files?.[0];
		e.target.value = '';
		await uploadAndSet(file, (url) => setSelected((prev) => ({...prev, imageUrl: url})));
	}

	async function handleManualFileChange(e) {
		const file = e.target.files?.[0];
		e.target.value = '';
		await uploadAndSet(file, setManualImageUrl);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<header className="flex justify-between items-center">
				<Link href="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
					bestRead
				</Link>
				<div className="flex items-center gap-4">
					<ThemeToggle />
					<form action={logOutAction}>
						<button type="submit" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
							log out
						</button>
					</form>
				</div>
			</header>

			{/* Back */}
			<Link href={`/${username}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
				← go back
			</Link>

			{!selected ? (
				<div className="space-y-6">
					{/* Search */}
					<Input
						placeholder="search by title or author..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						autoFocus
					/>

					{searching && <p className="text-sm text-muted-foreground">searching...</p>}

					{!searching && results.length > 0 && (
						<div className="divide-y divide-border">
							{results.map((book) => (
								<button
									key={book.id}
									onClick={() => handleSelect(book)}
									className="w-full text-left flex gap-4 items-start py-3 hover:bg-accent transition-colors px-1">
									{book.volumeInfo.imageLinks?.smallThumbnail ? (
										<Image
											src={book.volumeInfo.imageLinks.smallThumbnail.replace('http:', 'https:')}
											alt={book.volumeInfo.title}
											width={40}
											height={60}
											className="object-cover flex-shrink-0"
										/>
									) : (
										<div className="w-10 h-[60px] bg-secondary flex-shrink-0" />
									)}
									<div className="min-w-0">
										<p className="font-bold text-sm leading-tight">{book.volumeInfo.title}</p>
										{book.volumeInfo.authors?.length > 0 && (
											<p className="text-sm italic text-muted-foreground mt-0.5">
												{book.volumeInfo.authors.join(', ')}
											</p>
										)}
									</div>
								</button>
							))}
						</div>
					)}

					{!searching && query.trim() && results.length === 0 && (
						<p className="text-sm text-muted-foreground">no results</p>
					)}

					{/* Manual add */}
					<div className="border-t pt-4 space-y-3">
						<p className="text-xs text-muted-foreground">or add manually</p>
						<form onSubmit={handleManualAdd} className="space-y-3">
							<Input
								name="title"
								placeholder="book title (press enter to add)"
								value={manualTitle}
								onChange={(e) => setManualTitle(e.target.value)}
							/>
							<div className="flex gap-3 items-start">
								{manualImageUrl ? (
									<Image
										src={manualImageUrl}
										alt="cover"
										width={48}
										height={72}
										unoptimized
										className="object-cover flex-shrink-0"
									/>
								) : (
									<div className="w-12 h-[72px] bg-secondary flex-shrink-0" />
								)}
								<div className="space-y-1">
									<input
										ref={manualFileRef}
										type="file"
										accept="image/jpeg,image/png,image/webp"
										onChange={handleManualFileChange}
										className="hidden"
									/>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={() => manualFileRef.current?.click()}
											disabled={uploading}
											className="text-xs underline text-muted-foreground hover:text-foreground disabled:opacity-50">
											{uploading ? 'uploading...' : manualImageUrl ? 'replace cover' : 'upload cover (optional)'}
										</button>
										{manualImageUrl && !uploading && (
											<button
												type="button"
												onClick={() => setManualImageUrl(null)}
												className="text-xs underline text-muted-foreground hover:text-destructive">
												remove
											</button>
										)}
									</div>
									<p className="text-[10px] text-muted-foreground">jpg, png, webp · max 2 mb</p>
								</div>
							</div>
						</form>
					</div>
				</div>
			) : (
				<div className="space-y-6">
					<div className="flex gap-4">
						{selected.imageUrl ? (
							<Image
								src={selected.imageUrl}
								alt={selected.title}
								width={64}
								height={96}
								unoptimized
								className="object-cover flex-shrink-0"
							/>
						) : (
							<div className="w-16 h-[96px] bg-secondary flex-shrink-0" />
						)}
						<div className="min-w-0 space-y-1">
							<p className="font-bold">{selected.title}</p>
							<p className="text-sm italic text-muted-foreground">{selected.authors.join(', ')}</p>
							{selected.pageCount > 0 && <p className="text-xs text-muted-foreground">{selected.pageCount} pages</p>}
							<input
								ref={selectedFileRef}
								type="file"
								accept="image/jpeg,image/png,image/webp"
								onChange={handleSelectedFileChange}
								className="hidden"
							/>
							<button
								type="button"
								onClick={() => selectedFileRef.current?.click()}
								disabled={uploading}
								className="text-xs underline text-muted-foreground hover:text-foreground disabled:opacity-50">
								{uploading ? 'uploading...' : selected.imageUrl ? 'replace cover' : 'upload cover'}
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<Button onClick={() => handleAdd(true)} disabled={isPending || uploading} className="w-full">
							currently reading
						</Button>
						<Button
							onClick={() => handleAdd(false)}
							disabled={isPending || uploading}
							variant="outline"
							className="w-full">
							want to read
						</Button>
					</div>

					<button onClick={() => setSelected(null)} className="text-xs text-muted-foreground hover:underline">
						search again
					</button>
				</div>
			)}
		</div>
	);
}
