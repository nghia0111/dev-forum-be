export class UpdateProfileDto {
  displayName: string;
  avatar?: Record<string, any>;
  description?: string;
  favorites?: string[];
}
