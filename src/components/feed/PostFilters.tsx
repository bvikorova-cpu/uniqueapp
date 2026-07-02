import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export type SortBy = "newest" | "oldest" | "popular" | "most-comments";
export type TimeFilter = "all" | "today" | "week" | "month";
export type CategoryFilter = "all" | "text" | "image" | "video";

interface PostFiltersProps {
  sortBy: SortBy;
  timeFilter: TimeFilter;
  categoryFilter: CategoryFilter;
  onSortChange: (sort: SortBy) => void;
  onTimeChange: (time: TimeFilter) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onReset: () => void;
}

export const PostFilters = ({
  sortBy,
  timeFilter,
  categoryFilter,
  onSortChange,
  onTimeChange,
  onCategoryChange,
  onReset,
}: PostFiltersProps) => {
  const hasActiveFilters = sortBy !== "newest" || timeFilter !== "all" || categoryFilter !== "all";

  return (
    <>
      <FloatingHowItWorks title={"Post Filters - How it works"} steps={[{ title: 'Open', desc: 'Access the Post Filters section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Post Filters.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sort">Sort by</Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger id="sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="most-comments">Most Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time Period</Label>
          <Select value={timeFilter} onValueChange={onTimeChange}>
            <SelectTrigger id="time">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
    </>
  );
};
