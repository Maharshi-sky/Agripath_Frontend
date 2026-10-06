import { useEffect, useState } from 'react';
import { FieldGroup, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from '../UI/FormControls';
import type { TechFormState } from '../state/wizardStore';
import { agriApi } from '../services/agriApi';

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
    setTechField('cropType', selectedGroup);
    setTechField('seedType', '');
    setTechField('varietyName', '');
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
    setTechField('seedType', selectedCrop);
    setTechField('varietyName', '');
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
      const cropEn = record['Crop Name (English)'] || tech.seedType || '';
      const vName = record['Variety Name'] || selectedVariety;
      setTechField('name', `${cropEn} - ${vName}`);
      setTechField('crop', cropEn);
      setTechField('varietyType', record['Variety / Hybrid Type'] || 'variety');
      setTechField('varietyCode', record['Variety Code'] || '-');
      setTechField('releaseYear', record['Year of Release'] || '-');

      let maturity = '-';
      const dur = record['Maturity Duration (Days)'];
      const mType = record['Maturity Type'];
      if (dur && dur !== '-' && dur !== 'NULL - NULL Day') {
        maturity = dur;
      } else if (mType && mType !== '-') {
        maturity = `${mType} Days`;
      }
      setTechField('maturityRange', maturity);

      setTechField('expectedYield', record['Yield Range (Qt/Ha)'] || '-');
      setTechField('yield', record['Yield Range (Qt/Ha)'] || '-');
      setTechField('diseaseProtection', record['Disease Resistance'] || '-');

      setTechField('origin', record['Country of Origin'] || 'India');
      setTechField('originRegion', record['Recommended States'] || 'India');

      setTechField('varietyDesc', record['Description'] || '');
      setTechField('desc', record['Description'] || '');
    }

    setLoadingDetails(false);
  };

  const showVarietyFields = Boolean(tech.cropType && tech.seedType && tech.varietyName);

  // Non-editable field styling (design/font exact rahega, cursor aur edit lock ho jayega)
  const lockedInputClass =
    'bg-slate-50/80 text-ink/90 cursor-not-allowed select-all border-line/70 focus:border-line focus:ring-0';

  // Dynamic layout check for Recommended States length
  const statesText = String(tech.originRegion ?? '');
  const isStatesLong = statesText.length > 35;
  const isStatesVeryLong = statesText.length > 75;

  return (
    <div className="rounded-sm bg-cream p-5 md:col-span-2">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-label">
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
          {/* Variety Type - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Variety / Hybrid Type</FieldLabel>
            <FieldInput
              value={tech.varietyType ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. variety / hybrid"
            />
          </FieldGroup>

          {/* Variety Code - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Variety Code</FieldLabel>
            <FieldInput
              value={tech.varietyCode ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. A0305029"
            />
          </FieldGroup>

          {/* Year of Release - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Year of Release</FieldLabel>
            <FieldInput
              value={tech.releaseYear ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. 2021"
            />
          </FieldGroup>

          {/* Maturity Range - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Maturity Range</FieldLabel>
            <FieldInput
              value={tech.maturityRange ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. 80 - 88 Days"
            />
          </FieldGroup>

          {/* Expected Yield - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Expected Yield Range</FieldLabel>
            <FieldInput
              value={tech.expectedYield ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. 15 - 20 Qt/Ha"
            />
          </FieldGroup>

          {/* Disease Protection - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Disease Protection / Resistance</FieldLabel>
            <FieldInput
              value={tech.diseaseProtection ?? ''}
              readOnly
              className={lockedInputClass}
              placeholder="e.g. Powdery Mildew, Rust"
            />
          </FieldGroup>

          {/* Country of Origin - READ ONLY */}
          <FieldGroup>
            <FieldLabel>Country of Origin</FieldLabel>
            <FieldInput
              value={tech.origin ?? 'India'}
              readOnly
              className={lockedInputClass}
              placeholder="India"
            />
          </FieldGroup>

          {/* Recommended States / Region - READ ONLY & DYNAMIC AUTO-EXTEND */}
          <div
            className={
              isStatesVeryLong
                ? 'md:col-span-3'
                : isStatesLong
                ? 'md:col-span-2'
                : 'md:col-span-1'
            }
          >
            <FieldLabel>Recommended States / Region</FieldLabel>
            {isStatesVeryLong ? (
              <FieldTextarea
                value={tech.originRegion ?? ''}
                readOnly
                rows={2}
                className={`${lockedInputClass} resize-none min-h-14.5 leading-relaxed py-2.5`}
                placeholder="e.g. Gujarat, Punjab, UP"
              />
            ) : (
              <FieldInput
                value={tech.originRegion ?? ''}
                readOnly
                className={lockedInputClass}
                placeholder="e.g. Gujarat, Punjab, UP"
              />
            )}
          </div>

          {/* Automated Description - READ ONLY */}
          <div className="md:col-span-3">
            <FieldLabel>Automated Description</FieldLabel>
            <FieldTextarea
              value={tech.varietyDesc ?? ''}
              readOnly
              className={`${lockedInputClass} min-h-22.5 leading-relaxed`}
              placeholder="Full agronomic summary..."
            />
          </div>
        </div>
      )}
    </div>
  );
}