import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Battery, Zap, Sun, Box, Loader2, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  _count: { products: number };
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: { name: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  specs: any;
}

const Products = () => {
  const { isDark } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: { category?: string; search?: string } = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      
      const response = await axios.get('/api/products', { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'panneaux solaires': return Sun;
      case 'onduleurs': return Zap;
      case 'batteries': return Battery;
      case 'kits solaires': return Box;
      default: return ShoppingBag;
    }
  };

  return (
    <Layout>
      <div className={cn("min-h-screen pt-24 pb-12 transition-colors duration-300", 
        isDark ? "bg-[#0d1412]" : "bg-slate-50")}>
        
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className={cn("text-4xl md:text-5xl font-bold mb-4", 
              isDark ? "text-white" : "text-slate-900")}>
              Nos Solutions Solaires
            </h1>
            <p className={cn("text-lg max-w-2xl mx-auto", 
              isDark ? "text-slate-400" : "text-slate-600")}>
              Découvrez notre gamme complète de produits photovoltaïques haute performance pour votre indépendance énergétique.
            </p>
          </motion.div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 backdrop-blur-sm">
            
            {/* Categories */}
            <div className="flex overflow-x-auto gap-2 w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('All')}
                className={cn("px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === 'All'
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-transparent dark:hover:bg-white/10"
                )}
              >
                Tout voir
              </button>
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                      selectedCategory === cat.name
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                        : "text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-transparent dark:hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full pl-10 pr-4 py-2 rounded-xl outline-none transition-all",
                  isDark 
                    ? "bg-white/10 text-white placeholder-slate-500 focus:bg-white/15 border border-white/10 focus:border-emerald-500/50" 
                    : "bg-slate-100 text-slate-900 placeholder-slate-500 focus:bg-white border border-slate-200 focus:border-emerald-500"
                )}
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn("group rounded-2xl overflow-hidden border transition-all duration-300",
                      isDark 
                        ? "bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-white/10" 
                        : "bg-white border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30"
                    )}
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                      <img 
                        src={product.image || 'https://via.placeholder.com/400'} 
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 z-20">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500 text-white shadow-lg">
                          {product.category.name}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className={cn("text-xl font-bold mb-2 transition-colors",
                        isDark ? "text-white group-hover:text-emerald-400" : "text-slate-900 group-hover:text-emerald-600")}>
                        {product.name}
                      </h3>
                      <p className={cn("text-sm mb-4 line-clamp-2",
                        isDark ? "text-slate-400" : "text-slate-600")}>
                        {product.description}
                      </p>

                      {/* Specs */}
                      {product.specs && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                            <span key={key} className={cn("text-xs px-2 py-1 rounded-md border",
                              isDark 
                                ? "bg-white/5 border-white/10 text-slate-300" 
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            )}>
                              <span className="opacity-70 mr-1 capitalize">{key}:</span>
                              <span className="font-medium">{value as string}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
                        <div className="flex flex-col">
                          <span className={cn("text-xs font-medium uppercase tracking-wider",
                            isDark ? "text-slate-500" : "text-slate-400")}>
                            Prix
                          </span>
                          <span className={cn("text-2xl font-bold",
                            isDark ? "text-emerald-400" : "text-emerald-600")}>
                            {product.price.toLocaleString('fr-DZ')} DZD
                          </span>
                        </div>
                        <button className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 hover:scale-110 transition-all shadow-lg shadow-emerald-500/20">
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {!loading && products.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-slate-100 dark:bg-white/5 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className={cn("text-xl font-medium mb-2", isDark ? "text-white" : "text-slate-900")}>
                Aucun produit trouvé
              </h3>
              <p className="text-slate-500">
                Essayez de modifier vos filtres ou votre recherche.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
