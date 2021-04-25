import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreatePostInput {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Field()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  text: string;
}
