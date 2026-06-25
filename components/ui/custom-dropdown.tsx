"use client";

import React, { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon, Search01Icon, Tick01Icon } from "@hugeicons/core-free-icons";

export interface DropdownOption {
  value: string;
  label: string;
}

// 1. Dropdown with search box inside the popover list
interface SearchDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  onSelect?: (value: string) => void;
  error?: string;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  label,
  placeholder = "Select option...",
  options,
  onSelect,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DropdownOption | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: DropdownOption) => {
    setSelected(option);
    setIsOpen(false);
    setSearch("");
    if (onSelect) onSelect(option.value);
  };

  return (
    <div ref={containerRef} className="w-full space-y-1.5 text-left relative">
      {label && (
        <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wide">
          {label}
        </span>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full bg-white text-neutral-900 border font-sans text-sm transition-all duration-200 rounded-md
            px-3.5 py-2.5 outline-none flex items-center justify-between text-left cursor-pointer
            hover:border-neutral-350
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            ${error ? "border-error-500" : "border-neutral-200"}
          `}
        >
          <span className={selected ? "text-neutral-900" : "text-neutral-400"}>
            {selected ? selected.label : placeholder}
          </span>
          <HugeiconsIcon icon={ChevronDownIcon} className="h-4.5 w-4.5 text-neutral-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-neutral-200/80 rounded-md max-h-60 overflow-hidden flex flex-col">
            {/* Search Input inside Dropdown */}
            <div className="p-2 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/50">
              <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-neutral-800 placeholder-neutral-400"
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto flex-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = selected?.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={`
                        w-full text-left px-3.5 py-2 text-sm hover:bg-neutral-50 flex items-center justify-between
                        ${isSelected ? "bg-primary-50/60 text-primary-700 font-bold" : "text-neutral-800"}
                      `}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4 text-primary-600" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3.5 py-3 text-sm text-neutral-400 text-center">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs font-bold text-error-600 mt-1">{error}</p>}
    </div>
  );
};


// 2. Dropdown but search in main field (Combobox/Autocomplete)
interface ComboboxDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  onSelect?: (value: string) => void;
  error?: string;
}

export const ComboboxDropdown: React.FC<ComboboxDropdownProps> = ({
  label,
  placeholder = "Type to search...",
  options,
  onSelect,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (option: DropdownOption) => {
    setInputValue(option.label);
    setIsOpen(false);
    if (onSelect) onSelect(option.value);
  };

  return (
    <div ref={containerRef} className="w-full space-y-1.5 text-left relative">
      {label && (
        <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wide">
          {label}
        </span>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`
            w-full bg-white text-neutral-900 border font-sans text-sm transition-all duration-200 rounded-md
            pl-3.5 pr-10 py-2.5 outline-none text-left
            hover:border-neutral-350
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            ${error ? "border-error-500" : "border-neutral-200"}
          `}
        />
        
        {/* Toggle Icon */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        >
          <HugeiconsIcon icon={ChevronDownIcon} className="h-4.5 w-4.5" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 bg-white border border-neutral-200/80 rounded-md max-h-52 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = inputValue.toLowerCase() === opt.label.toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`
                      w-full text-left px-3.5 py-2 text-sm hover:bg-neutral-50 flex items-center justify-between
                      ${isSelected ? "bg-primary-50/60 text-primary-700 font-bold" : "text-neutral-800"}
                    `}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4 text-primary-600" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3.5 py-3 text-sm text-neutral-400 text-center">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-bold text-error-600 mt-1">{error}</p>}
    </div>
  );
};
