"use client";
import { Tab } from "@/context/TabsContext";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTabs } from "@/context/TabsContext";
import {
  Search,
  Package,
  Star,
  ShoppingCart,
  Eye,
  Filter,
  MoreVertical,
} from "lucide-react";

interface ProductSearchTabProps {
  tab: Tab;
}

export function ProductSearchTab({ tab }: ProductSearchTabProps) {
  const { openTab } = useTabs();
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  // Mock product data
  const products = [
    {
      id: "prod-1",
      name: "Premium Wireless Headphones",
      sku: "WH-2024-001",
      category: "electronics",
      price: 299.99,
      stock: 45,
      rating: 4.8,
      image: "/api/placeholder/80/80",
      description: "High-quality wireless headphones with noise cancellation",
      features: ["Bluetooth 5.0", "30hr battery", "Active noise cancellation"],
    },
    {
      id: "prod-2",
      name: "Smart Home Security Camera",
      sku: "CAM-2024-002",
      category: "electronics",
      price: 199.99,
      stock: 23,
      rating: 4.6,
      image: "/api/placeholder/80/80",
      description: "1080p HD security camera with night vision",
      features: ["1080p HD", "Night vision", "Mobile app", "Cloud storage"],
    },
    {
      id: "prod-3",
      name: "Organic Cotton T-Shirt",
      sku: "TSH-2024-003",
      category: "clothing",
      price: 29.99,
      stock: 156,
      rating: 4.4,
      image: "/api/placeholder/80/80",
      description: "Comfortable organic cotton t-shirt",
      features: ["100% organic cotton", "Machine washable", "Various colors"],
    },
    {
      id: "prod-4",
      name: "Professional Coffee Maker",
      sku: "COF-2024-004",
      category: "appliances",
      price: 449.99,
      stock: 12,
      rating: 4.9,
      image: "/api/placeholder/80/80",
      description: "Professional-grade coffee maker for home use",
      features: ["15-bar pressure", "Built-in grinder", "Programmable"],
    },
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "appliances", label: "Appliances" },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (category === "all") return matchesSearch;
    return matchesSearch && product.category === category;
  });

  const openProductDetails = (productId: string, productName: string) => {
    openTab({
      title: `Product - ${productName}`,
      type: "case-details",
      data: { productId, productName, type: "product" },
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Out of Stock", color: "bg-red-500 text-white" };
    if (stock < 20) return { text: "Low Stock", color: "bg-yellow-500 text-white" };
    return { text: "In Stock", color: "bg-green-500 text-white" };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Search className="w-5 h-5" />
            Product Search
          </h1>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products by name, SKU, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={category === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openProductDetails(product.id, product.name)}
              >
                <CardContent className="p-4">
                  {/* Product Image */}
                  <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm line-clamp-2 flex-1">
                        {product.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      SKU: {product.sku}
                    </p>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    
                    {/* Rating and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{product.rating}</span>
                      </div>
                      <span className="font-bold text-sm">{formatPrice(product.price)}</span>
                    </div>
                    
                    {/* Stock Status */}
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${stockStatus.color}`}>
                        {stockStatus.text}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {product.stock} units
                      </span>
                    </div>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {product.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.features.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProductDetails(product.id, product.name);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart or recommend logic here
                        }}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Recommend
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms or category filter"
                : "No products available in the selected category"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
