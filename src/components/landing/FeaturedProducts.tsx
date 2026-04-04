import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { fadeInVariants, cardHoverVariants, staggerContainer } from '@/lib/animations';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  category?: { name: string } | null;
  specs?: Record<string, unknown> | null;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<Product[]>('/products');
        setProducts(response.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section id="pricing" className="bg-white dark:bg-[#0d1412] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div variants={fadeInVariants} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Produits sélectionnés
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Découvrez notre catalogue solaire
          </h2>
          <p className="text-slate-600 dark:text-white/60 text-center mt-3 max-w-2xl mx-auto">
            Une sélection de produits réels issus du catalogue Agalid, avec une présentation plus moderne et plus claire pour vos clients.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12"
          >
            {products.map((product) => (
              <motion.article
                key={product.id}
                variants={cardHoverVariants}
                initial="initial"
                whileHover="hover"
                className="group overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent z-10 opacity-70" />
                  <img
                    src={product.image || 'https://via.placeholder.com/800x600?text=Agalid'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500 text-white shadow-lg">
                      {product.category?.name || 'Produit'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  {product.specs && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
                        <span
                          key={key}
                          className={cn(
                            'text-xs px-2.5 py-1.5 rounded-full border',
                            'bg-slate-50 border-slate-200 text-slate-600',
                            'dark:bg-white/5 dark:border-white/10 dark:text-slate-300'
                          )}
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Prix</div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {product.price.toLocaleString('fr-DZ')} DZD
                      </div>
                    </div>
                    <a
                      href="/products"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-emerald-500 shadow-lg transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
