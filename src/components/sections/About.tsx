import { splitWords } from '@/lib/format';

export function About({ text }: { text: string }) {
  return (
    <section className="about" id="about">
      <div className="about-inner">
        <p className="eyebrow">About me</p>
        {/* Each word is its own span so the scroll animation can reveal them one by one. */}
        <p className="about-text">
          {splitWords(text).map((token, index) =>
            token.kind === 'word' ? (
              <span className="w" key={index}>
                {token.value}
              </span>
            ) : (
              token.value
            ),
          )}
        </p>
      </div>
    </section>
  );
}
