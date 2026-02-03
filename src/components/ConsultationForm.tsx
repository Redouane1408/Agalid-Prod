import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';
import { fadeInVariants } from '../lib/animations';

const stepSchema = [
  // Step 1: Client Information
  z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    phone: z.string().min(10, 'Le téléphone doit contenir au moins 10 chiffres'),
    address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
    clientType: z.enum(['Particulier', 'Entreprise', 'Industrie', 'Administration'], { message: 'Type de client requis' }),
  }),
  
  // Step 2: Energy Usage
  z.object({
    monthlyConsumption: z.number().min(50, 'La consommation doit être d\'au moins 50 kWh').max(5000, 'Maximum 5000 kWh'),
    householdSize: z.number().min(1, 'Minimum 1 personne').max(20, 'Maximum 20 personnes'),
    energyUsagePattern: z.enum(['residential', 'commercial', 'industrial']),
    appliances: z.array(z.string()).min(1, 'Sélectionnez au moins un appareil'),
  }),
  
  // Step 3: Property Details
  z.object({
    roofArea: z.number().min(10, 'La surface doit être d\'au moins 10 m²').max(1000, 'Maximum 1000 m²'),
    roofType: z.enum(['flat', 'sloped', 'mixed']),
    location: z.string().min(2, 'La localisation doit contenir au moins 2 caractères'),
    peakSunHours: z.number().min(3, 'Minimum 3 heures').max(8, 'Maximum 8 heures'),
    hasShading: z.boolean(),
  }),
  
  // Step 4: Budget and Preferences
  z.object({
    budget: z.number().min(10000, 'Le budget doit être d\'au moins 10,000 MAD').max(1000000, 'Maximum 1,000,000 MAD'),
  })
];

type FormData = z.infer<typeof stepSchema[0]> & 
  z.infer<typeof stepSchema[1]> & 
  z.infer<typeof stepSchema[2]> & 
  z.infer<typeof stepSchema[3]>;

