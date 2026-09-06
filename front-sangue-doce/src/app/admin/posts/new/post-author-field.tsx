import type { PostAuthor } from "@/lib/api";
import { resolvePublicImageUrl } from "@/lib/public-image-url";

type PostAuthorFieldProps = {
  authors: PostAuthor[];
  onAuthorChange: (authorId: string) => void;
  selectedAuthorId: string;
};

export function PostAuthorField({
  authors,
  onAuthorChange,
  selectedAuthorId,
}: PostAuthorFieldProps) {
  const selectedAuthor = authors.find((author) => author.id === selectedAuthorId) ?? null;
  const selectedAuthorAvatarUrl = resolvePublicImageUrl(selectedAuthor?.avatarUrl);

  return (
    <div className="grid content-start gap-2 text-sm font-bold text-inkSoft">
      Autor
      <select
        className="h-12 rounded-lg border border-line bg-paper px-4 text-base font-medium text-ink outline-none transition focus:border-green"
        name="autor"
        onChange={(event) => onAuthorChange(event.target.value)}
        value={selectedAuthorId}
      >
        <option value="">Selecione um autor</option>
        {authors.map((author) => (
          <option key={author.id} value={author.id}>
            {author.name}
          </option>
        ))}
      </select>
      {selectedAuthor ? (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-paper2 px-3 py-2.5">
          {selectedAuthorAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={selectedAuthor.name}
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
              height={36}
              loading="lazy"
              src={selectedAuthorAvatarUrl}
              title={selectedAuthor.name}
              width={36}
            />
          ) : (
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-lineStrong bg-paper text-xs font-bold text-greenDeep">
              {selectedAuthor.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">{selectedAuthor.name}</div>
            <div className="truncate text-xs font-normal text-muted">{selectedAuthor.role}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
