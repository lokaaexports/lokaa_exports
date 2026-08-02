'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { COUNTRY_CODES, searchCountries, getCountryByName } from '@/lib/country-codes'
import { ChevronDown } from 'lucide-react'

export function PhoneInput({ value, onChange, country = '', className = '' }: any) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const selectedCountry = getCountryByName(country)
  const [phoneNumber, setPhoneNumber] = useState(value)

  const filteredCountries = useMemo(() => {
    return searchCountries(searchQuery)
  }, [searchQuery])

  const handleCountrySelect = (countryData) => {
    setShowDropdown(false)
    setSearchQuery('')
    onChange({ target: { name: 'country', value: countryData.name } })
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^\d]/g, '')
    setPhoneNumber(val)
    onChange({ target: { name: 'phone', value: val } })
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex items-center gap-0 border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Country Code Selector */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 transition-colors min-w-max"
        >
          <span className="text-xl">{selectedCountry.flag}</span>
          <span className="text-sm font-semibold text-slate-700 min-w-12">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {/* Phone Number Input */}
        <Input
          type="tel"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={handlePhoneChange}
          className="border-0 flex-1 focus:outline-none focus:ring-0 px-4 py-3 text-sm placeholder:text-slate-400"
          maxLength={15}
        />
      </div>

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
              filteredCountries.map(countryData => (
                <button
                  key={countryData.code}
                  type="button"
                  onClick={() => handleCountrySelect(countryData)}
                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-100 last:border-b-0"
                >
                  <span className="text-lg w-6">{countryData.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{countryData.name}</div>
                    <div className="text-xs text-slate-500">{countryData.dialCode}</div>
                  </div>
                  {selectedCountry.code === countryData.code && (
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
