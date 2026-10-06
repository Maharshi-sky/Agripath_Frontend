import { ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import { FieldGroup, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from '../../../UI/FormControls';

import { STEPS } from '../../../state/steps';
import { techRegistryForCategory, useWizard } from '../../../state/wizardStore';
import SeedDetailsFields from './SeedDetailsFields';
import FertilizerForm from './FertilizerForm';
import CropProtectionForm from './CropProtectionForm';
import BioInputs from './BioInputs';
import FarmMachinary from './FarmMachinary';

const CATEGORIES_WITH_CUSTOM_FORM = ['seeds', 'fertilizers', 'protection', 'bio', 'equipment'];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'seeds', label: 'Seeds & Varieties' },
  { value: 'fertilizers', label: 'Fertilizers & Plant Nutrients' },
  { value: 'protection', label: 'Crop Protection & Agrochem' },
  { value: 'bio', label: 'Biological Inputs & Bio-stimulants' },
  { value: 'equipment', label: 'Farm Machinery & Equipment' },
];

export default function Step1TechnologyDetails({ onToast }: { onToast: (message: string) => void }) {
  const navigate = useNavigate();
  const { state, setTechField, setTechCategory, loadExample, nextFromStep1 } = useWizard();
  const { tech, techCategory, techKey } = state;

  const [categoryChosen, setCategoryChosen] = useState(
    () => techCategory !== 'all' || Boolean(tech.name || tech.varietyName || tech.equipmentName)
  );

  useEffect(() => {
    if (techCategory !== 'all' || techKey || tech.name || tech.varietyName || tech.equipmentName) {
      setCategoryChosen(true);
    }
  }, [techCategory, techKey, tech.name, tech.varietyName, tech.equipmentName]);

  const techOptions = techRegistryForCategory(techCategory);

  const handleCategoryChange = (value: string) => {
    setTechCategory(value);
    setCategoryChosen(true);
  };

  const handleExampleLoad = (key: string) => {
    loadExample(key);
    setCategoryChosen(true);
  };

  const handleContinue = () => {
    const result = nextFromStep1();
    if (!result.ok && result.error) {
      onToast(result.error);
      return;
    }
    navigate(`/${STEPS[1].path}`);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-14 py-10">
      <h1 className="mb-3 text-[2.25rem] font-semibold leading-tight tracking-tight text-ink">
        What agricultural input or equipment are you evaluating?
      </h1>
      <p className="mb-9 text-[15px] leading-relaxed text-muted">
        Select your crop seed, fertilizer, biological input, or farm machinery model to analyze regional field compatibility and suitability.
      </p>

      <div
        className={cn(
          'grid grid-cols-1 gap-x-8 gap-y-6',
          categoryChosen ? 'md:grid-cols-2' : 'mx-auto max-w-md',
        )}
      >
        <FieldGroup>
          <FieldLabel>Select Category</FieldLabel>
          <FieldSelect value={techCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        {/* 1. Seeds & Varieties Form */}
        {categoryChosen && techCategory === 'seeds' && (
          <SeedDetailsFields tech={tech} setTechField={setTechField} />
        )}

        {/* 2. Fertilizers & Plant Nutrients Form */}
        {categoryChosen && techCategory === 'fertilizers' && (
          <FertilizerForm tech={tech} setTechField={(f: any, v: any) => setTechField(f, v)} />
        )}

        {/* 3. Crop Protection Form */}
        {categoryChosen && techCategory === 'protection' && (
          <CropProtectionForm tech={tech} setTechField={(f: any, v: any) => setTechField(f, v)} />
        )}

        {/* 4. Biological Inputs Form */}
        {categoryChosen && techCategory === 'bio' && (
          <BioInputs tech={tech} setTechField={setTechField} />
        )}

        {/* 5. Farm Machinery Form */}
        {categoryChosen && techCategory === 'equipment' && (
          <FarmMachinary tech={tech} setTechField={(f: any, v: any) => setTechField(f, v)} />
        )}

        {/* 6. Generic Form for non-custom categories */}
        {categoryChosen && !CATEGORIES_WITH_CUSTOM_FORM.includes(techCategory) && (
          <>
            <FieldGroup>
              <FieldLabel>Select Technology</FieldLabel>
              <FieldSelect value={techKey} onChange={(e) => e.target.value && handleExampleLoad(e.target.value)}>
                <option value="">Choose a technology</option>
                {techOptions.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </FieldSelect>
            </FieldGroup>

            <div className="border-t border-line md:col-span-2" />

            <FieldGroup full>
              <FieldLabel>Technology Name *</FieldLabel>
              <FieldInput
                value={tech.name}
                onChange={(e) => setTechField('name', e.target.value)}
                placeholder="e.g. Jain Drip Micro-Irrigation System 0.1–5ha"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Company / Institution *</FieldLabel>
              <FieldInput
                value={tech.company}
                onChange={(e) => setTechField('company', e.target.value)}
                placeholder="e.g. Jain Irrigation, ICRISAT, ICAR-IARI"
              />
            </FieldGroup>

            <FieldGroup full>
              <FieldLabel>Technology Description *</FieldLabel>
              <FieldTextarea
                value={tech.desc}
                onChange={(e) => setTechField('desc', e.target.value)}
                className="min-h-[140px]"
                placeholder="What it does, how it works, proven field results, target crops/animals..."
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Target Crop(s) or Livestock</FieldLabel>
              <FieldInput
                value={tech.crop}
                onChange={(e) => setTechField('crop', e.target.value)}
                placeholder="e.g. Chickpea, Wheat, Maize or Cattle, Poultry, Shrimp"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Proven Yield / Impact Data</FieldLabel>
              <FieldInput
                value={tech.yield}
                onChange={(e) => setTechField('yield', e.target.value)}
                placeholder="e.g. +22% yield, 60% water saving, 95% vaccine efficacy"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Application Method</FieldLabel>
              <FieldInput
                value={tech.method}
                onChange={(e) => setTechField('method', e.target.value)}
                placeholder="e.g. Drip irrigation, IM injection 2ml/animal"
              />
            </FieldGroup>

            <FieldGroup>
              <FieldLabel>Unit Price (approx)</FieldLabel>
              <FieldInput
                value={tech.price || tech.approx_unit_price_inr || ''}
                onChange={(e) => {
                  setTechField('price', e.target.value);
                  setTechField('approx_unit_price_inr', e.target.value);
                }}
                placeholder="e.g. ₹25,000 / unit"
              />
            </FieldGroup>

            <FieldGroup full>
              <FieldLabel>Additional Context (optional)</FieldLabel>
              <FieldTextarea
                value={tech.context}
                onChange={(e) => setTechField('context', e.target.value)}
                className="min-h-[90px]"
                placeholder="Certifications (BIS, ISO, NABL), power needs, existing partnerships..."
              />
            </FieldGroup>
          </>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <button type="button" className="text-sm font-medium text-ink hover:text-brand cursor-pointer">
          Save draft
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark cursor-pointer shadow-sm"
        >
          Continue to Target Markets
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}