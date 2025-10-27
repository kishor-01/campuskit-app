// src/components/ui/safe-select.tsx
"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SafeSelectItem {
  value: string
  label: string
  disabled?: boolean
}

interface SafeSelectProps {
  items: SafeSelectItem[]
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  label?: string
  disabled?: boolean
}

export function SafeSelect({ 
  items, 
  placeholder = "Select...", 
  value, 
  onValueChange,
  label,
  disabled = false 
}: SafeSelectProps) {
  // Filter out empty string values to prevent the error
  const safeItems = items.filter(item => item.value !== "" && item.value !== undefined && item.value !== null);
  
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {label && (
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {safeItems.map((item) => (
              <SelectItem 
                key={item.value} 
                value={item.value}
                disabled={item.disabled}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {!label && safeItems.map((item) => (
          <SelectItem 
            key={item.value} 
            value={item.value}
            disabled={item.disabled}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Role-specific select component
export function RoleSelect({ value, onValueChange, disabled = false }: {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}) {
  const roleItems: SafeSelectItem[] = [
    { value: "VIEWER", label: "Viewer" },
    { value: "CONTRIBUTOR", label: "Contributor" },
    { value: "EDITOR", label: "Editor" },
    { value: "ADMIN", label: "Admin" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
  ]

  return (
    <SafeSelect
      items={roleItems}
      placeholder="Select role..."
      value={value}
      onValueChange={onValueChange}
      label="User Role"
      disabled={disabled}
    />
  )
}

// Status select component
export function StatusSelect({ value, onValueChange, disabled = false }: {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}) {
  const statusItems: SafeSelectItem[] = [
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
    { value: "PUBLISHED", label: "Published" },
    { value: "DRAFT", label: "Draft" },
  ]

  return (
    <SafeSelect
      items={statusItems}
      placeholder="Select status..."
      value={value}
      onValueChange={onValueChange}
      label="Status"
      disabled={disabled}
    />
  )
}

// Resource Status select component
export function ResourceStatusSelect({ value, onValueChange, disabled = false }: {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}) {
  const statusItems: SafeSelectItem[] = [
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ]

  return (
    <SafeSelect
      items={statusItems}
      placeholder="Select status..."
      value={value}
      onValueChange={onValueChange}
      label="Resource Status"
      disabled={disabled}
    />
  )
}

// Opportunity Type select component
export function OpportunityTypeSelect({ value, onValueChange, disabled = false }: {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}) {
  const typeItems: SafeSelectItem[] = [
    { value: "INTERNSHIP", label: "Internship" },
    { value: "FULL_TIME", label: "Full Time" },
    { value: "HACKATHON", label: "Hackathon" },
    { value: "WORKSHOP", label: "Workshop" },
    { value: "SEMINAR", label: "Seminar" },
    { value: "SCHOLARSHIP", label: "Scholarship" },
    { value: "COMPETITION", label: "Competition" },
    { value: "DEAL", label: "Deal" },
  ]

  return (
    <SafeSelect
      items={typeItems}
      placeholder="Select type..."
      value={value}
      onValueChange={onValueChange}
      label="Opportunity Type"
      disabled={disabled}
    />
  )
}