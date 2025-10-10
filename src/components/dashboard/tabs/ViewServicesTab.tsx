"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Wrench,
  DollarSign,
  ArrowUpDown,
  Grid3x3,
  List,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/utils/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Service {
  id?: string;
  _id?: string;
  businessId: string;
  name: string;
  description: string;
  category: string;
  pricing: {
    type: "fixed" | "hourly" | "package" | "quote";
    amount: number;
    currency: string;
  };
  duration: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortField = "name" | "category" | "pricing" | "duration" | "createdAt";
type SortDirection = "asc" | "desc";
type ViewMode = "table" | "grid";

// Helper to normalize service object from API
function normalizeService(service: any): Service {
  return {
    ...service,
    id: service._id || service.id,
  };
}

export default function ViewServices() {
  const { user } = useAuth();
  const businessId = user?.businessId;

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPricingType, setSelectedPricingType] = useState("All");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const pageLimit = 13;

  // Fetch services
  const fetchServices = async () => {
    if (!businessId) return;

    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageLimit,
      };
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedPricingType !== "All")
        params.pricingType = selectedPricingType;
      if (showActiveOnly) params.isActive = true;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get(`/service/business/${businessId}`, { params });
      setServices((res.data.services || []).map(normalizeService));
      setTotalServices(res.data.total || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setServices([]);
      setTotalServices(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!businessId) return;

      try {
        const res = await api.get(`/service/business/${businessId}/categories`);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [businessId]);

  // Fetch services when filters change
  useEffect(() => {
    fetchServices();
  }, [
    businessId,
    selectedCategory,
    selectedPricingType,
    showActiveOnly,
    searchTerm,
    currentPage,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory, selectedPricingType, showActiveOnly, searchTerm]);

  const formatPrice = (pricing: Service["pricing"]) => {
    if (pricing.type === "quote") {
      return "Custom Quote";
    }

    const formatted = new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(pricing.amount);

    switch (pricing.type) {
      case "hourly":
        return `${formatted}/hr`;
      case "package":
        return `${formatted} package`;
      default:
        return formatted;
    }
  };

  const getPricingTypeColor = (type: string) => {
    switch (type) {
      case "fixed":
        return "default";
      case "hourly":
        return "secondary";
      case "package":
        return "outline";
      case "quote":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedServices = [...services].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "pricing") {
      aValue = a.pricing.amount;
      bValue = b.pricing.amount;
    }

    if (sortField === "createdAt") {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  );

  const pricingTypes = [
    { value: "All", label: "All Types" },
    { value: "fixed", label: "Fixed Price" },
    { value: "hourly", label: "Hourly Rate" },
    { value: "package", label: "Package" },
    { value: "quote", label: "Custom Quote" },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar - Filters */}
      <div className="w-64 border-r bg-background/95 p-4 space-y-4 overflow-y-auto flex-shrink-0">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Services
          </h2>
          <p className="text-sm text-muted-foreground">
            View service offerings
          </p>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
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
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pricing Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Pricing Type</Label>
          <Select
            value={selectedPricingType}
            onValueChange={setSelectedPricingType}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {pricingTypes.map((type) => (
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
              checked={showActiveOnly}
              onCheckedChange={setShowActiveOnly}
            />
            <Label htmlFor="activeOnly" className="text-sm cursor-pointer">
              Active only
            </Label>
          </div>
        </div>

        {/* Results Summary */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {services.length} of {totalServices} services
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background/95 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Service Catalog</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse all available services
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchServices}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Wrench className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No services found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchTerm || selectedCategory !== "All"
                    ? "Try adjusting your filters or search terms"
                    : "No services available at the moment"}
                </p>
              </div>
            ) : viewMode === "table" ? (
              <>
                <div className="border rounded-lg">
                  <Table className="bg-card rounded-lg">
                    <TableHeader>
                      <TableRow>
                        <SortableHeader field="name">Service Name</SortableHeader>
                        <SortableHeader field="category">Category</SortableHeader>
                        <SortableHeader field="pricing">Pricing</SortableHeader>
                        <SortableHeader field="duration">Duration</SortableHeader>
                        <TableHead>Status</TableHead>
                        <TableHead>Visibility</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedServices.map((service, index) => {
                        const serviceId = service.id ?? service._id;
                        return (
                          <TableRow
                            key={serviceId ?? index}
                            className={!service.isActive ? "opacity-60" : ""}
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">{service.name}</div>
                                {service.description && (
                                  <div className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
                                    {service.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{service.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatPrice(service.pricing)}
                                </div>
                                <Badge
                                  variant={getPricingTypeColor(
                                    service.pricing.type
                                  )}
                                  className="text-xs"
                                >
                                  {service.pricing.type}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {service.duration}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={service.isActive ? "default" : "secondary"}
                              >
                                {service.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {service.isActive ? (
                                <Eye className="h-4 w-4 text-green-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedServices.map((service, index) => {
                    const serviceId = service.id ?? service._id;
                    return (
                      <Card
                        key={serviceId ?? index}
                        className={`transition-all ${
                          service.isActive ? "" : "opacity-60"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg leading-tight mb-2">
                                  {service.name}
                                </h3>
                                {service.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              {service.isActive ? (
                                <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium">
                                  {formatPrice(service.pricing)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span>{service.duration}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">{service.category}</Badge>
                              <Badge
                                variant={getPricingTypeColor(service.pricing.type)}
                              >
                                {service.pricing.type}
                              </Badge>
                              <Badge
                                variant={service.isActive ? "default" : "secondary"}
                              >
                                {service.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>

                            <div className="text-xs text-muted-foreground pt-2 border-t">
                              Created:{" "}
                              {new Date(service.createdAt).toLocaleDateString()} •
                              Updated:{" "}
                              {new Date(service.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
