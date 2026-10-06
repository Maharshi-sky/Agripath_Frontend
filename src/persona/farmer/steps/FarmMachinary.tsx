import { useEffect, useState } from 'react';
import { FieldGroup, FieldLabel, FieldSelect } from '../../../UI/FormControls';
import type { TechFormState } from '../../../state/wizardStore';
import { getMachineryCategories, getMachineryCompanies } from '../../../services/agriApi';

interface FarmMachinaryProps {
  tech: TechFormState;
  setTechField: (field: keyof TechFormState, value: string) => void;
}

export default function FarmMachinary({ tech, setTechField }: FarmMachinaryProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Selected Type: 'Equipment' ya 'Machinery' (jo tech state me ho, vahi active rahega)
  const selectedType = tech.productType || 'Equipment';

  useEffect(() => {
    if (!tech.productType) {
      setTechField('productType', 'Equipment'); // default Equipment type
      setTechField('productType', 'machinery');    // wizard category ko machinery set karna
    }
  }, [tech.productType, setTechField]);

  // 1. Fetch Categories whenever 'Type' changes
  useEffect(() => {
    let isSubscribed = true;

    async function loadCategories() {
      if (!selectedType) return;
      setLoadingCategories(true);
      try {
        const data = await getMachineryCategories(selectedType);
        if (isSubscribed) {
          const validCategories = Array.isArray(data) ? data : [];
          setCategories(validCategories);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
        if (isSubscribed) setCategories([]);
      } finally {
        if (isSubscribed) setLoadingCategories(false);
      }
    }

    loadCategories();

    return () => {
      isSubscribed = false;
    };
  }, [selectedType]);

  // 2. Fetch Companies whenever 'Type' or 'Category' changes
  useEffect(() => {
    let isSubscribed = true;

    async function loadCompanies() {
      if (!selectedType || !tech.machineryCategory) {
        setCompanies([]);
        return;
      }
      setLoadingCompanies(true);
      try {
        const data = await getMachineryCompanies(selectedType, tech.machineryCategory);
        if (isSubscribed) {
          const validCompanies = Array.isArray(data) ? data : [];
          setCompanies(validCompanies);
        }
      } catch (err) {
        console.error('Failed to load companies', err);
        if (isSubscribed) setCompanies([]);
      } finally {
        if (isSubscribed) setLoadingCompanies(false);
      }
    }

    loadCompanies();

    return () => {
      isSubscribed = false;
    };
  }, [selectedType, tech.machineryCategory]);

  return (
    <div className="rounded-sm bg-cream p-5 md:col-span-2">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-label">
        Farm Machinery & Equipment Details
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
        {/* Dropdown 1: TYPE */}
        <FieldGroup>
          <FieldLabel>Type *</FieldLabel>
          <FieldSelect
            value={selectedType}
            onChange={(e) => {
              const newType = e.target.value;
              setTechField('productType', newType);
              setTechField('productType', 'machinery');
              setTechField('machineryCategory', '');
              setTechField('manufacturingCompany', '');
              setTechField('company', '');
              setTechField('equipmentName', '');
              setTechField('name', '');
            }}
          >
            <option value="Equipment">Equipment</option>
            <option value="Machinery">Machinery</option>
          </FieldSelect>
        </FieldGroup>

        {/* Dropdown 2: CATEGORY */}
        <FieldGroup>
          <FieldLabel>
            Category {loadingCategories && <span className="text-[10px] text-slate-400">(loading...)</span>} *
          </FieldLabel>
          <FieldSelect
            value={tech.machineryCategory ?? ''}
            onChange={(e) => {
              const cat = e.target.value;
              setTechField('machineryCategory', cat);
              setTechField('productType', 'machinery');
              setTechField('manufacturingCompany', '');
              setTechField('company', '');
              setTechField('equipmentName', '');
              setTechField('name', '');
            }}
            disabled={loadingCategories}
          >
            <option value="">
              {loadingCategories
                ? 'Loading categories from database...'
                : categories.length === 0
                ? 'No categories found'
                : 'Select category'}
            </option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        {/* Dropdown 3: COMPANY NAME */}
        <FieldGroup>
          <FieldLabel>
            Manufacturing Company {loadingCompanies && <span className="text-[10px] text-slate-400">(loading...)</span>} *
          </FieldLabel>
          <FieldSelect
            value={tech.manufacturingCompany ?? ''}
            onChange={(e) => {
              const comp = e.target.value;
              const fullName = `${comp} - ${tech.machineryCategory || selectedType}`;
              setTechField('manufacturingCompany', comp);
              setTechField('company', comp);
              setTechField('equipmentName', fullName);
              setTechField('name', fullName);
            }}
            disabled={!tech.machineryCategory || loadingCompanies}
          >
            <option value="">
              {!tech.machineryCategory
                ? 'Select category first'
                : loadingCompanies
                ? 'Loading companies from database...'
                : companies.length === 0
                ? 'No companies found'
                : 'Select manufacturing company'}
            </option>
            {companies.map((comp) => (
              <option key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>
      </div>
    </div>
  );
}