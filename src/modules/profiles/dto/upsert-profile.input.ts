import { InputType, Field } from '@nestjs/graphql';
import { IsString, MaxLength } from 'class-validator';

@InputType()
export class UpsertProfileInput {
  @Field({ nullable: true })
  @IsString()
  @MaxLength(1000)
  bio?: string;
}
