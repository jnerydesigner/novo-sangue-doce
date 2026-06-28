import { resolvePublicImageUrl } from "@/lib/public-image-url";
import { getInitials } from "../dashboard.utils";

type UserAvatarProps = {
  avatarUrl?: string;
  name: string;
};

export function UserAvatar({ avatarUrl, name }: UserAvatarProps) {
  const resolvedAvatarUrl = resolvePublicImageUrl(avatarUrl);

  return (
    <div
      aria-label={name}
      className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-green text-sm font-bold text-white"
      role="img"
    >
      {resolvedAvatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="h-full w-full object-cover" src={resolvedAvatarUrl} />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
