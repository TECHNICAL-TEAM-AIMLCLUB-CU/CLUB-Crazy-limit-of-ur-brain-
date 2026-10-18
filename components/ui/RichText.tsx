export default function RichText({ value }: { value: string }) {
  return value
    .split(/\r?\n\s*\r?\n/)
    .filter((paragraph) => paragraph.trim())
    .map((paragraph, index) => (
      <p key={index} className="mt-4 whitespace-pre-line leading-relaxed text-fg/85">
        {paragraph.trim()}
      </p>
    ));
}
