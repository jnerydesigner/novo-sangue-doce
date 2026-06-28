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
      className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-green bg-cover bg-center text-sm font-bold text-white"
      role="img"
      style={resolvedAvatarUrl ? { backgroundImage: `url(${resolvedAvatarUrl})` } : undefined}
    >
      {resolvedAvatarUrl ? <span className="sr-only">{name}</span> : getInitials(name)}
    </div>
  );
}
