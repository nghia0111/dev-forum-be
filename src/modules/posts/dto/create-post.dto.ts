export class CreatePostDto {
  title: string;
  description: string;
  bounty? : number;
  tags: string[]
}
