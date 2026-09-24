'use client'

import React from 'react'
import type { LeadGenRecipe } from '@/lib/leadgen/types'

interface RecipeLibraryProps {
  recipes: LeadGenRecipe[]
  selectedRecipeId: string
  onSelectRecipe: (recipe: LeadGenRecipe) => void
  isArabic?: boolean
  disabled?: boolean
}

export function RecipeLibrary({
  recipes,
  selectedRecipeId,
  onSelectRecipe,
  isArabic = false,
  disabled = false,
}: RecipeLibraryProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
          {isArabic ? 'مكتبة الوصفات الجاهزة (Extraction Recipes)' : 'Preconfigured Extraction Recipes'}
        </label>
        <p className="mt-0.5 text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
          {isArabic
            ? 'اختر وصفة مهيأة لمجال عملك تتضمن محددات CSS متكيفة وقواعد السماح والاستبعاد للروابط.'
            : 'Select an optimized vertical recipe with pre-tuned adaptive selectors and URL regex filters.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recipes.map(recipe => {
          const isSelected = recipe.id === selectedRecipeId
          return (
            <button
              key={recipe.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectRecipe(recipe)}
              className={`rounded-lg border p-3 text-left transition-all ${
                isSelected
                  ? 'border-[#0e8da6] dark:border-[#38c6e0] bg-[#0e8da6]/5 dark:bg-[#38c6e0]/10 ring-1 ring-[#0e8da6] dark:ring-[#38c6e0]'
                  : 'border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] hover:border-[#cfd6df] dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
                  {isArabic && recipe.label_ar ? recipe.label_ar : recipe.label}
                </span>
                <span className="shrink-0 rounded bg-[#eaeef3] dark:bg-[#171c25] px-1.5 py-0.5 font-mono text-[10px] text-[#5b6577] dark:text-[#8b95a7]">
                  {recipe.mode}
                </span>
              </div>

              <p className="mt-1.5 text-[11px] text-[#5b6577] dark:text-[#8b95a7] line-clamp-2 leading-relaxed">
                {recipe.description}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-[#d9dee6]/60 dark:border-white/5 pt-2 text-[10px] font-mono text-[#5b6577] dark:text-[#8b95a7]">
                <span className="rounded bg-black/[0.04] dark:bg-white/[0.05] px-1.5 py-0.5">
                  engine: {recipe.engine_default}
                </span>
                {recipe.adaptive && (
                  <span className="text-[#0e8da6] dark:text-[#38c6e0]">adaptive:on</span>
                )}
                <span>max:{recipe.max_pages}p</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
