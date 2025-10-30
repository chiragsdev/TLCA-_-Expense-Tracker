import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
  className?: string;
  id?: string;
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  allowCustom = true,
  className,
  id,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  // Check if current value is in options
  const isValueInOptions = options.includes(value);

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    if (selectedValue === value) {
      onValueChange("");
    } else {
      onValueChange(selectedValue);
    }
    setOpen(false);
    setSearchValue("");
  };

  // Handle custom input (when user types and presses Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && allowCustom && searchValue && filteredOptions.length === 0) {
      e.preventDefault();
      onValueChange(searchValue);
      setOpen(false);
      setSearchValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {allowCustom && searchValue ? (
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground mb-2">{emptyText}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onValueChange(searchValue);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    Use "{searchValue}"
                  </Button>
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyText}
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleSelect(option)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
