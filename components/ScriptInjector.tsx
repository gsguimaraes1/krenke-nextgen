import React, { useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export const ScriptInjector: React.FC = () => {
    useEffect(() => {
        // Usamos uma IIFE para manter o useEffect limpo
        (async () => {
            if (!supabase) return;

            try {
                const { data: scripts, error } = await supabase
                    .from('app_scripts')
                    .select('id, content, placement')
                    .eq('is_active', true);

                if (error || !scripts) return;

                scripts.forEach((script) => {
                    const elementId = `dynamic-tag-${script.id}`;
                    if (document.getElementById(elementId)) return;

                    // Criamos um Range para converter a string HTML em nós do DOM de forma eficiente
                    const range = document.createRange();
                    const documentFragment = range.createContextualFragment(script.content);

                    // Identificamos o alvo (Head ou Body)
                    const target = script.placement === 'head' ? document.head : document.body;

                    // Criamos um container leve (DocumentFragment não renderiza no DOM, mas ajuda na inserção)
                    const wrapper = document.createElement('div');
                    wrapper.id = elementId;
                    wrapper.style.display = 'none';

                    // Lidamos com a execução de scripts
                    const scriptsInFragment = documentFragment.querySelectorAll('script');

                    scriptsInFragment.forEach((oldScript) => {
                        const newScript = document.createElement('script');
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.textContent = oldScript.textContent;

                        // Substitui o script antigo pelo novo "executável" no fragmento
                        oldScript.parentNode?.replaceChild(newScript, oldScript);
                    });

                    wrapper.appendChild(documentFragment);
                    target.appendChild(wrapper);
                });
            } catch (err) {
                console.error('Error injecting scripts:', err);
            }
        })();
    }, []);

    return null;
};