export class CreateTutorialDto {
  title: string;
  description?: string;
  videoUrl: string;
  isPublished?: boolean;
}

export class UpdateTutorialDto {
  title?: string;
  description?: string;
  videoUrl?: string;
  isPublished?: boolean;
}
