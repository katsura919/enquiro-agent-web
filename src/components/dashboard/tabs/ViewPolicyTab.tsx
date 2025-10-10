"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Tag as TagIcon,
  Filter,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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

interface Policy {
  id?: string;
  _id?: string;
  businessId: string;
  title: string;
  content: string;
  type: "privacy" | "terms" | "refund" | "shipping" | "warranty" | "general";
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const policyTypes = [
  { value: "privacy", label: "Privacy Policy" },
  { value: "terms", label: "Terms of Service" },
  { value: "refund", label: "Refund Policy" },
  { value: "shipping", label: "Shipping Policy" },
  { value: "warranty", label: "Warranty Policy" },
  { value: "general", label: "General Policy" },
];

export default function ViewPolicyTab() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activeOnly, setActiveOnly] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 13;

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const businessId = user?.businessId;

      if (!businessId) {
        console.error("No business ID found");
        return;
      }

      const response = await api.get(`/policy/business/${businessId}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          type: selectedType !== "all" ? selectedType : undefined,
          isActive: activeOnly ? true : undefined,
          search: searchTerm || undefined,
        },
      });

      if (response.data) {
        setPolicies(response.data.policies || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.businessId, currentPage, selectedType, activeOnly, searchTerm]);

  useEffect(() => {
    if (user?.businessId) {
      fetchPolicies();
    }
  }, [fetchPolicies, user?.businessId]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, activeOnly]);

  const filteredPolicies = policies;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setActiveOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || selectedType !== "all" || activeOnly;

  const getPolicyTypeLabel = (type: string) => {
    const policyType = policyTypes.find((pt) => pt.value === type);
    return policyType ? policyType.label : type;
  };

  const getPolicyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      privacy: "bg-blue-100 text-blue-800 border-blue-300",
      terms: "bg-purple-100 text-purple-800 border-purple-300",
      refund: "bg-green-100 text-green-800 border-green-300",
      shipping: "bg-orange-100 text-orange-800 border-orange-300",
      warranty: "bg-yellow-100 text-yellow-800 border-yellow-300",
      general: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[type] || colors.general;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar - Filters */}
      <div className="w-64 border-r bg-background/95 p-4 space-y-4 overflow-y-auto flex-shrink-0">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Policies
          </h2>
          <p className="text-sm text-muted-foreground">
            View policy information
          </p>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card pl-10 shadow-none"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Policy Type</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {policyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
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
            Showing {filteredPolicies.length} of {policies.length} policies
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Policies & Guidelines</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>
                Showing {filteredPolicies.length} of {policies.length} policies
              </span>
            </div>
          </div>
        </div>

        {/* Policy List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Loading policies...</p>
              </div>
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-lg font-medium">No policies found</p>
                <p className="text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "No policies available"}
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-4">
              <Accordion type="single" collapsible className="space-y-3">
                {filteredPolicies.map((policy) => (
                  <AccordionItem
                    key={policy._id || policy.id}
                    value={policy._id || policy.id || ""}
                    className="border border-border rounded-lg bg-card px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-start gap-3 text-left flex-1 pr-4">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-semibold text-base leading-tight">
                              {policy.title}
                            </h3>
                            {policy.isActive ? (
                              <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getPolicyTypeColor(policy.type)}`}
                            >
                              {getPolicyTypeLabel(policy.type)}
                            </Badge>
                            {!policy.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                            {policy.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                <TagIcon className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {policy.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{policy.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="pl-8 space-y-4">
                        <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                          {policy.content}
                        </div>
                        {policy.tags.length > 3 && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground mr-2">
                              All tags:
                            </span>
                            {policy.tags.map((tag, index) => (
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
                          Created:{" "}
                          {new Date(policy.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          • Last updated:{" "}
                          {new Date(policy.updatedAt).toLocaleDateString("en-US", {
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
        {!loading && filteredPolicies.length > 0 && totalPages > 1 && (
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
