"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { logOutAction } from "@/actions/log-out.action";
import { EditBookDialog } from "@/components/edit-book-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookCoverPlaceholder, EmptyShelfDoodle, FlameDoodle } from "@/components/doodles";

export function LibraryView({ books, isOwner, username, streak }) {
  const [activeTab, setActiveTab] = useState("total");

  const reading = books.filter((b) => b.is_reading && !b.is_finished);
  const finished = books.filter((b) => b.is_finished);
  const wantToRead = books.filter((b) => !b.is_reading && !b.is_finished);

  const displayBooks =
    activeTab === "reading" ? reading :
    activeTab === "finished" ? finished :
    activeTab === "next" ? wantToRead :
    books;

  const tabs = [
    { key: "total", label: "total", count: books.length },
    { key: "reading", label: "reading", count: reading.length },
    { key: "finished", label: "finished", count: finished.length },
    { key: "next", label: "next", count: wantToRead.length },
  ];

  const emptyMessage =
    activeTab === "reading" ? "no books currently being read" :
    activeTab === "finished" ? "no finished books yet" :
    activeTab === "next" ? "no books queued up next" :
    isOwner ? "add your first book to get started" : "no books yet";

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-3xl">{username}</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="doodle-underline font-hand text-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            bestRead
          </Link>
          <ThemeToggle />
          {isOwner && (
            <form action={logOutAction}>
              <button
                type="submit"
                className="doodle-underline text-[13px] tracking-[0.13em] text-muted-foreground hover:text-foreground transition-colors"
              >
                log out
              </button>
            </form>
          )}
        </div>
      </header>

      {/* Add book link */}
      {isOwner && (
        <div className="flex justify-end">
          <Link
            href="/add-book"
            className="doodle-underline accent font-hand text-xl text-foreground"
          >
            + add a book
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-x-7 gap-y-3">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            aria-pressed={activeTab === key}
            className={`doodle-underline whitespace-nowrap text-sm tracking-[0.1em] transition-colors ${
              activeTab === key
                ? "is-on text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="font-hand text-xl mr-1">{count}</span> {label}
          </button>
        ))}
      </div>

      {/* Streak */}
      {streak?.current_streak > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FlameDoodle className="w-4 h-4 -mt-0.5" />
          {streak.current_streak} day streak
          {streak.longest_streak > streak.current_streak &&
            ` · best: ${streak.longest_streak}`}
        </p>
      )}

      {/* Book list */}
      {displayBooks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <EmptyShelfDoodle className="w-56 text-foreground" />
          <p className="font-hand text-xl text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayBooks.map((book) => (
            <BookRow key={book.id} book={book} isOwner={isOwner} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookRow({ book, isOwner }) {
  const progressPercent =
    book.progress_type === "percentage"
      ? book.progress
      : book.page_count && book.page_count > 0
      ? Math.round((book.progress / book.page_count) * 100)
      : 0;

  const rightLabel = book.is_finished
    ? "read"
    : book.is_reading
    ? `${progressPercent}%`
    : "next";

  const inner = (
    <>
      <div className="flex gap-3 min-w-0">
        {book.image_url ? (
          <Image
            src={book.image_url}
            alt={book.title}
            width={40}
            height={60}
            className="object-cover flex-shrink-0 self-start"
          />
        ) : (
          <BookCoverPlaceholder className="w-10 h-[60px]" />
        )}
        <div className="min-w-0 space-y-0.5">
          <p className="font-normal text-[15px] text-foreground leading-snug">{book.title}</p>
          {book.authors?.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {book.authors.join(", ")}
            </p>
          )}
        </div>
      </div>
      <span className="font-hand text-lg text-muted-foreground shrink-0 self-center">
        {rightLabel}
      </span>
    </>
  );

  if (!isOwner) {
    return (
      <div className="flex justify-between items-start gap-4 py-2">
        {inner}
      </div>
    );
  }

  return (
    <EditBookDialog book={book}>
      <button
        type="button"
        className="group flex justify-between items-start gap-4 w-full text-left py-2.5 px-2 -mx-2 transition-transform duration-300 hover:translate-x-1"
      >
        {inner}
      </button>
    </EditBookDialog>
  );
}
