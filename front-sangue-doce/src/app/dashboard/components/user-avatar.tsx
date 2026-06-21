import { getInitials } from "../dashboard.utils";

type UserAvatarProps = {
  name: string;
};

export function UserAvatar({ name }: UserAvatarProps) {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-full bg-green text-sm font-bold text-white">
      {getInitials(name)}
    </div>
  );
}
