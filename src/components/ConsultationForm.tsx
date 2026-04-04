import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Home, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  DollarSign,
  MapPin,
  Users,
  Sparkles,
  Minus,
  Plus,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import Loader from './Loader';

const fullSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^(?:0|\+213)\s*[567](?:[\s.-]*\d){8}$/, 'Numéro invalide (ex: 0550 12 34 56 ou +213 550 12 34 56)'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  clientType: z.enum(['Particulier', 'Entreprise', 'Industrie', 'Administration'], { message: 'Type de client requis' }),
  monthlyConsumption: z.number().min(50, 'La consommation doit être d\'au moins 50 kWh').max(10000, 'Maximum 10000 kWh'),
  householdSize: z.number().min(1, 'Minimum 1 personne').max(20, 'Maximum 20 personnes'),
  energyUsagePattern: z.enum(['residential', 'commercial', 'industrial']),
  appliances: z.array(z.string()).min(1, 'Sélectionnez au moins un appareil'),
  roofArea: z.number().min(10, 'La surface doit être d\'au moins 10 m²').max(5000, 'Maximum 5000 m²'),
  roofType: z.enum(['flat', 'sloped', 'mixed']),
  location: z.string().min(2, 'La localisation doit contenir au moins 2 caractères'),
  peakSunHours: z.number().min(2, 'Minimum 2 heures').max(10, 'Maximum 10 heures'),
  hasShading: z.boolean(),
  budget: z.number().min(50000, 'Le budget doit être d\'au moins 50,000 DA').max(10000000, 'Maximum 10,000,000 DA'),
});

type FormData = z.infer<typeof fullSchema>;

interface ConsultationFormProps {
  onComplete: (data: FormData) => void;
  onClose: () => void;
}

const defaultValues: FormData = {
  name: '',
  email: '',
  phone: '',
  address: 'Alger',
  clientType: 'Particulier',
  monthlyConsumption: 350,
  householdSize: 4,
  energyUsagePattern: 'residential',
  appliances: ['Réfrigérateur x1', 'TV x1', 'Éclairage x4'],
  roofArea: 60,
  roofType: 'flat',
  location: 'Alger',
  peakSunHours: 5.5,
  hasShading: false,
  budget: 150000,
};

const applianceOptions = [
  { name: 'Réfrigérateur', emoji: '🧊', hint: 'Appareil essentiel 24h/24' },
  { name: 'Climatiseur', emoji: '❄️', hint: 'Charge importante en été' },
  { name: 'Chauffe-eau', emoji: '🚿', hint: 'Besoin thermique quotidien' },
  { name: 'Machine à laver', emoji: '🧺', hint: 'Cycles ponctuels' },
  { name: 'Sèche-linge', emoji: '🌬️', hint: 'Consommation élevée' },
  { name: 'Four', emoji: '🔥', hint: 'Pic de puissance' },
  { name: 'Micro-ondes', emoji: '🍽️', hint: 'Usage rapide' },
  { name: 'TV', emoji: '📺', hint: 'Usage domestique courant' },
  { name: 'Ordinateur', emoji: '💻', hint: 'Usage travail ou loisir' },
  { name: 'Éclairage', emoji: '💡', hint: 'Plusieurs points lumineux' },
];

const parseApplianceQuantities = (values: string[]) => {
  const quantities = Object.fromEntries(applianceOptions.map(({ name }) => [name, 0])) as Record<string, number>;

  values.forEach((value) => {
    const match = value.match(/^(.*?)(?:\s*x(\d+))?$/i);
    if (!match) {
      return;
    }

    const name = match[1]?.trim();
    const quantity = Number(match[2] || 1);

    if (name in quantities) {
      quantities[name] = Math.max(0, quantity);
    }
  });

  return quantities;
};

const serializeApplianceQuantities = (quantities: Record<string, number>) => {
  return Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([name, quantity]) => `${name} x${quantity}`);
};

