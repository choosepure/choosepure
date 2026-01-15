import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { testReports } from '../mockData';

const ReportDetail = () => {
  const { id } = useParams();
  const report = testReports.find(r => r.id === id);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Report Not Found</h2>
          <Link to="/reports">
            <Button className="bg-green-600 hover:bg-green-700">Back to Reports</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-40 sm:pt-48 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/reports" className="inline-flex items-center text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Reports
        </Link>

        {/* Header */}
        <Card className="p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img
                src={report.image}
                alt={report.productName}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div>
              <Badge className="mb-3">{report.category}</Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{report.productName}</h1>
              <p className="text-xl text-gray-600 mb-6">{report.brand}</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${
                    report.purityScore >= 9 ? 'text-green-600' :
                    report.purityScore >= 8 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {report.purityScore}
                  </div>
                  <p className="text-gray-600 mt-2">Purity Score</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Test Date:</span> {report.testDate}</p>
                <p><span className="font-semibold">Tested By:</span> {report.testedBy}</p>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download size={18} className="mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Share2 size={18} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{report.summary}</p>
        </Card>

        {/* Test Parameters */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Parameters</h2>
          <div className="space-y-4">
            {report.parameters.map((param, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {param.status === 'pass' ? (
                    <CheckCircle2 className="text-green-600" size={24} />
                  ) : (
                    <AlertTriangle className="text-yellow-600" size={24} />
                  )}
                  <span className="font-semibold text-gray-900">{param.name}</span>
                </div>
                <span className={`font-semibold ${
                  param.status === 'pass' ? 'text-green-600' : 'text-yellow-600'
                }`}>{param.result}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Lab Information */}
        <Card className="p-8 bg-gradient-to-r from-green-50 to-teal-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lab Information</h2>
          <p className="text-gray-700 mb-4">
            This test was conducted at {report.testedBy}, a certified laboratory following 
            FSSAI, US FDA, and EFSA standards.
          </p>
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-600">FSSAI Approved</Badge>
            <Badge className="bg-green-600">NABL Certified</Badge>
            <Badge className="bg-green-600">ISO 17025</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportDetail;
