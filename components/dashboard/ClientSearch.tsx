"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface ClientSearchProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function ClientSearch({
  onSearchChange,
  placeholder = "Buscar por nombre, email o teléfono...",
}: ClientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      onSearchChange(searchQuery.toLowerCase());
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [searchQuery, onSearchChange]);

  return (
    <div className="w-full">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border-slate-200 focus:ring-purple-500"
      />
    </div>
  );
}
