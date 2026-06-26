import { getInitials } from "../dashboard.utils";

type UserAvatarProps = {
  avatarUrl?: string;
  name: string;
};

export function UserAvatar({ avatarUrl, name }: UserAvatarProps) {
  return (
    <div
      aria-label={name}
      className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-green bg-cover bg-center text-sm font-bold text-white"
      role="img"
      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
    >
      {avatarUrl ? <span className="sr-only">{name}</span> : getInitials(name)}
    </div>
  );
}
