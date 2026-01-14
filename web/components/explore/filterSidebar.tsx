'use client';

import { ExploreFilters } from "@/lib/filters";
import CategoryTree from "./categoryTree";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, ChevronUpIcon, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface Props {
  filters: ExploreFilters;
  updateFilter: (key: string, value?: string) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({
  filters,
  updateFilter,
  applyFilters,
  clearFilters,
  isOpen,
  onClose,
}: Props) {
  const isRecommended = filters.mode === "recommended";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      {/* OVERLAY (MOBILE ONLY) */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 bg-black/40 z-100 transition-opacity lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      />

      {/* SIDEBAR */}
      <aside
        className={clsx(
          `
          fixed inset-y-0 right-0 z-100
          w-full sm:w-[360px]
          bg-white
          transform transition-transform duration-300
          flex flex-col
          lg:static lg:transform-none lg:z-100
          lg:w-72 lg:rounded-xl lg:border
          `,
          isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* HEADER (MOBILE) */}
        <div className="flex items-center justify-between p-4 border-b lg:hidden z-100">
          <h3 className="font-semibold text-lg">Filters</h3>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* MODE */}
          <section>
            <h4 className="font-semibold mb-2">Mode</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={clsx(
                    "w-full justify-between",
                    isRecommended && "bg-black text-white border-black"
                  )}
                >
                  {filters.mode === "recommended" ? "Recommended" : "Custom"}
                  {isDropdownOpen ? (
                    <ChevronUpIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup
                  value={filters.mode}
                  onValueChange={(value) => updateFilter("mode", value)}
                >
                  <DropdownMenuRadioItem value="recommended">
                    Recommended
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="custom">
                    Custom
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </section>

          {/* FILTERS */}
          <div
            className={clsx(
              "space-y-6",
              isRecommended && "opacity-50 pointer-events-none"
            )}
          >
            {/* SORT */}
            <section>
              <h4 className="font-semibold mb-2">Sort By</h4>
              <RadioGroup
                value={filters.sort}
                onValueChange={(v) => updateFilter("sort", v)}
              >
                {["relevance", "rating", "price", "reviews"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={opt} />
                    <Label htmlFor={opt} className="capitalize">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </section>

            {/* CONNECT */}
            <section>
              <h4 className="font-semibold mb-2">Connect Type</h4>
              <RadioGroup
                value={filters.connectType}
                onValueChange={(v) => updateFilter("connect", v)}
              >
                {["video", "audio", "chat"].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <RadioGroupItem value={t} id={t} />
                    <Label htmlFor={t} className="capitalize">
                      {t}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </section>

            {/* CATEGORIES */}
            <CategoryTree
              selected={filters.categories}
              onChange={(cats) =>
                updateFilter("categories", cats.join(","))
              }
              disabled={isRecommended}
            />
          </div>
        </div>

        {/* FOOTER (MOBILE ACTIONS) */}
        <div className="border-t p-4 flex gap-3 lg:hidden">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => {
              clearFilters();
              onClose();
            }}
          >
            Clear
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              applyFilters();
              onClose();
            }}
          >
            Apply
          </Button>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden lg:flex gap-3 p-5 pt-0">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={clearFilters}
            disabled={isRecommended}
          >
            Clear
          </Button>
          <Button className="flex-1" onClick={applyFilters} disabled={isRecommended}>
            Apply
          </Button>
        </div>
      </aside>
    </>
  );
}
