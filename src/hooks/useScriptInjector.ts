import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useScriptInjector() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadAndInject = async () => {
      console.log("[ScriptInjector] Fetching scripts from Supabase...");
      const { data, error } = await supabase.from("admin_scripts").select("script_key, script_value");
      
      if (error) {
        console.error("[ScriptInjector] Error fetching scripts:", error);
        return;
      }

      if (!mounted || !data) return;

      const promises = data.map((row) => {
        if (!row.script_value?.trim()) return Promise.resolve();

        // Check if already injected to avoid duplicates
        if (document.querySelector(`[data-injected="${row.script_key}"]`)) {
          console.log(`[ScriptInjector] Script ${row.script_key} already injected, skipping.`);
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          const isBody = row.script_key === "custom_body";
          const container = isBody ? document.body : document.head;

          // Parse the script_value (HTML string)
          const parser = new DOMParser();
          const doc = parser.parseFromString(row.script_value, "text/html");
          const elements = Array.from(doc.body.childNodes);

          let scriptsToLoad = 0;
          const scriptsInRow: HTMLScriptElement[] = [];

          elements.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              
              if (el.tagName.toLowerCase() === "script") {
                const s = document.createElement("script");
                Array.from(el.attributes).forEach((attr) => {
                  s.setAttribute(attr.name, attr.value);
                });
                s.textContent = el.textContent;
                s.setAttribute("data-injected", row.script_key);
                
                if (s.src) {
                  scriptsToLoad++;
                  const loadHandler = () => {
                    scriptsToLoad--;
                    if (scriptsToLoad === 0) resolve();
                  };
                  s.onload = loadHandler;
                  s.onerror = loadHandler;
                }
                scriptsInRow.push(s);
              } else {
                // For non-script elements (like noscript, img, style)
                const clone = document.importNode(el, true);
                clone.setAttribute("data-injected", row.script_key);
                container.appendChild(clone);
              }
            } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
              // Handle comments or raw text if any
              const text = document.createTextNode(node.textContent);
              container.appendChild(text);
            }
          });

          // Append all scripts at once
          scriptsInRow.forEach(s => container.appendChild(s));

          if (scriptsToLoad === 0) resolve();
        });
      });

      await Promise.all(promises);
      
      if (mounted) {
        console.log("[ScriptInjector] All scripts injected and loaded.");
        setIsLoaded(true);
        // Dispatch a custom event to notify that scripts are ready
        window.dispatchEvent(new CustomEvent("scripts-ready"));
      }
    };

    loadAndInject();

    return () => {
      mounted = false;
      // We don't remove scripts on unmount to avoid breaking trackers that expect to persist
      // especially since Index.tsx might re-mount.
    };
  }, []);

  return isLoaded;
}
