'use client'

import { useState, useMemo } from 'react'
import { COUNTRY_CODES, searchCountries } from '@/lib/country-codes'
import { ChevronDown } from 'lucide-react'

export function CountrySelect({ value, onChange, className = '' }: any) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedCountry = COUNTRY_CODES.find(c => c.name === value) || COUNTRY_CODES[0]

  const filteredCountries = useMemo(() => {
    return searchCountries(searchQuery)
  }, [searchQuery])

  const handleSelect = (country) => {
    setShowDropdown(false)
    setSearchQuery('')
    onChange({ target: { name: 'country', value: country.name } })
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm text-slate-700">{selectedCountry.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Country Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-72 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="sticky top-0 bg-white px-3 py-2.5 border-b border-slate-200">
            <input
              type="text"
              placeholder="Search country..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            {filteredCountries.length > 0 && (
              <div className="text-xs text-slate-500 mt-1">
                {filteredCountries.length} result{filteredCountries.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>

          {/* Countries List */}
          <div className="overflow-y-auto flex-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                >
                  <span className="text-lg w-6">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{country.name}</div>
                    <div className="text-xs text-slate-500">{country.dialCode}</div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                No countries found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
