"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Tag as TagIcon,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/lib/auth";
import api from "@/utils/api";

interface FAQ {
  id?: string;
  _id?: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const categories = [
  "General",
  "Account Management",
  "Billing",
  "Technical Support",
  "Product Information",
  "Shipping",
  "Returns & Refunds",
  "Privacy & Security",
  "Other",
];

export default function ViewFAQTab() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 13;

  // Get all unique tags from FAQs
  const allTags = Array.from(
    new Set(faqs.flatMap((faq) => faq.tags))
  ).sort();

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      const businessId = user?.businessId;

      if (!businessId) {
        console.error("No business ID found");
        return;
      }

      const response = await api.get(`/faq/business/${businessId}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          isActive: activeOnly ? true : undefined,
          search: searchTerm || undefined,
        },
      });

      if (response.data) {
        setFaqs(response.data.faqs || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.businessId, currentPage, selectedCategory, activeOnly, searchTerm]);

  useEffect(() => {
    if (user?.businessId) {
      fetchFAQs();
    }
  }, [fetchFAQs, user?.businessId]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, activeOnly, selectedTag]);

  // Filter FAQs by selected tag (client-side filter)
  const filteredFaqs = selectedTag !== "all"
    ? faqs.filter((faq) => faq.tags.includes(selectedTag))
    : faqs;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setActiveOnly(false);
    setSelectedTag("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || selectedCategory !== "all" || activeOnly || selectedTag !== "all";

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar - Filters */}
      <div className="w-64 border-r bg-background/95 p-4 space-y-4 overflow-y-auto flex-shrink-0">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            FAQs
          </h2>
          <p className="text-sm text-muted-foreground">
            View FAQ information
          </p>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card pl-10 shadow-none"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full bg-card shadow-none">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Filters</Label>

          <div className="flex items-center space-x-2 px-3 py-2 border border-input rounded-md bg-card">
            <Switch
              id="activeOnly"
              checked={activeOnly}
              onCheckedChange={setActiveOnly}
            />
            <Label htmlFor="activeOnly" className="text-sm cursor-pointer">
              Active only
            </Label>
          </div>
        </div>

        {/* Results Summary */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {filteredFaqs.length} of {faqs.length} FAQs
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">FAQ Knowledge Base</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredFaqs.length} of {faqs.length} FAQs
              </span>
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Loading FAQs...</p>
              </div>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-lg font-medium">No FAQs found</p>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "No FAQs available"}
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              <Accordion type="single" collapsible className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <AccordionItem
                    key={faq._id || faq.id}
                    value={faq._id || faq.id || ""}
                    className="border border-border rounded-lg bg-card px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start gap-3 text-left flex-1 pr-4">
                        <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-base leading-tight">
                            {faq.question}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {faq.category}
                            </Badge>
                            {!faq.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                            {faq.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {faq.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{faq.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="pl-8 space-y-4">
                        <div className="text-sm leading-relaxed text-muted-foreground">
                          {faq.answer}
                        </div>
                        {faq.tags.length > 3 && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground mr-2">
                              All tags:
                            </span>
                            {faq.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                          Last updated:{" "}
                          {new Date(faq.updatedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredFaqs.length > 0 && totalPages > 1 && (
          <div className="border-t border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
