import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const ScriptInjector: React.FC = () => {
    useEffect(() => {
        const injectScripts = async () => {
            if (!supabase) return;

            try {
                const { data: scripts } = await supabase
                    .from('app_scripts')
                    .select('*')
                    .eq('is_active', true);

                if (!scripts || scripts.length === 0) return;

                scripts.forEach((script) => {
                    const elementId = `dynamic-tag-${script.id}`;
                    if (document.getElementById(elementId)) return;

                    // Create container for non-script content (like styles or pixel noscripts)
                    const div = document.createElement('div');
                    div.id = elementId;
                    div.style.display = 'none';
                    div.innerHTML = script.content;

                    // Handle <script> tags within the content to ensure execution
                    const scriptTags = div.getElementsByTagName('script');
                    const scriptsToExecute: HTMLScriptElement[] = [];

                    for (let i = 0; i < scriptTags.length; i++) {
                        const oldScript = scriptTags[i];
                        const newScript = document.createElement('script');

                        // Copy attributes
                        Array.from(oldScript.attributes).forEach(attr => {
                            newScript.setAttribute(attr.name, attr.value);
                        });

                        // Copy content
                        newScript.text = oldScript.text;
                        scriptsToExecute.push(newScript);
                    }

                    // Append to head or body
                    const target = script.placement === 'head' ? document.head : document.body;

                    // Append scripts
                    scriptsToExecute.forEach(s => target.appendChild(s));

                    // Append remaining content (styles, divs, etc)
                    target.appendChild(div);
                });
            } catch (err) {
                console.error('Error injecting dynamic scripts:', err);
            }
        };

        injectScripts();
    }, []);

    return null;
};
