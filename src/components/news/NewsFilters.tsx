"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { NewsFilters } from '@/types';
import { SortOption } from '@/types';
import { useCategories, useSources } from '@/hooks/useNewsQuery';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface NewsFiltersProps {
  filters: NewsFilters;
  onFilterChange: (filters: Partial<NewsFilters>) => void;
  onReset: () => void;
}

export function NewsFilters({ filters, onFilterChange, onReset }: NewsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const { data: categories = [] } = useCategories();
  const { data: sources = [] } = useSources();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  const handleSearch = () => {
    onFilterChange({ searchQuery: searchInput });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleSortChange = (value: SortOption) => {
    onFilterChange({ sortBy: value });
  };
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);
    
    onFilterChange({ categories: updatedCategories });
  };
  
  const handleSourceChange = (source: string, checked: boolean) => {
    const updatedSources = checked
      ? [...filters.sources, source]
      : filters.sources.filter((s) => s !== source);
    
    onFilterChange({ sources: updatedSources });
  };
  
  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.sources.length > 0 || 
    filters.authors.length > 0 ||
    filters.searchQuery !== '';
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="뉴스 검색..."
              className="pl-9"
              value={searchInput}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button onClick={handleSearch} type="button">
            검색
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체보기</SelectItem>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="popularity">인기순</SelectItem>
              <SelectItem value="relevance">관련성</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={isExpanded ? "secondary" : "outline"}
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-1" />
              초기화
            </Button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
          <div>
            <h3 className="font-medium mb-2">카테고리</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => 
                      handleCategoryChange(category, checked === true)
                    }
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">소스</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sources.slice(0, 10).map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-${source.id}`}
                    checked={filters.sources.includes(source.id)}
                    onCheckedChange={(checked) => 
                      handleSourceChange(source.id, checked === true)
                    }
                  />
                  <label
                    htmlFor={`source-${source.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {source.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">날짜 범위</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-muted-foreground">시작일</label>
                  <Input
                    type="date"
                    value={filters.dateRange.from?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const from = e.target.value ? new Date(e.target.value) : null;
                      onFilterChange({ dateRange: { ...filters.dateRange, from } });
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">종료일</label>
                  <Input
                    type="date"
                    value={filters.dateRange.to?.toISOString().split('T')[0] || ''}
                    onChange={(e) => {
                      const to = e.target.value ? new Date(e.target.value) : null;
                      onFilterChange({ dateRange: { ...filters.dateRange, to } });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
