import { InputType, Field } from '@nestjs/graphql';
import { IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class AuthInput {
  @Field()
  @IsString()
  @MaxLength(20)
  username: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;
}
