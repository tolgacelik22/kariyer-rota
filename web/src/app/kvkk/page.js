import { KVKK_TEXT } from '@/lib/legal/kvkk';

export const metadata = {
    title: 'KVKK Aydınlatma Metni - Kariyer Rota',
    description: 'Kariyer Rota Kişisel Verilerin Korunması Aydınlatma Metni ve Açık Rıza Formu',
};

export default function KvkkPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 font-sans">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-sm rounded-2xl">
                <h1 className="text-2xl font-black text-gray-900 mb-8 border-b pb-4">
                    KVKK Aydınlatma Metni
                </h1>

                <div className="prose prose-blue max-w-none">
                    {KVKK_TEXT.split('\n').map((line, i) => (
                        <p key={i} className="text-gray-600 text-sm leading-relaxed mb-4">
                            {line}
                        </p>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Kariyer Rota</span>
                    <span>Son Güncelleme: 2026</span>
                </div>
            </div>
        </div>
    );
}
