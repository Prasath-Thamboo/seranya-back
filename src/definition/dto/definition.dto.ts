export class CreateDefinitionDto {
  term: string;
  definition: string;
  category?: string;
  isPublished?: boolean;
}

export class UpdateDefinitionDto {
  term?: string;
  definition?: string;
  category?: string;
  isPublished?: boolean;
}
