'use client';

import { useState } from 'react';
import { Copy, Download, Printer, Trash2 } from 'lucide-react';

export default function ReportActions({ id, content, filename }) {
    const [copied, setCopied] = useState(false);

    function download() {
        const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    async function copy() {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function remove() {
        if (!confirm('Bu raporu silmek istiyor musun? Haftalık kayıtların etkilenmez.')) return;
        await fetch(`/api/reports/${id}`, { method: 'DELETE' });
        window.location.href = '/app/raporlar';
    }

    const btn = 'flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100';
    return (
        <div className="flex flex-wrap gap-2">
            <button onClick={copy} className={btn}><Copy className="h-4 w-4" /> {copied ? 'Kopyalandı' : 'Kopyala'}</button>
            <button onClick={download} className={btn}><Download className="h-4 w-4" /> Markdown</button>
            <button onClick={() => window.print()} className={btn}><Printer className="h-4 w-4" /> PDF / Yazdır</button>
            <button onClick={remove} className={`${btn} hover:text-red-600`}><Trash2 className="h-4 w-4" /></button>
        </div>
    );
}
