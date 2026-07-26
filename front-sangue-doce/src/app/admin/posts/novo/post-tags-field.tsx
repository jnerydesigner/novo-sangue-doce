import type { PostTag } from "@/lib/api";

type PostTagsFieldProps = {
  onSelectedTagIdsChange: (updater: (current: string[]) => string[]) => void;
  selectedTagIds: string[];
  tags: PostTag[];
};

export function PostTagsField({
  onSelectedTagIdsChange,
  selectedTagIds,
  tags,
}: PostTagsFieldProps) {
  return (
    <div className="grid gap-2 text-sm font-bold text-inkSoft md:col-span-2">
      Tags
      <div className="flex flex-wrap gap-2 rounded-lg border border-line bg-paper p-3">
        {tags.map((tag) => {
          const checked = selectedTagIds.includes(tag.id);

          return (
            <label
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                checked
                  ? "border-green/30 bg-green/10 text-greenDeep"
                  : "border-lineStrong text-inkSoft"
              }`}
              key={tag.id}
            >
              <input
                checked={checked}
                className="sr-only"
                name="tagIds"
                onChange={(event) => {
                  onSelectedTagIdsChange((current) =>
                    event.target.checked
                      ? Array.from(new Set([...current, tag.id]))
                      : current.filter((id) => id !== tag.id),
                  );
                }}
                type="checkbox"
                value={tag.id}
              />
              {tag.name}
            </label>
          );
        })}
      </div>
    </div>
  );
}
