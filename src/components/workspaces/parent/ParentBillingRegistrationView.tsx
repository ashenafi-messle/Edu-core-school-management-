/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, CreditCard, Download, UserCheck, ShieldCheck, 
  UploadCloud, Trash2, CheckCircle2, AlertCircle, Info, X 
} from 'lucide-react';
import { ChildProfile, PaymentInvoice, RegistrationStatus } from './ParentMockData';

interface ParentBillingRegistrationViewProps {
  selectedChild: ChildProfile;
  payments: PaymentInvoice[];
  registrationStatus: RegistrationStatus;
  mode: 'payments' | 'registration';
  onSettleInvoice: (invoiceId: string) => void;
  onSubmitRegistration: (childId: string, documents: string[], updatedInfo: any) => void;
}

export const ParentBillingRegistrationView: React.FC<ParentBillingRegistrationViewProps> = ({
  selectedChild,
  payments,
  registrationStatus,
  mode,
  onSettleInvoice,
  onSubmitRegistration
}) => {
  // Payment state
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [authorizing, setAuthorizing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Registration form state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: string }[]>([]);
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (555) 019-2834');
  const [homeAddress, setHomeAddress] = useState('1022 West Oak Avenue, Sector 4');
  const [allergyNotes, setAllergyNotes] = useState(selectedChild.allergyInfo);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Settle invoice callback
  const handleOpenCheckout = (inv: PaymentInvoice) => {
    setSelectedInvoice(inv);
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthorizing(true);
    setTimeout(() => {
      setAuthorizing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        if (selectedInvoice) {
          onSettleInvoice(selectedInvoice.id);
        }
        setShowCheckout(false);
        setPaymentSuccess(false);
        setSelectedInvoice(null);
        setCardNumber('');
        setExpDate('');
        setCvv('');
      }, 1200);
    }, 1500);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = (Array.from(e.dataTransfer.files) as File[]).map(f => ({
        name: f.name,
        size: f.size > 1024 * 1024 
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${(f.size / 1024).toFixed(0)} KB`
      }));
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = (Array.from(e.target.files) as File[]).map(f => ({
        name: f.name,
        size: f.size > 1024 * 1024 
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${(f.size / 1024).toFixed(0)} KB`
      }));
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please upload at least one of the required enrollment documents!");
      return;
    }
    setSubmittingReg(true);
    setTimeout(() => {
      setSubmittingReg(false);
      setRegSuccess(true);
      onSubmitRegistration(
        selectedChild.id, 
        selectedFiles.map(f => f.name), 
        { emergencyPhone, address: homeAddress, medicalNotes: allergyNotes }
      );
      setTimeout(() => {
        setRegSuccess(false);
        setSelectedFiles([]);
      }, 2000);
    }, 1800);
  };

  // Metrics
  const outstandingInvoices = payments.filter(p => p.status === 'Overdue' || p.status === 'Unpaid');
  const outstandingAmount = outstandingInvoices.reduce((acc, p) => acc + p.amount, 0);
  const paidInvoices = payments.filter(p => p.status === 'Paid');
  const paidAmount = paidInvoices.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 text-left">
      
      {/* Upper Status Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-brand-blue uppercase px-2 py-0.5 bg-brand-blue/10 rounded">
            Administrative Registry
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-2">
            {mode === 'payments' ? 'School Payments & Billing Center' : 'Next Academic Year Re-Enrollment'}
          </h3>
          <p className="text-xs text-slate-550 mt-0.5">
            Active child: <span className="font-bold text-slate-850 dark:text-white">{selectedChild.name} ({selectedChild.grade})</span>
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secure AES-256 Link</span>
        </span>
      </div>

      {/* RENDER PAYMENTS SECTION */}
      {mode === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">OUTSTANDING BALANCE</span>
              <span className="text-2xl font-black text-red-500 font-mono mt-1 block">${outstandingAmount}.00</span>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">Due immediately</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">TOTAL SETTLED FEES</span>
              <span className="text-2xl font-black text-emerald-500 font-mono mt-1 block">${paidAmount}.00</span>
              <span className="text-[10px] text-emerald-500 font-bold block mt-1">✓ Term 1 fully covered</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
              <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">DEFAULT CONFIGURATION</span>
              <span className="text-base font-black text-slate-800 dark:text-white font-mono mt-1 block">ACH Direct Debit</span>
              <span className="text-[10px] text-slate-500 block mt-1">Settled on checkout</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-850">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Active Invoices & Receipt Ledger</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Settle dues instantly and download legal school receipt proofs</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 text-[9.5px] uppercase font-bold">
                    <th className="py-3 px-5">Receipt No</th>
                    <th className="py-3 px-5">Description</th>
                    <th className="py-3 px-5">Due Date</th>
                    <th className="py-3 px-5">Method</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                      <td className="py-4 px-5 text-brand-blue font-bold">{p.receiptNumber}</td>
                      <td className="py-4 px-5 font-sans font-bold text-slate-850 dark:text-white">{p.desc}</td>
                      <td className="py-4 px-5 text-slate-500">{p.dueDate}</td>
                      <td className="py-4 px-5 font-sans">{p.paymentMethod || '—'}</td>
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">${p.amount}</td>
                      <td className="py-4 px-5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' :
                          p.status === 'Overdue' ? 'bg-red-500/10 text-red-600 animate-pulse' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-2">
                          {p.status !== 'Paid' ? (
                            <button
                              onClick={() => handleOpenCheckout(p)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shadow cursor-pointer"
                            >
                              Settle Invoice
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                alert(`Downloading official receipt file: ${p.receiptNumber}.pdf`);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer"
                              title="Download Receipt"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER REGISTRATION SECTION */}
      {mode === 'registration' && (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Official Re-enrollment Status Tracker</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Academic promotion for: <span className="font-bold text-slate-850 dark:text-white">{selectedChild.name}</span></p>
              </div>
              <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full ${
                registrationStatus.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                registrationStatus.status === 'Submitted' ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' :
                'bg-amber-500/15 text-amber-600'
              }`}>
                Re-enrollment Status: {registrationStatus.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                <span className="text-slate-450 font-bold block text-[10px]">CURRENT PROMOTION</span>
                <p className="font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">{registrationStatus.currentGrade} ➔ {registrationStatus.nextGrade}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                <span className="text-slate-450 font-bold block text-[10px]">OPEN DATE</span>
                <p className="font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">{registrationStatus.openingDate}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                <span className="text-slate-450 font-bold block text-[10px]">DEADLINE CLOSE</span>
                <p className="font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">{registrationStatus.closingDate}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-950 border border-slate-150 dark:border-slate-850">
                <span className="text-slate-450 font-bold block text-[10px]">RE-ENROLLMENT CODE</span>
                <p className="font-bold font-mono text-brand-blue mt-1">REG-{selectedChild.id}</p>
              </div>
            </div>
          </div>

          {registrationStatus.status === 'Approved' ? (
            <div className="p-8 bg-white dark:bg-slate-900 border border-emerald-500/20 rounded-3xl text-center space-y-4 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Promotion Fully Approved!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">The registrar team has validated your document uploads. {selectedChild.name} is promoted to {registrationStatus.nextGrade} for the upcoming academic cycle.</p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl max-w-sm mx-auto space-y-1 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200 block text-[11px]">Submitted Documents:</span>
                {registrationStatus.submittedDocuments.map((doc, idx) => (
                  <div key={idx} className="flex justify-between font-mono text-[10px] text-slate-500">
                    <span>{doc.name}</span>
                    <span>{doc.date}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form panel */}
              <form onSubmit={handleFormSubmit} className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-5">
                <div>
                  <h4 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider font-sans">Complete Re-Enrollment Application</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Verify dependent data, emergency contact telephone numbers, and upload signed safety documents</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Emergency Contact Telephone</label>
                      <input 
                        type="text" 
                        required
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Verified Address Line</label>
                      <input 
                        type="text" 
                        required
                        value={homeAddress}
                        onChange={(e) => setHomeAddress(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Health & Dietary Allergy Updates</label>
                    <textarea 
                      value={allergyNotes}
                      onChange={(e) => setAllergyNotes(e.target.value)}
                      rows={2}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Drag and Drop Upload */}
                  <div className="space-y-2 text-left">
                    <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono block">Upload Required Documents</label>
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
                        dragActive 
                          ? 'border-brand-blue bg-brand-blue/5' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/30'
                      }`}
                    >
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2.5" />
                      <p className="text-[11px] text-slate-600 dark:text-slate-350">
                        Drag and drop signed enrollment slips, or{' '}
                        <label className="text-brand-blue font-bold hover:underline cursor-pointer">
                          browse files
                          <input 
                            type="file" 
                            multiple 
                            onChange={handleFileSelect} 
                            className="hidden" 
                          />
                        </label>
                      </p>
                      <p className="text-[9.5px] text-slate-400 mt-1">Supports PDF, JPG, PNG up to 10MB</p>
                    </div>

                    {/* Show selected files */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-1.5 mt-3">
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl flex justify-between items-center text-[10.5px] font-mono">
                            <span className="text-slate-700 dark:text-slate-350">{file.name} ({file.size})</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFile(idx)}
                              className="text-red-500 hover:text-red-600 p-1 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center gap-4">
                  <span className="text-[10px] text-slate-450 leading-relaxed max-w-xs block">
                    Submit file proofs to request registrars validation checklist.
                  </span>

                  <button
                    type="submit"
                    disabled={submittingReg || regSuccess}
                    className="px-5 py-2.5 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white font-bold text-xs shadow disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {submittingReg ? 'Submitting Registry...' : regSuccess ? 'Form Submitted!' : 'Submit Registration'}
                  </button>
                </div>
              </form>

              {/* Required Documents Checklist sidebar */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4 h-fit">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider font-sans">Required Documents Checklist</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Attach these requested files for fast approval</p>
                </div>

                <div className="space-y-2.5">
                  {registrationStatus.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950 border border-slate-200/40 text-[11px] flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 font-mono text-[9px] font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-slate-650 dark:text-slate-350 leading-tight">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Credit Card sandbox checkout modal */}
      <AnimatePresence>
        {showCheckout && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl text-left space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Secure Checkout Sandbox</h3>
                <button onClick={() => setShowCheckout(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl space-y-1">
                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase block">BILLING INVOICE TARGET</span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">{selectedInvoice.desc}</h4>
                <p className="text-base font-black text-brand-blue font-mono mt-2">${selectedInvoice.amount}.00 USD</p>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Credit card details</label>
                  <div className="relative flex items-center">
                    <CreditCard className="absolute left-3.5 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="4111 •••• •••• 1111 (Demo Sandbox Allowed)"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full h-10 pl-11 pr-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">Expiration Date</label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      required
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-center focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-450 uppercase text-[9.5px] font-mono">CVV Code</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={3}
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-center focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={authorizing || paymentSuccess}
                    className="px-4.5 py-2 rounded-xl bg-brand-blue hover:bg-brand-indigo text-white shadow disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {authorizing ? 'Authorizing Transact...' : paymentSuccess ? 'Checkout Succeeded!' : 'Authorize Checkout'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
