/**
 * Invoice action buttons — Save, Download PDF, Print, Share WhatsApp.
 */

'use client';

import React from 'react';
import { Save, Download, Printer, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

interface InvoiceActionsProps {
  onSave: () => void;
  onDownloadPDF: () => void;
  onPrint: () => void;
  onShareWhatsApp: () => void;
  isSaving?: boolean;
  isEdit?: boolean;
}

export default function InvoiceActions({
  onSave,
  onDownloadPDF,
  onPrint,
  onShareWhatsApp,
  isSaving = false,
  isEdit = false,
}: InvoiceActionsProps) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          icon={<Save size={16} />}
          onClick={onSave}
          disabled={isSaving}
          className="flex-1 min-w-[140px]"
        >
          {isSaving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Save Invoice'}
        </Button>

        <Button
          variant="secondary"
          icon={<Download size={16} />}
          onClick={onDownloadPDF}
          className="flex-1 min-w-[140px]"
        >
          Download PDF
        </Button>

        <Button
          variant="secondary"
          icon={<Printer size={16} />}
          onClick={onPrint}
          className="flex-1 min-w-[110px]"
        >
          Print
        </Button>

        <Button
          variant="success"
          icon={<MessageCircle size={16} />}
          onClick={onShareWhatsApp}
          className="flex-1 min-w-[140px]"
        >
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
