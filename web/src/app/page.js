'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const QUESTIONS = [
  {
    id: 'seniority',
    type: 'select',
    label: 'Mevcut Kıdem Seviyeniz',
    options: [
      { value: 'junior', label: 'Junior / Giriş Seviyesi' },
      { value: 'mid', label: 'Mid-Level / Orta Seviye' },
      { value: 'senior', label: 'Senior / Uzman' },
      { value: 'lead', label: 'Lead / Yönetici' },
    ],
  },
  {
    id: 'experience',
    type: 'radio',
    label: 'Toplam İş Tecrübeniz',
    options: [
      { value: '0-2', label: '0-2 Yıl' },
      { value: '3-5', label: '3-5 Yıl' },
      { value: '6-10', label: '6-10 Yıl' },
      { value: '10+', label: '10 Yıl Üzeri' },
    ],
  },
  {
    id: 'concern',
    type: 'select',
    label: 'Kariyerinizdeki Temel Endişeniz',
    options: [
      { value: 'salary', label: 'Maaş Pazarlığı ve Ücret Beklentisi' },
      { value: 'promotion', label: 'Terfi Süreci ve Pozisyon Yükseltme' },
      { value: 'growth', label: 'Kariyer Gelişimi ve Yeni Fırsatlar' },
      { value: 'communication', label: 'Yönetim ve İletişim Stratejileri' },
    ],
  },
  {
    id: 'risk_tolerance',
    type: 'range',
    label: 'Karar Alma Cesaretiniz (1: Çekimser, 10: Atılgan)',
    min: 1,
    max: 10,
    step: 1,
  },
  {
    id: 'difficulty',
    type: 'textarea',
    label: 'Şu an iş hayatında en çok zorlandığınız profesyonel konu nedir?',
    placeholder: 'Kısa ve öz bir şekilde açıklayınız...',
  },
];

export default function LandingQuizPage() {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    // Capture UTMs
    const utms = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
      const val = searchParams.get(key);
      if (val) utms[key] = val;
    });
    if (Object.keys(utms).length > 0) {
      localStorage.setItem('utms', JSON.stringify(utms));
    }

    // Track Quiz Started
    fetch('/api/track', {
      method: 'POST',
      body: JSON.stringify({ name: 'quiz_started', properties: utms })
    }).catch(() => { });
  }, [searchParams]);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const utms = JSON.parse(localStorage.getItem('utms') || '{}');

    try {
      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, utms }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('survey_id', data.id);

        // Track Quiz Completed
        fetch('/api/track', {
          method: 'POST',
          body: JSON.stringify({ name: 'quiz_completed', submissionId: data.id })
        }).catch(() => { });

        router.push('/result');
      }
    } catch (err) {
      console.error(err);
      alert('Analiz hazırlanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-12 px-6 text-gray-800 font-sans">
      <div className="max-w-xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Kariyer Analiz Formu
          </h1>
          <p className="text-gray-500 font-light max-w-sm mx-auto">
            Profesyonel durumunuzu 2 dakikada analiz edin ve stratejik raporunuzu hazırlayalım.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10 border-t border-gray-100 pt-10">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                {q.label}
              </label>

              {q.type === 'select' && (
                <select
                  required
                  className="w-full border-b-2 border-gray-100 focus:border-[#1f3a8a] py-3 bg-transparent focus:outline-none transition-colors"
                  onChange={(e) => handleChange(q.id, e.target.value)}
                >
                  <option value="">Seçiniz</option>
                  {q.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}

              {q.type === 'radio' && (
                <div className="grid grid-cols-2 gap-3">
                  {q.options.map((opt) => (
                    <label key={opt.value} className={`
                      border-2 rounded-md p-4 flex items-center justify-center cursor-pointer transition-all
                      ${answers[q.id] === opt.value ? 'border-[#1f3a8a] bg-blue-50 text-[#1f3a8a]' : 'border-gray-100 hover:border-gray-200'}
                    `}>
                      <input
                        type="radio"
                        name={q.id}
                        required
                        className="sr-only"
                        value={opt.value}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'range' && (
                <div className="space-y-4 pt-2">
                  <input
                    type="range"
                    min={q.min}
                    max={q.max}
                    step={q.step}
                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1f3a8a]"
                    onChange={(e) => handleChange(q.id, e.target.value)}
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Çekimser</span>
                    <span>Atılgan</span>
                  </div>
                </div>
              )}

              {q.type === 'textarea' && (
                <textarea
                  required
                  rows={4}
                  placeholder={q.placeholder}
                  className="w-full border-2 border-gray-100 rounded-md p-4 focus:outline-none focus:border-[#1f3a8a] transition-colors"
                  onChange={(e) => handleChange(q.id, e.target.value)}
                ></textarea>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f3a8a] text-white py-5 rounded-md font-bold text-lg hover:bg-blue-900 transition-all shadow-lg active:scale-[0.98] disabled:bg-gray-400"
          >
            {loading ? 'Analiz Ediliyor...' : 'Analizi Tamamla ve Raporu Hazırla'}
          </button>
        </form>

        <footer className="text-center pt-8 border-t border-gray-50">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Profesyonel Değerlendirme & Veri Gizliliği Güvencesi
          </p>
        </footer>
      </div>
    </main>
  );
}
