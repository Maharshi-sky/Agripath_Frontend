import { useEffect, useState } from 'react';
import { FieldGroup, FieldLabel, FieldSelect } from '../../../UI/FormControls';
import { getFertilizerCategories } from '../../../services/api.ts';

interface FertilizerFormProps {
  tech: any;
  setTechField: (field: string, value: any) => void;
}

const DEFAULT_NUTRIENT_TYPES = [
  'Primary Nutrients',
  'Micronutrients',
  'Water Soluble Fertilisers',
  'Nano Fertilisers'
];

export default function FertilizerForm({ tech, setTechField }: FertilizerFormProps) {
  const [categories, setCategories] = useState<string[]>(DEFAULT_NUTRIENT_TYPES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const data = await getFertilizerCategories();
        if (data && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.warn('Using default fertilizer categories fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <FieldGroup>
      <FieldLabel>
        Fertilizer Category {loading && <span className="text-[10px] text-slate-400 font-normal">(fetching...)</span>} *
      </FieldLabel>
      <FieldSelect
        value={tech.fertilizerCategory || ''}
        onChange={(e) => {
          const selected = e.target.value;
          setTechField('fertilizerCategory', selected);
          setTechField('name', selected);
        }}
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </FieldSelect>
    </FieldGroup>
  );
}