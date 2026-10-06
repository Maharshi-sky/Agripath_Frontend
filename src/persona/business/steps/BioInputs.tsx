import { useEffect, useState } from 'react';
import { FieldGroup, FieldInput, FieldLabel, FieldSelect, FieldTextarea } from '../../../UI/FormControls';
import type { TechFormState } from '../../../state/wizardStore';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface BioInputsProps {
  tech: TechFormState;
  setTechField: (field: keyof TechFormState, value: string) => void;
}

export default function BioInputs({ tech, setTechField }: BioInputsProps) {
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [loadingCrops, setLoadingCrops] = useState<boolean>(false);
  const [loadingCats, setLoadingCats] = useState<boolean>(false);
  const [loadingComps, setLoadingComps] = useState<boolean>(false);
  const [loadingProds, setLoadingProds] = useState<boolean>(false);

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Ensure category is set in wizard store
  useEffect(() => {
    if (tech.category !== 'biologicals') {
      setTechField('category', 'biologicals');
    }
  }, [tech.category, setTechField]);

  // 1. Mount: Fetch Unique Crop Types
  useEffect(() => {
    let isMounted = true;
    async function fetchCropTypes() {
      setLoadingCrops(true);
      try {
        const res = await fetch(`${BASE_URL}/bio-inputs/crops`);
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setCropTypes(json.data);
        }
      } catch (err) {
        console.error('Failed to load bio crop types:', err);
      } finally {
        if (isMounted) setLoadingCrops(false);
      }
    }
    fetchCropTypes();
    return () => {
      isMounted = false;
    };
  }, [BASE_URL]);

  // 2. Crop Type change -> Fetch Categories
  useEffect(() => {
    let isMounted = true;
    if (!tech.cropType) {
      setCategories([]);
      return;
    }
    async function fetchCategories() {
      setLoadingCats(true);
      try {
        const res = await fetch(
          `${BASE_URL}/bio-inputs/categories?crop_type=${encodeURIComponent(tech.cropType || '')}`
        );
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setLoadingCats(false);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [tech.cropType, BASE_URL]);

  // 3. Category change -> Fetch Manufacturers
  useEffect(() => {
    let isMounted = true;
    if (!tech.inputCategory) {
      setCompanies([]);
      return;
    }
    async function fetchCompanies() {
      setLoadingComps(true);
      try {
        const res = await fetch(
          `${BASE_URL}/bio-inputs/companies?crop_type=${encodeURIComponent(
            tech.cropType || ''
          )}&category=${encodeURIComponent(tech.inputCategory || '')}`
        );
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setCompanies(json.data);
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        if (isMounted) setLoadingComps(false);
      }
    }
    fetchCompanies();
    return () => {
      isMounted = false;
    };
  }, [tech.cropType, tech.inputCategory, BASE_URL]);

  // 4. Company change -> Fetch Products
  useEffect(() => {
    let isMounted = true;
    if (!tech.inputCategory || !tech.manufacturingCompany) {
      setProducts([]);
      return;
    }
    async function fetchProducts() {
      setLoadingProds(true);
      try {
        const res = await fetch(
          `${BASE_URL}/bio-inputs/products?crop_type=${encodeURIComponent(
            tech.cropType || ''
          )}&category=${encodeURIComponent(
            tech.inputCategory || ''
          )}&company=${encodeURIComponent(tech.manufacturingCompany || '')}`
        );
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        if (isMounted) setLoadingProds(false);
      }
    }
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [tech.cropType, tech.inputCategory, tech.manufacturingCompany, BASE_URL]);

  const handleCropTypeChange = (crop: string) => {
    setTechField('cropType', crop);
    setTechField('inputCategory', '');
    setTechField('productCategory', '');
    setTechField('manufacturingCompany', '');
    setTechField('company', '');
    setTechField('brandProductName', '');
    setTechField('name', '');
    setTechField('approx_unit_price_inr', '');
  };

  const handleCategoryChange = (cat: string) => {
    setTechField('inputCategory', cat);
    setTechField('productCategory', cat);
    setTechField('manufacturingCompany', '');
    setTechField('company', '');
    setTechField('brandProductName', '');
    setTechField('name', '');
    setTechField('approx_unit_price_inr', '');
  };

  const handleCompanyChange = (comp: string) => {
    setTechField('manufacturingCompany', comp);
    setTechField('company', comp);
    setTechField('brandProductName', '');
    setTechField('name', '');
    setTechField('approx_unit_price_inr', '');
  };

  const handleProductChange = (prodName: string) => {
    setTechField('brandProductName', prodName);
    setTechField('name', prodName);

    const selected = products.find((p) => p.brand_product_name === prodName);
    if (selected) {
      setTechField('method', selected.application_method || '');
      setTechField('crop', selected.target_crops || selected.crop_type || '');
      setTechField(
        'approx_unit_price_inr',
        selected.approx_unit_price_inr || selected.approx_unit_price || ''
      );
      setTechField('origin', selected.country_of_origin || 'India');
      setTechField('keyBenefits', selected.key_benefits || '');
      setTechField('yield', selected.key_benefits || '');
      setTechField('desc', selected.description || '');
      setTechField(
        'context',
        selected.official_source_domain || selected.official_source_url || ''
      );
    }
  };

  const showDetailFields = Boolean(
    tech.cropType && tech.inputCategory && tech.manufacturingCompany && tech.brandProductName
  );

  return (
    <div className="rounded-sm bg-cream p-5 md:col-span-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-label">
          Biological Input Details
        </div>
        {(loadingCrops || loadingCats || loadingComps || loadingProds) && (
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <RefreshCw size={12} className="animate-spin" />
            Loading catalog...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-4">
        {/* Dropdown 1: Target Crop Selection */}
        <FieldGroup>
          <FieldLabel>1. Target Crop</FieldLabel>
          <FieldSelect
            value={tech.cropType ?? ''}
            onChange={(e) => handleCropTypeChange(e.target.value)}
            disabled={loadingCrops}
          >
            <option value="">-- Select Crop --</option>
            {cropTypes.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        {/* Dropdown 2: Biological Category */}
        <FieldGroup>
          <FieldLabel>2. Biological Category</FieldLabel>
          <FieldSelect
            value={tech.inputCategory ?? ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={!tech.cropType || loadingCats}
          >
            <option value="">
              {!tech.cropType ? 'Select crop first' : '-- Select Category --'}
            </option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        {/* Dropdown 3: Manufacturer */}
        <FieldGroup>
          <FieldLabel>3. Manufacturer / Brand</FieldLabel>
          <FieldSelect
            value={tech.manufacturingCompany ?? ''}
            disabled={!tech.inputCategory || loadingComps}
            onChange={(e) => handleCompanyChange(e.target.value)}
          >
            <option value="">
              {!tech.inputCategory
                ? 'Select category first'
                : loadingComps
                ? 'Loading manufacturers...'
                : '-- Select Manufacturer --'}
            </option>
            {companies.map((comp, idx) => (
              <option key={idx} value={comp}>
                {comp}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>

        {/* Dropdown 4: Product Name */}
        <FieldGroup>
          <FieldLabel>4. Product Name</FieldLabel>
          <FieldSelect
            value={tech.brandProductName ?? ''}
            disabled={!tech.manufacturingCompany || loadingProds}
            onChange={(e) => handleProductChange(e.target.value)}
          >
            <option value="">
              {!tech.manufacturingCompany
                ? 'Select manufacturer first'
                : loadingProds
                ? 'Loading products...'
                : '-- Select Product --'}
            </option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.brand_product_name}>
                {prod.brand_product_name}
              </option>
            ))}
          </FieldSelect>
        </FieldGroup>
      </div>

      {/* Auto-filled Product Specifications */}
      {showDetailFields && (
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line pt-6 md:grid-cols-3">
          <FieldGroup>
            <FieldLabel>Application Method</FieldLabel>
            <FieldInput
              value={tech.method ?? ''}
              onChange={(e) => setTechField('method', e.target.value)}
              placeholder="e.g. Soil drench, Foliar spray"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Target Crops Cluster</FieldLabel>
            <FieldInput
              value={tech.crop ?? ''}
              onChange={(e) => setTechField('crop', e.target.value)}
              placeholder="e.g. Chickpea; Soybean; Wheat"
            />
          </FieldGroup>

          <FieldGroup>
            <FieldLabel>Unit Price</FieldLabel>
            <FieldInput
              value={tech.approx_unit_price_inr ?? ''}
              onChange={(e) => setTechField('approx_unit_price_inr', e.target.value)}
              placeholder="e.g. ₹240 / 1 L"
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

          <div className="col-span-full">
            <FieldLabel>Key Agricultural Benefits</FieldLabel>
            <FieldTextarea
              value={tech.keyBenefits ?? ''}
              onChange={(e) => setTechField('keyBenefits', e.target.value)}
              className="w-full min-h-[60px]"
              placeholder="Key soil/crop benefits..."
            />
          </div>

          <div className="md:col-span-3">
            <div className="mb-1 flex items-center justify-between">
              <FieldLabel>Technical Formulation Brief</FieldLabel>
              {tech.context && (
                <a
                  href={tech.context}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  Official Company Domain <ExternalLink size={12} />
                </a>
              )}
            </div>
            <FieldTextarea
              value={tech.desc ?? ''}
              onChange={(e) => setTechField('desc', e.target.value)}
              className="min-h-[80px]"
              placeholder="Formulation details, active CFU count, biochemical activity..."
            />
          </div>
        </div>
      )}
    </div>
  );
}