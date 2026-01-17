import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import ReportPurchaseModal from '../components/ReportPurchaseModal';

const SampleReport = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const milkBrands = [
    {
      brand: 'Brand A',
      nutritionScore: 8.5,
      ingredientSafety: 10,
      processing: 8,
      compositeScore: 8.8,
      benefits: 'Reliable, balanced nutrition; broadly trusted',
      meetsStandards: 'Yes'
    },
    {
      brand: 'Brand B',
      nutritionScore: 9.2,
      ingredientSafety: 10,
      processing: 8,
      compositeScore: 9.2,
      benefits: 'High nutrient content; premium taste',
      meetsStandards: 'Yes'
    },
    {
      brand: 'Brand C',
      nutritionScore: 9.2,
      ingredientSafety: 10,
      processing: 8,
      compositeScore: 9.2,
      benefits: 'Balanced fat and protein; strong safety records',
      meetsStandards: 'Yes'
    },
    {
      brand: 'Brand D',
      nutritionScore: 8.8,
      ingredientSafety: 10,
      processing: 8,
      compositeScore: 8.8,
      benefits: 'Lower calorie; clean ingredient profile',
      meetsStandards: 'Yes'
    },
    {
      brand: 'Brand E',
      nutritionScore: 9.4,
      ingredientSafety: 10,
      processing: 9,
      compositeScore: 9.4,
      benefits: 'Traceable A2 milk; minimal processing',
      meetsStandards: 'Yes'
    },
    {
      brand: 'Brand F',
      nutritionScore: 9.6,
      ingredientSafety: 10,
      processing: 9,
      compositeScore: 9.6,
      benefits: 'Highest purity; organic certification',
      meetsStandards: 'Yes'
    }
  ];

  const getScoreBarColor = (score) => {
    if (score >= 9.3) return '#27ae60';
    if (score >= 9.0) return '#2ecc71';
    return '#3498db';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-40 sm:pt-48 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="text-center sm:text-left w-full">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
                Milk Quality Scorecard Report
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-4">
                An impartial assessment of nutrition, safety, and processing quality<br />
                <span className="text-base">Scores range from 0 (worst) to 10 (best)</span>
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => setShowPurchaseModal(true)}
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
              >
                <ShoppingCart size={18} className="mr-2" />
                Buy Full Report ₹199
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none">
                <Download size={18} className="mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Share2 size={18} className="mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-6">
            <div className="bg-green-600 text-white px-4 py-2 rounded-full text-center font-semibold text-sm">
              9 - 10: Excellent
            </div>
            <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-center font-semibold text-sm">
              7 - 8.9: Good
            </div>
            <div className="bg-red-500 text-white px-4 py-2 rounded-full text-center font-semibold text-sm">
              0 - 6.9: Needs Attention
            </div>
          </div>
        </div>

        {/* Brand Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center py-6">Brand Comparison Summary</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-3 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wide">Brand</th>
                  <th className="px-3 py-4 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide">Nutrition Score (40%)</th>
                  <th className="px-3 py-4 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide">Ingredient Safety (40%)</th>
                  <th className="px-3 py-4 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide">Processing (20%)</th>
                  <th className="px-3 py-4 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide">Composite Score</th>
                  <th className="px-3 py-4 text-left text-xs sm:text-sm font-semibold uppercase tracking-wide">Key User Benefits</th>
                  <th className="px-3 py-4 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide">Meets Int'l Standards*</th>
                </tr>
              </thead>
              <tbody>
                {milkBrands.map((brand, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-3 py-4 text-sm sm:text-base font-medium text-gray-900">{brand.brand}</td>
                    <td className="px-3 py-4 text-center text-sm sm:text-base text-gray-900">{brand.nutritionScore}</td>
                    <td className="px-3 py-4 text-center text-sm sm:text-base text-gray-900">{brand.ingredientSafety}</td>
                    <td className="px-3 py-4 text-center text-sm sm:text-base text-gray-900">{brand.processing}</td>
                    <td className="px-3 py-4 text-center text-sm sm:text-base font-bold text-gray-900">{brand.compositeScore}</td>
                    <td className="px-3 py-4 text-sm sm:text-base text-gray-700">{brand.benefits}</td>
                    <td className="px-3 py-4 text-center text-sm sm:text-base text-gray-900">{brand.meetsStandards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Composite Scores Visualized */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">Composite Scores Visualized</h2>
          
          <div className="space-y-4">
            {milkBrands.map((brand, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 sm:w-24 text-sm sm:text-base font-medium text-gray-900 text-right">
                  {brand.brand}
                </div>
                <div className="flex-1 relative">
                  <div className="h-5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${brand.compositeScore * 10}%`,
                        backgroundColor: getScoreBarColor(brand.compositeScore)
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm sm:text-base font-bold text-gray-900">
                  {brand.compositeScore}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Choose Your Milk */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">How to Choose Your Milk</h2>
          
          <ul className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              All brands listed pass global safety standards and are safe for children and adults.
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              Higher-scoring products generally provide premium nutrition and purity suitable for sensitive consumers.
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              Lower-fat or toned options give you calorie control without compromising safety or protein.
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              Organic or A2 labeled products are ideal if you want traceability, purity, and minimal processing.
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-3 mt-1">•</span>
              Always check product packaging for real-time fortification labels and expiry dates.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mb-8">
          *Meets or exceeds standards of India's FSSAI, European EFSA, US FDA, Japan FOSHU, and Canada CFIA.
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 sm:p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Get the Complete Analysis</h3>
          <p className="text-gray-700 mb-6">
            This is just a preview. Get the full detailed report with individual brand analysis, 
            lab methodologies, and comprehensive recommendations for just ₹199.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              size="lg" 
              onClick={() => setShowPurchaseModal(true)}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <ShoppingCart className="mr-2" size={20} />
              Buy Full Report - ₹199
            </Button>
            <Link to="/#waitlist">
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto">
                Join Community
              </Button>
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            <p className="mb-2">✓ Detailed analysis of all brands</p>
            <p className="mb-2">✓ Lab test methodologies</p>
            <p className="mb-2">✓ Delivered to your email within 24 hours</p>
            <p>✓ Secure payment via Razorpay</p>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <ReportPurchaseModal 
          onClose={() => setShowPurchaseModal(false)}
          reportTitle="Milk Quality Scorecard Report"
        />
      )}
    </div>
  );
};

export default SampleReport;
