// Minimal Markdown → HTML for reports (headings, lists, bold, italic, links). Escapes input first.
function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(s) {
    return escapeHtml(s)
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
        .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,;:!?)])/g, '$1<em>$2</em>');
}

export function markdownToHtml(md) {
    const out = [];
    let list = null;
    const closeList = () => {
        if (list) {
            out.push(`</${list}>`);
            list = null;
        }
    };
    const openList = (kind) => {
        if (list !== kind) {
            closeList();
            out.push(`<${kind}>`);
            list = kind;
        }
    };
    for (const raw of String(md || '').split('\n')) {
        const line = raw.trimEnd();
        let m;
        if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
            closeList();
            const level = Math.min(m[1].length + 1, 4);
            out.push(`<h${level}>${inline(m[2])}</h${level}>`);
        } else if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
            openList('ul');
            out.push(`<li>${inline(m[1])}</li>`);
        } else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
            openList('ol');
            out.push(`<li>${inline(m[1])}</li>`);
        } else if (line.trim() === '') {
            closeList();
        } else {
            closeList();
            out.push(`<p>${inline(line)}</p>`);
        }
    }
    closeList();
    return out.join('\n');
}