interface ConsultationFormProps {
  onComplete: (data: FormData) => void;
  onClose: () => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues
  } = useForm<FormData>({
    resolver: zodResolver(stepSchema[currentStep]),
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      name: 'Test User',
      email: 'ricardoxvxv145@gmail.com',
      phone: '+213674231032',
      address: 'Casablanca',
      clientType: 'Entreprise',
      monthlyConsumption: 350,
      householdSize: 4,
      energyUsagePattern: 'commercial',
      appliances: ['Réfrigérateur', 'TV'],
      roofArea: 60,
      roofType: 'flat',
      location: 'Casablanca',
      peakSunHours: 5.5,
      hasShading: false,
      budget: 50000
    }
  });
  useEffect(() => {
    register('name');
    register('email');
    register('phone');
    register('address');
    register('clientType');
    register('monthlyConsumption');
    register('householdSize');
    register('energyUsagePattern');
    register('appliances');
    register('roofArea');
    register('roofType');
    register('location');
    register('peakSunHours');
    register('hasShading');
    register('budget');
  }, [register]);
  const formErrors = errors as Record<string, { message?: string }>;

  const steps = [
    { title: 'Informations Client', icon: User },
    { title: 'Consommation Énergétique', icon: Zap },
    { title: 'Détails du Propriété', icon: Home },
    { title: 'Budget & Préférences', icon: DollarSign },
  ];

  const applianceOptions = [
    'Réfrigérateur', 'Climatiseur', 'Chauffe-eau', 'Machine à laver',
    'Sèche-linge', 'Four', 'Micro-ondes', 'TV', 'Ordinateur', 'Éclairage'
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

  const handleNext = async () => {
    const isValid = await trigger();
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

  const watchedAppliances = watch('appliances') || [];
  const watchedEnergyPattern = watch('energyUsagePattern');
  const watchedRoofType = watch('roofType');
  const watchedClientType = watch('clientType');

  const toggleAppliance = (appliance: string) => {
    const current = watchedAppliances;
    if (current.includes(appliance)) {
      setValue('appliances', current.filter(a => a !== appliance));
    } else {
      setValue('appliances', [...current, appliance]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Informations Personnelles</h2>
              <p className="text-gray-600 dark:text-gray-400">Commençons par vos coordonnées</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Nom Complet
                </label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors"
                  placeholder="Jean Dupont"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors"
                  placeholder="jean.dupont@email.com"
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors"
                  placeholder="+212 6 12 34 56 78"
                />
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Adresse
                </label>
                <input
                    {...register('address')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors"
                    placeholder="123 Rue Didouche Mourad, Alger"
                  />
                {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Type de client</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clientTypeOptions.map((option) => (
                  <motion.label
                    key={option.value}
                    className={cn(
                      "flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                      watchedClientType === option.value
                        ? "border-[color:var(--color-secondary)] bg-[color:var(--color-secondary)]/10"
                        : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      {...register('clientType')}
                      type="radio"
                      value={option.value}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-white">{option.label}</div>
                    </div>
                  </motion.label>
                ))}
              </div>
              {formErrors.clientType && <p className="text-red-500 text-sm mt-1">{formErrors.clientType.message}</p>}
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Consommation Énergétique</h2>
              <p className="text-gray-600 dark:text-gray-400">Analysons vos besoins énergétiques</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Zap className="inline h-4 w-4 mr-1" />
                  Consommation mensuelle (kWh)
                </label>
                <input
                  {...register('monthlyConsumption', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors"
                  placeholder="350"
                />
                {formErrors.monthlyConsumption && <p className="text-red-500 text-sm mt-1">{formErrors.monthlyConsumption.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Nombre de personnes
                </label>
                <input
                  {...register('householdSize', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                  placeholder="4"
                />
                {formErrors.householdSize && <p className="text-red-500 text-sm mt-1">{formErrors.householdSize.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Type d'usage énergétique
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {energyPatternOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      className={cn(
                        "flex items-center p-4 border rounded-lg cursor-pointer transition-all",
                        watchedEnergyPattern === option.value
                          ? "border-[color:var(--color-secondary)] bg-[color:var(--color-secondary)]/10"
                          : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        {...register('energyUsagePattern')}
                        type="radio"
                        value={option.value}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 dark:text-white">{option.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                      </div>
                    </motion.label>
                  ))}
                </div>
                {formErrors.energyUsagePattern && <p className="text-red-500 text-sm mt-1">{formErrors.energyUsagePattern.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Appareils électroménagers principaux
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {applianceOptions.map((appliance) => (
                    <motion.button
                      key={appliance}
                      type="button"
                      onClick={() => toggleAppliance(appliance)}
                      className={cn(
                        "p-3 text-sm border rounded-lg transition-all",
                        watchedAppliances.includes(appliance)
                          ? "border-[color:var(--color-secondary)] bg-[color:var(--color-secondary)]/10 text-[color:var(--color-secondary)]"
                          : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 text-gray-700 dark:text-gray-300"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {appliance}
                    </motion.button>
                  ))}
                </div>
                {formErrors.appliances && <p className="text-red-500 text-sm mt-1">{formErrors.appliances.message}</p>}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Détails du Propriété</h2>
              <p className="text-gray-600 dark:text-gray-400">Informations sur votre propriété</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Surface du toit (m²)
                  </label>
                  <input
                    {...register('roofArea', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors"
                    placeholder="50"
                  />
                  {formErrors.roofArea && <p className="text-red-500 text-sm mt-1">{formErrors.roofArea.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Localisation
                  </label>
                  <input
                    {...register('location')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors"
                    placeholder="Alger"
                  />
                  {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Heures d'ensoleillement par jour
                  </label>
                  <input
                    {...register('peakSunHours', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors"
                    placeholder="5.5"
                  />
                  {formErrors.peakSunHours && <p className="text-red-500 text-sm mt-1">{formErrors.peakSunHours.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Type de toit
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roofTypeOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        watchedRoofType === option.value
                          ? "border-[color:var(--color-secondary)] bg-[color:var(--color-secondary)]/10"
                          : "border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        {...register('roofType')}
                        type="radio"
                        value={option.value}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="font-medium text-gray-800 dark:text-white mb-1">{option.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{option.description}</div>
                      </div>
                    </motion.label>
                  ))}
                </div>
                {formErrors.roofType && <p className="text-red-500 text-sm mt-1">{formErrors.roofType.message}</p>}
              </div>

              <div>
                <label className="flex items-center space-x-3 p-4 border border-gray-300 dark:border-white/10 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-white/20 transition-colors">
                  <input
                    {...register('hasShading')}
                    type="checkbox"
                    className="w-4 h-4 text-[var(--color-secondary)] border-gray-300 rounded focus:ring-[var(--color-secondary)]"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Le toit a-t-il des zones d'ombre ?</span>
                </label>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Budget & Préférences</h2>
              <p className="text-gray-600 dark:text-gray-400">Finalisons votre demande</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Budget disponible (MAD)
                </label>
                <input
                  {...register('budget', { valueAsNumber: true })}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-white rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-colors"
                  placeholder="50000"
                />
                {formErrors.budget && <p className="text-red-500 text-sm mt-1">{formErrors.budget.message}</p>}
              </div>

              <div className="bg-[color:var(--color-secondary)]/10 border border-[color:var(--color-secondary)]/30 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Résumé de votre demande</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>• Client: {watch('name') || 'Non spécifié'}</p>
                  <p>• Type de client: {watch('clientType') || 'Non spécifié'}</p>
                  <p>• Consommation: {watch('monthlyConsumption') || 0} kWh/mois</p>
                  <p>• Surface du toit: {watch('roofArea') || 0} m²</p>
                  <p>• Localisation: {watch('location') || 'Non spécifiée'}</p>
                  <p>• Budget: {watch('budget') ? `${watch('budget').toLocaleString('fr-MA')} MAD` : 'Non spécifié'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const active = idx === currentStep;
            return (
              <div key={s.title} className={cn('flex items-center gap-2', idx < steps.length - 1 && 'mr-2')}>
                <div className={cn('flex items-center gap-2 px-3 py-2 rounded-full border transition-colors', active ? 'bg-[color:var(--color-secondary)]/10 border-[color:var(--color-secondary)]' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10')}>
                  <Icon className={cn('h-4 w-4', active ? 'text-[var(--color-secondary)]' : 'text-gray-500 dark:text-gray-400')} />
                  <span className={cn('text-sm font-medium hidden sm:inline', active ? 'text-[var(--color-secondary)]' : 'text-gray-600 dark:text-gray-400')}>{s.title}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Étape {currentStep + 1} / {steps.length}</div>
      </div>

      {renderStepContent()}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={handlePrevious}
          className={cn('px-4 py-2 rounded-lg border dark:border-white/10 dark:text-white transition-colors', currentStep === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-white/5')}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="inline h-4 w-4 mr-2" /> Précédent
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 rounded-lg bg-[var(--color-secondary)] hover:brightness-110 text-black font-medium shadow-sm transition-all"
          >
            Suivant <ArrowRight className="inline h-4 w-4 ml-2" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className={cn('px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all', isSubmitting && 'opacity-70')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Envoi...' : 'Terminer'} <CheckCircle className="inline h-4 w-4 ml-2" />
          </button>
        )}
      </div>

      <div className="text-right">
        <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">Fermer</button>
      </div>
    </div>
  );
}

export default ConsultationForm;