const ConsultationForm: React.FC<ConsultationFormProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applianceQuantities, setApplianceQuantities] = useState<Record<string, number>>(() => parseApplianceQuantities(defaultValues.appliances));
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues
  });

  useEffect(() => {
    register('phone');
    register('appliances');
  }, [register]);

  const formErrors = errors as Record<string, { message?: string }>;

  const steps = [
    { title: 'Profil', subtitle: 'Vos coordonnées', icon: User },
    { title: 'Usage', subtitle: 'Consommation & appareils', icon: Zap },
    { title: 'Habitation', subtitle: 'Toit & localisation', icon: Home },
    { title: 'Validation', subtitle: 'Budget & résumé', icon: DollarSign },
  ];

  const stepFields: Array<Array<keyof FormData>> = [
    ['name', 'email', 'phone', 'address', 'clientType'],
    ['monthlyConsumption', 'householdSize', 'energyUsagePattern', 'appliances'],
    ['roofArea', 'roofType', 'location', 'peakSunHours', 'hasShading'],
    ['budget'],
  ];

  const roofTypeOptions = [
    { value: 'flat', label: 'Toit Plat', description: 'Idéal pour l\'installation' },
    { value: 'sloped', label: 'Toit en Pente', description: 'Bonnes performances' },
    { value: 'mixed', label: 'Toit Mixte', description: 'Configuration complexe' },
  ];

  const energyPatternOptions = [
    { value: 'residential', label: 'Résidentiel', description: 'Usage domestique' },
    { value: 'commercial', label: 'Commercial', description: 'Usage professionnel' },
    { value: 'industrial', label: 'Industriel', description: 'Usage industriel' },
  ];

  const clientTypeOptions = [
    { value: 'Particulier', label: 'Particulier' },
    { value: 'Entreprise', label: 'Entreprise' },
    { value: 'Industrie', label: 'Industrie' },
    { value: 'Administration', label: 'Administration' },
  ];

  const syncAppliances = (nextQuantities: Record<string, number>) => {
    setApplianceQuantities(nextQuantities);
    setValue('appliances', serializeApplianceQuantities(nextQuantities), { shouldValidate: true, shouldDirty: true });
  };

  const handleNext = async () => {
    const isValid = await trigger(stepFields[currentStep]);
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fullData = getValues() as FormData;
      await onComplete(fullData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedEnergyPattern = watch('energyUsagePattern');
  const watchedRoofType = watch('roofType');
  const watchedClientType = watch('clientType');
  const watchedHasShading = watch('hasShading');
  const progress = ((currentStep + 1) / steps.length) * 100;
  const selectedAppliances = useMemo(
    () => Object.entries(applianceQuantities).filter(([, quantity]) => quantity > 0),
    [applianceQuantities]
  );

  const toggleAppliance = (appliance: string) => {
    const currentQuantity = applianceQuantities[appliance] || 0;
    syncAppliances({
      ...applianceQuantities,
      [appliance]: currentQuantity > 0 ? 0 : 1,
    });
  };

  const updateApplianceQuantity = (appliance: string, delta: number) => {
    const nextQuantity = Math.max(0, Math.min(12, (applianceQuantities[appliance] || 0) + delta));
    syncAppliances({
      ...applianceQuantities,
      [appliance]: nextQuantity,
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-4 w-4" />
                Démarrons votre étude
              </div>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Parlez-nous de votre projet</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Une première étape claire et rapide pour personnaliser votre devis solaire.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <User className="h-4 w-4" />
                  Nom Complet
                </label>
                <input
                  {...register('name')}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="Jean Dupont"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="jean.dupont@email.com"
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Téléphone
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="font-medium text-slate-500 dark:text-slate-400">+213</span>
                  </div>
                  <input
                    value={watch('phone')?.replace(/^\+213/, '') || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setValue('phone', val ? `+213${val}` : '', { shouldValidate: true });
                    }}
                    type="tel"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-16 pr-4 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="5 XX XX XX XX"
                  />
                </div>
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone.message}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </label>
                <input
                    {...register('address')}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="123 Rue Didouche Mourad, Alger"
                  />
                {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Type de client</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clientTypeOptions.map((option) => (
                  <motion.label
                    key={option.value}
                    className={cn(
                      "cursor-pointer rounded-2xl border p-4 transition-all",
                      watchedClientType === option.value
                        ? "border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                    )}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <input
                      {...register('clientType')}
                      type="radio"
                      value={option.value}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-800 dark:text-white">{option.label}</div>
                      {watchedClientType === option.value && (
                        <div className="rounded-full bg-emerald-500 p-1 text-white">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </motion.label>
                ))}
              </div>
              {formErrors.clientType && <p className="text-red-500 text-sm mt-1">{formErrors.clientType.message}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Vos équipements comptent</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Sélectionnez chaque appareil et indiquez combien d’unités vous utilisez réellement.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Zap className="h-4 w-4" />
                      Consommation mensuelle (kWh)
                    </label>
                    <input
                      {...register('monthlyConsumption', { valueAsNumber: true })}
                      type="number"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="350"
                    />
                    {formErrors.monthlyConsumption && <p className="text-red-500 text-sm mt-1">{formErrors.monthlyConsumption.message}</p>}
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Users className="h-4 w-4" />
                      Nombre de personnes
                    </label>
                    <input
                      {...register('householdSize', { valueAsNumber: true })}
                      type="number"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="4"
                    />
                    {formErrors.householdSize && <p className="text-red-500 text-sm mt-1">{formErrors.householdSize.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Type d'usage énergétique
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {energyPatternOptions.map((option) => (
                      <motion.label
                        key={option.value}
                        className={cn(
                          "cursor-pointer rounded-2xl border p-4 transition-all",
                          watchedEnergyPattern === option.value
                            ? "border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                        )}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <input
                          {...register('energyUsagePattern')}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 dark:text-white">{option.label}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{option.description}</div>
                        </div>
                        {watchedEnergyPattern === option.value && (
                          <div className="rounded-full bg-emerald-500 p-1 text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </motion.label>
                    ))}
                  </div>
                  {formErrors.energyUsagePattern && <p className="text-red-500 text-sm mt-1">{formErrors.energyUsagePattern.message}</p>}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Appareils électroménagers principaux</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Activez un appareil puis ajustez sa quantité.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {applianceOptions.map((appliance) => (
                    <motion.div
                      key={appliance.name}
                      className={cn(
                        "rounded-2xl border p-4 transition-all",
                        applianceQuantities[appliance.name] > 0
                          ? "border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                          : "border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/5"
                      )}
                      whileHover={{ y: -2 }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAppliance(appliance.name)}
                        className="flex w-full items-start justify-between gap-3 text-left"
                      >
                        <div>
                          <div className="text-2xl">{appliance.emoji}</div>
                          <div className="mt-3 font-medium text-slate-900 dark:text-white">{appliance.name}</div>
                          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{appliance.hint}</div>
                        </div>
                        <div className={cn(
                          "mt-1 rounded-full border px-2 py-1 text-xs font-semibold",
                          applianceQuantities[appliance.name] > 0
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 text-slate-500 dark:border-white/10 dark:text-slate-400"
                        )}>
                          {applianceQuantities[appliance.name] > 0 ? 'Sélectionné' : 'Ajouter'}
                        </div>
                      </button>

                      {applianceQuantities[appliance.name] > 0 && (
                        <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2 dark:bg-black/20">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Quantité</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateApplianceQuantity(appliance.name, -1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <div className="min-w-10 text-center text-base font-semibold text-slate-900 dark:text-white">
                              {applianceQuantities[appliance.name]}
                            </div>
                            <button
                              type="button"
                              onClick={() => updateApplianceQuantity(appliance.name, 1)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500 text-white transition-colors hover:brightness-110"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-black/10">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Appareils retenus</div>
                    {selectedAppliances.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedAppliances.map(([name, quantity]) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-emerald-500"
                          >
                            {name}
                            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">x{quantity}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sélectionnez au moins un appareil pour affiner la recommandation.</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-emerald-900 p-4 text-white dark:border-white/10">
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Résumé rapide</div>
                    <div className="mt-3 text-3xl font-bold">{selectedAppliances.reduce((sum, [, quantity]) => sum + quantity, 0)}</div>
                    <div className="mt-1 text-sm text-emerald-100/80">équipements sélectionnés</div>
                    <div className="mt-4 text-sm text-emerald-100/80">
                      {selectedAppliances.length > 0
                        ? `${selectedAppliances.length} types d'appareils actifs`
                        : 'Aucun appareil actif pour le moment'}
                    </div>
                  </div>
                </div>
                {formErrors.appliances && <p className="text-red-500 text-sm mt-1">{formErrors.appliances.message}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Décrivez votre installation</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Nous adaptons la proposition à votre toiture, à votre ville et à l’ensoleillement estimé.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Surface du toit (m²)
                  </label>
                  <input
                    {...register('roofArea', { valueAsNumber: true })}
                    type="number"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="50"
                  />
                  {formErrors.roofArea && <p className="text-red-500 text-sm mt-1">{formErrors.roofArea.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Localisation
                  </label>
                  <input
                    {...register('location')}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Alger"
                  />
                  {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Heures d'ensoleillement par jour
                  </label>
                  <input
                    {...register('peakSunHours', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="5.5"
                  />
                  {formErrors.peakSunHours && <p className="text-red-500 text-sm mt-1">{formErrors.peakSunHours.message}</p>}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Ombres sur la toiture</div>
                  <label className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-black/20">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Présence d’ombre</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Arbres, murs voisins ou obstacles proches</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setValue('hasShading', !watchedHasShading, { shouldDirty: true })}
                      className={cn(
                        'relative inline-flex h-8 w-14 items-center rounded-full transition-colors',
                        watchedHasShading ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                      )}
                    >
                      <span
                        className={cn(
                          'inline-block h-6 w-6 transform rounded-full bg-white transition-transform',
                          watchedHasShading ? 'translate-x-7' : 'translate-x-1'
                        )}
                      />
                    </button>
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                <label className="mb-4 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Type de toit
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roofTypeOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      className={cn(
                        "cursor-pointer rounded-2xl border p-5 transition-all",
                        watchedRoofType === option.value
                          ? "border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                      )}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <input
                        {...register('roofType')}
                        type="radio"
                        value={option.value}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="font-medium text-slate-800 dark:text-white mb-1">{option.label}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{option.description}</div>
                      </div>
                    </motion.label>
                  ))}
                </div>
                {formErrors.roofType && <p className="text-red-500 text-sm mt-1">{formErrors.roofType.message}</p>}
              </div>

                <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 to-emerald-900 p-6 text-white shadow-2xl shadow-slate-900/20">
                  <div className="text-sm uppercase tracking-[0.25em] text-emerald-200/80">Aperçu</div>
                  <div className="mt-4 text-2xl font-semibold">{watch('location') || 'Votre ville'}</div>
                  <div className="mt-2 text-emerald-100/80">Toit {watchedRoofType === 'flat' ? 'plat' : watchedRoofType === 'sloped' ? 'en pente' : 'mixte'} • {watch('roofArea') || 0} m²</div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <div className="text-sm text-emerald-100/70">Ensoleillement</div>
                      <div className="mt-1 text-2xl font-bold">{watch('peakSunHours') || 0}h</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <div className="text-sm text-emerald-100/70">Ombres</div>
                      <div className="mt-1 text-2xl font-bold">{watchedHasShading ? 'Oui' : 'Non'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Validez votre demande</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Dernière étape avant de générer une étude plus précise et plus utile pour votre client.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
              <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <DollarSign className="h-4 w-4" />
                  Budget disponible (DA)
                </label>
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-black/10">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {(watch('budget') || 0).toLocaleString('fr-DZ')} DZD
                  </div>
                  <input
                    {...register('budget', { valueAsNumber: true })}
                    type="range"
                    min={50000}
                    max={10000000}
                    step={50000}
                    className="mt-5 w-full accent-emerald-500"
                  />
                  <input
                    {...register('budget', { valueAsNumber: true })}
                    type="number"
                    className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="50000"
                  />
                </div>
                {formErrors.budget && <p className="text-red-500 text-sm mt-1">{formErrors.budget.message}</p>}
              </div>

              <div className="rounded-[28px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-white to-white p-6 shadow-xl shadow-emerald-500/10 dark:from-emerald-500/10 dark:via-[#0d1412] dark:to-[#0d1412]">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Résumé de votre demande</h3>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-slate-500 dark:text-slate-400">Client</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-white">{watch('name') || 'Non spécifié'}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-slate-500 dark:text-slate-400">Type</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-white">{watch('clientType') || 'Non spécifié'}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-slate-500 dark:text-slate-400">Consommation</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-white">{watch('monthlyConsumption') || 0} kWh/mois</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-slate-500 dark:text-slate-400">Surface</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-white">{watch('roofArea') || 0} m²</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-slate-500 dark:text-slate-400">Localisation</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-white">{watch('location') || 'Non spécifiée'}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-slate-500 dark:text-slate-400">Budget</div>
                    <div className="mt-1 font-semibold text-slate-900 dark:text-white">{watch('budget') ? `${watch('budget').toLocaleString('fr-DZ')} DZD` : 'Non spécifié'}</div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-black/10">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Appareils sélectionnés</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedAppliances.length > 0 ? selectedAppliances.map(([name, quantity]) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-emerald-500"
                      >
                        {name}
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">x{quantity}</span>
                      </span>
                    )) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">Aucun appareil sélectionné</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/90 p-5 shadow-2xl shadow-slate-900/5 backdrop-blur-sm dark:border-white/10 dark:bg-[#08100d]/95 md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.12),transparent_28%)]" />
      {isSubmitting && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-[32px] bg-white/80 backdrop-blur-sm dark:bg-black/80">
          <Loader fullScreen={false} />
        </div>
      )}

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />
                Assistant solaire
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">Formulaire intelligent</div>
              <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Une expérience guidée, moderne et plus précise pour préparer le devis.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-right shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Progression</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Étape {currentStep + 1} / {steps.length}</div>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-lime-400 to-amber-300"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const active = idx === currentStep;
              const done = idx < currentStep;

              return (
                <motion.button
                  key={step.title}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    'rounded-2xl border p-4 text-left transition-all',
                    active
                      ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                      : done
                        ? 'border-slate-300 bg-slate-50/80 dark:border-white/10 dark:bg-white/5'
                        : 'border-slate-200 bg-white/70 dark:border-white/10 dark:bg-white/5'
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-2xl border',
                      active || done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                    )}>
                      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">0{idx + 1}</span>
                  </div>
                  <div className="mt-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{step.title}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{step.subtitle}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-white/10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3 md:justify-start">
            <button
              type="button"
              onClick={handlePrevious}
              className={cn(
                'inline-flex items-center justify-center rounded-2xl border px-5 py-3 font-medium transition-colors',
                currentStep === 0
                  ? 'cursor-not-allowed border-slate-200 text-slate-400 dark:border-white/10 dark:text-slate-500'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
              )}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Fermer
            </button>
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-lime-400 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5"
            >
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className={cn(
                'inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition-transform hover:-translate-y-0.5',
                isSubmitting && 'opacity-70'
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Terminer'}
              <CheckCircle className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default ConsultationForm;
