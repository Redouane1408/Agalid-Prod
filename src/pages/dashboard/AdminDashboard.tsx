import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, Upload, Image as ImageIcon, Users, FileText, Package, DollarSign, Loader2, Settings2, Wrench, Percent, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '@/lib/api';
import { toast } from 'sonner';
import Loader from '../../components/Loader';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  categoryId: number;
  category: { id: number; name: string };
  specs: Record<string, unknown>;
}

interface Category {
  id: number;
  name: string;
}

interface AdminStats {
  products: number;
  quotes: number;
  users: number;
  totalQuoteValue: number;
  categoryStats: { name: string; products: number }[];
  monthlyQuotes: { month: string; quotes: number; totalDa: number }[];
  recentQuotes: {
    id: number;
    createdAt: string;
    totalDa: number;
    customerName: string;
    location: string;
  }[];
}

interface OwnerSettings {
  id: number;
  services: string[];
  displayQuoteOnSite: boolean;
  sendEmailQuote: boolean;
  sendWhatsappQuote: boolean;
  requiredFields: string[];
  defaultSystemEfficiency: number;
  defaultPanelAreaM2: number;
  defaultPanelPowerKw: number;
  minimumPanelCount: number;
  inverterSizingSafetyFactor: number;
  quoteValidityDays: number;
  installationBaseCostDa: number;
  installationCostPerPanelDa: number;
  structureCostPerPanelDa: number;
  cablingCostPerKwDa: number;
  protectionCostDa: number;
  transportCostDa: number;
  maintenanceCostDa: number;
  shadingCostPercent: number;
  marginPercent: number;
  taxPercent: number;
  roofTypeMultipliers: Record<string, number>;
  clientTypeMultipliers: Record<string, number>;
  businessRules: {
    productSelectionStrategy: string;
    panelCategoryKeyword: string;
    inverterCategoryKeyword: string;
    preferredPanelProductId?: number | null;
    preferredInverterProductId?: number | null;
    includeMaintenanceInQuote?: boolean;
  };
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [ownerSettings, setOwnerSettings] = useState<OwnerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    images: [] as string[],
    categoryId: '',
    specs: '{}'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes, statsRes, settingsRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/categories'),
        api.get('/dashboard/admin-stats'),
        api.get('/owner-settings')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setStats(statsRes.data);
      setOwnerSettings(settingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerSettingChange = <K extends keyof OwnerSettings>(key: K, value: OwnerSettings[K]) => {
    setOwnerSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleNestedBusinessRuleChange = (key: keyof OwnerSettings['businessRules'], value: string | number | boolean | null) => {
    setOwnerSettings(prev => prev ? {
      ...prev,
      businessRules: {
        ...prev.businessRules,
        [key]: value,
      }
    } : prev);
  };

  const handleMultiplierChange = (
    key: 'roofTypeMultipliers' | 'clientTypeMultipliers',
    itemKey: string,
    value: number
  ) => {
    setOwnerSettings(prev => prev ? {
      ...prev,
      [key]: {
        ...prev[key],
        [itemKey]: value,
      }
    } : prev);
  };

  const handleArraySettingsChange = (key: 'services' | 'requiredFields', value: string) => {
    const parsed = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    handleOwnerSettingChange(key, parsed);
  };

  const handleSaveOwnerSettings = async () => {
    if (!ownerSettings) return;

    try {
      setSavingSettings(true);
      const payload = {
        ...ownerSettings,
        services: ownerSettings.services,
        requiredFields: ownerSettings.requiredFields,
      };
      await api.put('/owner-settings', payload);
      toast.success('Paramètres de calcul mis à jour');
      fetchData();
    } catch (error) {
      console.error('Error saving owner settings:', error);
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...formData.images];
    let mainImage = formData.image;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append('file', file);

        const res = await api.post('/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        newImages.push(res.data.url);
        if (!mainImage) mainImage = res.data.url;
      }

      setFormData(prev => ({ ...prev, images: newImages, image: mainImage }));
      toast.success(`${files.length} image(s) téléchargée(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleUpload(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newMainImage = newImages.length > 0 ? newImages[0] : '';
    setFormData(prev => ({ ...prev, images: newImages, image: prev.image === formData.images[index] ? newMainImage : prev.image }));
  };

  const setMainImage = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Produit supprimé');
      fetchData();
    } catch {
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  const handleClearCatalog = async () => {
    if (!window.confirm('Cette action supprimera tous les produits du catalogue ainsi que les lignes de devis liées à ces produits. Voulez-vous continuer ?')) return;
    try {
      const response = await api.delete('/products/clear-all');
      setProducts([]);
      toast.success(`${response.data.deletedProducts || 0} produits supprimés du catalogue`);
      fetchData();
    } catch {
      toast.error('Erreur lors de la réinitialisation du catalogue');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image || '',
      images: product.images || (product.image ? [product.image] : []),
      categoryId: product.categoryId.toString(),
      specs: JSON.stringify(product.specs || {}, null, 2)
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      images: [],
      categoryId: categories[0]?.id.toString() || '',
      specs: '{\n  "puissance": "400W",\n  "garantie": "25 ans"\n}'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let specsJson;
    try {
      specsJson = JSON.parse(formData.specs);
    } catch {
      toast.error('Format JSON invalide pour les spécifications');
      return;
    }

    const categoryId = parseInt(formData.categoryId);
    if (isNaN(categoryId)) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        categoryId: categoryId,
        specs: specsJson
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Produit mis à jour');
      } else {
        await api.post('/products', payload);
        toast.success('Produit créé');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Admin Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Package className="w-6 h-6" /></div>
          </div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Produits</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.products || 0}</div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><FileText className="w-6 h-6" /></div>
          </div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Devis Générés</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.quotes || 0}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500"><Users className="w-6 h-6" /></div>
          </div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Utilisateurs</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.users || 0}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500"><DollarSign className="w-6 h-6" /></div>
          </div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Valeur Totale Devis</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{(stats?.totalQuoteValue || 0).toLocaleString('fr-DZ')} DZD</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Évolution des devis</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">Données réelles agrégées depuis la base</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyQuotes || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#10b981' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Bar dataKey="quotes" radius={[8, 8, 0, 0]} fill="#10b981" name="Devis" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Produits par catégorie</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">Répartition réelle du catalogue</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryStats || []} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.1} horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Bar dataKey="products" radius={[0, 8, 8, 0]} fill="#3b82f6" name="Produits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Derniers devis</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">Suivi des derniers devis réellement créés</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">Référence</th>
                <th className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">Client</th>
                <th className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">Ville</th>
                <th className="py-3 pr-4 font-semibold text-slate-700 dark:text-slate-200">Date</th>
                <th className="py-3 font-semibold text-slate-700 dark:text-slate-200 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {(stats?.recentQuotes || []).map((quote) => (
                <tr key={quote.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                    {`AGL-${quote.id.toString().padStart(6, '0')}`}
                  </td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{quote.customerName}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{quote.location}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                    {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">
                    {quote.totalDa.toLocaleString('fr-DZ')} DZD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {ownerSettings && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres de calcul du devis</h1>
              <p className="text-slate-500 dark:text-gray-400">Le propriétaire peut piloter les coûts d’installation, les règles métier et les marges depuis cet espace.</p>
            </div>
            <button
              onClick={handleSaveOwnerSettings}
              disabled={savingSettings}
              className="bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950"
            >
              <Save className="w-4 h-4" />
              {savingSettings ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><Wrench className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Coûts d’installation</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Tous les montants entrent directement dans le calcul réel du devis.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['installationBaseCostDa', 'Base installation'],
                    ['installationCostPerPanelDa', 'Installation / panneau'],
                    ['structureCostPerPanelDa', 'Structure / panneau'],
                    ['cablingCostPerKwDa', 'Câblage / kW'],
                    ['protectionCostDa', 'Protections'],
                    ['transportCostDa', 'Transport'],
                    ['maintenanceCostDa', 'Maintenance'],
                  ].map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                      <input
                        type="number"
                        value={ownerSettings[key as keyof OwnerSettings] as number}
                        onChange={(e) => handleOwnerSettingChange(key as keyof OwnerSettings, Number(e.target.value) as never)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><Settings2 className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Règles de dimensionnement</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Les hypothèses techniques deviennent modifiables sans toucher au code.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rendement système</span>
                    <input type="number" step="0.01" value={ownerSettings.defaultSystemEfficiency} onChange={(e) => handleOwnerSettingChange('defaultSystemEfficiency', Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Surface / panneau (m²)</span>
                    <input type="number" step="0.1" value={ownerSettings.defaultPanelAreaM2} onChange={(e) => handleOwnerSettingChange('defaultPanelAreaM2', Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Puissance panneau fallback (kW)</span>
                    <input type="number" step="0.01" value={ownerSettings.defaultPanelPowerKw} onChange={(e) => handleOwnerSettingChange('defaultPanelPowerKw', Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre minimal de panneaux</span>
                    <input type="number" value={ownerSettings.minimumPanelCount} onChange={(e) => handleOwnerSettingChange('minimumPanelCount', Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Facteur de sécurité onduleur</span>
                    <input type="number" step="0.05" value={ownerSettings.inverterSizingSafetyFactor} onChange={(e) => handleOwnerSettingChange('inverterSizingSafetyFactor', Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Validité du devis (jours)</span>
                    <input type="number" value={ownerSettings.quoteValidityDays} onChange={(e) => handleOwnerSettingChange('quoteValidityDays', Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500"><Percent className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Marges et taxes</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Calcul direct sur le sous-total matériel + installation.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Marge (%)</span>
                    <input type="number" step="0.1" value={ownerSettings.marginPercent} onChange={(e) => handleOwnerSettingChange('marginPercent', Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Taxes (%)</span>
                    <input type="number" step="0.1" value={ownerSettings.taxPercent} onChange={(e) => handleOwnerSettingChange('taxPercent', Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Surcoût ombrage (%)</span>
                    <input type="number" step="0.1" value={ownerSettings.shadingCostPercent} onChange={(e) => handleOwnerSettingChange('shadingCostPercent', Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                </div>
              </div>

              <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500"><ShieldCheck className="w-5 h-5" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Règles métier</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400">Pilotage du choix produit et des multiplicateurs.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stratégie de sélection</span>
                    <select value={ownerSettings.businessRules.productSelectionStrategy} onChange={(e) => handleNestedBusinessRuleChange('productSelectionStrategy', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <option value="best_price_per_power">Meilleur prix / puissance</option>
                      <option value="lowest_price">Prix le plus bas</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot-clé catégorie panneaux</span>
                    <input type="text" value={ownerSettings.businessRules.panelCategoryKeyword} onChange={(e) => handleNestedBusinessRuleChange('panelCategoryKeyword', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mot-clé catégorie onduleurs</span>
                    <input type="text" value={ownerSettings.businessRules.inverterCategoryKeyword} onChange={(e) => handleNestedBusinessRuleChange('inverterCategoryKeyword', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Produit panneau préféré (ID)</span>
                    <input type="number" value={ownerSettings.businessRules.preferredPanelProductId || ''} onChange={(e) => handleNestedBusinessRuleChange('preferredPanelProductId', e.target.value ? Number(e.target.value) : null)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Produit onduleur préféré (ID)</span>
                    <input type="number" value={ownerSettings.businessRules.preferredInverterProductId || ''} onChange={(e) => handleNestedBusinessRuleChange('preferredInverterProductId', e.target.value ? Number(e.target.value) : null)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                  <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-white/10">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Inclure la maintenance dans le devis</span>
                    <input type="checkbox" checked={Boolean(ownerSettings.businessRules.includeMaintenanceInQuote)} onChange={(e) => handleNestedBusinessRuleChange('includeMaintenanceInQuote', e.target.checked)} className="h-4 w-4 accent-emerald-500" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Multiplicateurs par type de toit</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                {Object.entries(ownerSettings.roofTypeMultipliers || {}).map(([key, value]) => (
                  <label key={key} className="block">
                    <span className="text-sm font-medium text-slate-700 capitalize dark:text-slate-300">{key}</span>
                    <input type="number" step="0.05" value={value} onChange={(e) => handleMultiplierChange('roofTypeMultipliers', key, Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Multiplicateurs par type de client</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {Object.entries(ownerSettings.clientTypeMultipliers || {}).map(([key, value]) => (
                  <label key={key} className="block">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{key}</span>
                    <input type="number" step="0.05" value={value} onChange={(e) => handleMultiplierChange('clientTypeMultipliers', key, Number(e.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Canaux et champs obligatoires</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Services</span>
                <input type="text" value={ownerSettings.services.join(', ')} onChange={(e) => handleArraySettingsChange('services', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Champs requis</span>
                <input type="text" value={ownerSettings.requiredFields.join(', ')} onChange={(e) => handleArraySettingsChange('requiredFields', e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Afficher le devis sur le site</span>
                <input type="checkbox" checked={ownerSettings.displayQuoteOnSite} onChange={(e) => handleOwnerSettingChange('displayQuoteOnSite', e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Envoi email</span>
                <input type="checkbox" checked={ownerSettings.sendEmailQuote} onChange={(e) => handleOwnerSettingChange('sendEmailQuote', e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Envoi WhatsApp</span>
                <input type="checkbox" checked={ownerSettings.sendWhatsappQuote} onChange={(e) => handleOwnerSettingChange('sendWhatsappQuote', e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Catalogue Produits</h1>
          <p className="text-slate-500 dark:text-gray-400">Gérez les produits disponibles pour les devis</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearCatalog}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            Vider le catalogue
          </button>
          <button
            onClick={handleAdd}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            Nouveau Produit
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader fullScreen={false} size="md" />
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Produit</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Catégorie</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Prix (DZD)</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{product.name}</div>
                          <div className="text-slate-500 text-xs truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-medium">
                        {product.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                      {product.price.toLocaleString('fr-DZ')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1a202c] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Modifier Produit' : 'Nouveau Produit'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom du produit</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-transparent dark:text-white focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Panneau Solaire 550W"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prix (DZD)</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-transparent dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
                      <select
                        value={formData.categoryId}
                        onChange={e => setFormData({...formData, categoryId: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-transparent dark:text-white focus:ring-2 focus:ring-emerald-500 dark:bg-[#1a202c]"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-transparent dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Spécifications (JSON)</label>
                    <textarea
                      rows={4}
                      value={formData.specs}
                      onChange={e => setFormData({...formData, specs: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-white/10 bg-transparent dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Images</label>
                  
                  {/* Drag & Drop Zone */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-slate-50 dark:bg-white/5"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                        {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-white">Cliquez ou glissez des images ici</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">PNG, JPG jusqu'à 5MB</p>
                      </div>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        className="hidden" 
                        id="image-upload"
                        onChange={(e) => handleUpload(e.target.files)}
                      />
                      <label 
                        htmlFor="image-upload"
                        className="text-xs font-medium text-emerald-500 hover:text-emerald-600 cursor-pointer"
                      >
                        Parcourir les fichiers
                      </label>
                    </div>
                  </div>

                  {/* Image Preview List */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 group">
                        <img src={url} alt="" className="w-12 h-12 rounded-md object-cover bg-white" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500 truncate">{url.split('/').pop()}</p>
                          {formData.image === url && (
                            <span className="text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">Principale</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {formData.image !== url && (
                            <button 
                              type="button"
                              onClick={() => setMainImage(url)}
                              className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded"
                              title="Définir comme principale"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded"
                            title="Supprimer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* URL Input Fallback */}
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                     <label className="block text-xs font-medium text-slate-500 mb-1">Ou ajouter par URL</label>
                     <div className="flex gap-2">
                       <input 
                         type="url" 
                         placeholder="https://..."
                         className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-white/10 bg-transparent dark:text-white"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             const val = e.currentTarget.value;
                             if (val) {
                               setFormData(prev => ({ 
                                 ...prev, 
                                 images: [...prev.images, val],
                                 image: prev.image || val 
                               }));
                               e.currentTarget.value = '';
                             }
                           }
                         }}
                       />
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10 mt-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
