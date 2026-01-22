import React from 'react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Terms & Conditions – ChoosePure
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> 17/01/26
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Welcome to ChoosePure ("ChoosePure", "we", "our", "us"). By accessing our website, joining the ChoosePure community, contributing towards food testing, or using any of our services, you agree to comply with and be bound by these Terms & Conditions ("Terms").
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-8 font-medium">
              If you do not agree to these Terms, please do not use ChoosePure.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Nature of ChoosePure Services</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>ChoosePure is a consumer awareness and community-driven platform focused on food quality, purity, nutrition, and processing transparency.</li>
                <li>We facilitate food testing through FSSAI-accredited laboratories.</li>
                <li>We share lab reports and simplified insights to help consumers make informed choices.</li>
                <li><strong>ChoosePure does not manufacture, sell, distribute, or endorse any food product.</strong></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Laboratory Testing & Reports (Important)</h2>
              <p className="text-gray-700 mb-4">By using ChoosePure, you expressly acknowledge and agree that:</p>
              
              <ul className="list-disc ml-6 text-gray-700 space-y-3">
                <li>All food testing is conducted in FSSAI-accredited laboratories, based on standard laboratory procedures and methodologies.</li>
                <li>The reports shared by ChoosePure are exactly as provided by the laboratory, without any alteration of test results.</li>
                <li>ChoosePure does not guarantee or warrant that the lab results represent absolute or universal product quality, as:
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Testing is sample-based</li>
                    <li>Results may vary across batches, locations, and time</li>
                  </ul>
                </li>
                <li><strong>The reports are informational and educational only, and should not be treated as medical, nutritional, or legal advice.</strong></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Ownership & Confidentiality of Reports</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-gray-700 font-medium">
                  Food testing reports shared by ChoosePure are strictly for the personal use of the contributing or authorized user only.
                </p>
              </div>
              
              <p className="text-gray-700 mb-4">
                <strong>You are not permitted to copy, publish, redistribute, resell, forward, or share the reports (in full or in part) with any third party, including on social media, websites, or messaging platforms.</strong>
              </p>
              
              <p className="text-gray-700 mb-2">Unauthorized sharing may result in:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Suspension or termination of access</li>
                <li>Legal action, if required</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Product Scores & Ratings Disclaimer</h2>
              <p className="text-gray-700 mb-4">ChoosePure may provide scores, ratings, or simplified summaries for tested products. By using these, you acknowledge that:</p>
              
              <ul className="list-disc ml-6 text-gray-700 space-y-3">
                <li><strong>Scores are provided for demonstration and consumer understanding purposes only.</strong></li>
                <li>The scores reflect an overall assessment based on:
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Purity indicators</li>
                    <li>Nutritional parameters</li>
                    <li>Degree of processing</li>
                  </ul>
                </li>
                <li>The scoring system is defined by ChoosePure, inspired by publicly known frameworks such as the EWG scale, but is not an official or standardized certification.</li>
                <li>ChoosePure does not claim that scores are correct, complete, or applicable in all cases.</li>
                <li><strong>Scores should not be interpreted as endorsements, rejections, or guarantees of any product.</strong></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree that you will:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Use ChoosePure for lawful and personal purposes only</li>
                <li>Provide accurate information while registering or contributing</li>
                <li>Not misuse reports, data, or community content</li>
                <li>Not misrepresent ChoosePure reports as official regulatory findings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payments & Contributions</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Contributions made towards testing are voluntary and community-driven.</li>
                <li>Fees paid are used to cover testing, operations, and platform costs.</li>
                <li>Refunds, if any, are subject to ChoosePure's{' '}
                  <Link to="/refund-policy" className="text-green-600 hover:text-green-700 underline font-medium">
                    Refund Policy
                  </Link>.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>All content, summaries, scoring frameworks, explanations, and branding on ChoosePure are the intellectual property of ChoosePure.</li>
                <li><strong>Unauthorized use, reproduction, or distribution is prohibited.</strong></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-gray-700 font-medium">
                  To the maximum extent permitted by law:
                </p>
              </div>
              
              <p className="text-gray-700 mb-4">ChoosePure shall not be liable for any direct or indirect damages arising from:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
                <li>Use or reliance on reports or scores</li>
                <li>Product purchase decisions</li>
                <li>Differences in future product quality or composition</li>
              </ul>
              
              <p className="text-gray-700 font-medium">
                <strong>Users assume full responsibility for decisions made based on ChoosePure content.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination of Access</h2>
              <p className="text-gray-700 mb-4">ChoosePure reserves the right to:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Suspend or terminate user access</li>
                <li>Remove content</li>
                <li>Restrict report access</li>
              </ul>
              <p className="text-gray-700 mt-4">...if these Terms are violated.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law & Jurisdiction</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700">
                ChoosePure may update these Terms from time to time. Continued use of the platform implies acceptance of the revised Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For any questions or concerns regarding these Terms, contact:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 font-medium">ChoosePure</p>
                <p className="text-gray-700">
                  Email:{' '}
                  <a href="mailto:support@choosepure.in" className="text-green-600 hover:text-green-700 underline">
                    support@choosepure.in
                  </a>
                </p>
                <p className="text-gray-700">
                  Website:{' '}
                  <a href="https://choosepure.in" className="text-green-600 hover:text-green-700 underline">
                    choosepure.in
                  </a>
                </p>
              </div>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
              <p className="text-blue-800 font-medium">
                📋 By continuing to use ChoosePure, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-4">
              <p className="text-green-800">
                🔒 Also review our{' '}
                <Link to="/privacy-policy" className="font-medium underline hover:text-green-900">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link to="/refund-policy" className="font-medium underline hover:text-green-900">
                  Refund Policy
                </Link>
                {' '}for complete information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;