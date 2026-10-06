import { useEffect, useState } from 'react';
import { FieldGroup, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from '../../../UI/FormControls';
import type { TechFormState } from '../../../state/wizardStore';
import { agriApi } from '../../../services/agriApi';

interface SeedDetailsFieldsProps {
  tech: TechFormState;
  setTechField: (field: keyof TechFormState, value: string) => void;
}

export default function SeedDetailsFields({ tech, setTechField }: SeedDetailsFieldsProps) {
  // Cascading Dropdown States
  const [cropGroups, setCropGroups] = useState<string[]>([]);
  const [crops, setCrops] = useState<string[]>([]);
  const [varieties, setVarieties] = useState<string[]>([]);

  // Loading States
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false);
  const [loadingCrops, setLoadingCrops] = useState<boolean>(false);
  const [loadingVarieties, setLoadingVarieties] = useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // 1. Initial Load: Fetch all unique Crop Groups
  useEffect(() => {
    let isMounted = true;
    async function loadGroups() {
      setLoadingGroups(true);
      const groups = await agriApi.getCropGroups();
      if (isMounted) {
        setCropGroups(groups);
        setLoadingGroups(false);
      }
    }
    loadGroups();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. When Crop Group changes -> Fetch Crop Names
  const handleGroupChange = async (selectedGroup: string) => {
    setTechField('cropType', selectedGroup); // Storing Crop Group in cropType
    setTechField('seedType', '');            // Reset Crop Name
    setTechField('varietyName', '');         // Reset Variety Name
    setCrops([]);
    setVarieties([]);

    if (!selectedGroup) return;

    setLoadingCrops(true);
    const cropList = await agriApi.getCropsByGroup(selectedGroup);
    setCrops(cropList);
    setLoadingCrops(false);
  };

  // 3. When Crop Name changes -> Fetch Variety Names
  const handleCropChange = async (selectedCrop: string) => {
    setTechField('seedType', selectedCrop);  // Storing Crop Name in seedType
    setTechField('varietyName', '');         // Reset Variety Name
    setVarieties([]);

    if (!selectedCrop) return;

    setLoadingVarieties(true);
    const varietyList = await agriApi.getVarietiesByCrop(selectedCrop);
    setVarieties(varietyList);
    setLoadingVarieties(false);
  };

  // 4. When Variety Name is selected -> AUTO POPULATE ALL DETAILS
  const handleVarietyChange = async (selectedVariety: string) => {
    setTechField('varietyName', selectedVariety);
    if (!selectedVariety) return;

    setLoadingDetails(true);
    const record = await agriApi.getVarietyDetails(selectedVariety, tech.seedType);

    if (record) {
      // 1. Basic & Variety Info
      const cropEn = record['Crop Name (English)'] || tech.seedType || '';
      const vName = record['Variety Name'] || selectedVariety;
      setTechField('name', `${cropEn} - ${vName}`);
      setTechField('crop', cropEn);
      setTechField('varietyType', record['Variety / Hybrid Type'] || 'variety');
      setTechField('varietyCode', record['Variety Code'] || '-');
      setTechField('releaseYear', record['Year of Release'] || '-');

      // 2. Smart Best-Fit Maturity Range Mapping
      let maturity = '-';
      const dur = record['Maturity Duration (Days)'];
      const mType = record['Maturity Type'];
      if (dur && dur !== '-' && dur !== 'NULL - NULL Day') {
        maturity = dur;
      } else if (mType && mType !== '-') {
        maturity = `${mType} Days`;
      }
      setTechField('maturityRange', maturity);

      // 3. Yield & Disease Resistance
      setTechField('expectedYield', record['Yield Range (Qt/Ha)'] || '-');
      setTechField('yield', record['Yield Range (Qt/Ha)'] || '-');
      setTechField('diseaseProtection', record['Disease Resistance'] || '-');

      // 4. Country of Origin & States
      setTechField('origin', record['Country of Origin'] || 'India');
      setTechField('originRegion', record['Recommended States'] || 'India');

      // 5. Description
      setTechField('varietyDesc', record['Description'] || '');
      setTechField('desc', record['Description'] || '');
    }

    setLoadingDetails(false);
  };

  const showVarietyFields = Boolean(tech.cropType && tech.seedType && tech.varietyName);

  return (
    <div className="rounded-sm bg-cream p-5 md:col-span-2">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-label">
        Seed Selection & Classification
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
        {/* 1. Crop Group Dropdown */}
        <FieldGroup>
          <FieldLabel>Crop Group *</FieldLabel>
          <FieldSelect
            value={tech.cropType ?? ''}
            onChange={(e) => handleGroupChange(e.target.value)}
            disabled={loadingGroups}
          >
            <option value="">{loadingGroups ? 'Loading Groups...' : 'Select Crop Group'}</option>
            {cropGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        {/* 2. Crop Name Dropdown */}
        <FieldGroup>
          <FieldLabel>Crop Name *</FieldLabel>
          <FieldSelect
            value={tech.seedType ?? ''}
            onChange={(e) => handleCropChange(e.target.value)}
            disabled={!tech.cropType || loadingCrops}
          >
            <option value="">
              {!tech.cropType
                ? 'Select Group First'
                : loadingCrops
                ? 'Loading Crops...'
                : 'Select Crop Name'}
            </option>
            {crops.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        {/* 3. Variety Name Dropdown */}
        <FieldGroup>
          <FieldLabel>Variety Name *</FieldLabel>
          <FieldSelect
            value={tech.varietyName ?? ''}
            onChange={(e) => handleVarietyChange(e.target.value)}
            disabled={!tech.seedType || loadingVarieties}
          >
            <option value="">
              {!tech.seedType
                ? 'Select Crop First'
                : loadingVarieties
                ? 'Loading Varieties...'
                : 'Select Variety Name'}
            </option>
            {varieties.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>
      </div>

      {/* Auto-Populated Details Section */}
      {loadingDetails && (
        <div className="mt-6 text-center text-xs font-semibold uppercase tracking-wider text-brand">
          Fetching variety parameters from database...
        </div>
      )}

      {showVarietyFields && !loadingDetails && (
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line pt-6 md:grid-cols-3">
          <FieldGroup>
            <FieldLabel>Variety / Hybrid Type</FieldLabel>
            <FieldInput
              value={tech.varietyType ?? ''}
              onChange={(e) => setTechField('varietyType', e.target.value)}
              placeholder="e.g. variety / hybrid"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Variety Code</FieldLabel>
            <FieldInput
              value={tech.varietyCode ?? ''}
              onChange={(e) => setTechField('varietyCode', e.target.value)}
              placeholder="e.g. A0305029"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Year of Release</FieldLabel>
            <FieldInput
              value={tech.releaseYear ?? ''}
              onChange={(e) => setTechField('releaseYear', e.target.value)}
              placeholder="e.g. 2021"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Maturity Range</FieldLabel>
            <FieldInput
              value={tech.maturityRange ?? ''}
              onChange={(e) => setTechField('maturityRange', e.target.value)}
              placeholder="e.g. 80 - 88 Days"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Expected Yield Range</FieldLabel>
            <FieldInput
              value={tech.expectedYield ?? ''}
              onChange={(e) => setTechField('expectedYield', e.target.value)}
              placeholder="e.g. 15 - 20 Qt/Ha"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Disease Protection / Resistance</FieldLabel>
            <FieldInput
              value={tech.diseaseProtection ?? ''}
              onChange={(e) => setTechField('diseaseProtection', e.target.value)}
              placeholder="e.g. Powdery Mildew, Rust"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Country of Origin</FieldLabel>
            <FieldInput
              value={tech.origin ?? 'India'}
              onChange={(e) => setTechField('origin', e.target.value)}
              placeholder="India"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Recommended States / Region</FieldLabel>
            <FieldInput
              value={tech.originRegion ?? ''}
              onChange={(e) => setTechField('originRegion', e.target.value)}
              placeholder="e.g. Gujarat, Punjab, UP"
            />
          </FieldGroup>

          <div className="md:col-span-3">
            <FieldLabel>Automated Description</FieldLabel>
            <FieldTextarea
              value={tech.varietyDesc ?? ''}
              onChange={(e) => setTechField('varietyDesc', e.target.value)}
              className="min-h-[90px]"
              placeholder="Full agronomic summary..."
            />
          </div>
        </div>
      )}
    </div>
  );
}