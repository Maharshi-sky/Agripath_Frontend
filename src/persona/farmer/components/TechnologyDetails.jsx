import React, { useState, useEffect } from 'react';

// Mock database auto-population ke liye
const SEED_DATABASE = [
  {
    cropType: 'Wheat',
    seedType: 'Hybrid / High Yielding',
    brand: 'ICAR-IARI',
    data: {
      techName: 'HD-3226 (Pusa Yashasvi) High-Yield Seed Variety',
      company: 'ICAR - Indian Agricultural Research Institute',
      country: 'India',
      description: 'Biofortified bread wheat variety with high resistance to stripe and leaf rust. Requires less water and provides superior grain quality.',
      targetCrops: 'Wheat',
      provenYield: '+18% yield, 15% water saving, high protein content (12.8%)',
      applicationMethod: 'Direct sowing with seed drill, basal fertilizer dose',
      regulatoryStatus: 'Fully registered & commercialised',
      unitPrice: '$1.20/kg bag (Certified Seed)',
      partnershipModel: 'Distribution rights / License',
      additionalContext: 'ICAR certified, Non-GM, climate resilient for North-Western plain zone.'
    }
  },
  {
    cropType: 'Cotton',
    seedType: 'Bt Hybrid',
    brand: 'Mahyco',
    data: {
      techName: 'Bollgard II Cotton Seeds (MRC-7351)',
      company: 'Mahyco Seeds',
      country: 'India',
      description: 'Genetically modified dual-toxin cotton hybrid offering resistance to American, pink and spotted bollworms.',
      targetCrops: 'Cotton',
      provenYield: '+25% yield, 40% reduction in pesticide sprays',
      applicationMethod: 'Seed dibbling with recommended spacing (90x60 cm)',
      regulatoryStatus: 'Fully registered & commercialised',
      unitPrice: '$10.50/450g packet',
      partnershipModel: 'Distribution rights',
      additionalContext: 'GEAC approved, requires standard refugia planting.'
    }
  }
];

