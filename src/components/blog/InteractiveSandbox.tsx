// src/components/blog/InteractiveSandbox.tsx
'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import { useTheme } from 'next-themes';

interface InteractiveSandboxProps {
  code: string;
  language?: string;
}

/**
 * Secure, client-side code sandbox powered by Sandpack (WebContainers).
 * Only rendered for code blocks explicitly flagged with data-interactive="true".
 * Standard code blocks remain static <pre><code> elements.
 */
export default function InteractiveSandbox({ code, language = 'javascript' }: InteractiveSandboxProps) {
  const { resolvedTheme } = useTheme();

  // Map common language aliases to Sandpack templates
  const getTemplate = (): 'vanilla' | 'react' | 'node' => {
    const lang = language.toLowerCase();
    if (lang.includes('react') || lang.includes('jsx') || lang.includes('tsx')) return 'react';
    if (lang.includes('node')) return 'node';
    return 'vanilla';
  };

  const template = getTemplate();

  // Determine the main file name based on template
  const getMainFile = () => {
    switch (template) {
      case 'react':
        return '/App.js';
      case 'node':
        return '/index.js';
      default:
        return '/index.js';
    }
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-border shadow-lg">
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-border">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Interactive Playground
        </span>
      </div>
      <Sandpack
        template={template}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        files={{
          [getMainFile()]: {
            code: code.trim(),
            active: true,
          },
        }}
        options={{
          showConsole: true,
          showConsoleButton: true,
          showLineNumbers: true,
          showTabs: true,
          editorHeight: 350,
          wrapContent: true,
        }}
      />
    </div>
  );
}
