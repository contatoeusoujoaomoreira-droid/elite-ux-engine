import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicForm, submitPublicForm, FormRecord, FormField } from "@/hooks/useForms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

const FormPublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState<FormRecord | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startedAt = useRef(new Date().toISOString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slug) return;
    fetchPublicForm(slug).then((result) => {
      if (!result) { setNotFound(true); setLoading(false); return; }
      setForm(result.form);
      setFields(result.fields);
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [currentStep]);

  const currentField = fields[currentStep];
  const progress = fields.length > 0 ? ((currentStep + 1) / fields.length) * 100 : 0;
  const theme = form?.theme_config || {};
  const primaryColor = (theme as any).primaryColor || "#FBBF24";
  const bgColor = (theme as any).backgroundColor || "#0a0a0a";

  const setAnswer = (val: any) => {
    setAnswers((prev) => ({ ...prev, [currentField.id]: val }));
  };

  const canProceed = () => {
    if (!currentField) return false;
    if (!currentField.required) return true;
    const val = answers[currentField.id];
    return val !== undefined && val !== "" && val !== null;
  };

  const handleNext = () => {
    if (currentStep < fields.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed()) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    setSubmitting(true);

    const params = new URLSearchParams(window.location.search);
    const metadata = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
    };

    const fieldMappings: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.field_mapping) fieldMappings[f.id] = f.field_mapping;
    });

    await submitPublicForm(
      form.id,
      answers,
      metadata,
      startedAt.current,
      form.pipeline_id,
      form.stage_id,
      fieldMappings
    );

    setSubmitted(true);
    setSubmitting(false);
  };

  // Track abandonment on unmount
  useEffect(() => {
    return () => {
      if (!submitted && form && currentField) {
        const { supabase } = require("@/integrations/supabase/client");
        supabase.from("form_submissions").insert({
          form_id: form.id,
          data: answers,
          metadata: { abandoned: true },
          started_at: startedAt.current,
          dropped_at_field: currentField.id,
        } as any);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
        <div className="animate-pulse text-white/50">Carregando...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-center">
          <p className="text-white/80 text-lg">Formulário não encontrado</p>
          <p className="text-white/40 text-sm mt-2">Este link pode estar incorreto ou expirado.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    const thankYouMsg = (form?.settings as any)?.thank_you_message || "Obrigado! Entraremos em contato em breve.";
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 px-6">
          <CheckCircle className="w-16 h-16 mx-auto" style={{ color: primaryColor }} />
          <h1 className="text-2xl font-bold text-white">{thankYouMsg}</h1>
        </div>
      </div>
    );
  }

  const renderField = () => {
    if (!currentField) return null;
    const value = answers[currentField.id] || "";
    const commonProps = {
      ref: inputRef as any,
      value,
      onChange: (e: any) => setAnswer(e.target.value),
      onKeyDown: handleKeyDown,
      className: "bg-white/10 border-white/20 text-white placeholder:text-white/40 text-lg h-14 focus:border-primary focus:ring-primary",
      placeholder: currentField.placeholder || "",
    };

    switch (currentField.type) {
      case "textarea":
        return <Textarea {...commonProps} className={commonProps.className + " min-h-[120px]"} rows={4} />;
      case "email":
        return <Input {...commonProps} type="email" />;
      case "phone":
        return <Input {...commonProps} type="tel" />;
      case "number":
        return <Input {...commonProps} type="number" />;
      case "date":
        return <Input {...commonProps} type="date" />;
      case "select":
        const options = (currentField.options as any[]) || [];
        return (
          <div className="space-y-2">
            {options.map((opt: any, i: number) => (
              <button
                key={i}
                onClick={() => { setAnswer(opt.value || opt.label); setTimeout(handleNext, 300); }}
                className={`w-full text-left p-4 rounded-lg border text-white transition-all ${
                  value === (opt.value || opt.label)
                    ? "border-primary bg-primary/20"
                    : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
                style={value === (opt.value || opt.label) ? { borderColor: primaryColor } : {}}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded border border-white/30 text-xs mr-3">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        );
      case "yes_no":
        return (
          <div className="flex gap-3">
            {["Sim", "Não"].map((opt) => (
              <button
                key={opt}
                onClick={() => { setAnswer(opt); setTimeout(handleNext, 300); }}
                className={`flex-1 p-4 rounded-lg border text-white transition-all text-lg ${
                  value === opt ? "border-primary bg-primary/20" : "border-white/20 bg-white/5 hover:bg-white/10"
                }`}
                style={value === opt ? { borderColor: primaryColor } : {}}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case "rating":
        return (
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => { setAnswer(n); setTimeout(handleNext, 300); }}
                className={`w-14 h-14 rounded-lg border text-xl transition-all ${
                  value === n ? "border-primary bg-primary/20 text-white" : "border-white/20 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
                style={value === n ? { borderColor: primaryColor } : {}}
              >
                {n}
              </button>
            ))}
          </div>
        );
      case "opinion_scale":
        return (
          <div className="flex gap-1 justify-center flex-wrap">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => { setAnswer(i); setTimeout(handleNext, 300); }}
                className={`w-11 h-11 rounded-lg border text-sm transition-all ${
                  value === i ? "border-primary bg-primary/20 text-white" : "border-white/20 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
                style={value === i ? { borderColor: primaryColor } : {}}
              >
                {i}
              </button>
            ))}
          </div>
        );
      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bgColor }}>
      {/* Progress */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <div className="h-1 w-full bg-white/10">
          <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: primaryColor }} />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300" key={currentStep}>
          <p className="text-white/40 text-sm mb-2">
            {currentStep + 1} → {fields.length}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {currentField?.label}
            {currentField?.required && <span style={{ color: primaryColor }}> *</span>}
          </h2>

          {renderField()}

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || submitting}
              className="px-6"
              style={{ background: primaryColor, color: "#000" }}
            >
              {currentStep === fields.length - 1 ? (submitting ? "Enviando..." : "Enviar") : "Próxima"}
              {currentStep < fields.length - 1 && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>

          <p className="text-white/30 text-xs text-center mt-6">
            Pressione <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/50">Enter ↵</kbd> para avançar
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormPublic;