export default function TechnologyDetails() {
  // Category state
  const [category, setCategory] = useState('');

  // Seeds specific selectors
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSeedType, setSelectedSeedType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Main Form fields state
  const [formData, setFormData] = useState({
    techName: '',
    company: '',
    country: 'India',
    description: '',
    targetCrops: '',
    provenYield: '',
    applicationMethod: '',
    regulatoryStatus: 'Fully registered & commercialised',
    unitPrice: '',
    partnershipModel: 'Distribution rights',
    additionalContext: ''
  });

  // Auto-populate trigger jab 3 selection complete ho jaye
  useEffect(() => {
    if (category === 'seeds' && selectedCrop && selectedSeedType && selectedBrand) {
      const match = SEED_DATABASE.find(
        (item) =>
          item.cropType === selectedCrop &&
          item.seedType === selectedSeedType &&
          item.brand === selectedBrand
      );

      if (match) {
        setFormData(match.data);
      } else {
        // Fallback default agar exact match na mile
        setFormData((prev) => ({
          ...prev,
          techName: `${selectedBrand} ${selectedCrop} (${selectedSeedType})`,
          company: selectedBrand,
          targetCrops: selectedCrop,
        }));
      }
    }
  }, [category, selectedCrop, selectedSeedType, selectedBrand]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#fcfcf9] p-10 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            What technology are you deploying?
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            The match engine uses formulation, agronomic mechanism and trial evidence to score market fit. Precision here materially improves downstream regulatory accuracy.
          </p>
        </div>

        {/* Part 1: Primary Category Selector */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
            Select Category
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              // Reset seed selectors on category change
              setSelectedCrop('');
              setSelectedSeedType('');
              setSelectedBrand('');
            }}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Choose Category --</option>
            <option value="seeds">Seeds & Planting Material</option>
            <option value="fertilizer">Fertilizers & Soil Nutrition</option>
            <option value="machinery">Machinery & Irrigation</option>
            <option value="biopesticides">Crop Protection / Biopesticides</option>
          </select>
        </div>

        {/* Part 2: Dynamic Seed Flow */}
        {category === 'seeds' && (
          <div className="space-y-6">
            
            {/* 3 Step Seed Specific Selectors */}
            <div className="bg-white p-6 rounded-xl border border-green-200 bg-green-50/20 shadow-sm">
              <h2 className="text-sm font-bold text-green-800 uppercase tracking-wide mb-4">
                Seed Identification Parameters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Crop Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    1. Crop Type *
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Select Crop</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize</option>
                    <option value="Rice / Paddy">Rice / Paddy</option>
                  </select>
                </div>

                {/* 2. Seed Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    2. Seed Type *
                  </label>
                  <select
                    value={selectedSeedType}
                    onChange={(e) => setSelectedSeedType(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Select Type</option>
                    <option value="Hybrid / High Yielding">Hybrid / High Yielding</option>
                    <option value="Bt Hybrid">Bt Hybrid</option>
                    <option value="Open Pollinated (OPV)">Open Pollinated (OPV)</option>
                    <option value="Organic / Heirloom">Organic / Heirloom</option>
                  </select>
                </div>

                {/* 3. Brand / Institution */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    3. Brand / Institution *
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Select Brand</option>
                    <option value="ICAR-IARI">ICAR-IARI</option>
                    <option value="Mahyco">Mahyco</option>
                    <option value="Bayer CropScience">Bayer CropScience</option>
                    <option value="Syngenta">Syngenta</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Auto-populated Form Section */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-5">
              
              {/* Technology Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Technology Name *
                </label>
                <input
                  type="text"
                  name="techName"
                  value={formData.techName}
                  onChange={handleInputChange}
                  placeholder="e.g. HD-3226 High Yield Seed"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {/* Company & Country Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Company / Institution *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. ICAR, Mahyco"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Country of Origin
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Israel">Israel</option>
                  </select>
                </div>
              </div>

              {/* Technology Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Technology Description *
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What it does, how it works, active traits, proven field results..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                ></textarea>
              </div>

              {/* Target Crop & Yield Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Target Crop(s) or Livestock
                  </label>
                  <input
                    type="text"
                    name="targetCrops"
                    value={formData.targetCrops}
                    onChange={handleInputChange}
                    placeholder="e.g. Wheat, Cotton"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Proven Yield / Impact Data
                  </label>
                  <input
                    type="text"
                    name="provenYield"
                    value={formData.provenYield}
                    onChange={handleInputChange}
                    placeholder="e.g. +18% yield, 15% water saving"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              {/* Application Method & Regulatory Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Application Method
                  </label>
                  <input
                    type="text"
                    name="applicationMethod"
                    value={formData.applicationMethod}
                    onChange={handleInputChange}
                    placeholder="e.g. Direct sowing, Seed treatment"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Regulatory Status (Origin Country)
                  </label>
                  <select
                    name="regulatoryStatus"
                    value={formData.regulatoryStatus}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="Fully registered & commercialised">Fully registered & commercialised</option>
                    <option value="Under Trial / Experimental">Under Trial / Experimental</option>
                    <option value="Pending Approval">Pending Approval</option>
                  </select>
                </div>
              </div>

              {/* Unit Price & Partnership Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Unit Price (Approx)
                  </label>
                  <input
                    type="text"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    placeholder="e.g. $1.20/kg bag"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Partnership Model
                  </label>
                  <select
                    name="partnershipModel"
                    value={formData.partnershipModel}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="Distribution rights">Distribution rights</option>
                    <option value="Direct Sales">Direct Sales</option>
                    <option value="Joint Venture">Joint Venture</option>
                    <option value="Technology Licensing">Technology Licensing</option>
                  </select>
                </div>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Additional Context (Optional)
                </label>
                <textarea
                  name="additionalContext"
                  rows="2"
                  value={formData.additionalContext}
                  onChange={handleInputChange}
                  placeholder="Certifications (BIS, ISO, NABL), cold chain needs, GM/non-GM..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                ></textarea>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}