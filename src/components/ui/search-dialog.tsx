"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";

type SearchResult = {
  id: string;
  title: string;
  type: "project" | "event" | "user";
  url: string;
  description?: string;
  username?: string;
};

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.results);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    router.push(result.url);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 bg-[#252525] border-[#333333] text-gray-300 hover:bg-[#333333] hover:text-white"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" aria-hidden="true" />
        <span className="hidden xl:inline-flex">Search...</span>
        <span className="sr-only">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-[#333333] px-1.5 font-mono text-xs font-medium opacity-100 xl:flex text-gray-400">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        // Remove className from here
      >
        <div className="bg-[#1a1a1a] border-[#333333] text-white">
          <CommandInput
            placeholder="Search projects, events, and users..."
            value={query}
            onValueChange={setQuery}
            className="border-b-[#333333] text-white placeholder:text-gray-500 bg-[#1a1a1a]"
          />
          <CommandList className="bg-[#1a1a1a] text-white">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-8 w-full bg-[#252525]" />
                <Skeleton className="h-8 w-full bg-[#252525]" />
                <Skeleton className="h-8 w-full bg-[#252525]" />
              </div>
            ) : (
              <>
                <CommandEmpty className="text-gray-400 p-4">
                  No results found.
                </CommandEmpty>
                {results.length > 0 && (
                  <>
                    <CommandGroup heading="Projects" className="text-gray-300">
                      {results
                        .filter((result) => result.type === "project")
                        .map((result) => (
                          <CommandItem
                            key={result.id}
                            value={result.title}
                            onSelect={() => handleSelect(result)}
                            className="hover:bg-[#252525] text-white"
                          >
                            <div className="flex flex-col">
                              <span>{result.title}</span>
                              {result.description && (
                                <span className="text-xs text-gray-400 truncate">
                                  {result.description.substring(0, 60)}...
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandGroup heading="Events" className="text-gray-300">
                      {results
                        .filter((result) => result.type === "event")
                        .map((result) => (
                          <CommandItem
                            key={result.id}
                            value={result.title}
                            onSelect={() => handleSelect(result)}
                            className="hover:bg-[#252525] text-white"
                          >
                            <div className="flex flex-col">
                              <span>{result.title}</span>
                              {result.description && (
                                <span className="text-xs text-gray-400 truncate">
                                  {result.description.substring(0, 60)}...
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandGroup heading="Users" className="text-gray-300">
                      {results
                        .filter((result) => result.type === "user")
                        .map((result) => (
                          <CommandItem
                            key={result.id}
                            value={result.username || result.title}
                            onSelect={() => handleSelect(result)}
                            className="hover:bg-[#252525] text-white"
                          >
                            <span>@{result.username || result.title}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </CommandList>
        </div>
      </CommandDialog>
    </>
  );
}
