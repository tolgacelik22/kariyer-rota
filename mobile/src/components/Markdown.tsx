import { Linking, StyleSheet, Text, View } from 'react-native';

import { C, F } from '@/constants/theme';

// Renders the report Markdown the server produces: headings, bullets, numbered lists, **bold**, _italic_, [links](url).
function Inline({ text, style }: { text: string; style?: any }) {
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\b_([^_]+)_\b|\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) parts.push(<Text key={i++} style={s.bold}>{m[1]}</Text>);
    else if (m[2])
      parts.push(
        <Text key={i++} style={s.link} onPress={() => Linking.openURL(m![3])}>
          {m[2] === 'kanıt' ? '🔗 kanıt' : m[2]}
        </Text>,
      );
    else parts.push(<Text key={i++} style={s.italic}>{m[4] || m[5]}</Text>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Text style={[s.p, style]}>{parts}</Text>;
}

export default function Markdown({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  content.split('\n').forEach((raw, idx) => {
    const line = raw.trimEnd();
    let m: RegExpMatchArray | null;
    if (!line.trim()) return;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      const level = m[1].length;
      blocks.push(<Text key={idx} style={level <= 2 ? s.h2 : s.h3}>{m[2].replace(/\*\*/g, '')}</Text>);
    } else if ((m = line.match(/^(\s*)[-*]\s+(.*)$/))) {
      const nested = m[1].length >= 2;
      blocks.push(
        <View key={idx} style={[s.li, nested && { paddingLeft: 18 }]}>
          <View style={[s.dot, nested && s.dotNested]} />
          <Inline text={m[2]} style={{ flex: 1 }} />
        </View>,
      );
    } else if ((m = line.match(/^\s*(\d+)[.)]\s+(.*)$/))) {
      blocks.push(
        <View key={idx} style={s.li}>
          <Text style={s.num}>{m[1]}.</Text>
          <Inline text={m[2]} style={{ flex: 1 }} />
        </View>,
      );
    } else {
      blocks.push(<Inline key={idx} text={line} />);
    }
  });
  return <View style={{ gap: 8 }}>{blocks}</View>;
}

const s = StyleSheet.create({
  h2: { fontFamily: F.black, fontSize: 19, lineHeight: 25, color: C.ink, marginTop: 18, letterSpacing: -0.3 },
  h3: { fontFamily: F.bold, fontSize: 16, lineHeight: 22, color: C.brand, marginTop: 10 },
  p: { fontFamily: F.regular, fontSize: 15, lineHeight: 23, color: C.text },
  bold: { fontFamily: F.bold, color: C.ink },
  italic: { fontFamily: F.regular, fontStyle: 'italic', color: C.muted },
  link: { fontFamily: F.semibold, color: C.brandBright },
  li: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.brand, marginTop: 9 },
  dotNested: { backgroundColor: C.faint, width: 5, height: 5 },
  num: { fontFamily: F.bold, fontSize: 15, lineHeight: 23, color: C.brand, minWidth: 18 },
});
