import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useScriptInjector() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAndInject = async () => {
      const { data } = await supabase.from("admin_scripts").select("script_key, script_value");
      if (!mounted || !data) return;

      const promises = data.map((row) => {
        if (!row.script_value?.trim()) return Promise.resolve();

        return new Promise<void>((resolve) => {
          const isBody = row.script_key === "custom_body";
          const container = isBody ? document.body : document.head;

          // Remove previous injection
          document.querySelectorAll(`[data-injected="${row.script_key}"]`).forEach(el => el.remove());

          const wrapper = document.createElement("div");
          wrapper.setAttribute("data-injected", row.script_key);
          wrapper.innerHTML = row.script_value;

          const scripts = wrapper.querySelectorAll("script");
          let scriptsToLoad = scripts.length;

          if (scriptsToLoad === 0) {
            container.appendChild(wrapper);
            resolve();
            return;
          }

          scripts.forEach((orig) => {
            const s = document.createElement("script");
            orig.getAttributeNames().forEach((attr) => {
              s.setAttribute(attr, orig.getAttribute(attr)!);
            });
            s.textContent = orig.textContent;
            
            if (s.src) {
              s.onload = () => {
                scriptsToLoad--;
                if (scriptsToLoad === 0) resolve();
              };
              s.onerror = () => {
                scriptsToLoad--;
                if (scriptsToLoad === 0) resolve();
              };
            } else {
              scriptsToLoad--;
            }

            orig.replaceWith(s);
          });

          container.appendChild(wrapper);
          if (scriptsToLoad === 0) resolve();
        });
      });

      await Promise.all(promises);
      if (mounted) {
        setIsLoaded(true);
        // Dispatch a custom event to notify that scripts are ready
        window.dispatchEvent(new CustomEvent("scripts-ready"));
      }
    };

    loadAndInject();

    return () => {
      mounted = false;
      document.querySelectorAll("[data-injected]").forEach((el) => el.remove());
    };
  }, []);

  return isLoaded;
}
