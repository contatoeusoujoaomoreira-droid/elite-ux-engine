import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useScriptInjector() {
  useEffect(() => {
    let mounted = true;

    const loadAndInject = async () => {
      const { data } = await supabase.from("admin_scripts").select("script_key, script_value");
      if (!mounted || !data) return;

      data.forEach((row) => {
        if (!row.script_value?.trim()) return;

        // Determine injection target
        const isBody = row.script_key === "custom_body";
        const container = isBody ? document.body : document.head;

        // Remove previous injection with same key
        document.querySelectorAll(`[data-injected="${row.script_key}"]`).forEach(el => el.remove());

        const wrapper = document.createElement("div");
        wrapper.setAttribute("data-injected", row.script_key);
        wrapper.innerHTML = row.script_value;

        // Activate script tags by cloning them (innerHTML doesn't execute scripts)
        const scripts = wrapper.querySelectorAll("script");
        scripts.forEach((orig) => {
          const s = document.createElement("script");
          orig.getAttributeNames().forEach((attr) => {
            s.setAttribute(attr, orig.getAttribute(attr)!);
          });
          s.textContent = orig.textContent;
          orig.replaceWith(s);
        });

        container.appendChild(wrapper);
      });
    };

    loadAndInject();

    return () => {
      mounted = false;
      document.querySelectorAll("[data-injected]").forEach((el) => el.remove());
    };
  }, []);
}
