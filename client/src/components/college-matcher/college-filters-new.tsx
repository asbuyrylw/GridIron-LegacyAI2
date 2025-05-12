import { useState } from "react";
import { Filter, BookOpen, DollarSign, Users, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export interface CollegeFilters {
  searchQuery: string;
  region: string;
  preferredState: string;
  maxDistance: string;
  preferredMajor: string;
  minEnrollment: string;
  maxEnrollment: string;
  athleticScholarship: boolean;
  publicOnly: boolean;
  privateOnly: boolean;
  financialAidImportance: number;
  useAI: boolean;
  division?: string;
}

interface CollegeFiltersProps {
  filters: CollegeFilters;
  onFilterChange: (key: string, value: any) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  compact?: boolean;
}

export function CollegeFilters({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  compact = false
}: CollegeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Count active filters (excluding searchQuery and useAI)
  const countActiveFilters = () => {
    let count = 0;
    if (filters.region) count++;
    if (filters.preferredState) count++;
    if (filters.maxDistance) count++;
    if (filters.preferredMajor) count++;
    if (filters.minEnrollment) count++;
    if (filters.maxEnrollment) count++;
    if (filters.athleticScholarship) count++;
    if (filters.publicOnly) count++;
    if (filters.privateOnly) count++;
    if (filters.financialAidImportance !== 5) count++;
    if (filters.division) count++;
    return count;
  };
  
  // Get active filter count
  const activeFiltersCount = countActiveFilters();
  
  if (compact) {
    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="border rounded-md"
      >
        <div className="flex items-center px-4 py-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          
          <div className="ml-auto flex gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search colleges..."
                className="pl-8"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange("searchQuery", e.target.value)}
              />
            </div>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={onApplyFilters}
            >
              Apply
            </Button>
          </div>
        </div>
        
        <CollapsibleContent>
          <div className="px-4 py-3 border-t space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Location Filters */}
              <div>
                <Label htmlFor="region" className="mb-1 block">
                  Region
                </Label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => onFilterChange("region", value)}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-regions">All regions</SelectItem>
                    <SelectItem value="Northeast">Northeast</SelectItem>
                    <SelectItem value="Southeast">Southeast</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="Midwest">Midwest</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="Northwest">Northwest</SelectItem>
                    <SelectItem value="Southwest">Southwest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="division" className="mb-1 block">
                  Division
                </Label>
                <Select
                  value={filters.division || "all-divisions"}
                  onValueChange={(value) => onFilterChange("division", value)}
                >
                  <SelectTrigger id="division">
                    <SelectValue placeholder="All divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-divisions">All divisions</SelectItem>
                    <SelectItem value="D1">Division I</SelectItem>
                    <SelectItem value="D2">Division II</SelectItem>
                    <SelectItem value="D3">Division III</SelectItem>
                    <SelectItem value="NAIA">NAIA</SelectItem>
                    <SelectItem value="JUCO">Junior College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="preferredState" className="mb-1 block">
                  State
                </Label>
                <Input
                  id="preferredState"
                  value={filters.preferredState}
                  onChange={(e) => onFilterChange("preferredState", e.target.value)}
                  placeholder="e.g. California"
                />
              </div>
              
              <div>
                <Label htmlFor="preferredMajor" className="mb-1 block">
                  Major
                </Label>
                <Input
                  id="preferredMajor"
                  value={filters.preferredMajor}
                  onChange={(e) => onFilterChange("preferredMajor", e.target.value)}
                  placeholder="e.g. Business"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="athleticScholarship"
                  checked={filters.athleticScholarship}
                  onCheckedChange={(checked) => onFilterChange("athleticScholarship", checked)}
                />
                <Label htmlFor="athleticScholarship" className="text-sm">
                  Athletic scholarships
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publicOnly"
                  checked={filters.publicOnly}
                  onCheckedChange={(checked) => {
                    onFilterChange("publicOnly", checked);
                    if (checked) onFilterChange("privateOnly", false);
                  }}
                />
                <Label htmlFor="publicOnly" className="text-sm">
                  Public only
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privateOnly"
                  checked={filters.privateOnly}
                  onCheckedChange={(checked) => {
                    onFilterChange("privateOnly", checked);
                    if (checked) onFilterChange("publicOnly", false);
                  }}
                />
                <Label htmlFor="privateOnly" className="text-sm">
                  Private only
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearFilters}
              >
                Clear Filters
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={onApplyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a college by name..."
          className="pl-8"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange("searchQuery", e.target.value)}
        />
      </div>
      
      <Accordion
        type="multiple"
        defaultValue={["location", "academic", "size"]}
        className="space-y-2"
      >
        {/* Location Filters */}
        <AccordionItem value="location" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>Location</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region" className="mb-1 block">
                  Region
                </Label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => onFilterChange("region", value)}
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-regions">All regions</SelectItem>
                    <SelectItem value="Northeast">Northeast</SelectItem>
                    <SelectItem value="Southeast">Southeast</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="Midwest">Midwest</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="Northwest">Northwest</SelectItem>
                    <SelectItem value="Southwest">Southwest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="preferredState" className="mb-1 block">
                  Preferred State
                </Label>
                <Input
                  id="preferredState"
                  value={filters.preferredState}
                  onChange={(e) => onFilterChange("preferredState", e.target.value)}
                  placeholder="e.g. California, Texas"
                />
              </div>
              
              <div>
                <Label htmlFor="maxDistance" className="mb-1 block">
                  Max Distance (miles)
                </Label>
                <Input
                  id="maxDistance"
                  type="number"
                  value={filters.maxDistance}
                  onChange={(e) => onFilterChange("maxDistance", e.target.value)}
                  placeholder="No limit"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Academic Filters */}
        <AccordionItem value="academic" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>Academic</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div>
              <Label htmlFor="preferredMajor" className="mb-1 block">
                Preferred Major
              </Label>
              <Input
                id="preferredMajor"
                value={filters.preferredMajor}
                onChange={(e) => onFilterChange("preferredMajor", e.target.value)}
                placeholder="e.g. Business, Engineering"
              />
            </div>
            
            <div className="mt-4">
              <Label htmlFor="division" className="mb-1 block">
                Division
              </Label>
              <Select
                value={filters.division || "all-divisions"}
                onValueChange={(value) => onFilterChange("division", value)}
              >
                <SelectTrigger id="division">
                  <SelectValue placeholder="All divisions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-divisions">All divisions</SelectItem>
                  <SelectItem value="D1">Division I</SelectItem>
                  <SelectItem value="D2">Division II</SelectItem>
                  <SelectItem value="D3">Division III</SelectItem>
                  <SelectItem value="NAIA">NAIA</SelectItem>
                  <SelectItem value="JUCO">Junior College</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Size Filters */}
        <AccordionItem value="size" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>School Size</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minEnrollment" className="mb-1 block">
                  Min Enrollment
                </Label>
                <Input
                  id="minEnrollment"
                  type="number"
                  value={filters.minEnrollment}
                  onChange={(e) => onFilterChange("minEnrollment", e.target.value)}
                  placeholder="e.g. 5000"
                />
              </div>
              <div>
                <Label htmlFor="maxEnrollment" className="mb-1 block">
                  Max Enrollment
                </Label>
                <Input
                  id="maxEnrollment"
                  type="number"
                  value={filters.maxEnrollment}
                  onChange={(e) => onFilterChange("maxEnrollment", e.target.value)}
                  placeholder="e.g. 30000"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publicOnly"
                  checked={filters.publicOnly}
                  onCheckedChange={(checked) => {
                    onFilterChange("publicOnly", checked);
                    if (checked) onFilterChange("privateOnly", false);
                  }}
                />
                <Label htmlFor="publicOnly">
                  Public only
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privateOnly"
                  checked={filters.privateOnly}
                  onCheckedChange={(checked) => {
                    onFilterChange("privateOnly", checked);
                    if (checked) onFilterChange("publicOnly", false);
                  }}
                />
                <Label htmlFor="privateOnly">
                  Private only
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Financial Aid Filters */}
        <AccordionItem value="financial" className="border rounded-md">
          <AccordionTrigger className="px-4 py-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>Financial</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="financialAidImportance" className="block">
                  Financial Aid Importance
                </Label>
                <span className="text-xs text-muted-foreground">
                  {filters.financialAidImportance === 0 ? "Not Important" : 
                   filters.financialAidImportance === 10 ? "Very Important" : 
                   `${filters.financialAidImportance}/10`}
                </span>
              </div>
              
              <Slider
                id="financialAidImportance"
                value={[filters.financialAidImportance]}
                min={0}
                max={10}
                step={1}
                onValueChange={(value) => onFilterChange("financialAidImportance", value[0])}
                className="mt-2"
              />
            </div>
            
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="athleticScholarship"
                  checked={filters.athleticScholarship}
                  onCheckedChange={(checked) => onFilterChange("athleticScholarship", checked)}
                />
                <Label htmlFor="athleticScholarship">
                  Athletic scholarships available
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button 
          variant="outline" 
          onClick={onClearFilters}
        >
          Clear All Filters
        </Button>
        <Button 
          variant="default" 
          onClick={onApplyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}