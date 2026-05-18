'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useTheme } from 'next-themes';

interface MermaidRendererProps {
  chart: string;
}

/**
 * Theme-aware Mermaid chart renderer.
 * Detects dark/light mode via next-themes and applies appropriate
 * Mermaid theme variables for consistent visual rendering.
 */
export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const isDark = resolvedTheme === 'dark';

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: isDark
        ? {
            primaryColor: '#0a0a0a',
            primaryTextColor: '#fff',
            primaryBorderColor: '#333',
            lineColor: '#666',
            secondaryColor: '#111',
            tertiaryColor: '#222',
            nodeBorder: '#444',
            clusterBkg: '#1a1a2e',
            titleColor: '#e2e8f0',
            edgeLabelBackground: '#111',
          }
        : {
            primaryColor: '#f8fafc',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#cbd5e1',
            lineColor: '#94a3b8',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#e2e8f0',
            nodeBorder: '#94a3b8',
            clusterBkg: '#f8fafc',
            titleColor: '#1e293b',
            edgeLabelBackground: '#f1f5f9',
          },
      securityLevel: 'loose',
    });

    const renderChart = async () => {
      try {
        if (chart) {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          setSvg(svg);
        }
      } catch (error) {
        console.error('Failed to render Mermaid chart:', error);
      }
    };

    renderChart();
  }, [chart, resolvedTheme]);

  if (!chart) return null;

  return (
    <div 
      className="mermaid-wrapper w-full overflow-x-auto flex justify-center p-4 bg-muted/20 rounded-2xl border border-border"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
