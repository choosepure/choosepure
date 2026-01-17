import React from 'react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-40 sm:pt-48 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            Refund Policy – ChoosePure
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Effective Date:</strong> 17/01/26
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              This Refund Policy explains the circumstances under which refunds may be issued for contributions or payments made to ChoosePure ("we", "our", "us").
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-8 font-medium">
              By making a payment on ChoosePure, you agree to the terms outlined below.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Eligibility for Refund</h2>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800 font-medium">
                  Refunds are only applicable under the following condition:
                </p>
              </div>
              
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li><strong>A refund request is made before the food testing report has been shared with the user or community.</strong></li>
                <li>Once the report (or any part of it, including summaries or scores) is shared, no refund will be provided.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Non-Refundable Situations</h2>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800 font-medium">
                  Refunds will not be issued in the following cases:
                </p>
              </div>
              
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>The testing report has already been shared</li>
                <li>The user has accessed, downloaded, or viewed the report</li>
                <li>Dissatisfaction with test results, scores, or findings</li>
                <li>Change of mind after report delivery</li>
                <li>Delay caused by laboratories beyond reasonable control</li>
                <li>Differences between expected and actual results</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Refund Request Process</h2>
              <p className="text-gray-700 mb-4">To request a refund (before report sharing), users must:</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <ol className="list-decimal ml-6 text-gray-700 space-y-2">
                  <li>
                    Email us at{' '}
                    <a href="mailto:support@choosepure.in" className="text-blue-600 hover:text-blue-700 underline font-medium">
                      support@choosepure.in
                    </a>
                  </li>
                  <li>Mention:
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>Registered email ID</li>
                      <li>Transaction ID or payment reference</li>
                      <li>Reason for refund request</li>
                    </ul>
                  </li>
                </ol>
              </div>
              
              <p className="text-gray-700 font-medium">
                Refund requests will be reviewed and processed within 5–7 working days, if eligible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Mode of Refund</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Approved refunds will be credited back to the original payment method used.</li>
                <li>Processing time may vary depending on the payment gateway or bank.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Community-Driven Testing Disclaimer</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800">
                  <strong>ChoosePure operates on a community-contribution model.</strong> Once testing is initiated or reports are shared, costs are already incurred, and refunds are therefore not possible.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cancellation by ChoosePure</h2>
              <p className="text-gray-700 mb-4">In rare cases where:</p>
              <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
                <li>A test is cancelled by ChoosePure</li>
                <li>Testing cannot be conducted due to unforeseen circumstances</li>
              </ul>
              <p className="text-gray-700">
                An appropriate refund or credit may be issued at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to This Refund Policy</h2>
              <p className="text-gray-700">
                ChoosePure reserves the right to modify this Refund Policy at any time. Updates will be posted on this page with a revised effective date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For refund-related questions, contact:
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

            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mt-8">
              <p className="text-orange-800 font-medium">
                ⚠️ <strong>Important:</strong> Refunds are only possible before report sharing. Once you receive any part of the testing report, the transaction becomes final.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
              <p className="text-blue-800">
                📋 For complete terms of service, please review our{' '}
                <Link to="/terms-conditions" className="font-medium underline hover:text-blue-900">
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link to="/privacy-policy" className="font-medium underline hover:text-blue-900">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;