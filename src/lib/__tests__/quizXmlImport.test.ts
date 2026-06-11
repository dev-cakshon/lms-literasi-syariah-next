import { parseMoodleQuizXml } from '@/lib/quizXmlImport';

const FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="category">
    <category><text>Kategori Test</text></category>
  </question>
  <question type="multichoice">
    <questiontext format="html">
      <text><![CDATA[<p>Zakat Mal wajib bagi Muslim yang memiliki harta melebihi <em>nisab</em>?</p>]]></text>
    </questiontext>
    <defaultgrade>2</defaultgrade>
    <single>true</single>
    <answer fraction="0"><text><![CDATA[Benar, tanpa syarat]]></text></answer>
    <answer fraction="100"><text><![CDATA[Benar, dengan syarat nisab dan haul]]></text></answer>
    <answer fraction="0"><text><![CDATA[Salah, zakat mal tidak wajib]]></text></answer>
  </question>
  <question type="shortanswer">
    <questiontext format="html">
      <text><![CDATA[Sebutkan rukun jual beli yang pertama!]]></text>
    </questiontext>
    <defaultgrade>1</defaultgrade>
    <answer fraction="100"><text><![CDATA[Penjual dan Pembeli]]></text></answer>
    <answer fraction="0"><text><![CDATA[Ijab dan Kabul]]></text></answer>
  </question>
</quiz>`;

describe('parseMoodleQuizXml', () => {
  it('parses one multichoice and one shortanswer, skips category with a warning', () => {
    const { questions, warnings } = parseMoodleQuizXml(FIXTURE);

    expect(questions).toHaveLength(2);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/kategori|category/i);
  });

  it('strips HTML tags from questionText', () => {
    const { questions } = parseMoodleQuizXml(FIXTURE);
    expect(questions[0].questionText).not.toContain('<p>');
    expect(questions[0].questionText).not.toContain('<em>');
    expect(questions[0].questionText).toContain('nisab');
  });

  it('correctly maps multichoice fields', () => {
    const { questions } = parseMoodleQuizXml(FIXTURE);
    const mc = questions[0];
    expect(mc.type).toBe('multipleChoice');
    expect(mc.options).toHaveLength(3);
    expect(mc.correctAnswerIndex).toBe(1); // fraction="100" is index 1
    expect(mc.points).toBe(2);
    expect(mc.question).toBe(''); // legacy back-compat field
  });

  it('correctly maps shortanswer fields', () => {
    const { questions } = parseMoodleQuizXml(FIXTURE);
    const sa = questions[1];
    expect(sa.type).toBe('shortAnswer');
    expect(sa.correctAnswerText).toBe('Penjual dan Pembeli');
    expect(sa.points).toBe(1);
    expect(sa.options).toEqual([]);
  });

  it('throws a readable error for malformed XML', () => {
    expect(() => parseMoodleQuizXml('<quiz><broken')).toThrow(
      /XML tidak valid/,
    );
  });

  it('warns on multi-answer (single=false) and still imports using first correct', () => {
    const xml = `<quiz>
      <question type="multichoice">
        <questiontext format="html"><text>Multi</text></questiontext>
        <defaultgrade>1</defaultgrade>
        <single>false</single>
        <answer fraction="100"><text>A</text></answer>
        <answer fraction="100"><text>B</text></answer>
      </question>
    </quiz>`;
    const { questions, warnings } = parseMoodleQuizXml(xml);
    expect(questions).toHaveLength(1);
    expect(questions[0].correctAnswerIndex).toBe(0);
    expect(warnings.some((w) => /multi/i.test(w))).toBe(true);
  });
});
