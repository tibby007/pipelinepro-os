
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, Building2, Loader2 } from 'lucide-react';
import { INDUSTRY_CATEGORIES, INDUSTRY_TYPES, ALL_INDUSTRY_TYPES } from '@/lib/types';

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void;
  isLoading?: boolean;
}

export interface SearchCriteria {
  location: string;
  industryTypes: string[];
  industryCategory?: string;
  radius: number;
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [location, setLocation] = useState('');
  const [industryCategory, setIndustryCategory] = useState('all');
  const [selectedIndustryTypes, setSelectedIndustryTypes] = useState<string[]>([]);
  const [radius, setRadius] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;

    // Determine industry types based on selection
    let industryTypes: string[] = [];
    if (industryCategory === 'all') {
      industryTypes = ALL_INDUSTRY_TYPES.map(type => type.value);
    } else if (industryCategory !== 'all' && INDUSTRY_TYPES[industryCategory as keyof typeof INDUSTRY_TYPES]) {
      industryTypes = INDUSTRY_TYPES[industryCategory as keyof typeof INDUSTRY_TYPES].map(type => type.value);
    } else {
      industryTypes = selectedIndustryTypes;
    }

    onSearch({
      location: location.trim(),
      industryTypes,
      industryCategory: industryCategory !== 'all' ? industryCategory : undefined,
      radius,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5 text-blue-600" />
          <span>Multi-Industry Business Research</span>
        </CardTitle>
        <CardDescription>
          Search for real businesses across 8+ industries using Apify's web scraping technology to find qualified prospects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="City, State or ZIP"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Industry Category */}
            <div className="space-y-2">
              <Label htmlFor="industryCategory">Industry Category</Label>
              <Select value={industryCategory} onValueChange={setIndustryCategory} disabled={isLoading}>
                <SelectTrigger>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select industry category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRY_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Radius */}
            <div className="space-y-2">
              <Label htmlFor="radius">Search Radius</Label>
              <Select value={radius.toString()} onValueChange={(value) => setRadius(parseInt(value))} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Targeting criteria:</p>
              <p>• Industry-specific revenue thresholds • Tailored qualification criteria • Multi-industry coverage</p>
            </div>
            <Button type="submit" disabled={isLoading || !location.trim()} className="min-w-[140px]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scraping Data...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Live Data
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
