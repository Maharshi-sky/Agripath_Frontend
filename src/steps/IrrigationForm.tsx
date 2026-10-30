// src/steps/IrrigationForm.tsx
import { useState, useEffect } from 'react';
import { FieldGroup, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from '../UI/FormControls';
import type { TechFormState } from '../state/wizardStore';
import { agriApi } from '../services/agriApi';

export interface CropWaterRecord {
  id: number;
  crop_name: string;
  crop_category: string;
  min_water_mm_day: number;
  max_water_mm_day: number;
  avg_water_mm_day: number;
  daily_m3_ha_day: string;
  critical_growth_stage: string;
  recommended_system: string;
  agronomic_notes: string;
}

interface IrrigationFormProps {
  tech: TechFormState;
  setTechField: (field: keyof TechFormState, value: string) => void;
}

export default function IrrigationForm({ tech, setTechField }: IrrigationFormProps) {
  // Cascading / Filter Dropdown States
  const [cropsData, setCropsData] = useState<CropWaterRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Loading States
  const [loadingCrops, setLoadingCrops] = useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // 1. Initial Load: Fetch all 60 crops from Supabase via agriApi
  useEffect(() => {
    let isMounted = true;
    async function loadCrops() {
      setLoadingCrops(true);
      try {
        const data = await agriApi.getCropWaterRequirements();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCropsData(data);
          const uniqueCats = Array.from(new Set(data.map((c: CropWaterRecord) => c.crop_category).filter(Boolean)));
          setCategories(uniqueCats as string[]);
        }
      } catch (err) {
        console.warn('Failed to load crop water requirements:', err);
      } finally {
        if (isMounted) setLoadingCrops(false);
      }
    }
    loadCrops();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Filter crops based on category if selected
  const filteredCrops = selectedCategory
    ? cropsData.filter((c) => c.crop_category.toLowerCase() === selectedCategory.toLowerCase())
    : cropsData;

  // 3. Category Change Handler
  const handleCategoryFilter = (cat: string) => {
    setSelectedCategory(cat);
    setTechField('cropCategory', cat);
    setTechField('targetCrop', '');
    setTechField('desc', '');
  };

  // 4. Crop Select Handler -> AUTO POPULATE ALL IRRIGATION FIELDS
  const handleCropSelect = (cropName: string) => {
    setTechField('targetCrop', cropName);
    if (!cropName) return;

    setLoadingDetails(true);
    const matched = cropsData.find(
      (c) => c.crop_name.toLowerCase() === cropName.toLowerCase()
    );

    if (matched) {
      setTechField('name', `${matched.crop_name} Irrigation Regimen`);
      setTechField('crop', matched.crop_name);
      setTechField('cropCategory', matched.crop_category);
      setSelectedCategory(matched.crop_category);

      setTechField('minWaterMmDay', String(matched.min_water_mm_day));
      setTechField('maxWaterMmDay', String(matched.max_water_mm_day));
      setTechField('avgWaterMmDay', `${matched.avg_water_mm_day} mm/day`);
      setTechField('volumetricDemand', matched.daily_m3_ha_day);
      setTechField('criticalStage', matched.critical_growth_stage);
      setTechField('recommendedSystem', matched.recommended_system);
      setTechField('agronomicNotes', matched.agronomic_notes);

      const autoDossier = `[FAO-56 CROP WATER REQUIREMENT DOSSIER]
• Target Crop: ${matched.crop_name} (${matched.crop_category})
• Daily Evapotranspiration Rate (ETc): ${matched.min_water_mm_day} - ${matched.max_water_mm_day} mm/day
• Volumetric Requirement: ${matched.daily_m3_ha_day}
• Design Average Discharge: ${matched.avg_water_mm_day} mm/day
• Critical Irrigation Stage: ${matched.critical_growth_stage}
• Recommended System Setup: ${matched.recommended_system}
• Field Agronomic Notes: ${matched.agronomic_notes}`;

      setTechField('waterRequirementDetails', autoDossier);
      setTechField('desc', autoDossier);
    }
    setLoadingDetails(false);
  };

  const showCropFields = Boolean(tech.targetCrop);

  // Exact matching locked styling from SeedDetailsFields
  const lockedInputClass =
    'bg-slate-50/80 text-ink/90 cursor-not-allowed select-all border-line/70 focus:border-line focus:ring-0';

  return (
    <div className="rounded-sm bg-cream p-5 md:col-span-2">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-label">
        Irrigation Crop Selection & Hydrological Sizing
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
        {/* 1. Crop Category Filter Dropdown */}
        <FieldGroup>
          <FieldLabel>Crop Category (Filter)</FieldLabel>
          <FieldSelect
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            disabled={loadingCrops}
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        {/* 2. Target Crop Dropdown */}
        <FieldGroup>
          <FieldLabel>Select Target Crop *</FieldLabel>
          <FieldSelect
            value={tech.targetCrop ?? ''}
            onChange={(e) => handleCropSelect(e.target.value)}
            disabled={loadingCrops}
          >
            <option value="">
              {loadingCrops ? 'Loading crops from database...' : '-- Choose Target Crop --'}
            </option>
            {filteredCrops.map((c) => (
              <option key={c.id} value={c.crop_name}>
                {c.crop_name} ({c.avg_water_mm_day} mm/day)
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>
      </div>

      {/* Auto-Populated Details Section */}
      {loadingDetails && (
        <div className="mt-6 text-center text-xs font-semibold uppercase tracking-wider text-brand">
          Fetching hydrological parameters from database...
        </div>
      )}

      {showCropFields && !loadingDetails && (
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line pt-6 md:grid-cols-3">
          {/* Daily Water Demand Range - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Daily Water Requirement (ETc)</FieldLabel>
            <FieldInput
              value={tech.minWaterMmDay && tech.maxWaterMmDay ? `${tech.minWaterMmDay} - ${tech.maxWaterMmDay} mm/day` : ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. 5.5 - 7.5 mm/day"
            />
          </FieldGroup>

          {/* Average Design Demand - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Design Average Sizing</FieldLabel>
            <FieldInput
              value={tech.avgWaterMmDay ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. 6.5 mm/day"
            />
          </FieldGroup>

          {/* Volumetric Water Demand - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Volumetric Demand (m³/ha/day)</FieldLabel>
            <FieldInput
              value={tech.volumetricDemand ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. 55 - 75 m³/ha/day"
            />
          </FieldGroup>

          {/* Critical Growth Stage - READ ONLY */}
          <div className="md:col-span-2">
            <FieldLabel>Critical Growth Stage (Moisture Sensitive)</FieldLabel>
            <FieldInput
              value={tech.criticalStage ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. Tasseling & Silking to Early Grain Fill"
            />
          </div>

          {/* Recommended Delivery System - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Recommended System</FieldLabel>
            <FieldInput
              value={tech.recommendedSystem ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. Center Pivot / Drip"
            />
          </FieldGroup>

          {/* Agronomic Management Notes - READ ONLY */}
          <div className="md:col-span-3">
            <FieldLabel>Agronomic Management Notes</FieldLabel>
            <FieldInput
              value={tech.agronomicNotes ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="Specific agronomic guidelines..."
            />
          </div>

          {/* Automated Water Regimen Dossier - READ ONLY */}
          <div className="md:col-span-3">
            <FieldLabel>Automated Water Regimen Specifications</FieldLabel>
            <FieldTextarea
              value={tech.waterRequirementDetails ?? ''}
              readOnly
              rows={5}
              className={`${lockedInputClass} min-h-24 leading-relaxed resize-none font-mono text-[12px]`}
              placeholder="Complete agronomic water specifications..."
            />
          </div>
        </div>
      )}
    </div>
  );
}