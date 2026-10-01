import React, { useState } from 'react';
import CitizenLayout from '../layouts/CitizenLayout';
import ReportForm from '../components/reports/ReportForm';
import ReportSuccess from '../components/reports/ReportSuccess';
import { PlusCircle } from 'lucide-react';

export default function NewReportPage() {
  const [submittedReport, setSubmittedReport] = useState(null);

  return (
    <CitizenLayout>
      {() => (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
          {/* Header Banner */}
          {!submittedReport && (
            <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-900 text-white flex items-center justify-center shrink-0">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                    Report an Issue or Civic Concern
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5 leading-relaxed">
                    Submit public infrastructure breakdowns, service delivery failures, environmental issues, or civic concerns across any of Kenya's 47 counties.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form or Success State */}
          {submittedReport ? (
            <ReportSuccess
              reportResult={submittedReport}
              onReset={() => setSubmittedReport(null)}
            />
          ) : (
            <ReportForm onSuccess={(report) => setSubmittedReport(report)} />
          )}
        </div>
      )}
    </CitizenLayout>
  );
}
