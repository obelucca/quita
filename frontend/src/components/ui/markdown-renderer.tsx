import React from "react";
import Link from "next/link";
import { Sparkles, AlertTriangle, Lightbulb, AlertCircle, Info } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Helper to render inline formatting: bold (**), italic (*), links ([text](url))
  const renderInline = (text: string): React.ReactNode[] => {
    // Regex matching links [text](url), bold **text**, and italic *text*
    const regex = /(\[.*?\]\(.*?\))|(\*\*.*?\*\*)|(\*.*?\*)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith("[") && matchText.includes("](")) {
        const linkMatch = matchText.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          const [, linkTitle, linkUrl] = linkMatch;
          const isExternal = linkUrl.startsWith("http://") || linkUrl.startsWith("https://");
          if (isExternal) {
            parts.push(
              <a
                key={match.index}
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 font-medium break-all transition-colors"
              >
                {linkTitle}
              </a>
            );
          } else {
            parts.push(
              <Link
                key={match.index}
                href={linkUrl.startsWith("#") ? linkUrl : linkUrl}
                className="text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2 transition-colors"
              >
                {linkTitle}
              </Link>
            );
          }
        }
      } else if (matchText.startsWith("**") && matchText.endsWith("**")) {
        parts.push(
          <strong key={match.index} className="font-bold text-slate-900">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith("*") && matchText.endsWith("*")) {
        parts.push(
          <em key={match.index} className="italic text-slate-800">
            {matchText.slice(1, -1)}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  // Split lines and parse block-level Markdown constructs
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let i = 0;
  let keyIndex = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Skip Meta Description line (handled by metadata)
    if (trimmed.startsWith("**Meta Description:**")) {
      i++;
      continue;
    }

    // Skip H1 title if rendered separately in hero/header layout
    if (trimmed.startsWith("# ")) {
      i++;
      continue;
    }

    // Headings H2
    if (trimmed.startsWith("## ")) {
      const titleText = trimmed.replace("## ", "").trim();
      const slugId = titleText
        .toLowerCase()
        .replace(/[^a-z0-9à-ú\s-]/g, "")
        .replace(/\s+/g, "-");

      elements.push(
        <h2
          key={keyIndex++}
          id={slugId}
          className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight pt-6 pb-2 border-b border-slate-100 flex items-center gap-2"
        >
          {renderInline(titleText)}
        </h2>
      );
      i++;
      continue;
    }

    // Headings H3
    if (trimmed.startsWith("### ")) {
      const titleText = trimmed.replace("### ", "").trim();
      elements.push(
        <h3 key={keyIndex++} className="text-base sm:text-lg font-bold text-slate-900 pt-4 pb-1">
          {renderInline(titleText)}
        </h3>
      );
      i++;
      continue;
    }

    // Callout / Blockquote parsing
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const fullQuote = quoteLines.join("\n").trim();

      // Determine callout type based on content
      let icon = <Info className="w-5 h-5 text-emerald-600" />;
      let bgStyle = "bg-emerald-50/60 border-emerald-200 text-emerald-950";

      if (fullQuote.includes("Você sabia?")) {
        icon = <Sparkles className="w-5 h-5 text-emerald-600" />;
        bgStyle = "bg-emerald-50/80 border-emerald-300 text-emerald-950";
      } else if (fullQuote.includes("Atenção")) {
        icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
        bgStyle = "bg-amber-50/80 border-amber-300 text-amber-950";
      } else if (fullQuote.includes("Dica do Especialista")) {
        icon = <Lightbulb className="w-5 h-5 text-blue-600" />;
        bgStyle = "bg-blue-50/80 border-blue-300 text-blue-950";
      } else if (fullQuote.includes("Erro comum")) {
        icon = <AlertCircle className="w-5 h-5 text-red-600" />;
        bgStyle = "bg-rose-50/80 border-rose-300 text-rose-950";
      }

      elements.push(
        <div
          key={keyIndex++}
          className={`my-6 p-4 sm:p-5 rounded-2xl border ${bgStyle} flex gap-3.5 items-start shadow-xs`}
        >
          <div className="flex-shrink-0 mt-0.5">{icon}</div>
          <div className="text-xs sm:text-sm font-medium leading-relaxed space-y-1">
            {quoteLines.map((qLine, qIdx) => (
              <p key={qIdx}>{renderInline(qLine)}</p>
            ))}
          </div>
        </div>
      );
      continue;
    }

    // Markdown Table parsing
    if (trimmed.startsWith("|")) {
      const tableRows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableRows.push(lines[i].trim());
        i++;
      }

      if (tableRows.length >= 2) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(2); // Ignore separator row (|---|---|)

        const parseRow = (rowStr: string) =>
          rowStr
            .split("|")
            .slice(1, -1)
            .map((cell) => cell.trim());

        const headers = parseRow(headerRow);

        elements.push(
          <div key={keyIndex++} className="my-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="p-3 sm:p-4 border-b border-slate-800">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {bodyRows.map((bRow, rIdx) => {
                  const cells = parseRow(bRow);
                  return (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      {cells.map((c, cIdx) => (
                        <td key={cIdx} className="p-3 sm:p-4 text-slate-700 font-medium">
                          {renderInline(c)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Unordered List parsing (- or *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }

      elements.push(
        <ul key={keyIndex++} className="my-4 space-y-2.5 pl-2">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5 text-slate-700 text-xs sm:text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List parsing (1. 2. 3.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }

      elements.push(
        <ol key={keyIndex++} className="my-4 space-y-3">
          {listItems.map((item, itemIdx) => (
            <li
              key={itemIdx}
              className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs sm:text-sm font-medium"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                {itemIdx + 1}
              </span>
              <span className="pt-0.5">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular Paragraph
    elements.push(
      <p key={keyIndex++} className="my-3 text-slate-700 text-xs sm:text-base leading-relaxed font-medium">
        {renderInline(trimmed)}
      </p>
    );

    i++;
  }

  return <div className="space-y-4">{elements}</div>;
}
