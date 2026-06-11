'use client';
import React, { Suspense } from 'react';
import NewVisitForm from './NewVisitForm';

export default function NewVisitPage() {
  return (
    <Suspense fallback={<div className="section-card text-center py-12 text-slate-400">Loading...</div>}>
      <NewVisitForm />
    </Suspense>
  );
}
