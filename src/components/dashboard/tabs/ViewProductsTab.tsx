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
  Package,
  DollarSign,
  ArrowUpDown,
  Grid3x3,
  List,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/utils/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id?: string;
  _id?: string;
  businessId: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  price: {
    amount: number;
    currency: string;
  };
  quantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type SortField = "name" | "sku" | "category" | "price" | "quantity" | "createdAt";
type SortDirection = "asc" | "desc";
type ViewMode = "table" | "grid";

export default function ViewProducts() {
  const { user } = useAuth();
  const businessId = user?.businessId;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  const pageLimit = 13;

  // Fetch products
  const fetchProducts = async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pageLimit,
      };
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (showActiveOnly) params.isActive = true;
      if (showInStockOnly) params.inStock = true;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get(`/product/business/${businessId}`, { params });
      setProducts(res.data.products || []);
      setTotalProducts(res.data.total || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
      setTotalProducts(0);
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
        const res = await api.get(`/product/business/${businessId}/categories`);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [businessId]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [businessId, selectedCategory, showActiveOnly, showInStockOnly, searchTerm, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory, showActiveOnly, showInStockOnly, searchTerm]);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { text: "Out of Stock", variant: "destructive" as const };
    if (quantity < 10)
      return { text: "Low Stock", variant: "secondary" as const };
    return { text: "In Stock", variant: "default" as const };
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "price") {
      aValue = a.price.amount;
      bValue = b.price.amount;
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

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar - Filters */}
      <div className="w-64 border-r bg-background/95 p-4 space-y-4 overflow-y-auto flex-shrink-0">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Products
          </h2>
          <p className="text-sm text-muted-foreground">
            View product information
          </p>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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

          <div className="flex items-center space-x-2 px-3 py-2 border border-input rounded-md bg-card">
            <Switch
              id="inStockOnly"
              checked={showInStockOnly}
              onCheckedChange={setShowInStockOnly}
            />
            <Label htmlFor="inStockOnly" className="text-sm cursor-pointer">
              In stock only
            </Label>
          </div>
        </div>

        {/* Results Summary */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {products.length} of {totalProducts} products
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-background/95 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Product Catalog</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and search through all available products
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProducts}
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
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchTerm || selectedCategory !== "All"
                    ? "Try adjusting your filters or search terms"
                    : "No products available at the moment"}
                </p>
              </div>
            ) : viewMode === "table" ? (
              <>
                <div className="border rounded-lg">
                  <Table className="bg-card rounded-lg">
                    <TableHeader>
                      <TableRow>
                        <SortableHeader field="name">Product Name</SortableHeader>
                        <SortableHeader field="sku">SKU</SortableHeader>
                        <SortableHeader field="category">Category</SortableHeader>
                        <SortableHeader field="price">Price</SortableHeader>
                        <SortableHeader field="quantity">Stock</SortableHeader>
                        <TableHead>Status</TableHead>
                        <TableHead>Visibility</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedProducts.map((product, index) => {
                        const stockStatus = getStockStatus(product.quantity);
                        const productId = product.id ?? product._id;
                        return (
                          <TableRow
                            key={productId ?? index}
                            className={!product.isActive ? "opacity-60" : ""}
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                {product.description && (
                                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                    {product.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {product.sku}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{product.category}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(
                                product.price.amount,
                                product.price.currency
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{product.quantity}</span>
                                <Badge variant={stockStatus.variant} className="text-xs">
                                  {stockStatus.text}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={product.isActive ? "default" : "secondary"}
                              >
                                {product.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {product.isActive ? (
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
                  {sortedProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product.quantity);
                    const productId = product.id ?? product._id;
                    return (
                      <Card
                        key={productId ?? index}
                        className={`transition-all ${
                          product.isActive ? "" : "opacity-60"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg leading-tight">
                                    {product.name}
                                  </h3>
                                </div>
                                <Badge variant="outline" className="text-xs mb-2">
                                  {product.sku}
                                </Badge>
                                {product.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                    {product.description}
                                  </p>
                                )}
                              </div>
                              {product.isActive ? (
                                <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-medium">
                                  {formatPrice(
                                    product.price.amount,
                                    product.price.currency
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="h-4 w-4 text-blue-600" />
                                <span>{product.quantity} units</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="secondary">{product.category}</Badge>
                              <Badge variant={stockStatus.variant}>
                                {stockStatus.text}
                              </Badge>
                              <Badge
                                variant={product.isActive ? "default" : "secondary"}
                              >
                                {product.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>

                            <div className="text-xs text-muted-foreground pt-2 border-t">
                              Created:{" "}
                              {new Date(product.createdAt).toLocaleDateString()} •
                              Updated:{" "}
                              {new Date(product.updatedAt).toLocaleDateString()}
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
