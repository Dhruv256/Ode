"use client";

import React, { useState } from "react";

/**
 * Lightweight direct-edit. In the recipient view (creator context) these span
 * elements become inline editors bound to a project memory key; in public /
 * recipient-only mode they are plain text. Templates protect their quality by
 * only exposing a small set of editable fields.
 */
export function EditableText({
  value,
  placeholder,
  onEdit,
  editing,
  className,
  as: Tag = "span",
  multiline = false,
}: {
  value: string;
  placeholder?: string;
  onEdit?: (next: string) => void;
  editing?: boolean;
  className?: string;
  as?: React.ElementType;
  multiline?: boolean;
}) {
  const [active, setActive] = useState(false);
  const isEditing = Boolean(onEdit && editing && active);
  const inner =
    isEditing ? (
      multiline ? (
        <textarea
          autoFocus
          value={value}
          placeholder={placeholder}
          onChange={(e) => onEdit?.(e.target.value)}
          onBlur={(e) => { onEdit?.(e.target.value.trim()); setActive(false); }}
          className="w-full resize-none bg-transparent outline-none"
          rows={3}
        />
      ) : (
        <input
          autoFocus
          value={value}
          placeholder={placeholder}
          onChange={(e) => onEdit?.(e.target.value)}
          onBlur={(e) => { onEdit?.(e.target.value.trim()); setActive(false); }}
          className="w-full bg-transparent outline-none"
        />
      )
    ) : (
      value
    );

  if (onEdit && editing) {
    return <Tag className={`${className ?? ""} cursor-text outline-dashed outline-1 outline-transparent hover:outline-[var(--tp-accent)]`} onClick={() => setActive(true)}>{inner}</Tag>;
  }

  return (
    <Tag className={className} title={onEdit && editing ? undefined : value || placeholder}>
      {value || placeholder || ""}
    </Tag>
  );
}
