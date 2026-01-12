'use client';

import { useState, useEffect, Suspense } from 'react';
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
    id: 'work_model',
    type: 'radio',
    label: 'Size En Uygun Çalışma Modeli',
    options: [
      { value: 'remote', label: 'Tamamen Uzaktan (Remote)' },
      { value: 'hybrid', label: 'Hibrit (Ofis + Uzaktan)' },
      { value: 'office', label: 'Tam Zamanlı Ofis' },
      { value: 'freelance', label: 'Proje Bazlı / Freelance' },
    ],
  },
  {
    id: 'difficulty',
    type: 'textarea',
    label: 'Şu an iş hayatında en çok zorlandığınız profesyonel konu nedir?',
    placeholder: 'Kısa ve öz bir şekilde açıklayınız...',
  },
];

function QuizContent() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    risk_tolerance: 5 // Default for range
  });
  const [loading, setLoading] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
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

  const nextStep = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kvkkAccepted) return;
    setLoading(true);

    const utms = JSON.parse(localStorage.getItem('utms') || '{}');

    try {
      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, utms, kvkkAccepted }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('survey_id', data.id);
        localStorage.setItem('last_answers', JSON.stringify(answers));

        // Track Quiz Completed
        fetch('/api/track', {
          method: 'POST',
          body: JSON.stringify({ name: 'quiz_completed', submissionId: data.id })
        }).catch(() => { });

        router.push('/result');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Bir hata oluştu.');
      }
    } catch (err) {
      console.error(err);
      alert('Analiz hazırlanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = QUESTIONS[step];
  const isLastStep = step === QUESTIONS.length - 1;
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  // Simple validation to enable "Next"
  const canContinue = answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '';
  const canSubmit = canContinue && kvkkAccepted;

  return (
    <main className="min-h-screen bg-white py-12 px-6 text-gray-800 font-sans flex flex-col items-center">
      <div className="max-w-xl w-full space-y-12">
        <header className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1f3a8a]">
              Analiz Süreci: Adım {step + 1} / {QUESTIONS.length}
            </p>
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#1f3a8a] h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {step === 0 ? 'Kariyer Stratejinizi Belirleyelim' : 'Durum Analizi Devam Ediyor'}
          </h1>
        </header>

        <div className="min-h-[300px] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={isLastStep ? handleSubmit : (e) => e.preventDefault()} className="space-y-10">
            <div className="space-y-6">
              <label className="block text-lg font-bold text-gray-800 leading-tight">
                {currentQuestion.label}
              </label>

              {currentQuestion.type === 'select' && (
                <select
                  required
                  value={answers[currentQuestion.id] || ''}
                  className="w-full border-b-2 border-gray-100 focus:border-[#1f3a8a] py-4 bg-transparent focus:outline-none transition-colors text-lg"
                  onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
                >
                  <option value="">Seçiniz</option>
                  {currentQuestion.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}

              {currentQuestion.type === 'radio' && (
                <div className="grid gap-3">
                  {currentQuestion.options.map((opt) => (
                    <label key={opt.value} className={`
                                    border-2 rounded-xl p-5 flex items-center cursor-pointer transition-all
                                    ${answers[currentQuestion.id] === opt.value ? 'border-[#1f3a8a] bg-blue-50 text-[#1f3a8a]' : 'border-gray-50 hover:border-gray-200'}
                                `}>
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        required
                        className="sr-only"
                        value={opt.value}
                        checked={answers[currentQuestion.id] === opt.value}
                        onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
                      />
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === opt.value ? 'border-[#1f3a8a]' : 'border-gray-300'}`}>
                          {answers[currentQuestion.id] === opt.value && <div className="w-2.5 h-2.5 bg-[#1f3a8a] rounded-full" />}
                        </div>
                        <span className="text-base font-bold">{opt.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'range' && (
                <div className="space-y-6 pt-4">
                  <div className="text-center text-4xl font-black text-[#1f3a8a] mb-2">
                    {answers[currentQuestion.id] || 5}
                  </div>
                  <input
                    type="range"
                    min={currentQuestion.min}
                    max={currentQuestion.max}
                    step={currentQuestion.step}
                    value={answers[currentQuestion.id] || 5}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1f3a8a]"
                    onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Riskten Kaçınan</span>
                    <span>Yüksek Atılganlık</span>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'textarea' && (
                <textarea
                  required
                  rows={6}
                  placeholder={currentQuestion.placeholder}
                  value={answers[currentQuestion.id] || ''}
                  className="w-full border-2 border-gray-50 rounded-xl p-5 focus:outline-none focus:border-[#1f3a8a] transition-colors resize-none text-lg shadow-sm"
                  onChange={(e) => handleChange(currentQuestion.id, e.target.value)}
                ></textarea>
              )}
            </div>

            <div className="flex gap-4 pt-6 flex-col">
              {isLastStep && (
                <div className="space-y-4 pb-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 rounded border-gray-200 text-[#1f3a8a] focus:ring-[#1f3a8a] transition-all cursor-pointer"
                      checked={kvkkAccepted}
                      onChange={(e) => setKvkkAccepted(e.target.checked)}
                    />
                    <span className="text-sm text-gray-500 leading-snug group-hover:text-gray-700 transition-colors">
                      <a href="/kvkk" target="_blank" className="text-[#1f3a8a] font-bold underline decoration-blue-100 hover:decoration-blue-300">KVKK Aydınlatma Metni</a>’ni okudum ve kişisel verilerimin işlenmesini kabul ediyorum.
                    </span>
                  </label>
                  {!kvkkAccepted && (
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                      Devam etmek için onayınız gereklidir.
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-5 border-2 border-gray-100 rounded-xl font-bold uppercase tracking-widest text-xs text-gray-400 hover:bg-gray-50 transition-all"
                  >
                    Geri Dön
                  </button>
                )}

                {isLastStep ? (
                  <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    className="flex-[2] bg-[#1f3a8a] text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-900 transition-all shadow-xl active:scale-[0.98] disabled:bg-gray-200"
                  >
                    {loading ? 'Analiz Ediliyor...' : 'Analizi Tamamla'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canContinue}
                    className="flex-[2] bg-[#1f3a8a] text-white py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-900 transition-all shadow-xl active:scale-[0.98] disabled:bg-gray-200"
                  >
                    Sonraki Adım
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <footer className="text-center pt-12 border-t border-gray-50">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
            Profesyonel Kariyer Algoritması v2.4 — <span className="text-gray-400">Verileriniz SSL ile Korunmaktadır</span>
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function LandingQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a8a]"></div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
