import * as React from 'react'
import { cn } from '@/lib/utils'

function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-x-auto rounded-[16px] border border-helix-border bg-helix-surface">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-13 text-ink', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        'sticky top-0 border-b border-helix-border bg-helix-surface text-11 font-medium uppercase tracking-[0.06em] text-helix-muted',
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('divide-y divide-helix-border [&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t border-helix-border bg-helix-canvas font-medium text-ink', className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'transition-colors duration-150 hover:bg-helix-canvas/80 data-[state=selected]:bg-helix-canvas',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-10 px-4 text-start align-middle text-11 font-medium uppercase tracking-[0.06em] text-helix-muted whitespace-nowrap',
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      data-slot="table-cell"
      className={cn('py-3.5 px-4 align-middle whitespace-nowrap text-13 text-ink', className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-12 text-helix-muted', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
