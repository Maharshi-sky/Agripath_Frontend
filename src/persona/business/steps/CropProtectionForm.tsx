import { useEffect, useState } from 'react';
import { FieldGroup, FieldLabel, FieldSelect } from '../../../UI/FormControls';
import { getCropProtectionChemicalTypes } from '../../../services/agriApi';

interface CropProtectionFormProps {
  tech: any;
  setTechField: (field: string, value: any) => void;
}

export default function CropProtectionForm({ tech, setTechField }: CropProtectionFormProps) {
  const [chemicalTypes, setChemicalTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadChemicalTypes() {
      try {
        setLoading(true);
        const data = await getCropProtectionChemicalTypes();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setChemicalTypes(data);
        }
      } catch (err) {
        console.warn('Error fetching crop protection chemical types:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadChemicalTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <FieldGroup>
      <FieldLabel>
        Chemical Type {loading && <span className="text-[10px] text-slate-400 font-normal">(fetching...)</span>} *
      </FieldLabel>
      <FieldSelect
        value={tech.chemicalType || tech.protectionCategory || tech.name || ''}
        onChange={(e) => {
          const selected = e.target.value;
          setTechField('chemicalType', selected);
          setTechField('protectionCategory', selected);
          setTechField('name', selected);
          setTechField('category', 'protection');
        }}
      >
        <option value="">Select Chemical Type</option>
        {chemicalTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </FieldSelect>
    </FieldGroup>
  );
}